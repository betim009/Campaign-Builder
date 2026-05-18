import { getPool } from '../db.js'
import { resolveAccessTokenForScheduler } from '../meta/accessToken.js'
import { syncGeneratedCampaignMetrics } from '../meta/sync.js'
import { insertOpsLogBestEffort } from '../ops/opsLogs.js'

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

function parseConcurrency(value, fallback) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.min(6, Math.max(1, Math.trunc(n)))
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withRetry(fn, { attempts = 2, delayMs = 400 } = {}) {
  let lastErr = null
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (i + 1 < attempts) await sleep(delayMs)
    }
  }
  throw lastErr
}

async function runWithConcurrency(items, concurrency, handler) {
  const list = Array.isArray(items) ? items : []
  const safeConcurrency = Math.max(1, Math.trunc(concurrency || 1))
  let idx = 0

  const workers = Array.from({ length: Math.min(safeConcurrency, list.length || 1) }, async () => {
    while (true) {
      const current = idx
      idx += 1
      if (current >= list.length) return
      await handler(list[current])
    }
  })

  await Promise.all(workers)
}

export function startMetaMetricsScheduler(app) {
  const enabled = parseBool(process.env.META_METRICS_SCHEDULER_ENABLED)
  const intervalMs = parseIntervalMs(process.env.META_METRICS_SCHEDULER_INTERVAL_MS, 60 * 60 * 1000)
  const limit = parseLimit(process.env.META_METRICS_SCHEDULER_LIMIT, 25)
  const concurrency = parseConcurrency(process.env.META_METRICS_SCHEDULER_CONCURRENCY, 2)
  const runOnStartup = parseBool(process.env.META_METRICS_SCHEDULER_RUN_ON_STARTUP)

  const state = {
    enabled,
    intervalMs,
    limit,
    concurrency,
    runOnStartup,
    status: enabled ? (app.locals.dbEnabled ? 'enabled' : 'blocked_db_disabled') : 'disabled',
    running: false,
    lastRunAt: null,
    lastOkAt: null,
    lastErrorAt: null,
    lastError: null,
    lastResult: null
  }

  app.locals.metaMetricsScheduler = state

  if (!enabled) {
    return { stop: () => {} }
  }

  if (!app.locals.dbEnabled) {
    console.log('[scheduler] meta metrics scheduler enabled but DB is disabled (skipping)')
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
          SELECT id, meta_campaign_id
          FROM generated_campaigns
          WHERE meta_campaign_id IS NOT NULL
          ORDER BY created_at DESC
          LIMIT $1
        `,
        [limit]
      )

      const scanned = Array.isArray(rows) ? rows.length : 0
      let synced = 0
      let failed = 0
      const providers = {}

      await runWithConcurrency(rows ?? [], concurrency, async (gc) => {
        if (!isRealMetaId(gc.meta_campaign_id)) return

        const generatedCampaignId = gc.id
        const metaCampaignId = String(gc.meta_campaign_id)

        try {
          const result = await withRetry(() =>
            syncGeneratedCampaignMetrics({
              pool,
              generatedCampaignId,
              metaCampaignId,
              accessToken
            })
          )
          synced += 1
          const p = normalizeNonEmptyString(result?.provider) ?? 'unknown'
          providers[p] = (providers[p] ?? 0) + 1
          await insertOpsLogBestEffort(pool, {
            source: 'meta-sync',
            entity: 'metrics',
            action: 'meta.metrics.sync',
            ok: true,
            details: {
              generatedCampaignId,
              metaCampaignId,
              provider: result?.provider ?? null,
              inserted: result?.inserted ?? null,
              updated: result?.updated ?? null,
              since: result?.since ?? null,
              until: result?.until ?? null,
              reason: result?.reason ?? null
            }
          })
        } catch (err) {
          failed += 1
          console.log('[scheduler] meta metrics sync failed', {
            generatedCampaignId,
            error: err?.message ? String(err.message) : 'sync_failed'
          })
          await insertOpsLogBestEffort(pool, {
            source: 'meta-sync',
            entity: 'metrics',
            action: 'meta.metrics.sync',
            ok: false,
            error: err?.message ? String(err.message) : 'sync_failed',
            details: {
              generatedCampaignId,
              metaCampaignId,
              status: typeof err?.status === 'number' ? err.status : null
            }
          })
        }
      })

      const result = { ok: true, scanned, synced, failed, providers }
      state.lastOkAt = new Date().toISOString()
      state.lastErrorAt = null
      state.lastError = null
      state.lastResult = result
    } catch (err) {
      state.lastErrorAt = new Date().toISOString()
      state.lastError = err?.message ? String(err.message) : 'meta_metrics_scheduler_failed'
      console.error('[scheduler] meta metrics scheduler error', err)
    } finally {
      state.running = false
    }
  }

  timer = setInterval(tick, intervalMs)
  timer.unref?.()

  console.log('[scheduler] meta metrics scheduler started', { intervalMs, limit, runOnStartup })

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
