import CollapsibleCard from "./CollapsibleCard.jsx";

export default function StepAdSetSection({
  createdMetaCampaignId,
  adSetName,
  setAdSetName,
  countryCodeValue,
  adSetDailyBudget,
  setAdSetDailyBudget,
  adSetBillingEvent,
  setAdSetBillingEvent,
  adSetOptimizationGoal,
  setAdSetOptimizationGoal,
  canCreateAdSet,
  adSetCreating,
  onCreateAdSet,
  stepAdSetOk,
  onScrollToAdStep,
  createdGeneratedCampaignId,
  countryCodeForPayload,
  flowMode,
  normalizeNonEmptyString,
}) {
  return (
    <CollapsibleCard
      id="meta-test-step-adset"
      title="Etapa 2 — AdSet (PAUSED)"
      description="Criação incremental via `POST /api/meta/adsets` (REAL/STUB). Sempre PAUSED."
      meta={stepAdSetOk ? "OK" : "—"}
      defaultOpen={Boolean(normalizeNonEmptyString(createdMetaCampaignId))}
    >

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span className="muted" style={{ fontWeight: 900 }}>
            Meta Campaign ID (origem)
          </span>
          <input
            value={createdMetaCampaignId}
            readOnly
            placeholder="Crie uma Campaign acima para preencher automaticamente"
            style={{
              height: 38,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: "0 12px",
              fontSize: 13,
              fontWeight: 800,
              outline: "none",
              background: "#f9fafb",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span className="muted" style={{ fontWeight: 900 }}>
            Nome do AdSet
          </span>
          <input
            value={adSetName}
            onChange={(e) => setAdSetName(e.target.value)}
            placeholder="Ex: AdSet BR — Broad"
            style={{
              height: 38,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: "0 12px",
              fontSize: 13,
              fontWeight: 700,
              outline: "none",
              background: "#ffffff",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span className="muted" style={{ fontWeight: 900 }}>
            País (targeting)
          </span>
          <input
            value={countryCodeValue}
            readOnly
            style={{
              height: 38,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: "0 12px",
              fontSize: 13,
              fontWeight: 800,
              outline: "none",
              background: "#f9fafb",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span className="muted" style={{ fontWeight: 900 }}>
            Daily budget (cents)
          </span>
          <input
            value={adSetDailyBudget}
            onChange={(e) => setAdSetDailyBudget(e.target.value)}
            placeholder="1000"
            inputMode="numeric"
            style={{
              height: 38,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: "0 12px",
              fontSize: 13,
              fontWeight: 700,
              outline: "none",
              background: "#ffffff",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span className="muted" style={{ fontWeight: 900 }}>
            Billing event
          </span>
          <input
            value={adSetBillingEvent}
            onChange={(e) => setAdSetBillingEvent(e.target.value)}
            placeholder="Ex: IMPRESSIONS"
            style={{
              height: 38,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: "0 12px",
              fontSize: 13,
              fontWeight: 700,
              outline: "none",
              background: "#ffffff",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span className="muted" style={{ fontWeight: 900 }}>
            Optimization goal
          </span>
          <input
            value={adSetOptimizationGoal}
            onChange={(e) => setAdSetOptimizationGoal(e.target.value)}
            placeholder="Ex: LINK_CLICKS"
            style={{
              height: 38,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: "0 12px",
              fontSize: 13,
              fontWeight: 700,
              outline: "none",
              background: "#ffffff",
            }}
          />
        </label>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" className="pillOutline" disabled={!canCreateAdSet} onClick={onCreateAdSet}>
          {adSetCreating ? "Criando..." : `Criar AdSet ${flowMode} (PAUSED)`}
        </button>
        <button
          type="button"
          className="pillOutline"
          disabled={!stepAdSetOk}
          onClick={onScrollToAdStep}
          title={stepAdSetOk ? "Ir para criação de Ad" : "Crie/Selecione um AdSet primeiro"}
        >
          Ir para Etapa 3
        </button>
        <div className="muted" style={{ fontWeight: 800 }}>
          Requer Campaign criada acima. REAL exige token no backend.
        </div>
      </div>

      <details style={{ marginTop: 12 }}>
        <summary style={{ cursor: "pointer", fontWeight: 900 }}>Preview do payload</summary>
        <pre
          style={{
            marginTop: 10,
            background: "#0b1220",
            color: "#e5e7eb",
            padding: 12,
            borderRadius: 12,
            overflowX: "auto",
          }}
        >
{JSON.stringify(
  {
    generatedCampaignId: createdGeneratedCampaignId || null,
    name: normalizeNonEmptyString(adSetName) || null,
    countryCode: countryCodeForPayload ?? null,
    dailyBudgetCents: Number(adSetDailyBudget) ? Math.trunc(Number(adSetDailyBudget)) : null,
    billingEvent: normalizeNonEmptyString(adSetBillingEvent) || null,
    optimizationGoal: normalizeNonEmptyString(adSetOptimizationGoal) || null,
    mode: flowMode,
  },
  null,
  2,
	)}
        </pre>
      </details>
    </CollapsibleCard>
  );
}
