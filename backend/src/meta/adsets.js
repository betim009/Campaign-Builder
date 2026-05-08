function normalizeNonEmptyString(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function metaCreateAdSetStub({ stubId, name, campaign_id } = {}) {
  const id = normalizeNonEmptyString(stubId) ?? `stub-adset-${Date.now()}`
  return {
    id,
    name: normalizeNonEmptyString(name) ?? id,
    campaign_id: normalizeNonEmptyString(campaign_id) ?? null,
    status: 'PAUSED',
    effective_status: 'PAUSED'
  }
}

export async function metaCreateAdSet() {
  const err = new Error('Not implemented yet: metaCreateAdSet')
  err.status = 501
  throw err
}

