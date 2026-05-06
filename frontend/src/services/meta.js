import { apiPost } from "./http.js";

export async function syncGeneratedCampaign(generatedCampaignId, { startDate, endDate, accessToken, userId } = {}) {
  const body = {
    ...(startDate ? { startDate } : null),
    ...(endDate ? { endDate } : null),
    ...(accessToken ? { accessToken } : null),
    ...(userId ? { userId } : null),
  };

  const data = await apiPost(
    `/api/meta/sync/generated-campaigns/${encodeURIComponent(String(generatedCampaignId))}`,
    body,
  );
  return { ok: true, sync: data?.sync ?? null };
}

