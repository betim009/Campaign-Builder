import { getBackendBaseUrl } from "../../services/http.js";
import CollapsibleCard from "./CollapsibleCard.jsx";
import JsonAccordion from "./JsonAccordion.jsx";
import { copyTextToClipboard } from "./metaTestUtils.js";

export default function CreativeAssetsSection({
  loading,
  error,
  errorDetails,
  assets,
  onRefresh,
  refreshDisabled,
  onDismissError,
  onUpload,
  uploadDisabled,
  safeJson,
}) {
  const baseUrl = getBackendBaseUrl();
  return (
    <CollapsibleCard
      id="meta-test-creative-assets"
      title="Mídia (dev) — upload local"
      description="Upload via backend + persistência no Postgres. Não cria Creative na Meta (ainda)."
      meta={<>{loading ? "Carregando..." : `${assets.length} asset(s)`}</>}
      defaultOpen={false}
      headerRight={
        <button type="button" className="pillOutline" onClick={onRefresh} disabled={refreshDisabled}>
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      }
    >

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span className="muted" style={{ fontWeight: 900 }}>
            Arquivo
          </span>
          <input type="file" onChange={(e) => onUpload(e.target.files?.[0] ?? null)} disabled={uploadDisabled} />
        </label>
        <div className="muted" style={{ fontWeight: 800 }}>
          Dica: use arquivos pequenos (dev). O backend limita em 15MB.
        </div>
      </div>

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
          <JsonAccordion title="Detalhes (erro upload/assets)" value={errorDetails} safeJson={safeJson} />
        </div>
      ) : null}

      <div style={{ marginTop: 12, borderTop: "1px solid #e5e7eb", overflowX: "auto" }}>
        <table className="dataTable" style={{ marginTop: 0 }}>
          <thead>
            <tr>
              <th>Criado</th>
              <th>ID</th>
              <th>Nome</th>
              <th>MIME</th>
              <th>Tamanho</th>
              <th>URL</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.id}>
                <td className="muted" style={{ fontWeight: 800 }}>
                  {a.created_at ? String(a.created_at).slice(0, 19).replace("T", " ") : "—"}
                </td>
                <td className="muted" style={{ fontWeight: 800 }}>{a.id}</td>
                <td style={{ fontWeight: 900 }}>{a.original_name || a.stored_name || "—"}</td>
                <td className="muted" style={{ fontWeight: 800 }}>{a.mime_type || "—"}</td>
                <td className="muted" style={{ fontWeight: 800 }}>{typeof a.size_bytes === "number" ? a.size_bytes : "—"}</td>
                <td className="muted" style={{ fontWeight: 800 }}>
                  {a.url ? `${baseUrl}${a.url}` : "—"}
                </td>
                <td>
                  <button
                    type="button"
                    className="pillOutline"
                    disabled={!a.url}
                    onClick={async () => {
                      try {
                        await copyTextToClipboard(a.url ? `${baseUrl}${a.url}` : "");
                      } catch {
                        // ignore
                      }
                    }}
                    style={{ height: 32, padding: "0 12px", fontSize: 12, fontWeight: 900 }}
                  >
                    Copiar URL
                  </button>
                </td>
              </tr>
            ))}
            {!assets.length && !loading ? (
              <tr>
                <td colSpan={7} className="muted" style={{ fontWeight: 800 }}>
                  Vazio. Faça upload acima para criar um asset.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </CollapsibleCard>
  );
}
