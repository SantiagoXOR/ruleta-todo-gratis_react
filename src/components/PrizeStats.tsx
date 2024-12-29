import React, { useState, useEffect } from 'react';
import { prizeStatsService, PrizeStats, PrizeDistribution, TimeStats, StatsFilter } from '../services/prizeStatsService';
import { Icons } from './Icons';
import PrizeChart from './charts/PrizeChart';
import ExportMenu from './ExportMenu';
import '../styles/PrizeStats.css';

interface PrizeStatsProps {
  storeId?: string;
  initialFilter?: StatsFilter;
}

const PrizeStats: React.FC<PrizeStatsProps> = ({ storeId, initialFilter = {} }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PrizeStats | null>(null);
  const [distribution, setDistribution] = useState<PrizeDistribution[]>([]);
  const [timeStats, setTimeStats] = useState<TimeStats[]>([]);
  const [filter, setFilter] = useState<StatsFilter>(initialFilter);
  const [showTables, setShowTables] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const [generalResponse, distributionResponse, timeResponse] = await Promise.all([
        prizeStatsService.getGeneralStats({ ...filter, storeId }),
        prizeStatsService.getPrizeDistribution({ ...filter, storeId }),
        prizeStatsService.getTimeSeriesStats({ ...filter, storeId })
      ]);

      if (generalResponse.success && generalResponse.stats) {
        setStats(generalResponse.stats);
      }

      if (distributionResponse.success && distributionResponse.distribution) {
        setDistribution(distributionResponse.distribution);
      }

      if (timeResponse.success && timeResponse.timeStats) {
        setTimeStats(timeResponse.timeStats);
      }

      if (!generalResponse.success || !distributionResponse.success || !timeResponse.success) {
        setError('Error al cargar algunas estadísticas');
      }
    } catch (err) {
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [filter, storeId]);

  const handleFilterChange = (changes: Partial<StatsFilter>) => {
    setFilter(prev => ({
      ...prev,
      ...changes
    }));
  };

  return (
    <div className="prize-stats">
      <div className="stats-header">
        <h2 className="stats-title">
          <Icons.Chart /> Estadísticas de Premios
        </h2>
        <div className="stats-actions">
          <div className="stats-filters">
            <div className="filter-group">
              <label>Desde:</label>
              <input
                type="date"
                value={filter.startDate?.toISOString().split('T')[0] ?? ''}
                onChange={(e) => handleFilterChange({
                  startDate: e.target.value ? new Date(e.target.value) : undefined
                })}
              />
            </div>
            <div className="filter-group">
              <label>Hasta:</label>
              <input
                type="date"
                value={filter.endDate?.toISOString().split('T')[0] ?? ''}
                onChange={(e) => handleFilterChange({
                  endDate: e.target.value ? new Date(e.target.value) : undefined
                })}
              />
            </div>
          </div>

          {stats && !loading && (
            <ExportMenu
              stats={stats}
              distribution={distribution}
              timeStats={timeStats}
            />
          )}
        </div>
      </div>

      {error && (
        <div className="stats-error">
          <Icons.Error /> {error}
        </div>
      )}

      {loading ? (
        <div className="stats-loading">
          <span className="loading-spinner">
            <Icons.Spinner />
          </span>
          Cargando estadísticas...
        </div>
      ) : (
        <>
          {stats && (
            <div className="general-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <Icons.Gift />
                </div>
                <div className="stat-content">
                  <h3>Total de Premios</h3>
                  <div className="stat-value">{stats.totalPrizes}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon claimed">
                  <Icons.Check />
                </div>
                <div className="stat-content">
                  <h3>Premios Canjeados</h3>
                  <div className="stat-value">{stats.claimedPrizes}</div>
                  <div className="stat-subtitle">
                    {stats.redemptionRate}% de canje
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon pending">
                  <Icons.Clock />
                </div>
                <div className="stat-content">
                  <h3>Premios Pendientes</h3>
                  <div className="stat-value">{stats.pendingPrizes}</div>
                  <div className="stat-subtitle">
                    {stats.expiringToday} vencen hoy
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon expired">
                  <Icons.Warning />
                </div>
                <div className="stat-content">
                  <h3>Premios Vencidos</h3>
                  <div className="stat-value">{stats.expiredPrizes}</div>
                </div>
              </div>
            </div>
          )}

          <div className="stats-charts">
            {timeStats.length > 0 && (
              <div className="chart-container">
                <PrizeChart
                  type="line"
                  data={timeStats}
                  title="Evolución de Premios"
                  height={350}
                  chartId="evolution-chart"
                />
              </div>
            )}

            {distribution.length > 0 && (
              <div className="charts-row">
                <div className="chart-container">
                  <PrizeChart
                    type="pie"
                    data={distribution}
                    title="Distribución de Premios"
                    height={300}
                    chartId="distribution-chart"
                  />
                </div>
                <div className="chart-container">
                  <PrizeChart
                    type="bar"
                    data={timeStats}
                    title="Premios por Período"
                    height={300}
                    chartId="period-chart"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="detailed-stats">
            <div className="collapsible-section">
              <button
                className="collapsible-button"
                onClick={() => setShowTables(prev => !prev)}
              >
                <Icons.Table /> Ver Datos Detallados
                <span className={`arrow-icon ${showTables ? 'open' : ''}`}>
                  <Icons.ArrowDown />
                </span>
              </button>

              {showTables && (
                <div className="tables-container">
                  {distribution.length > 0 && (
                    <div className="prize-distribution">
                      <h3 className="section-title">
                        <Icons.PieChart /> Distribución de Premios
                      </h3>
                      <div className="distribution-table-container">
                        <table className="distribution-table">
                          <thead>
                            <tr>
                              <th>Premio</th>
                              <th>Total</th>
                              <th>Canjeados</th>
                              <th>Pendientes</th>
                              <th>Porcentaje</th>
                            </tr>
                          </thead>
                          <tbody>
                            {distribution.map((item) => (
                              <tr key={item.name}>
                                <td>{item.name}</td>
                                <td>{item.count}</td>
                                <td>{item.claimed}</td>
                                <td>{item.pending}</td>
                                <td>
                                  <div className="percentage-bar">
                                    <div 
                                      className="percentage-fill"
                                      style={{ width: `${item.percentage}%` }}
                                    />
                                    <span>{item.percentage}%</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {timeStats.length > 0 && (
                    <div className="time-stats">
                      <h3 className="section-title">
                        <Icons.LineChart /> Evolución Temporal
                      </h3>
                      <div className="time-table-container">
                        <table className="time-table">
                          <thead>
                            <tr>
                              <th>Fecha</th>
                              <th>Total</th>
                              <th>Canjeados</th>
                              <th>Tasa de Canje</th>
                            </tr>
                          </thead>
                          <tbody>
                            {timeStats.map((item) => (
                              <tr key={item.date}>
                                <td>{new Date(item.date).toLocaleDateString()}</td>
                                <td>{item.total}</td>
                                <td>{item.claimed}</td>
                                <td>
                                  {Math.round((item.claimed / item.total) * 100)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PrizeStats; 