function redactSecrets(value) {
  if (!value || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(redactSecrets)

  const out = {}
  for (const [k, v] of Object.entries(value)) {
    const key = String(k).toLowerCase()
    if (
      key.includes('token') ||
      key.includes('access_token') ||
      key.includes('authorization') ||
      key.includes('cookie')
    ) {
      out[k] = '[REDACTED]'
      continue
    }
    out[k] = redactSecrets(v)
  }
  return out
}

function normalizeDetails(details) {
  if (details === undefined || details === null) return {}
  if (typeof details !== 'object') return { value: String(details) }

  const redacted = redactSecrets(details)
  try {
    const raw = JSON.stringify(redacted)
    if (raw.length > 8000) {
      return { truncated: true, bytes: raw.length }
    }
  } catch {
    return { unserializable: true }
  }
  return redacted
}

function normalizeNonEmptyString(value, { maxLen } = {}) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (maxLen && trimmed.length > maxLen) return trimmed.slice(0, maxLen)
  return trimmed
}

export async function insertOpsLogBestEffort(
  pool,
  {
    source = 'meta-sync',
    entity = null,
    action,
    ok = true,
    error = null,
    details = null,
    clientAt = null
  } = {}
) {
  try {
    const normalizedAction = normalizeNonEmptyString(action, { maxLen: 160 })
    if (!normalizedAction) return

    await pool.query(
      `
        INSERT INTO ops_logs (source, entity, action, ok, error, details, client_at)
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
      `,
      [
        normalizeNonEmptyString(source, { maxLen: 40 }) ?? 'meta-sync',
        normalizeNonEmptyString(entity, { maxLen: 40 }),
        normalizedAction,
        Boolean(ok),
        normalizeNonEmptyString(error, { maxLen: 700 }),
        JSON.stringify(normalizeDetails(details)),
        normalizeNonEmptyString(clientAt, { maxLen: 80 })
      ]
    )
  } catch {
    // ignore (best-effort)
  }
}

