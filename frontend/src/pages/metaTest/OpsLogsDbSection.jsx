import CollapsibleCard from "./CollapsibleCard.jsx";
import JsonAccordion from "./JsonAccordion.jsx";

export default function OpsLogsDbSection({
  loading,
  error,
  errorDetails,
  opsLogs,
  refreshDisabled,
  onRefresh,
  onDismissError,
  safeJson,
}) {
  return (
    <CollapsibleCard
      id="meta-test-ops-logs-db"
      title="Logs persistidos (DB) — ops_logs"
      description={
        <>
          Evidência de persistência operacional (source: <b>meta-test</b>).
        </>
      }
      meta={<>{loading ? "Carregando..." : `${opsLogs.length} log(s)`}</>}
      defaultOpen={false}
      headerRight={
        <button type="button" className="pillOutline" onClick={onRefresh} disabled={refreshDisabled}>
          {loading ? "Atualizando..." : "Atualizar do DB"}
        </button>
      }
    >

      {error ? (
        <div className="card" style={{ padding: 14, marginTop: 12, borderColor: "#fecaca", color: "#991b1b" }}>
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

      <div style={{ borderTop: "1px solid #e5e7eb", overflowX: "auto" }}>
        <table className="dataTable" style={{ marginTop: 0 }}>
          <thead>
            <tr>
              <th>Quando (DB)</th>
              <th>Entity</th>
              <th>Ação</th>
              <th>OK</th>
              <th>Erro</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {opsLogs.map((l) => (
              <tr key={l.id}>
                <td className="muted" style={{ fontWeight: 800 }}>
                  {l.created_at ? String(l.created_at).slice(0, 19).replace("T", " ") : "—"}
                </td>
                <td className="muted" style={{ fontWeight: 900 }}>{l.entity || "—"}</td>
                <td style={{ fontWeight: 900 }}>{l.action || "—"}</td>
                <td className="muted" style={{ fontWeight: 900 }}>{l.ok ? "SIM" : "NÃO"}</td>
                <td className="muted" style={{ fontWeight: 800 }}>{l.error || "—"}</td>
                <td className="muted" style={{ fontWeight: 800, maxWidth: 520 }}>{safeJson(l.details ?? null)}</td>
              </tr>
            ))}
            {!opsLogs.length && !loading ? (
              <tr>
                <td colSpan={6} className="muted" style={{ fontWeight: 800 }}>
                  Vazio. Execute ações no `/meta-test` e clique em “Atualizar do DB”.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </CollapsibleCard>
  );
}
