import { createMetaCampaignSimple, listMetaAdAccountCampaigns } from "../../../services/metaCampaigns.js";

function normalizeNonEmptyString(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed ? trimmed : "";
}

export async function createCampaignSimple(payload) {
  const res = await createMetaCampaignSimple(payload ?? {});
  return {
    mode: normalizeNonEmptyString(res?.mode) || null,
    metaCampaign: res?.metaCampaign ?? null,
    generatedCampaign: res?.generatedCampaign ?? null,
  };
}

export async function listPausedCampaigns({ metaAdAccountId, limit } = {}) {
  const res = await listMetaAdAccountCampaigns({
    metaAdAccountId: normalizeNonEmptyString(metaAdAccountId),
    limit: Number.isFinite(limit) ? limit : 100,
    pausedOnly: true,
  });
  return { metaCampaigns: Array.isArray(res?.metaCampaigns) ? res.metaCampaigns : [] };
}

