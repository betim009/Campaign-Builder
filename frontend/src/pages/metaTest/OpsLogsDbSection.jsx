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
    <div id="meta-test-ops-logs-db" className="card" style={{ padding: 0, marginTop: 16 }}>
      <div style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Logs persistidos (DB) — ops_logs</div>
          <div className="muted" style={{ marginTop: 6, fontWeight: 800 }}>
            Evidência de persistência operacional (source: <b>meta-test</b>).
          </div>
          <div className="muted" style={{ marginTop: 8, fontWeight: 800 }}>
            {loading ? "Carregando..." : `${opsLogs.length} log(s)`}
          </div>
        </div>
        <button type="button" className="pillOutline" onClick={onRefresh} disabled={refreshDisabled}>
          {loading ? "Atualizando..." : "Atualizar do DB"}
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
          {errorDetails ? (
            <pre
              style={{
                marginTop: 12,
                background: "#0b1220",
                color: "#e5e7eb",
                padding: 12,
                borderRadius: 12,
                overflowX: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
{safeJson(errorDetails)}
            </pre>
          ) : null}
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
    </div>
  );
}

