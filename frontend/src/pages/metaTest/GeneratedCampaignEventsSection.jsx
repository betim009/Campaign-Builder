import JsonAccordion from "./JsonAccordion.jsx";

export default function GeneratedCampaignEventsSection({
  generatedCampaignId,
  loading,
  error,
  errorDetails,
  events,
  refreshDisabled,
  onRefresh,
  onDismissError,
  safeJson,
}) {
  return (
    <div id="meta-test-db-events" className="card" style={{ padding: 0, marginTop: 16 }}>
      <div style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Histórico (DB) — generated_campaign_events</div>
          <div className="muted" style={{ marginTop: 6, fontWeight: 800 }}>
            Eventos de workflow/publicação (best-effort).
          </div>
        </div>
        <button type="button" className="pillOutline" onClick={onRefresh} disabled={refreshDisabled}>
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {error ? (
        <div className="card" style={{ padding: 14, margin: "0 16px 16px", borderColor: "#fecaca", color: "#991b1b" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontWeight: 900 }}>Erro</div>
            <button
              type="button"
              className="pillOutline"
              onClick={onDismissError}
              style={{ height: 32, padding: "0 12px", fontSize: 12, fontWeight: 900 }}
            >
              Fechar
            </button>
          </div>
          <div style={{ marginTop: 6, fontWeight: 700 }}>{error}</div>
          <JsonAccordion title="Detalhes (erro DB)" value={errorDetails} safeJson={safeJson} />
        </div>
      ) : null}

      <div style={{ padding: "0 16px 16px" }}>
        {!generatedCampaignId ? (
          <div className="muted" style={{ fontWeight: 800 }}>
            Selecione um registro de `generated_campaigns` para carregar o histórico.
          </div>
        ) : events?.length ? (
          <div style={{ display: "grid", gap: 10 }}>
            {events.slice(0, 50).map((e) => (
              <div key={e.id} className="card" style={{ padding: 12 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
                  <div style={{ fontWeight: 900 }}>{e.event_type || "event"}</div>
                  <div className="muted" style={{ fontWeight: 800 }}>
                    {e.created_at ? String(e.created_at).slice(0, 19).replace("T", " ") : "—"}
                  </div>
                </div>
                <JsonAccordion title="Payload" value={e.payload} safeJson={safeJson} />
              </div>
            ))}
          </div>
        ) : (
          <div className="muted" style={{ fontWeight: 800 }}>
            Vazio.
          </div>
        )}
      </div>
    </div>
  );
}

