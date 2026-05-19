import { Router } from 'express'
import { getPool } from '../db.js'
import { jsonError, parseLimit } from '../lib/http.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { isUuid } from '../lib/validate.js'

const ALLOWED_STATUSES = new Set(['PAUSED', 'ACTIVE', 'ARCHIVED'])
const ALLOWED_OPS_STATES = new Set(['draft', 'validated', 'published'])
const CHECKPOINT_LABEL_MAX = 80
const CHECKPOINT_NOTE_MAX = 400

async function tryInsertGeneratedCampaignEvent(pool, generatedCampaignId, eventType, payload) {
  try {
    await pool.query(
      `
        INSERT INTO generated_campaign_events (generated_campaign_id, event_type, payload)
        VALUES ($1::uuid, $2, $3::jsonb)
      `,
      [generatedCampaignId, eventType, JSON.stringify(payload ?? {})]
    )
  } catch {
    // best-effort
  }
}

export function generatedCampaignsRouter() {
  const router = Router()

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      if (!req.app.locals.dbEnabled) {
        return jsonError(res, 503, 'Database is not enabled. Set DATABASE_URL.')
      }

      const limit = parseLimit(req.query.limit, 50, 200)
      const campaignId =
        typeof req.query.campaignId === 'string' && req.query.campaignId.trim()
          ? req.query.campaignId.trim()
          : null
      if (campaignId && !isUuid(campaignId)) {
        return jsonError(res, 400, 'Invalid campaignId')
      }
      const pool = getPool()

      const { rows } = await pool.query(
        `
          SELECT
            gc.id,
            gc.campaign_id,
            gc.country_code,
            gc.meta_campaign_id,
            gc.meta_run_mode,
            gc.meta_ad_account_id,
            gc.meta_user_id,
            gc.meta_status,
            gc.meta_effective_status,
            gc.meta_objective,
            gc.meta_adset_id,
            gc.meta_adset_status,
            gc.meta_adset_effective_status,
            gc.meta_ad_id,
            gc.meta_ad_status,
            gc.meta_ad_effective_status,
            gc.ops_last_action,
            gc.ops_last_ok,
            gc.ops_last_at,
            gc.ops_state,
            gc.name,
            gc.status,
            gc.created_at
          FROM generated_campaigns gc
          WHERE ($1::uuid IS NULL OR gc.campaign_id = $1::uuid)
          ORDER BY gc.created_at DESC
          LIMIT $2
        `,
        [campaignId, limit]
      )

      return res.json({ ok: true, generated_campaigns: rows })
    })
  )

  router.get(
    '/:id/structure',
    asyncHandler(async (req, res) => {
      if (!req.app.locals.dbEnabled) {
        return jsonError(res, 503, 'Database is not enabled. Set DATABASE_URL.')
      }

      if (!isUuid(req.params.id)) {
        return jsonError(res, 400, 'Invalid generated campaign id')
      }

      const pool = getPool()

      const { rowCount: exists } = await pool.query(
        `
          SELECT 1
          FROM generated_campaigns
          WHERE id = $1
        `,
        [req.params.id]
      )
      if (exists === 0) {
        return jsonError(res, 404, 'Generated campaign not found')
      }

      const { rows: adsets } = await pool.query(
        `
          SELECT
            id,
            generated_campaign_id,
            meta_adset_id,
            name,
            status,
            effective_status,
            created_at
          FROM generated_adsets
          WHERE generated_campaign_id = $1
          ORDER BY created_at DESC
          LIMIT 50
        `,
        [req.params.id]
      )

      const { rows: ads } = await pool.query(
        `
          SELECT
            id,
            generated_campaign_id,
            generated_adset_id,
            creative_draft_id,
            meta_ad_id,
            name,
            status,
            effective_status,
            created_at
          FROM generated_ads
          WHERE generated_campaign_id = $1
          ORDER BY created_at DESC
          LIMIT 200
        `,
        [req.params.id]
      )

      return res.json({ ok: true, generated_adsets: adsets, generated_ads: ads })
    })
  )

  router.get(
    '/:id/events',
    asyncHandler(async (req, res) => {
      if (!req.app.locals.dbEnabled) {
        return jsonError(res, 503, 'Database is not enabled. Set DATABASE_URL.')
      }

      if (!isUuid(req.params.id)) {
        return jsonError(res, 400, 'Invalid generated campaign id')
      }

      const limit = parseLimit(req.query.limit, 50, 200)
      const pool = getPool()

      const { rows } = await pool.query(
        `
          SELECT
            id,
            generated_campaign_id,
            event_type,
            payload,
            created_at
          FROM generated_campaign_events
          WHERE generated_campaign_id = $1
          ORDER BY created_at DESC
          LIMIT $2
        `,
        [req.params.id, limit]
      )

      return res.json({ ok: true, generated_campaign_events: rows })
    })
  )

  router.post(
    '/:id/checkpoints',
    asyncHandler(async (req, res) => {
      if (!req.app.locals.dbEnabled) {
        return jsonError(res, 503, 'Database is not enabled. Set DATABASE_URL.')
      }

      if (!isUuid(req.params.id)) {
        return jsonError(res, 400, 'Invalid generated campaign id')
      }

      const labelRaw = typeof req.body?.label === 'string' ? req.body.label.trim() : ''
      if (!labelRaw) {
        return jsonError(res, 400, 'Invalid label')
      }
      if (labelRaw.length > CHECKPOINT_LABEL_MAX) {
        return jsonError(res, 400, 'Label too long', { max: CHECKPOINT_LABEL_MAX })
      }

      const noteRaw = typeof req.body?.note === 'string' ? req.body.note.trim() : ''
      if (noteRaw.length > CHECKPOINT_NOTE_MAX) {
        return jsonError(res, 400, 'Note too long', { max: CHECKPOINT_NOTE_MAX })
      }

      const pool = getPool()
      const { rows, rowCount } = await pool.query(
        `
          INSERT INTO generated_campaign_events (generated_campaign_id, event_type, payload)
          VALUES ($1::uuid, 'checkpoint.created', $2::jsonb)
          RETURNING
            id,
            generated_campaign_id,
            event_type,
            payload,
            created_at
        `,
        [
          req.params.id,
          JSON.stringify({
            label: labelRaw,
            note: noteRaw || null,
          }),
        ]
      )

      if (rowCount === 0) {
        return jsonError(res, 500, 'Failed to create checkpoint')
      }

      return res.json({ ok: true, generated_campaign_event: rows[0] })
    })
  )

  router.post(
    '/:id/status',
    asyncHandler(async (req, res) => {
      if (!req.app.locals.dbEnabled) {
        return jsonError(res, 503, 'Database is not enabled. Set DATABASE_URL.')
      }

      if (!isUuid(req.params.id)) {
        return jsonError(res, 400, 'Invalid generated campaign id')
      }

      const status = req.body?.status
      if (typeof status !== 'string' || !ALLOWED_STATUSES.has(status)) {
        return jsonError(res, 400, 'Invalid status', { allowed: [...ALLOWED_STATUSES] })
      }

      const pool = getPool()
      const { rows, rowCount } = await pool.query(
        `
          UPDATE generated_campaigns
          SET status = $2
          WHERE id = $1
          RETURNING
            id,
            campaign_id,
            country_code,
            meta_campaign_id,
            meta_run_mode,
            meta_ad_account_id,
            meta_user_id,
            meta_status,
            meta_effective_status,
            meta_objective,
            meta_adset_id,
            meta_adset_status,
            meta_adset_effective_status,
            meta_ad_id,
            meta_ad_status,
            meta_ad_effective_status,
            ops_last_action,
            ops_last_ok,
            ops_last_at,
            ops_state,
            name,
            status,
            created_at
        `,
        [req.params.id, status]
      )

      if (rowCount === 0) {
        return jsonError(res, 404, 'Generated campaign not found')
      }

      return res.json({ ok: true, generated_campaign: rows[0] })
    })
  )

  router.post(
    '/:id/ops-state',
    asyncHandler(async (req, res) => {
      if (!req.app.locals.dbEnabled) {
        return jsonError(res, 503, 'Database is not enabled. Set DATABASE_URL.')
      }

      if (!isUuid(req.params.id)) {
        return jsonError(res, 400, 'Invalid generated campaign id')
      }

      const opsState = req.body?.opsState
      if (typeof opsState !== 'string' || !ALLOWED_OPS_STATES.has(opsState)) {
        return jsonError(res, 400, 'Invalid opsState', { allowed: [...ALLOWED_OPS_STATES] })
      }

      const pool = getPool()
      const { rows, rowCount } = await pool.query(
        `
          UPDATE generated_campaigns
          SET ops_state = $2
          WHERE id = $1
          RETURNING
            id,
            campaign_id,
            country_code,
            meta_campaign_id,
            meta_run_mode,
            meta_ad_account_id,
            meta_user_id,
            meta_status,
            meta_effective_status,
            meta_objective,
            meta_adset_id,
            meta_adset_status,
            meta_adset_effective_status,
            meta_ad_id,
            meta_ad_status,
            meta_ad_effective_status,
            ops_last_action,
            ops_last_ok,
            ops_last_at,
            ops_state,
            name,
            status,
            created_at
        `,
        [req.params.id, opsState]
      )

      if (rowCount === 0) {
        return jsonError(res, 404, 'Generated campaign not found')
      }

      await tryInsertGeneratedCampaignEvent(pool, req.params.id, 'ops_state.updated', { opsState })
      return res.json({ ok: true, generated_campaign: rows[0] })
    })
  )

  router.post(
    '/:id/mark-published',
    asyncHandler(async (req, res) => {
      if (!req.app.locals.dbEnabled) {
        return jsonError(res, 503, 'Database is not enabled. Set DATABASE_URL.')
      }

      if (!isUuid(req.params.id)) {
        return jsonError(res, 400, 'Invalid generated campaign id')
      }

      const metaCampaignId = req.body?.metaCampaignId
      if (typeof metaCampaignId !== 'string' || !metaCampaignId.trim()) {
        return jsonError(res, 400, 'Invalid metaCampaignId')
      }

      const pool = getPool()
      const { rows, rowCount } = await pool.query(
        `
          UPDATE generated_campaigns
          SET meta_campaign_id = $2
          WHERE id = $1
          RETURNING
            id,
            campaign_id,
            country_code,
            meta_campaign_id,
            meta_run_mode,
            meta_ad_account_id,
            meta_user_id,
            meta_status,
            meta_effective_status,
            meta_objective,
            meta_adset_id,
            meta_adset_status,
            meta_adset_effective_status,
            meta_ad_id,
            meta_ad_status,
            meta_ad_effective_status,
            ops_last_action,
            ops_last_ok,
            ops_last_at,
            ops_state,
            name,
            status,
            created_at
        `,
        [req.params.id, metaCampaignId.trim()]
      )

      if (rowCount === 0) {
        return jsonError(res, 404, 'Generated campaign not found')
      }

      await tryInsertGeneratedCampaignEvent(pool, req.params.id, 'meta_campaign_id.set', { metaCampaignId: metaCampaignId.trim() })
      return res.json({ ok: true, generated_campaign: rows[0] })
    })
  )

  return router
}
