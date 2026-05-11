export function normalizeNonEmptyString(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed ? trimmed : "";
}

export function normalizeMetaAdAccountId(value) {
  const raw = normalizeNonEmptyString(value);
  if (!raw) return "";
  const stripped = raw.replace(/^act_/, "");
  if (!/^\d+$/.test(stripped)) return "";
  return `act_${stripped}`;
}

export function isRealMetaId(metaId) {
  const id = normalizeNonEmptyString(metaId);
  return Boolean(id) && !id.startsWith("stub-");
}

export function formatNowPtBr() {
  return new Date().toLocaleString("pt-BR", { hour12: false });
}

export function safeJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

export function inferEntityFromAction(action) {
  const a = normalizeNonEmptyString(action);
  if (!a) return "unknown";
  if (a.startsWith("campaign.")) return "campaign";
  if (a.startsWith("adset.")) return "adset";
  if (a.startsWith("ad.")) return "ad";
  if (a.startsWith("meta.")) return "meta";
  if (a.startsWith("db.")) return "db";
  return "other";
}

