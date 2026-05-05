import BackLink from "../components/BackLink.jsx";
import SpendLineChart from "../components/SpendLineChart.jsx";
import { mockFinancial } from "../data/mockFinancial.js";
import { mockCountries } from "../data/mockCountries.js";

export default function Financeiro() {
  const { filters, metrics, spendSeries, tableRows } = mockFinancial;
  const flagByCode = Object.fromEntries(
    mockCountries.map((c) => [c.code, c.flag]),
  );

  return (
    <>
      <main style={{ background: "#ffffff" }}>
        <div className="container" style={{ paddingTop: 24 }}>
          <BackLink />
          <div style={{ marginTop: 26 }}>
            <h1 className="pageTitle">Financeiro</h1>
            <p className="pageSubtitle">
              Acompanhe os gastos e performance das campanhas
            </p>
          </div>
        </div>
      </main>

      <section className="page" style={{ marginTop: 22 }}>
        <div className="container">
          <div className="card filtersCard">
            <div className="filtersGrid">
              <div>
                <div className="fieldLabel">Conta de anúncio</div>
                <div className="selectLike" role="button" aria-label="Conta de anúncio">
                  <span>{filters.account}</span>
                  <span aria-hidden="true" style={{ opacity: 0.6 }}>
                    ▾
                  </span>
                </div>
              </div>

              <div>
                <div className="fieldLabel">Business Manager</div>
                <div className="selectLike" role="button" aria-label="Business Manager">
                  <span>{filters.businessManager}</span>
                  <span aria-hidden="true" style={{ opacity: 0.6 }}>
                    ▾
                  </span>
                </div>
              </div>

              <div>
                <div className="fieldLabel">Período</div>
                <div className="periodPills" role="tablist" aria-label="Período">
                  {filters.periodOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`periodPill${opt === filters.activePeriod ? " periodPillActive" : ""}`}
                      role="tab"
                      aria-selected={opt === filters.activePeriod}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <section className="gridFinanceMetrics" aria-label="Métricas financeiras">
            <div className="card financeMetricCard">
              <div className="financeMetricTop">
                <div className="metricIconBadge" style={{ background: "#dcfce7", color: "#16a34a" }}>
                  $
                </div>
                <span aria-hidden="true" style={{ color: "#22c55e", fontWeight: 900 }}>
                  ↗
                </span>
              </div>
              <div className="financeValue">{metrics.spendTotal}</div>
              <div className="financeLabel">
                <span aria-hidden="true">💰</span> Gasto Total
              </div>
            </div>

            <div className="card financeMetricCard">
              <div className="financeMetricTop">
                <div className="metricIconBadge" style={{ background: "#dbeafe", color: "#2563eb" }}>
                  ↗
                </div>
              </div>
              <div className="financeValue">{metrics.cpm}</div>
              <div className="financeLabel">
                <span aria-hidden="true">📊</span> CPM Médio
              </div>
            </div>

            <div className="card financeMetricCard">
              <div className="financeMetricTop">
                <div className="metricIconBadge" style={{ background: "#ede9fe", color: "#7c3aed" }}>
                  ↖
                </div>
              </div>
              <div className="financeValue">{metrics.clicks}</div>
              <div className="financeLabel">
                <span aria-hidden="true">🖱</span> Cliques Totais
              </div>
            </div>

            <div className="card financeMetricCard">
              <div className="financeMetricTop">
                <div className="metricIconBadge" style={{ background: "#ffedd5", color: "#f97316" }}>
                  👁
                </div>
              </div>
              <div className="financeValue">{metrics.impressions}</div>
              <div className="financeLabel">
                <span aria-hidden="true">👁</span> Impressões
              </div>
            </div>

            <div className="card financeMetricCard">
              <div className="financeMetricTop">
                <div className="metricIconBadge" style={{ background: "#fce7f3", color: "#db2777" }}>
                  ↗
                </div>
              </div>
              <div className="financeValue">{metrics.cpc}</div>
              <div className="financeLabel">
                <span aria-hidden="true">📉</span> CPC Médio
              </div>
            </div>
          </section>

          <section className="card chartCard" aria-label="Gráfico de Gastos">
            <div className="chartHeaderRow">
              <div>
                <div className="chartTitleRow">
                  <span aria-hidden="true" style={{ color: "#7c3aed", fontSize: 22 }}>
                    ●
                  </span>
                  <h2 className="chartTitle">Gráfico de Gastos</h2>
                </div>
                <p className="chartSubtitle">Evolução diária dos gastos</p>
              </div>
              <a className="chartLink" href="#" onClick={(e) => e.preventDefault()}>
                <span aria-hidden="true">📄</span> Ver relatório completo
              </a>
            </div>

            <SpendLineChart points={spendSeries} />

            <div className="tipBox" role="note">
              <span aria-hidden="true">💡</span>
              <span>
                <span style={{ fontWeight: 900 }}>Dica:</span> Os dados são puxados
                automaticamente da Meta Ads API em tempo real
              </span>
            </div>
          </section>

          <section className="card tableCard" aria-label="Detalhamento por Campanha">
            <div className="tableHeaderRow">
              <div>
                <div className="chartTitleRow">
                  <span aria-hidden="true" style={{ color: "#facc15", fontSize: 22 }}>
                    ●
                  </span>
                  <h2 className="chartTitle">Detalhamento por Campanha</h2>
                </div>
                <p className="chartSubtitle">Performance detalhada de cada país</p>
              </div>
              <div className="exportButtons" aria-label="Exportar">
                <button type="button" className="exportButton">
                  <span aria-hidden="true">⬇</span> CSV
                </button>
                <button type="button" className="exportButton">
                  <span aria-hidden="true">⬇</span> Excel
                </button>
                <button type="button" className="exportButton">
                  <span aria-hidden="true">⬇</span> PDF
                </button>
              </div>
            </div>

            <table className="dataTable">
              <thead>
                <tr>
                  <th>Campanha</th>
                  <th>País</th>
                  <th>Gasto</th>
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
                        <span aria-hidden="true">{flagByCode[r.countryCode]}</span>
                        {r.country}
                      </span>
                    </td>
                    <td style={{ fontWeight: 900 }}>{r.spend}</td>
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
                          <span aria-hidden="true">●</span> Ativo
                        </span>
                      ) : (
                        <span className="statusPillYellow">
                          <span aria-hidden="true">⏸</span> Pausado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </section>
    </>
  );
}
