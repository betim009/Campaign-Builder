import { useNavigate } from "react-router-dom";
import { useState } from "react";
import StatusBadge from "./StatusBadge.jsx";
import { BarChartIcon, LanguageIcon, PlayArrowIcon } from "../styles/icons.js";
import { duplicateCampaign } from "../services/campaigns.js";

export default function CampaignCard({
  id,
  name,
  status,
  scopeLabel,
  generatedLabel,
  createdAtLabel,
  countryFlags,
}) {
  const navigate = useNavigate();
  const [duplicating, setDuplicating] = useState(false);

  return (
    <div className="card campaignCard">
      <div className="campaignTopRow">
        <div className="campaignNameRow">
          <h3 className="campaignName">{name}</h3>
          <StatusBadge>{status}</StatusBadge>
        </div>
        <div className="campaignActions">
          <button
            type="button"
            className="pillOutline"
            onClick={() => navigate(`/campanhas/${id}`)}
            disabled={duplicating}
          >
            Ver Detalhes
          </button>
          <button
            type="button"
            className="pillOutline"
            disabled={duplicating}
            onClick={async () => {
              setDuplicating(true);
              try {
                const res = await duplicateCampaign(id);
                navigate(`/campanhas/${res.campaign.id}`);
              } catch {
                navigate(`/campanhas/${id}/duplicar`);
              } finally {
                setDuplicating(false);
              }
            }}
          >
            {duplicating ? "Duplicando..." : "Duplicar"}
          </button>
        </div>
      </div>

      <div className="campaignMetaRow">
        <LanguageIcon fontSize="small" style={{ opacity: 0.75 }} />
        <span>{scopeLabel}</span>
        <span aria-hidden="true">·</span>
        <BarChartIcon fontSize="small" style={{ opacity: 0.75 }} />
        <span>{generatedLabel}</span>
        <span aria-hidden="true">·</span>
        <PlayArrowIcon fontSize="small" style={{ opacity: 0.75 }} />
        <span>{createdAtLabel}</span>
      </div>

      <div className="campaignFlags" aria-label="Países">
        {countryFlags.map((flag) => (
          <span key={flag} aria-hidden="true">
            {flag}
          </span>
        ))}
      </div>
    </div>
  );
}
