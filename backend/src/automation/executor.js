function todayUtcYyyyMmDd() {
  return new Date().toISOString().slice(0, 10)
}

function addDaysUtc(yyyyMmDd, days) {
  const [y, m, d] = String(yyyyMmDd).split('-').map((v) => Number(v))
  const date = new Date(Date.UTC(y, m - 1, d))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function toInt(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.trunc(n)
}

function toNullableInt(value) {
  if (value === null || value === undefined) return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return Math.trunc(n)
}

function computeRoiPercent({ spendCents, revenueCents }) {
  if (!spendCents || revenueCents === null || revenueCents === undefined) return null
  const profit = revenueCents - spendCents
  return Math.round((profit / spendCents) * 10000) / 100
}

function coerceRuleType(config) {
  const type = config?.type
  if (type === 'pause_negative_roi_d1') return type
  if (type === 'activate_positive_roi_d1') return type
  return null
}

function coerceRoiMinPercent(config, fallback) {
  const n = Number(config?.roiMinPercent)
  if (!Number.isFinite(n)) return fallback
  return n
}

export async function runAutomation({ pool, date, dryRun = false } = {}) {
  if (!pool) throw new Error('pool is required')

  const resolvedDate = typeof date === 'string' && date ? date : addDaysUtc(todayUtcYyyyMmDd(), -1)

  const rulesResult = await pool.query(
    `
      SELECT id, name, enabled, config, created_at
      FROM automation_rules
      WHERE enabled = true
      ORDER BY created_at ASC
      LIMIT 50
    `
  )
  const rules = rulesResult.rows ?? []

  const metricsResult = await pool.query(
    `
      SELECT
        gc.id AS generated_campaign_id,
        gc.status AS generated_status,
        COALESCE(SUM(cm.spend_cents), 0) AS spend_cents,
        SUM(cm.revenue_cents) AS revenue_cents
      FROM generated_campaigns gc
      JOIN campaign_metrics cm ON cm.generated_campaign_id = gc.id
      WHERE cm.metric_date = $1::date
      GROUP BY gc.id, gc.status
      ORDER BY gc.id ASC
    `,
    [resolvedDate]
  )

  const metricsByGcId = new Map()
  for (const row of metricsResult.rows ?? []) {
    const spendCents = toInt(row.spend_cents)
    const revenueCents = toNullableInt(row.revenue_cents)
    metricsByGcId.set(row.generated_campaign_id, {
      generatedCampaignId: row.generated_campaign_id,
      status: row.generated_status,
      spendCents,
      revenueCents,
      roiPercent: computeRoiPercent({ spendCents, revenueCents })
    })
  }

  const actions = []

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    for (const rule of rules) {
      const type = coerceRuleType(rule.config)
      if (!type) {
        actions.push({
          rule_id: rule.id,
          rule_name: rule.name,
          type: rule.config?.type ?? null,
          outcome: 'skipped',
          reason: 'unknown_rule_type'
        })
        continue
      }

      const roiMinPercent = coerceRoiMinPercent(rule.config, type === 'pause_negative_roi_d1' ? 100 : 140)

      let touched = 0
      let updated = 0

      for (const m of metricsByGcId.values()) {
        if (m.roiPercent === null) continue

        if (type === 'pause_negative_roi_d1') {
          if (m.roiPercent >= roiMinPercent) continue
          touched += 1
          if (dryRun) continue
          const update = await client.query(
            `
              UPDATE generated_campaigns
              SET status = 'PAUSED'
              WHERE id = $1 AND status <> 'PAUSED'
              RETURNING id
            `,
            [m.generatedCampaignId]
          )
          if (update.rowCount > 0) updated += 1
        }

        if (type === 'activate_positive_roi_d1') {
          if (m.roiPercent < roiMinPercent) continue
          touched += 1
          if (dryRun) continue
          const update = await client.query(
            `
              UPDATE generated_campaigns
              SET status = 'ACTIVE'
              WHERE id = $1 AND status <> 'ACTIVE'
              RETURNING id
            `,
            [m.generatedCampaignId]
          )
          if (update.rowCount > 0) updated += 1
        }
      }

      const payload = {
        date: resolvedDate,
        type,
        roiMinPercent,
        dryRun,
        matched: touched,
        updated
      }

      if (!dryRun) {
        await client.query(
          `
            INSERT INTO automation_logs (rule_id, message, payload)
            VALUES ($1, $2, $3::jsonb)
          `,
          [rule.id, `automation.run ${type}`, JSON.stringify(payload)]
        )
      }

      actions.push({
        rule_id: rule.id,
        rule_name: rule.name,
        type,
        roiMinPercent,
        dryRun,
        matched: touched,
        updated,
        outcome: 'ok'
      })
    }

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }

  return { date: resolvedDate, dryRun, rules: actions }
}

