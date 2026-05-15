import { createMetaAdSet } from "../../../services/metaAdSets.js";
import { normalizeNonEmptyString } from "../metaTestUtils.js";

export async function createAdSet(payload) {
  const res = await createMetaAdSet(payload ?? {});
  return {
    mode: normalizeNonEmptyString(res?.mode) || null,
    metaAdSet: res?.metaAdSet ?? null,
    generatedCampaign: res?.generatedCampaign ?? null,
  };
}
