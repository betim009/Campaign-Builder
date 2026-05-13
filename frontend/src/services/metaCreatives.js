import { apiGet, apiPost } from "./http.js";

export async function publishMetaCreativeDraft(creativeDraftId, { pageId, instagramActorId, force } = {}) {
  const id = String(creativeDraftId || "").trim();
  const data = await apiPost(`/api/meta/creative-drafts/${encodeURIComponent(id)}/publish`, {
    pageId: pageId ?? null,
    instagramActorId: instagramActorId ?? null,
    force: force === true,
  });
  return {
    ok: true,
    metaCreative: data?.meta_creative ?? null,
    creativeDraft: data?.creative_draft ?? null,
  };
}

export async function getMetaCreative(metaCreativeId) {
  const id = String(metaCreativeId || "").trim();
  const data = await apiGet(`/api/meta/creatives/${encodeURIComponent(id)}`);
  return { ok: true, metaCreative: data?.meta_creative ?? null };
}

