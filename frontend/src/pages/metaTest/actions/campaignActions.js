import { createMetaCampaignSimple, listMetaAdAccountCampaigns } from "../../../services/metaCampaigns.js";
import { normalizeNonEmptyString } from "../metaTestUtils.js";

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
