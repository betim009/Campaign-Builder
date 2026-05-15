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
  };
}
