import React, { useEffect, useState } from 'react';
import LazyChart from './LazyChart';
import { Icons } from './Icons';
import { getGeneralStats, getTimeSeriesStats, getPrizeDistribution } from '../services/prizeStatsService';
import type { ChartData } from 'chart.js';

interface PrizeStatsProps {
  className?: string;
  style?: React.CSSProperties;
}

const PrizeStats: React.FC<PrizeStatsProps> = ({ className = '', style = {} }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [generalStats, setGeneralStats] = useState<any>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<ChartData<'line'> | null>(null);
  const [distributionData, setDistributionData] = useState<ChartData<'pie'> | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Cargar todas las estadísticas en paralelo
        const [general, timeSeries, distribution] = await Promise.all([
          getGeneralStats(),
          getTimeSeriesStats(),
          getPrizeDistribution()
        ]);

        setGeneralStats(general);
        setTimeSeriesData(timeSeries);
        setDistributionData(distribution);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error al cargar las estadísticas'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className={`prize-stats-loading ${className}`} style={style}>
        <Icons.Spinner className="spin" />
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`prize-stats-error ${className}`} style={style}>
        <Icons.Error />
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={`prize-stats ${className}`} style={style}>
      {/* Estadísticas generales */}
      <div className="prize-stats-general">
        <div className="stat-card">
          <Icons.Gift />
          <div className="stat-content">
            <h3>Total de Premios</h3>
            <p>{generalStats.totalPrizes}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <Icons.Calendar />
          <div className="stat-content">
            <h3>Premios Activos</h3>
            <p>{generalStats.activePrizes}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <Icons.Chart />
          <div className="stat-content">
            <h3>Tasa de Canje</h3>
            <p>{generalStats.redemptionRate}%</p>
          </div>
        </div>
      </div>

      {/* Gráfico de línea temporal */}
      <div className="prize-stats-chart">
        <h3>Evolución Temporal</h3>
        {timeSeriesData && (
          <LazyChart
            type="line"
            data={timeSeriesData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'Premios por Período'
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        )}
      </div>

      {/* Gráfico de distribución */}
      <div className="prize-stats-chart">
        <h3>Distribución de Premios</h3>
        {distributionData && (
          <LazyChart
            type="pie"
            data={distributionData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'right' as const,
                },
                title: {
                  display: true,
                  text: 'Distribución por Categoría'
                }
              }
            }}
          />
        )}
      </div>

      {/* Acciones */}
      <div className="prize-stats-actions">
        <button onClick={() => window.print()}>
          <Icons.Download />
          Exportar Reporte
        </button>
      </div>
    </div>
  );
};

export default PrizeStats; 