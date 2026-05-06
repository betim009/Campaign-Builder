import { apiGet, HttpError } from "./http.js";
import { asUiCountry, fallbackCountries } from "./fallbacks.js";

export async function getCountries({ limit = 500 } = {}) {
  try {
    const data = await apiGet(`/api/countries?limit=${encodeURIComponent(String(limit))}`);
    const countries = Array.isArray(data?.countries) ? data.countries : [];
    const ui = countries.map(asUiCountry).filter(Boolean);
    return { ok: true, countries: ui, source: "api" };
  } catch (err) {
    const shouldFallback =
      err instanceof HttpError ? err.status === 503 || err.status === 0 : true;
    if (!shouldFallback) throw err;
    return { ok: true, countries: fallbackCountries(), source: "fallback" };
  }
}

