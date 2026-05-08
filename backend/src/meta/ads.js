function normalizeNonEmptyString(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function metaCreateAdStub({ stubId, name, adset_id } = {}) {
  const id = normalizeNonEmptyString(stubId) ?? `stub-ad-${Date.now()}`
  return {
    id,
    name: normalizeNonEmptyString(name) ?? id,
    adset_id: normalizeNonEmptyString(adset_id) ?? null,
    status: 'PAUSED',
    effective_status: 'PAUSED'
  }
}

export async function metaCreateAd() {
  const err = new Error('Not implemented yet: metaCreateAd')
  err.status = 501
  throw err
}

