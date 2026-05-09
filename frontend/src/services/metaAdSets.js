import { apiPost } from "./http.js";

export async function createMetaAdSet(payload) {
  const data = await apiPost("/api/meta/adsets", payload ?? {});
  return {
    ok: true,
    mode: data?.mode ?? null,
    metaAdSet: data?.meta_adset ?? null,
    generatedCampaign: data?.generated_campaign ?? null,
  };
}

