import CollapsibleCard from "./CollapsibleCard.jsx";

function okLabel(ok) {
  return ok ? "OK" : "—";
}

export default function CreativeRealAcceptanceCard({
  flowMode,
  backendHasPageId,
  metaPageId,
  metaInstagramActorId,
  creativePublishForce,
  selectedCreativeDraft,
  adCreativeId,
  creativeGetResult,
  isRealMetaId,
  normalizeNonEmptyString,
  onCopyEvidence,
}) {
  const isRealFlow = flowMode === "REAL";

  const draftId = normalizeNonEmptyString(selectedCreativeDraft?.id);
  const draftHasUrl = normalizeNonEmptyString(selectedCreativeDraft?.destination_url) !== "";
  const draftMetaCreativeId = normalizeNonEmptyString(selectedCreativeDraft?.meta_creative_id);
  const draftMetaCreativeIdIsReal = draftMetaCreativeId !== "" && isRealMetaId(draftMetaCreativeId);

  const hasPageIdFromUi = normalizeNonEmptyString(metaPageId) !== "";
  const hasPageId = hasPageIdFromUi || backendHasPageId === true;

  const effectiveCreativeId = normalizeNonEmptyString(adCreativeId) || draftMetaCreativeId;
  const effectiveCreativeIdIsReal = effectiveCreativeId !== "" && isRealMetaId(effectiveCreativeId);

  const fetchedCreativeId =
    normalizeNonEmptyString(creativeGetResult?.id) ||
    normalizeNonEmptyString(creativeGetResult?.creative?.id) ||
    normalizeNonEmptyString(creativeGetResult?.metaCreative?.id);
  const fetchedCreativeOk = effectiveCreativeId !== "" ? fetchedCreativeId === effectiveCreativeId : fetchedCreativeId !== "";

  const checks = [
    { key: "draft", label: "Draft selecionado", ok: Boolean(draftId) },
    { key: "url", label: "Destination URL preenchida", ok: draftHasUrl },
    { key: "page", label: "Page ID disponível (UI/env)", ok: hasPageId, hidden: !isRealFlow },
    {
      key: "published",
      label: "Creative REAL publicado (meta_creative_id real)",
      ok: draftMetaCreativeIdIsReal,
      hidden: !isRealFlow,
    },
    {
      key: "creativeId",
      label: "`meta_creative_id` disponível (id real)",
      ok: effectiveCreativeIdIsReal,
      hidden: !isRealFlow,
    },
    {
      key: "graph",
      label: "Creative consultado no Graph (id confere)",
      ok: fetchedCreativeOk,
      hidden: !isRealFlow,
    },
  ].filter((c) => !c.hidden);

  const requiredOk = checks.length ? checks.every((c) => c.ok) : false;

  return (
    <CollapsibleCard
      id="meta-test-p4-acceptance"
      title="P4 — Checklist (Creative REAL MVP)"
      description="Guia operacional para validação do publish/Graph sem expor token. Não executa ações: apenas evidencia status."
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
            Objetivo: validar publish REAL de <b>AdCreative</b> e evidência via Graph, mantendo guardrails (token só no backend).
          </>
        ) : (
          <>
            Fluxo atual está em <b>STUB</b>. Para validar P4 REAL, troque para <b>REAL</b> e garanta token no backend.
          </>
        )}
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        <div className="card" style={{ padding: 12 }}>
          <div className="muted" style={{ fontWeight: 900 }}>
            Requisitos (essenciais)
          </div>
          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            {checks.map((c) => (
              <div key={c.key} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 900 }}>{c.label}</div>
                <div className="muted" style={{ fontWeight: 900 }}>
                  {okLabel(c.ok)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isRealFlow ? (
        <div className="muted" style={{ marginTop: 12, fontWeight: 800, lineHeight: 1.55 }}>
          <div>
            Fonte do Page ID:{" "}
            {hasPageIdFromUi ? (
              <b>UI</b>
            ) : backendHasPageId ? (
              <b>env (META_PAGE_ID)</b>
            ) : (
              <b>AUSENTE</b>
            )}
          </div>
          <div>
            Instagram Actor ID:{" "}
            {normalizeNonEmptyString(metaInstagramActorId) ? <b>UI</b> : <span className="muted">— (opcional)</span>}
          </div>
          <div>
            Force republish: <b>{creativePublishForce === true ? "ON" : "OFF"}</b>
          </div>
        </div>
      ) : null}
    </CollapsibleCard>
  );
}
