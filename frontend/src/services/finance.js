import { apiGet, HttpError } from "./http.js";
import { mockFinancial } from "../data/mockFinancial.js";

function todayUtcYyyyMmDd() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysUtc(yyyyMmDd, days) {
  const [y, m, d] = String(yyyyMmDd).split("-").map((v) => Number(v));
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatCurrencyBRLFromCents(cents) {
  const value = (Number(cents) || 0) / 100;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatInt(n) {
  return new Intl.NumberFormat("pt-BR").format(Number(n) || 0);
}

function formatDdMm(yyyyMmDd) {
  const [y, m, d] = String(yyyyMmDd).split("-");
  if (!y || !m || !d) return String(yyyyMmDd);
  return `${d}/${m}`;
}

export function buildFinanceRange(periodLabel) {
  const today = todayUtcYyyyMmDd();
  if (periodLabel === "Hoje") return { since: today, until: today };
  if (periodLabel === "Ontem") {
    const y = addDaysUtc(today, -1);
    return { since: y, until: y };
  }
  if (periodLabel === "30 dias") return { since: addDaysUtc(today, -29), until: today };
  return { since: addDaysUtc(today, -6), until: today };
}

export async function getFinanceOverview({ since, until, limit = 200 } = {}) {
  try {
    const query = new URLSearchParams();
    if (since) query.set("since", since);
    if (until) query.set("until", until);
    if (limit) query.set("limit", String(limit));
    const data = await apiGet(`/api/finance/overview?${query.toString()}`);
    return { ok: true, data, source: "api" };
  } catch (err) {
    const shouldFallback = err instanceof HttpError ? err.status === 503 || err.status === 0 : true;
    if (!shouldFallback) throw err;
    return { ok: false, data: null, source: "fallback" };
  }
}

export function toFinanceViewModel(overview, { countryNameByCode } = {}) {
  const totals = overview?.totals ?? {};
  const spendSeries = Array.isArray(overview?.spend_series) ? overview.spend_series : [];
  const breakdown = Array.isArray(overview?.breakdown) ? overview.breakdown : [];

  const metrics = {
    spendTotal: formatCurrencyBRLFromCents(totals.spend_cents),
    cpm: totals.cpm_cents === null ? "—" : formatCurrencyBRLFromCents(totals.cpm_cents),
    clicks: formatInt(totals.clicks),
    impressions: formatInt(totals.impressions),
    cpc: totals.cpc_cents === null ? "—" : formatCurrencyBRLFromCents(totals.cpc_cents),
  };

  const spendSeriesPoints = spendSeries.map((p) => ({
    label: formatDdMm(p.metric_date),
    value: Math.round((Number(p.spend_cents) || 0) / 100),
  }));

  const rows = breakdown.map((r) => {
    const countryCode = r.country_code;
    const countryName = countryNameByCode?.[countryCode] || countryCode;
    const status = String(r.status || "").toUpperCase() === "ACTIVE" ? "Ativo" : "Pausado";

    return {
      campaign: r.campaign_name,
      countryCode,
      country: countryName,
      spend: formatCurrencyBRLFromCents(r.spend_cents),
      impressions: formatInt(r.impressions),
      clicks: formatInt(r.clicks),
      cpc: r.cpc_cents === null ? "—" : formatCurrencyBRLFromCents(r.cpc_cents),
      cpm: r.cpm_cents === null ? "—" : formatCurrencyBRLFromCents(r.cpm_cents),
      status,
    };
  });

  return { metrics, spendSeries: spendSeriesPoints, tableRows: rows };
}

export async function getFinancePeriodsViewModel({ periodOptions, countryNameByCode } = {}) {
  const options = Array.isArray(periodOptions) ? periodOptions : mockFinancial.filters.periodOptions;
  const results = await Promise.all(
    options.map(async (label) => {
      const range = buildFinanceRange(label);
      const overview = await getFinanceOverview(range);
      return { label, overview };
    }),
  );

  const out = {};
  for (const { label, overview } of results) {
    if (overview.ok) {
      out[label] = toFinanceViewModel(overview.data, { countryNameByCode });
    }
  }

  if (Object.keys(out).length === 0) {
    return { ok: true, periods: mockFinancial.periods, source: "fallback" };
  }

  return { ok: true, periods: out, source: "api" };
}
