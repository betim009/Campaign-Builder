import { getMetaStatus, validateMetaToken, getMetaDiagnostics } from "../../../services/metaStatus.js";
import { getMetaPage, listMetaPages } from "../../../services/metaPages.js";
import { normalizeMetaAdAccountId, normalizeNonEmptyString } from "../metaTestUtils.js";

export async function fetchBackendStatus() {
  const res = await getMetaStatus();
  return res ?? null;
}

export async function validateBackendToken() {
  const res = await validateMetaToken();
  return res ?? null;
}

export async function fetchBackendDiagnostics() {
  const res = await getMetaDiagnostics();
  return res ?? null;
}

export async function listPages({ metaAdAccountId } = {}) {
  const res = await listMetaPages({ metaAdAccountId: normalizeMetaAdAccountId(metaAdAccountId) });
  return res ?? null;
}

export async function validatePage({ metaPageId } = {}) {
  const id = normalizeNonEmptyString(metaPageId);
  if (!id) return null;
  const res = await getMetaPage({ metaPageId: id });
  return res ?? null;
}

