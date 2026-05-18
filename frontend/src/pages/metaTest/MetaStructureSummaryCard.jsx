export default function MetaStructureSummaryCard({ created }) {
  const generatedId = created?.generatedCampaign?.id ?? null;
  const mode = created?.mode ?? null;

  const campaign = created?.metaCampaign ?? null;
  const adSet = created?.metaAdSet ?? null;
  const ad = created?.metaAd ?? null;

  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontWeight: 900 }}>Estrutura (resumo)</div>
        <div className="muted" style={{ fontWeight: 900 }}>
          {mode || "—"}
        </div>
      </div>

      <div className="muted" style={{ marginTop: 8, fontWeight: 800, lineHeight: 1.55 }}>
        IDs/status atuais do registro selecionado (Campaign → AdSet → Ad).
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        <div className="muted" style={{ fontWeight: 900 }}>
          generated_campaigns.id: <b>{generatedId || "—"}</b>
        </div>

        {[
          { label: "Campaign", value: campaign },
          { label: "AdSet", value: adSet },
          { label: "Ad", value: ad },
        ].map((row) => {
          const id = row.value?.id ?? null;
          const status = row.value?.status ?? "—";
          const effective = row.value?.effective_status ?? "—";
          return (
            <div
              key={row.label}
              className="card"
              style={{
                padding: 12,
                borderColor: id ? "#bbf7d0" : "#e5e7eb",
                background: id ? "#f0fdf4" : "#ffffff",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <div className="muted" style={{ fontWeight: 900 }}>
                  {row.label} (Meta)
                </div>
                <div className="muted" style={{ fontWeight: 900 }}>
                  {id ? "OK" : "—"}
                </div>
              </div>
              <div style={{ marginTop: 6, fontWeight: 900 }}>{id || "—"}</div>
              <div className="muted" style={{ marginTop: 6, fontWeight: 800 }}>
                {status + " / " + effective}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

