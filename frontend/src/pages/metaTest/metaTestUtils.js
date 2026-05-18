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

export function extractErrorDetails(err) {
  if (!err) return null;
  return err?.body?.error?.details ?? err?.body ?? null;
}

export async function copyTextToClipboard(text) {
  if (typeof navigator === "undefined" || !navigator?.clipboard?.writeText) {
    throw new Error("Clipboard API indisponível.");
  }
  await navigator.clipboard.writeText(String(text ?? ""));
}

export async function copyJsonToClipboard(value) {
  const text = safeJson(value) || "";
  await copyTextToClipboard(text);
  return text;
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
