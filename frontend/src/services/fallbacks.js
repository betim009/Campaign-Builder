import { mockCountries } from "../data/mockCountries.js";
import { mockCampaigns } from "../data/mockCampaigns.js";

export function countryCodeToFlag(code) {
  const cc = String(code || "").trim().toUpperCase();
  if (cc.length !== 2) return "🏳️";
  const base = 127397;
  const chars = [...cc].map((c) => String.fromCodePoint(base + c.charCodeAt(0)));
  return chars.join("");
}

export function asUiCountry(apiCountry) {
  if (!apiCountry) return null;
  const code = String(apiCountry.code || "").toUpperCase();
  return {
    code,
    name: apiCountry.name,
    lang: apiCountry.language_code,
    flag: countryCodeToFlag(code),
  };
}

export function fallbackCountries() {
  return mockCountries.slice();
}

export function asUiCampaign(apiCampaign) {
  if (!apiCampaign) return null;

  const status = String(apiCampaign.status || "").toLowerCase();
  const statusLabel = status === "draft" ? "Rascunho" : status === "published" ? "Publicado" : apiCampaign.status;

  const scope = String(apiCampaign.scope || "").toLowerCase();
  const scopeLabel = scope === "global" ? "Global" : apiCampaign.scope || "—";

  const createdAt = apiCampaign.created_at ? new Date(apiCampaign.created_at) : null;
  const createdAtLabel = createdAt && !Number.isNaN(createdAt.getTime())
    ? `Criado em ${createdAt.toISOString().slice(0, 10)}`
    : "Criado —";

  const countryCodes = Array.isArray(apiCampaign.country_codes) ? apiCampaign.country_codes : [];
  const config =
    apiCampaign.config && typeof apiCampaign.config === "object" && !Array.isArray(apiCampaign.config)
      ? apiCampaign.config
      : {};

  return {
    id: apiCampaign.id,
    slug: apiCampaign.slug,
    name: apiCampaign.name,
    status: statusLabel,
    scopeLabel,
    createdAtLabel,
    countryCodes,
    config,
  };
}

export function fallbackCampaigns() {
  return mockCampaigns.slice();
}
