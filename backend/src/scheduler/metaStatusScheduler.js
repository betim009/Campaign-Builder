import { getPool } from '../db.js'
import { resolveAccessTokenForScheduler } from '../meta/accessToken.js'
import { metaFetchCampaign } from '../meta/campaigns.js'
import { metaFetchAdSet } from '../meta/adsets.js'
import { metaFetchAd } from '../meta/ads.js'

function parseBool(value) {
  const v = String(value ?? '').trim().toLowerCase()
  if (!v) return false
  return v === '1' || v === 'true' || v === 'yes' || v === 'y' || v === 'on'
}

function parseIntervalMs(value, fallbackMs) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return fallbackMs
  return Math.trunc(n)
}

function parseLimit(value, fallback) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.min(200, Math.trunc(n))
}

function normalizeNonEmptyString(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function isRealMetaId(value) {
  const id = normalizeNonEmptyString(value)
  if (!id) return false
  return !id.startsWith('stub-')
}

export function startMetaStatusScheduler(app) {
  const enabled = parseBool(process.env.META_STATUS_SCHEDULER_ENABLED)
  const intervalMs = parseIntervalMs(process.env.META_STATUS_SCHEDULER_INTERVAL_MS, 15 * 60 * 1000)
  const limit = parseLimit(process.env.META_STATUS_SCHEDULER_LIMIT, 50)
  const runOnStartup = parseBool(process.env.META_STATUS_SCHEDULER_RUN_ON_STARTUP)

  const state = {
    enabled,
    intervalMs,
    limit,
    runOnStartup,
    status: enabled ? (app.locals.dbEnabled ? 'enabled' : 'blocked_db_disabled') : 'disabled',
    running: false,
    lastRunAt: null,
    lastOkAt: null,
    lastErrorAt: null,
    lastError: null,
    lastResult: null
  }

  app.locals.metaStatusScheduler = state

  if (!enabled) {
    return { stop: () => {} }
  }

  if (!app.locals.dbEnabled) {
    console.log('[scheduler] meta status scheduler enabled but DB is disabled (skipping)')
    return { stop: () => {} }
  }

  let timer = null
  let stopped = false

  async function tick() {
    if (stopped) return
    if (state.running) return
    state.running = true
    state.lastRunAt = new Date().toISOString()

    const pool = getPool()
    try {
      const accessToken = await resolveAccessTokenForScheduler(pool)
      if (!accessToken) {
        state.lastResult = { ok: false, reason: 'missing_access_token' }
        state.lastErrorAt = null
        state.lastError = null
        state.status = 'blocked_missing_access_token'
        return
      }

      state.status = 'enabled'

      const { rows } = await pool.query(
        `
          SELECT
            id,
            meta_campaign_id,
            meta_adset_id,
            meta_ad_id
          FROM generated_campaigns
          WHERE meta_campaign_id IS NOT NULL
          ORDER BY created_at DESC
          LIMIT $1
        `,
        [limit]
      )

      let scanned = 0
      let touched = 0
      let failed = 0

      for (const gc of rows ?? []) {
        scanned += 1

        const metaCampaignId = isRealMetaId(gc.meta_campaign_id) ? String(gc.meta_campaign_id) : null
        const metaAdSetId = isRealMetaId(gc.meta_adset_id) ? String(gc.meta_adset_id) : null
        const metaAdId = isRealMetaId(gc.meta_ad_id) ? String(gc.meta_ad_id) : null

        if (!metaCampaignId && !metaAdSetId && !metaAdId) continue

        let ok = true
        let errorMessage = null

        let metaStatus = null
        let metaEffectiveStatus = null
        let metaObjective = null
        let metaAdSetStatus = null
        let metaAdSetEffectiveStatus = null
        let metaAdStatus = null
        let metaAdEffectiveStatus = null

        try {
          if (metaCampaignId) {
            const c = await metaFetchCampaign({ metaCampaignId, accessToken })
            metaStatus = normalizeNonEmptyString(c?.status)
            metaEffectiveStatus = normalizeNonEmptyString(c?.effective_status)
            metaObjective = normalizeNonEmptyString(c?.objective)
          }
          if (metaAdSetId) {
            const a = await metaFetchAdSet({ metaAdSetId, accessToken })
            metaAdSetStatus = normalizeNonEmptyString(a?.status)
            metaAdSetEffectiveStatus = normalizeNonEmptyString(a?.effective_status)
          }
          if (metaAdId) {
            const ad = await metaFetchAd({ metaAdId, accessToken })
            metaAdStatus = normalizeNonEmptyString(ad?.status)
            metaAdEffectiveStatus = normalizeNonEmptyString(ad?.effective_status)
          }
        } catch (err) {
          ok = false
          failed += 1
          errorMessage = err?.message ? String(err.message) : 'meta_status_refresh_failed'
        }

        touched += 1

        await pool.query(
          `
            UPDATE generated_campaigns
            SET
              meta_status = COALESCE($2, meta_status),
              meta_effective_status = COALESCE($3, meta_effective_status),
              meta_objective = COALESCE($4, meta_objective),
              meta_adset_status = COALESCE($5, meta_adset_status),
              meta_adset_effective_status = COALESCE($6, meta_adset_effective_status),
              meta_ad_status = COALESCE($7, meta_ad_status),
              meta_ad_effective_status = COALESCE($8, meta_ad_effective_status),
              ops_last_action = 'meta.status.refresh',
              ops_last_ok = $9,
              ops_last_at = now()
            WHERE id = $1
          `,
          [
            gc.id,
            metaStatus,
            metaEffectiveStatus,
            metaObjective,
            metaAdSetStatus,
            metaAdSetEffectiveStatus,
            metaAdStatus,
            metaAdEffectiveStatus,
            ok
          ]
        )

        if (!ok) {
          console.log('[scheduler] meta status refresh failed', { generatedCampaignId: gc.id, error: errorMessage })
        }
      }

      const result = { ok: true, scanned, touched, failed }
      state.lastOkAt = new Date().toISOString()
      state.lastErrorAt = null
      state.lastError = null
      state.lastResult = result
    } catch (err) {
      state.lastErrorAt = new Date().toISOString()
      state.lastError = err?.message ? String(err.message) : 'meta_status_scheduler_failed'
      console.error('[scheduler] meta status scheduler error', err)
    } finally {
      state.running = false
    }
  }

  timer = setInterval(tick, intervalMs)
  timer.unref?.()

  console.log('[scheduler] meta status scheduler started', { intervalMs, limit, runOnStartup })

  if (runOnStartup) {
    setTimeout(() => {
      tick().catch(() => {
        // ignore
      })
    }, 2500).unref?.()
  }

  return {
    stop() {
      stopped = true
      if (timer) clearInterval(timer)
      timer = null
      state.status = 'stopped'
    }
  }
}

