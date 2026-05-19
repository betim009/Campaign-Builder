import { useState } from "react";
import JsonAccordion from "./JsonAccordion.jsx";

export default function GeneratedCampaignEventsSection({
  generatedCampaignId,
  loading,
  error,
  errorDetails,
  events,
  refreshDisabled,
  onRefresh,
  checkpointDisabled,
  checkpointCreating,
  onCreateCheckpoint,
  onDismissError,
  safeJson,
}) {
  const [checkpointLabel, setCheckpointLabel] = useState("");
  const [checkpointNote, setCheckpointNote] = useState("");

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

      <div style={{ padding: "0 16px 16px" }}>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 900 }}>Checkpoint (manual)</div>
          <div className="muted" style={{ marginTop: 6, fontWeight: 800 }}>
            Registra um marco no workflow (ex: “Validado”, “Criativo bloqueado”, “Publicado”, etc).
          </div>
          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            <input
              value={checkpointLabel}
              onChange={(e) => setCheckpointLabel(e.target.value)}
              placeholder="Label (obrigatório)"
              disabled={checkpointDisabled || checkpointCreating || !generatedCampaignId}
            />
            <input
              value={checkpointNote}
              onChange={(e) => setCheckpointNote(e.target.value)}
              placeholder="Nota (opcional)"
              disabled={checkpointDisabled || checkpointCreating || !generatedCampaignId}
            />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className="pillOutline"
                disabled={
                  checkpointDisabled ||
                  checkpointCreating ||
                  !generatedCampaignId ||
                  !String(checkpointLabel || "").trim()
                }
                onClick={async () => {
                  const label = String(checkpointLabel || "").trim();
                  const note = String(checkpointNote || "").trim();
                  await onCreateCheckpoint?.({ label, note: note || null });
                  setCheckpointLabel("");
                  setCheckpointNote("");
                }}
              >
                {checkpointCreating ? "Registrando..." : "Registrar checkpoint"}
              </button>
              <button
                type="button"
                className="pillOutline"
                disabled={checkpointDisabled || checkpointCreating || (!checkpointLabel && !checkpointNote)}
                onClick={() => {
                  setCheckpointLabel("");
                  setCheckpointNote("");
                }}
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
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
