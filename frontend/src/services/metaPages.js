import { apiGet } from "./http.js";

export async function listMetaPages({ metaAdAccountId } = {}) {
  const q = String(metaAdAccountId || "").trim();
  const qs = q ? `?metaAdAccountId=${encodeURIComponent(q)}` : "";
  const data = await apiGet(`/api/meta/pages${qs}`);
  return {
    ok: true,
    metaAdAccountId: data?.meta_ad_account_id ?? null,
    myPages: Array.isArray(data?.my_pages) ? data.my_pages : [],
    promotePages: Array.isArray(data?.promote_pages) ? data.promote_pages : [],
    businesses: Array.isArray(data?.businesses) ? data.businesses : [],
    ownedPagesByBusiness: Array.isArray(data?.owned_pages_by_business) ? data.owned_pages_by_business : [],
    adAccountBusiness: data?.ad_account_business ?? null,
    ownedPagesFromAdAccountBusiness: Array.isArray(data?.owned_pages_from_ad_account_business)
      ? data.owned_pages_from_ad_account_business
      : [],
  };
}

export async function getMetaPage({ metaPageId } = {}) {
  const id = String(metaPageId || "").trim();
  if (!id) throw new Error("metaPageId is required");
  const data = await apiGet(`/api/meta/pages/${encodeURIComponent(id)}`);
  return { ok: true, metaPage: data?.meta_page ?? null };
}
