export default function FlowProgressCard({ stepCampaignOk, stepAdSetOk, stepAdOk, opsState, latestCheckpoint }) {
  const label = latestCheckpoint?.payload?.label ? String(latestCheckpoint.payload.label) : "";
  const createdAt = latestCheckpoint?.created_at ? String(latestCheckpoint.created_at) : "";
  return (
    <div className="card" style={{ padding: 18, marginTop: 16 }}>
      <div style={{ fontWeight: 900 }}>Progresso (fluxo)</div>
      <div className="muted" style={{ marginTop: 8, fontWeight: 800, lineHeight: 1.55 }}>
        Evidência baseada em `meta_*` persistido em `generated_campaigns`.
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <span className="pillOutline" style={{ background: opsState ? "#dcfce7" : "#ffffff" }}>
          ops_state: {opsState || "—"}
        </span>
        <span className="pillOutline" style={{ background: label ? "#dcfce7" : "#ffffff" }}>
          checkpoint: {label || "—"}
        </span>
        <span className="pillOutline">
          {createdAt ? createdAt.slice(0, 19).replace("T", " ") : "—"}
        </span>
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <span className="pillOutline" style={{ background: stepCampaignOk ? "#dcfce7" : "#ffffff" }}>
          1. Campaign: {stepCampaignOk ? "OK" : "pendente"}
        </span>
        <span className="pillOutline" style={{ background: stepAdSetOk ? "#dcfce7" : "#ffffff" }}>
          2. AdSet: {stepAdSetOk ? "OK" : "pendente"}
        </span>
        <span className="pillOutline" style={{ background: stepAdOk ? "#dcfce7" : "#ffffff" }}>
          3. Ad: {stepAdOk ? "OK" : "pendente"}
        </span>
      </div>
      <div className="muted" style={{ marginTop: 10, fontWeight: 800, lineHeight: 1.55 }}>
        Dica: para retomar, use DB → “Selecionar” (não precisa recriar a Campaign).
      </div>
    </div>
  );
}
