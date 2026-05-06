import { apiGet, apiPost, HttpError } from "./http.js";
import { asUiCampaign, fallbackCampaigns } from "./fallbacks.js";

export async function listCampaigns({ limit = 50, status } = {}) {
  const query = new URLSearchParams();
  if (limit) query.set("limit", String(limit));
  if (status) query.set("status", String(status));

  try {
    const data = await apiGet(`/api/campaigns?${query.toString()}`);
    const campaigns = Array.isArray(data?.campaigns) ? data.campaigns : [];
    const ui = campaigns.map(asUiCampaign).filter(Boolean);
    return { ok: true, campaigns: ui, source: "api" };
  } catch (err) {
    const shouldFallback = err instanceof HttpError ? err.status === 503 || err.status === 0 : true;
    if (!shouldFallback) throw err;
    return { ok: true, campaigns: fallbackCampaigns(), source: "fallback" };
  }
}

export async function getCampaign(id) {
  const data = await apiGet(`/api/campaigns/${encodeURIComponent(String(id))}`);
  return { ok: true, campaign: asUiCampaign(data?.campaign) };
}

export async function createCampaign({ name, scope = "global", objectiveKey = null, countryCodes = [] }) {
  const data = await apiPost("/api/campaigns", {
    name,
    scope,
    objectiveKey,
    countryCodes,
  });
  return { ok: true, campaign: asUiCampaign(data?.campaign) };
}

export async function duplicateCampaign(id, { name } = {}) {
  const data = await apiPost(`/api/campaigns/${encodeURIComponent(String(id))}/duplicate`, { name });
  return { ok: true, campaign: asUiCampaign(data?.campaign) };
}

export async function generateCampaigns(id) {
  const data = await apiPost(`/api/campaigns/${encodeURIComponent(String(id))}/generate`, {});
  const list = Array.isArray(data?.generated_campaigns) ? data.generated_campaigns : [];
  return { ok: true, generatedCampaigns: list };
}

