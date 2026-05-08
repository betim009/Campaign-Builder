import { addDaysUtc, metaFetchCampaignInsightsDaily, normalizeDailyInsightRow } from './graph.js'

function todayUtcYyyyMmDd() {
  return new Date().toISOString().slice(0, 10)
}

function isYyyyMmDd(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function coerceDateOrNull(value) {
  if (!isYyyyMmDd(value)) return null
  return value
}

async function resolveSyncRange(pool, generatedCampaignId, startDate, endDate) {
  const resolvedEnd = coerceDateOrNull(endDate) ?? todayUtcYyyyMmDd()
  if (!isYyyyMmDd(resolvedEnd)) {
    throw new Error('Invalid endDate')
  }

  const fromBody = coerceDateOrNull(startDate)
  if (fromBody) return { since: fromBody, until: resolvedEnd, reason: 'explicit' }

  const last = await pool.query(
    `
      SELECT MAX(metric_date) AS last_date
      FROM campaign_metrics
      WHERE generated_campaign_id = $1
    `,
    [generatedCampaignId]
  )
  const lastDate = last.rows?.[0]?.last_date
  if (typeof lastDate === 'string' && isYyyyMmDd(lastDate)) {
    const since = addDaysUtc(lastDate, 1)
    return { since, until: resolvedEnd, reason: 'incremental' }
  }

  // Default: last 7 days (inclusive)
  const since = addDaysUtc(resolvedEnd, -6)
  return { since, until: resolvedEnd, reason: 'default_last_7d' }
}

export async function syncGeneratedCampaignMetrics({
  pool,
  generatedCampaignId,
  metaCampaignId,
  accessToken,
  startDate,
  endDate
}) {
  if (!pool) throw new Error('pool is required')
  if (!generatedCampaignId) throw new Error('generatedCampaignId is required')
  if (!metaCampaignId) throw new Error('metaCampaignId is required')

  const range = await resolveSyncRange(pool, generatedCampaignId, startDate, endDate)
  const { since, until } = range

  if (since > until) {
    return { inserted: 0, updated: 0, since, until, reason: range.reason, provider: 'noop' }
  }

  const providerSetting = process.env.META_SYNC_PROVIDER ?? null
  let raw = null
  let providerUsed = providerSetting === 'stub' || !accessToken ? 'stub' : 'meta'
  let fallback = null

  try {
    raw = await metaFetchCampaignInsightsDaily({
      metaCampaignId,
      accessToken,
      since,
      until
    })
  } catch (err) {
    if (providerSetting === 'meta') {
      throw err
    }

    fallback = {
      from: 'meta',
      reason: 'meta_graph_error',
      message: err?.message ?? 'Meta Graph error',
      status: typeof err?.status === 'number' ? err.status : null,
      details: err?.details ?? null
    }

    raw = await metaFetchCampaignInsightsDaily({
      metaCampaignId,
      accessToken: null,
      since,
      until
    })
    providerUsed = 'stub'
  }

  const rows = (Array.isArray(raw) ? raw : [])
    .map((r) => normalizeDailyInsightRow(r))
    .filter(Boolean)
    .filter((r) => r.metricDate >= since && r.metricDate <= until)

  if (rows.length === 0) {
    return {
      inserted: 0,
      updated: 0,
      since,
      until,
      reason: range.reason,
      provider: providerUsed,
      ...(fallback ? { fallback } : null)
    }
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    let inserted = 0
    let updated = 0

    for (const r of rows) {
      const result = await client.query(
        `
          INSERT INTO campaign_metrics (
            generated_campaign_id,
            metric_date,
            spend_cents,
            impressions,
            clicks,
            cpc_cents,
            cpm_cents,
            revenue_cents
          )
          VALUES ($1, $2::date, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (generated_campaign_id, metric_date) DO UPDATE SET
            spend_cents = EXCLUDED.spend_cents,
            impressions = EXCLUDED.impressions,
            clicks = EXCLUDED.clicks,
            cpc_cents = EXCLUDED.cpc_cents,
            cpm_cents = EXCLUDED.cpm_cents,
            revenue_cents = EXCLUDED.revenue_cents
          RETURNING (xmax = 0) AS inserted
        `,
        [
          generatedCampaignId,
          r.metricDate,
          r.spendCents,
          r.impressions,
          r.clicks,
          r.cpcCents,
          r.cpmCents,
          r.revenueCents
        ]
      )
      if (result.rows?.[0]?.inserted) inserted += 1
      else updated += 1
    }

    await client.query('COMMIT')
    return {
      inserted,
      updated,
      since,
      until,
      reason: range.reason,
      provider: providerUsed,
      ...(fallback ? { fallback } : null)
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
