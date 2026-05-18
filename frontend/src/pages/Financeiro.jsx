import ExportButton from "../components/ExportButton.jsx";
import FinanceMetricCard from "../components/FinanceMetricCard.jsx";
import PeriodPills from "../components/PeriodPills.jsx";
import SelectLike from "../components/SelectLike.jsx";
import SpendLineChart from "../components/SpendLineChart.jsx";
import PageShell from "../components/PageShell.jsx";
import usePeriodFilter from "../mocks/usePeriodFilter.js";
import { useEffect, useMemo, useState } from "react";
import { getCountries } from "../services/reference.js";
import { getFinancePeriodsViewModel } from "../services/finance.js";
import {
  AdsClickIcon,
  AttachMoneyIcon,
  BarChartIcon,
  CircleIcon,
  DescriptionIcon,
  LightbulbOutlinedIcon,
  MouseIcon,
  PauseCircleOutlineIcon,
  TrendingUpIcon,
  VisibilityIcon,
} from "../styles/icons.js";

export default function Financeiro() {
  const filters = {
    accountOptions: ["Global Account", "Conta LATAM"],
    businessManagerOptions: ["Main BM", "Secondary BM"],
    account: "Global Account",
    businessManager: "Main BM",
    periodOptions: ["Hoje", "Ontem", "7 dias", "30 dias"],
    activePeriod: "7 dias",
  };
  const periodOptions = filters.periodOptions;
  const [periods, setPeriods] = useState(null);
  const [countries, setCountries] = useState([]);
  const [account, setAccount] = useState(filters.account);
  const [businessManager, setBusinessManager] = useState(filters.businessManager);
  const { activePeriod, setActivePeriod, options, data } = usePeriodFilter({
    options: periodOptions,
    initial: filters.activePeriod,
    dataByPeriod: periods,
  });
  const metrics = data?.metrics ?? {};
  const spendSeries = data?.spendSeries ?? [];
  const performanceDaily = data?.performanceDaily ?? [];
  const tableRows = data?.tableRows ?? [];
  const latestDay = performanceDaily.length ? performanceDaily[performanceDaily.length - 1] : null;
  const previousDay = performanceDaily.length > 1 ? performanceDaily[performanceDaily.length - 2] : null;
  const profitDeltaCents =
    latestDay?._raw?.profit_cents === null || latestDay?._raw?.profit_cents === undefined
      ? null
      : previousDay?._raw?.profit_cents === null || previousDay?._raw?.profit_cents === undefined
        ? null
        : Number(latestDay._raw.profit_cents) - Number(previousDay._raw.profit_cents);
  const profitDeltaLabel =
    profitDeltaCents === null
      ? "—"
      : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(profitDeltaCents / 100);

  const countryMaps = useMemo(() => {
    const nameByCode = Object.fromEntries(countries.map((c) => [c.code, c.name]));
    const flagByCode = Object.fromEntries(countries.map((c) => [c.code, c.flag]));
    return { nameByCode, flagByCode };
  }, [countries]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const countriesRes = await getCountries();
      if (!alive) return;
      const nextCountries = countriesRes.countries ?? [];
      setCountries(nextCountries);

      const nameByCode = Object.fromEntries(nextCountries.map((c) => [c.code, c.name]));
      const financeRes = await getFinancePeriodsViewModel({ periodOptions, countryNameByCode: nameByCode });
      if (!alive) return;
      setPeriods(financeRes.periods ?? null);
    })().catch(() => {
      if (!alive) return;
      setPeriods(null);
    });

    return () => {
      alive = false;
    };
  }, [periodOptions]);

  return (
    <PageShell
      title="Financeiro"
      subtitle="Acompanhe os gastos e performance das campanhas"
      backFallbackTo="/mensal"
    >
      <div className="card filtersCard">
            <div className="filtersGrid">
              <SelectLike
                label="Conta de anúncio"
                value={account}
                options={filters.accountOptions}
                onChange={(e) => setAccount(e.target.value)}
              />
              <SelectLike
                label="Business Manager"
                value={businessManager}
                options={filters.businessManagerOptions}
                onChange={(e) => setBusinessManager(e.target.value)}
              />
              <PeriodPills
                label="Período"
                options={options}
                active={activePeriod}
                onChange={setActivePeriod}
              />
            </div>
      </div>

      <section className="gridFinanceMetrics" aria-label="Métricas financeiras">
            <FinanceMetricCard
              badgeBg="#dcfce7"
              badgeColor="#16a34a"
              badgeText={<AttachMoneyIcon fontSize="small" />}
              topRight={<TrendingUpIcon fontSize="small" style={{ color: "#22c55e" }} />}
              value={metrics.spendTotal}
              labelIcon={<AttachMoneyIcon fontSize="small" />}
              label="Gasto Total"
            />
            <FinanceMetricCard
              badgeBg="#ede9fe"
              badgeColor="#7c3aed"
              badgeText={<TrendingUpIcon fontSize="small" />}
              value={metrics.roiOverall}
              labelIcon={<TrendingUpIcon fontSize="small" />}
              label="ROI (Geral)"
            />
            <FinanceMetricCard
              badgeBg="#ffedd5"
              badgeColor="#f97316"
              badgeText={<AttachMoneyIcon fontSize="small" />}
              value={metrics.roasOverall}
              labelIcon={<AttachMoneyIcon fontSize="small" />}
              label="ROAS (Geral)"
            />
            <FinanceMetricCard
              badgeBg="#dbeafe"
              badgeColor="#2563eb"
              badgeText={<TrendingUpIcon fontSize="small" />}
              value={metrics.cpm}
              labelIcon={<BarChartIcon fontSize="small" />}
              label="CPM Médio"
            />
            <FinanceMetricCard
              badgeBg="#ede9fe"
              badgeColor="#7c3aed"
              badgeText={<TrendingUpIcon fontSize="small" style={{ transform: "rotate(-45deg)" }} />}
              value={metrics.clicks}
              labelIcon={<AdsClickIcon fontSize="small" />}
              label="Cliques Totais"
            />
            <FinanceMetricCard
              badgeBg="#ffedd5"
              badgeColor="#f97316"
              badgeText={<VisibilityIcon fontSize="small" />}
              value={metrics.impressions}
              labelIcon={<VisibilityIcon fontSize="small" />}
              label="Impressões"
            />
            <FinanceMetricCard
              badgeBg="#fce7f3"
              badgeColor="#db2777"
              badgeText={<MouseIcon fontSize="small" />}
              value={metrics.cpc}
              labelIcon={<MouseIcon fontSize="small" />}
              label="CPC Médio"
            />
      </section>

      <section className="card chartCard" aria-label="Gráfico de Gastos">
            <div className="chartHeaderRow">
              <div>
                <div className="chartTitleRow">
                  <CircleIcon fontSize="small" style={{ color: "#7c3aed" }} />
                  <h2 className="chartTitle">Gráfico de Gastos</h2>
                </div>
                <p className="chartSubtitle">Evolução diária dos gastos</p>
              </div>
              <a className="chartLink" href="#" onClick={(e) => e.preventDefault()}>
                <DescriptionIcon fontSize="small" />
                Ver relatório completo
              </a>
            </div>

            <SpendLineChart points={spendSeries} />

            <div className="tipBox" role="note">
              <LightbulbOutlinedIcon fontSize="small" />
              <span>
                <span style={{ fontWeight: 900 }}>Dica:</span> Os dados são puxados
                automaticamente da Meta Ads API em tempo real
              </span>
            </div>
          </section>

      {latestDay ? (
        <section className="card" style={{ marginTop: 24, padding: 24 }} aria-label="Resumo operacional diário">
          <div style={{ fontWeight: 900, fontSize: 16 }}>Resumo operacional diário</div>
          <div className="muted" style={{ marginTop: 8, fontWeight: 800 }}>
            Último dia no período: <b>{latestDay.dateLabel}</b>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="pillOutline" style={{ background: "#ffffff", fontWeight: 900 }}>
              Gasto: {latestDay.spend}
            </span>
            <span className="pillOutline" style={{ background: "#ffffff", fontWeight: 900 }}>
              Receita: {latestDay.revenue}
            </span>
            <span className="pillOutline" style={{ background: "#ffffff", fontWeight: 900 }}>
              Lucro: {latestDay.profit}
            </span>
            <span className="pillOutline" style={{ background: "#ffffff", fontWeight: 900 }}>
              ROI: {latestDay.roi}
            </span>
            <span className="pillOutline" style={{ background: "#ffffff", fontWeight: 900 }}>
              ROAS: {latestDay.roas}
            </span>
            {profitDeltaCents !== null ? (
              <span
                className="pillOutline"
                style={{
                  background: profitDeltaCents >= 0 ? "#dcfce7" : "#fee2e2",
                  borderColor: profitDeltaCents >= 0 ? "#bbf7d0" : "#fecaca",
                  fontWeight: 900,
                }}
                title="Delta de lucro vs dia anterior (no período)"
              >
                Δ Lucro: {profitDeltaCents >= 0 ? "+" : ""}
                {profitDeltaLabel}
              </span>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="card tableCard" aria-label="Timeline de performance">
            <div className="tableHeaderRow">
              <div>
                <div className="chartTitleRow">
                  <CircleIcon fontSize="small" style={{ color: "#111827" }} />
                  <h2 className="chartTitle">Timeline de performance</h2>
                </div>
                <p className="chartSubtitle">Evolução diária de gasto/receita/ROI</p>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="dataTable">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Gasto</th>
                    <th>Receita</th>
                    <th>Lucro</th>
                    <th>ROI</th>
                    <th>ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceDaily.map((d) => (
                    <tr key={d.date}>
                      <td className="muted" style={{ fontWeight: 900 }}>
                        {d.dateLabel}
                      </td>
                      <td style={{ fontWeight: 900 }}>{d.spend}</td>
                      <td style={{ fontWeight: 900 }}>{d.revenue}</td>
                      <td style={{ fontWeight: 900 }}>{d.profit}</td>
                      <td className="muted" style={{ fontWeight: 900 }}>
                        {d.roi}
                      </td>
                      <td className="muted" style={{ fontWeight: 900 }}>
                        {d.roas}
                      </td>
                    </tr>
                  ))}
                  {!performanceDaily.length ? (
                    <tr>
                      <td colSpan={6} className="muted" style={{ fontWeight: 800 }}>
                        Vazio. Rode sync de métricas (Meta ou STUB) e recarregue.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
      </section>

      <section className="card tableCard" aria-label="Detalhamento por Campanha">
            <div className="tableHeaderRow">
              <div>
                <div className="chartTitleRow">
                  <CircleIcon fontSize="small" style={{ color: "#facc15" }} />
                  <h2 className="chartTitle">Detalhamento por Campanha</h2>
                </div>
                <p className="chartSubtitle">Performance detalhada de cada país</p>
              </div>
              <div className="exportButtons" aria-label="Exportar">
                <ExportButton>CSV</ExportButton>
                <ExportButton>Excel</ExportButton>
                <ExportButton>PDF</ExportButton>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="dataTable">
                <thead>
                  <tr>
                    <th>Campanha</th>
                    <th>País</th>
                    <th>Gasto</th>
                    <th>Receita</th>
                    <th>Lucro</th>
                    <th>ROI</th>
                    <th>ROAS</th>
                    <th>Impressões</th>
                    <th>Cliques</th>
                    <th>CPC</th>
                    <th>CPM</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((r) => (
                    <tr key={`${r.countryCode}-${r.status}`}>
                      <td style={{ fontWeight: 900 }}>{r.campaign}</td>
                      <td>
                        <span className="countryCell">
                          <span aria-hidden="true">
                            {countryMaps.flagByCode[r.countryCode]}
                          </span>
                          {r.country}
                        </span>
                      </td>
                      <td style={{ fontWeight: 900 }}>{r.spend}</td>
                      <td style={{ fontWeight: 900 }}>{r.revenue}</td>
                      <td style={{ fontWeight: 900 }}>{r.profit}</td>
                      <td className="muted" style={{ fontWeight: 900 }}>
                        {r.roi}
                      </td>
                      <td className="muted" style={{ fontWeight: 900 }}>
                        {r.roas}
                      </td>
                      <td className="muted" style={{ fontWeight: 800 }}>
                        {r.impressions}
                      </td>
                      <td className="muted" style={{ fontWeight: 800 }}>
                        {r.clicks}
                      </td>
                      <td className="muted" style={{ fontWeight: 800 }}>
                        {r.cpc}
                      </td>
                      <td className="muted" style={{ fontWeight: 800 }}>
                        {r.cpm}
                      </td>
                      <td>
                        {r.status === "Ativo" ? (
                          <span className="statusPillGreen">
                            <CircleIcon fontSize="small" style={{ fontSize: 10 }} /> Ativo
                          </span>
                        ) : (
                          <span className="statusPillYellow">
                            <PauseCircleOutlineIcon fontSize="small" /> Pausado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      </section>
    </PageShell>
  );
}
