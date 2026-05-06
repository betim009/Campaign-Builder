import { useParams, useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";
import { useEffect, useState } from "react";
import { duplicateCampaign, getCampaign } from "../services/campaigns.js";

export default function CampanhaDuplicar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setError("");
    getCampaign(id)
      .then((res) => {
        if (!alive) return;
        setCampaign(res.campaign);
        setName(`${res.campaign?.name ?? "Campanha"} (cópia)`);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err?.message ? String(err.message) : "Falha ao carregar campanha.");
      });
    return () => {
      alive = false;
    };
  }, [id]);

  return (
    <PageShell
      title="Duplicar Campanha"
      subtitle={campaign ? campaign.name : "Campanha"}
      backFallbackTo={`/campanhas/${id}`}
    >
      {error ? (
        <div className="card" style={{ padding: 18, borderColor: "#fecaca", color: "#991b1b" }}>
          <div style={{ fontWeight: 900 }}>Erro</div>
          <div style={{ marginTop: 6, fontWeight: 700 }}>{error}</div>
        </div>
      ) : null}

      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 900, color: "#374151" }}>Nome da nova campanha</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Minha campanha (cópia)"
            style={{
              height: 48,
              borderRadius: 14,
              border: "1px solid #e5e7eb",
              padding: "0 16px",
              fontSize: 14,
              fontWeight: 700,
              outline: "none",
              background: "#ffffff",
            }}
          />
        </div>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" className="pillOutline" onClick={() => navigate(`/campanhas/${id}`)} disabled={busy}>
            Cancelar
          </button>
          <button
            type="button"
            className="pillOutline"
            disabled={busy || !campaign || name.trim() === ""}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                const res = await duplicateCampaign(id, { name: name.trim() });
                navigate(`/campanhas/${res.campaign.id}`);
              } catch (err) {
                setError(err?.message ? String(err.message) : "Falha ao duplicar campanha.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Duplicando..." : "Duplicar"}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
