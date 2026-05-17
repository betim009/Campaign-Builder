import CollapsibleCard from "./CollapsibleCard.jsx";

function okLabel(ok) {
  return ok ? "OK" : "—";
}

export default function AdRealAcceptanceCard({
  flowMode,
  created,
  selectedCreativeDraft,
  adCreativeId,
  isRealMetaId,
  normalizeNonEmptyString,
  onCopyEvidence,
}) {
  const isRealFlow = flowMode === "REAL";

  const metaCampaignId =
    normalizeNonEmptyString(created?.metaCampaign?.id) ||
    normalizeNonEmptyString(created?.generatedCampaign?.meta_campaign_id) ||
    "";
  const metaCampaignIdIsReal = metaCampaignId !== "" && isRealMetaId(metaCampaignId);

  const metaAdSetId =
    normalizeNonEmptyString(created?.metaAdSet?.id) ||
    normalizeNonEmptyString(created?.generatedCampaign?.meta_adset_id) ||
    "";
  const metaAdSetIdIsReal = metaAdSetId !== "" && isRealMetaId(metaAdSetId);

  const creativeDraftId = normalizeNonEmptyString(selectedCreativeDraft?.id);
  const creativeDraftHasUrl = normalizeNonEmptyString(selectedCreativeDraft?.destination_url) !== "";
  const creativeDraftHasCta = normalizeNonEmptyString(selectedCreativeDraft?.cta_type) !== "";
  const creativeDraftHasAsset = normalizeNonEmptyString(selectedCreativeDraft?.creative_asset_id) !== "";

  const draftMetaCreativeId = normalizeNonEmptyString(selectedCreativeDraft?.meta_creative_id);
  const draftMetaCreativeIdIsReal = draftMetaCreativeId !== "" && isRealMetaId(draftMetaCreativeId);

  const effectiveCreativeId = normalizeNonEmptyString(adCreativeId) || draftMetaCreativeId;
  const effectiveCreativeIdIsReal = effectiveCreativeId !== "" && isRealMetaId(effectiveCreativeId);

  const metaAdId = normalizeNonEmptyString(created?.metaAd?.id);
  const metaAdIdIsReal = metaAdId !== "" && isRealMetaId(metaAdId);
  const metaAdEffectiveStatus = normalizeNonEmptyString(created?.metaAd?.effective_status);

  const checks = [
    {
      key: "campaign",
      label: "Campaign REAL criado (meta_campaign_id real)",
      ok: metaCampaignIdIsReal,
      hidden: !isRealFlow,
    },
    { key: "adset", label: "AdSet REAL criado (meta_adset_id real)", ok: metaAdSetIdIsReal, hidden: !isRealFlow },
    { key: "draft", label: "Draft selecionado", ok: Boolean(creativeDraftId) },
    { key: "url", label: "Destination URL preenchida", ok: creativeDraftHasUrl },
    { key: "cta", label: "CTA definido (opcional)", ok: creativeDraftHasCta, optional: true },
    { key: "media", label: "Mídia vinculada (opcional)", ok: creativeDraftHasAsset, optional: true },
    {
      key: "creative",
      label: "Creative REAL publicado (meta_creative_id real)",
      ok: draftMetaCreativeIdIsReal,
      hidden: !isRealFlow,
    },
    {
      key: "creativeId",
      label: "`creativeId` disponível (id real)",
      ok: effectiveCreativeIdIsReal,
      hidden: !isRealFlow,
    },
    { key: "ad", label: "Ad REAL criado (meta_ad_id real)", ok: metaAdIdIsReal, hidden: !isRealFlow },
    {
      key: "paused",
      label: "Status PAUSED (Graph)",
      ok: metaAdEffectiveStatus === "PAUSED",
      hidden: !isRealFlow,
    },
  ].filter((c) => !c.hidden);

  const requiredChecks = checks.filter((c) => !c.optional);
  const optionalChecks = checks.filter((c) => c.optional);
  const requiredOk = requiredChecks.length ? requiredChecks.every((c) => c.ok) : false;

  const missing = isRealFlow ? requiredChecks.filter((c) => !c.ok).map((c) => c.key) : [];

  return (
    <CollapsibleCard
      id="meta-test-p5-acceptance"
      title="P5 — Checklist (Ad REAL mínimo)"
      description="Guia operacional para validação (creative → ad → PAUSED). Não executa ações: apenas evidencia status."
      meta={requiredOk ? "OK" : "—"}
      defaultOpen={false}
      headerRight={
        <button type="button" className="pillOutline" onClick={onCopyEvidence}>
          Copiar evidência (JSON)
        </button>
      }
    >
      <div className="muted" style={{ fontWeight: 800, lineHeight: 1.55 }}>
        {isRealFlow ? (
          <>
            Objetivo: validar criação REAL de Ad como <b>PAUSED</b> sem expor token (Graph via backend).
          </>
        ) : (
          <>
            Fluxo atual está em <b>STUB</b>. Para validar P5 REAL, troque para <b>REAL</b> e garanta token no backend.
          </>
        )}
      </div>

      {isRealFlow && missing.length ? (
        <div className="card" style={{ marginTop: 12, padding: 12, border: "1px solid #fed7aa", background: "#fffbeb" }}>
          <div style={{ fontWeight: 900, color: "#92400e" }}>Próximos passos (para destravar)</div>
          <div className="muted" style={{ marginTop: 8, fontWeight: 800, lineHeight: 1.55 }}>
            {missing.includes("campaign") ? (
              <div>
                - Crie a Campaign REAL na <a href="#meta-test-step-campaign">Etapa 1</a>.
              </div>
            ) : null}
            {missing.includes("adset") ? (
              <div>
                - Crie o AdSet REAL na <a href="#meta-test-step-adset">Etapa 2</a> (P5 exige `meta_adset_id` real).
              </div>
            ) : null}
            {missing.includes("draft") ? (
              <div>
                - Selecione um draft em <a href="#meta-test-creative-drafts">Creative Drafts</a>.
              </div>
            ) : null}
            {missing.includes("url") ? <div>- Preencha `destinationUrl` no draft antes de publicar.</div> : null}
            {missing.includes("creative") || missing.includes("creativeId") ? (
              <div>
                - Publique/valide o Creative REAL no checklist <a href="#meta-test-p4-acceptance">P4</a>.
              </div>
            ) : null}
            {missing.includes("ad") ? (
              <div>
                - Crie o Ad REAL na <a href="#meta-test-step-ad">Etapa 3</a>.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="muted" style={{ fontWeight: 900 }}>
            Requisitos (essenciais)
          </div>
          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            {requiredChecks.map((c) => (
              <div key={c.key} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 900 }}>{c.label}</div>
                <div className="muted" style={{ fontWeight: 900 }}>
                  {okLabel(c.ok)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {optionalChecks.length ? (
          <div className="card" style={{ padding: 12 }}>
            <div className="muted" style={{ fontWeight: 900 }}>
              Itens opcionais (qualidade)
            </div>
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {optionalChecks.map((c) => (
                <div key={c.key} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontWeight: 900 }}>{c.label}</div>
                  <div className="muted" style={{ fontWeight: 900 }}>
                    {okLabel(c.ok)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="muted" style={{ marginTop: 12, fontWeight: 800 }}>
        Dica: após criar o Ad REAL, use “Graph refresh → Consultar Ad no Graph” para evidenciar `effective_status=PAUSED`.
      </div>
    </CollapsibleCard>
  );
}
