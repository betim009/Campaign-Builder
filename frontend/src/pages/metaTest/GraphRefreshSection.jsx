import CollapsibleCard from "./CollapsibleCard.jsx";

export default function GraphRefreshSection({
  createdLoading,
  setCreatedLoading,
  adSetGraphLoading,
  setAdSetGraphLoading,
  adGraphLoading,
  setAdGraphLoading,
  isCreatingAny,
  backendHasAccessToken,
  createdMetaCampaignIdIsReal,
  createdMetaCampaignId,
  adSetEntityIdIsReal,
  adSetEntityId,
  adEntityIdIsReal,
  adEntityId,
  setError,
  setErrorDetails,
  setSuccess,
  captureError,
  setCreated,
  refreshLocalGenerated,
  refreshStructure,
  createdGeneratedCampaignId,
  pushLog,
  fetchGraphCampaign,
  fetchGraphAdSet,
  fetchGraphAd,
}) {
  return (
    <CollapsibleCard
      id="meta-test-graph-refresh"
      title="Graph (REAL) — atualizar status"
      description="Usa `GET /api/meta/*/:id` via backend. STUB não consulta Graph."
      defaultOpen={false}
    >
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button
          type="button"
          className="pillOutline"
          disabled={createdLoading || isCreatingAny || !backendHasAccessToken || !createdMetaCampaignIdIsReal}
          onClick={async () => {
            setCreatedLoading(true);
            setError("");
            setErrorDetails(null);
            setSuccess("");
            try {
              const res = await fetchGraphCampaign(createdMetaCampaignId);
              setCreated((prev) => ({
                ...(prev ?? {}),
                metaCampaign: res?.metaCampaign ?? prev?.metaCampaign ?? null,
              }));
              setSuccess("Campaign atualizada via Graph.");
              await refreshLocalGenerated();
              pushLog({
                action: "meta.campaign.get",
                ok: true,
                details: { metaCampaignId: createdMetaCampaignId, metaCampaign: res?.metaCampaign ?? null },
              });
            } catch (err) {
              const captured = captureError(err, "Falha ao consultar Campaign no Graph.");
              pushLog({
                action: "meta.campaign.get",
                ok: false,
                error: captured.message || "error",
                details: { metaCampaignId: createdMetaCampaignId, errorDetails: captured.details },
              });
            } finally {
              setCreatedLoading(false);
            }
          }}
        >
          {createdLoading ? "Consultando Campaign..." : "Consultar Campaign no Graph"}
        </button>

        <button
          type="button"
          className="pillOutline"
          disabled={adSetGraphLoading || isCreatingAny || !backendHasAccessToken || !adSetEntityIdIsReal}
          onClick={async () => {
            setAdSetGraphLoading(true);
            setError("");
            setErrorDetails(null);
            setSuccess("");
            try {
              const res = await fetchGraphAdSet(adSetEntityId);
              setCreated((prev) => ({
                ...(prev ?? {}),
                metaAdSet: res?.metaAdSet ?? prev?.metaAdSet ?? null,
              }));
              setSuccess("AdSet atualizado via Graph.");
              await refreshLocalGenerated();
              await refreshStructure(createdGeneratedCampaignId);
              pushLog({
                action: "meta.adset.get",
                ok: true,
                details: { metaAdSetId: adSetEntityId, metaAdSet: res?.metaAdSet ?? null },
              });
            } catch (err) {
              const captured = captureError(err, "Falha ao consultar AdSet no Graph.");
              pushLog({
                action: "meta.adset.get",
                ok: false,
                error: captured.message || "error",
                details: { metaAdSetId: adSetEntityId, errorDetails: captured.details },
              });
            } finally {
              setAdSetGraphLoading(false);
            }
          }}
        >
          {adSetGraphLoading ? "Consultando AdSet..." : "Consultar AdSet no Graph"}
        </button>

        <button
          type="button"
          className="pillOutline"
          disabled={adGraphLoading || isCreatingAny || !backendHasAccessToken || !adEntityIdIsReal}
          onClick={async () => {
            setAdGraphLoading(true);
            setError("");
            setErrorDetails(null);
            setSuccess("");
            try {
              const res = await fetchGraphAd(adEntityId);
              setCreated((prev) => ({
                ...(prev ?? {}),
                metaAd: res?.metaAd ?? prev?.metaAd ?? null,
              }));
              setSuccess("Ad atualizado via Graph.");
              await refreshLocalGenerated();
              await refreshStructure(createdGeneratedCampaignId);
              pushLog({
                action: "meta.ad.get",
                ok: true,
                details: { metaAdId: adEntityId, metaAd: res?.metaAd ?? null },
              });
            } catch (err) {
              const captured = captureError(err, "Falha ao consultar Ad no Graph.");
              pushLog({
                action: "meta.ad.get",
                ok: false,
                error: captured.message || "error",
                details: { metaAdId: adEntityId, errorDetails: captured.details },
              });
            } finally {
              setAdGraphLoading(false);
            }
          }}
        >
          {adGraphLoading ? "Consultando Ad..." : "Consultar Ad no Graph"}
        </button>

        <div className="muted" style={{ fontWeight: 800 }}>
          Requer token no backend + IDs reais (não `stub-*`).
        </div>
      </div>
    </CollapsibleCard>
  );
}

