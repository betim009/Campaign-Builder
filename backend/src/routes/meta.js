import { Router } from 'express'
import { getPool } from '../db.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { jsonError } from '../lib/http.js'
import { isUuid } from '../lib/validate.js'
import { syncGeneratedCampaignMetrics } from '../meta/sync.js'

function coerceAccessToken(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function parseDateOrNull(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  const d = new Date(value)
  if (!Number.isFinite(d.getTime())) return null
  return d.toISOString()
}

async function lookupToken(pool, { userId } = {}) {
  if (userId && !isUuid(userId)) {
    return null
  }

  const query =
    userId && isUuid(userId)
      ? `
          SELECT access_token, expires_at
          FROM meta_tokens
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 1
        `
      : `
          SELECT access_token, expires_at
          FROM meta_tokens
          ORDER BY created_at DESC
          LIMIT 1
        `

  const params = userId && isUuid(userId) ? [userId] : []
  const result = await pool.query(query, params)
  if (result.rowCount === 0) return null

  const row = result.rows[0]
  const token = coerceAccessToken(row.access_token)
  if (!token) return null

  if (row.expires_at) {
    const expiresAt = new Date(row.expires_at)
    if (Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() <= Date.now()) {
      return null
    }
  }

  return token
}

async function resolveAccessToken(pool, req) {
  const fromBody = coerceAccessToken(req.body?.accessToken)
  if (fromBody) return fromBody

  const fromEnv = coerceAccessToken(process.env.META_ACCESS_TOKEN)
  if (fromEnv) return fromEnv

  const fromDb = await lookupToken(pool, { userId: req.body?.userId })
  if (fromDb) return fromDb

  return null
}

export function metaRouter() {
  const router = Router()

  router.get(
    '/tokens',
    asyncHandler(async (req, res) => {
      if (!req.app.locals.dbEnabled) {
        return jsonError(res, 503, 'Database is not enabled. Set DATABASE_URL.')
      }

      const pool = getPool()
      const { rows } = await pool.query(
        `
          SELECT id, user_id, meta_user_id, expires_at, created_at
          FROM meta_tokens
          ORDER BY created_at DESC
          LIMIT 10
        `
      )

      return res.json({ ok: true, tokens: rows })
    })
  )

  router.post(
    '/tokens',
    asyncHandler(async (req, res) => {
      if (!req.app.locals.dbEnabled) {
        return jsonError(res, 503, 'Database is not enabled. Set DATABASE_URL.')
      }

      const userId = req.body?.userId ?? null
      if (userId !== null && userId !== undefined && !isUuid(userId)) {
        return jsonError(res, 400, 'Invalid userId')
      }

      const metaUserId =
        typeof req.body?.metaUserId === 'string' && req.body.metaUserId.trim()
          ? req.body.metaUserId.trim()
          : null

      const accessToken = coerceAccessToken(req.body?.accessToken)
      if (!accessToken) {
        return jsonError(res, 400, 'Invalid accessToken')
      }

      const expiresAt = parseDateOrNull(req.body?.expiresAt)
      if (req.body?.expiresAt && !expiresAt) {
        return jsonError(res, 400, 'Invalid expiresAt (expected ISO date string)')
      }

      const pool = getPool()
      const { rows } = await pool.query(
        `
          INSERT INTO meta_tokens (user_id, meta_user_id, access_token, expires_at)
          VALUES ($1::uuid, $2, $3, $4::timestamptz)
          RETURNING id, user_id, meta_user_id, expires_at, created_at
        `,
        [userId, metaUserId, accessToken, expiresAt]
      )

      return res.status(201).json({ ok: true, token: rows[0] })
    })
  )

  router.post(
    '/sync/generated-campaigns/:id',
    asyncHandler(async (req, res) => {
      if (!req.app.locals.dbEnabled) {
        return jsonError(res, 503, 'Database is not enabled. Set DATABASE_URL.')
      }

      const generatedCampaignId = req.params.id
      if (!isUuid(generatedCampaignId)) {
        return jsonError(res, 400, 'Invalid generated campaign id')
      }

      const startDate = typeof req.body?.startDate === 'string' ? req.body.startDate : null
      const endDate = typeof req.body?.endDate === 'string' ? req.body.endDate : null

      const pool = getPool()
      const gc = await pool.query(
        `
          SELECT id, meta_campaign_id
          FROM generated_campaigns
          WHERE id = $1
        `,
        [generatedCampaignId]
      )

      if (gc.rowCount === 0) {
        return jsonError(res, 404, 'Generated campaign not found')
      }

      const metaCampaignId = gc.rows[0].meta_campaign_id
      if (typeof metaCampaignId !== 'string' || !metaCampaignId.trim()) {
        return jsonError(res, 400, 'Generated campaign is not published (missing meta_campaign_id)')
      }

      const accessToken = await resolveAccessToken(pool, req)
      const result = await syncGeneratedCampaignMetrics({
        pool,
        generatedCampaignId,
        metaCampaignId: metaCampaignId.trim(),
        accessToken,
        startDate,
        endDate
      })

      return res.json({ ok: true, sync: result })
    })
  )

  return router
}

