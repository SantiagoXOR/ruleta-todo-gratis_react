import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { predictiveAnalyticsService, PredictionData, TrendAnalysis } from '../services/predictiveAnalyticsService';
import LazyChart from './LazyChart';
import { Icons } from './Icons';
import '../styles/PredictiveAnalytics.css';

interface PredictiveAnalyticsProps {
  prizeId?: string;
  userId?: string;
  className?: string;
}

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  prizeId,
  userId,
  className = ''
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const [trends, setTrends] = useState<TrendAnalysis | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [selectedMetric, setSelectedMetric] = useState<string>('participation');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [predictionsData, trendsData] = await Promise.all([
        prizeId ? predictiveAnalyticsService.getPrizePredictions(prizeId) : null,
        predictiveAnalyticsService.analyzeTrends(
          selectedMetric,
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          new Date()
        )
      ]);

      if (predictionsData) setPredictions(predictionsData);
      if (trendsData) setTrends(trendsData);
    } catch (error) {
      setError('Error al cargar los datos predictivos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [prizeId, selectedMetric]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const trendChartData = useMemo(() => {
    if (!trends) return null;

    return {
      labels: [...Array(trends.historicalData.length)].map((_, i) => `Día ${i + 1}`),
      datasets: [
        {
          label: 'Datos Históricos',
          data: trends.historicalData,
          borderColor: 'rgb(75, 192, 192)',
          fill: false
        },
        {
          label: 'Predicción',
          data: trends.prediction,
          borderColor: 'rgb(255, 99, 132)',
          borderDash: [5, 5],
          fill: false
        }
      ]
    };
  }, [trends]);

  const seasonalityChartData = useMemo(() => {
    if (!trends?.seasonality) return null;

    return {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Patrón Semanal',
          data: trends.seasonality.weekly,
          backgroundColor: 'rgba(54, 162, 235, 0.5)'
        }
      ]
    };
  }, [trends]);

  if (loading) {
    return (
      <div className="predictive-analytics-loading animate-fade-in">
        <Icons.Spinner className="spin" />
        <p>Cargando análisis predictivo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="predictive-analytics-error animate-fade-in error-shake">
        <Icons.Error />
        <p>{error}</p>
        <button onClick={loadData} className="button-press">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={`predictive-analytics ${className} animate-fade-in`}>
      <div className="predictive-header animate-slide-top">
        <h2>
          <Icons.Trend /> Análisis Predictivo
        </h2>
        <div className="header-controls">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="transition-all hover-bright"
          >
            <option value="day">Diario</option>
            <option value="week">Semanal</option>
            <option value="month">Mensual</option>
          </select>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="transition-all hover-bright"
          >
            <option value="participation">Participación</option>
            <option value="claims">Canjes</option>
            <option value="engagement">Engagement</option>
          </select>
        </div>
      </div>

      {predictions && (
        <div className="predictions-summary stagger-enter">
          <div className="prediction-card card-hover">
            <h3>Tendencia Esperada</h3>
            <div className="trend-indicator">
              <Icons.Trend className={`trend-${predictions.trend}`} />
              <span>{predictions.trend === 'up' ? 'Subida' : 
                     predictions.trend === 'down' ? 'Bajada' : 'Estable'}</span>
            </div>
            <p className="confidence">
              Confianza: {(predictions.confidence * 100).toFixed(1)}%
            </p>
          </div>
          <div className="prediction-card card-hover">
            <h3>Factores de Influencia</h3>
            <ul className="factors-list">
              {predictions.factors.map((factor, index) => (
                <li key={index} className="factor-item">
                  <span>{factor.name}</span>
                  <div className="impact-bar">
                    <div
                      className="impact-fill"
                      style={{ width: `${Math.abs(factor.impact) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="charts-grid stagger-enter">
        {trendChartData && (
          <div className="chart-container card-hover">
            <h3>Tendencias y Predicciones</h3>
            <LazyChart
              type="line"
              data={trendChartData}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Análisis de Tendencias'
                  }
                }
              }}
            />
          </div>
        )}
        {seasonalityChartData && (
          <div className="chart-container card-hover">
            <h3>Patrones de Estacionalidad</h3>
            <LazyChart
              type="bar"
              data={seasonalityChartData}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Patrones Semanales'
                  }
                }
              }}
            />
          </div>
        )}
      </div>

      {trends?.correlations && (
        <div className="correlations-section animate-slide-bottom card-hover">
          <h3>Correlaciones</h3>
          <div className="correlations-grid">
            {Object.entries(trends.correlations).map(([factor, correlation]) => (
              <div key={factor} className="correlation-item">
                <span className="factor-name">{factor}</span>
                <div className="correlation-bar">
                  <div
                    className="correlation-fill"
                    style={{
                      width: `${Math.abs(correlation) * 100}%`,
                      backgroundColor: correlation > 0 ? '#4CAF50' : '#F44336'
                    }}
                  />
                </div>
                <span className="correlation-value">
                  {(correlation * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(PredictiveAnalytics); 