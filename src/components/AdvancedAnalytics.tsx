import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { analyticsService, AnalyticsData } from '../services/analyticsService';
import { Icons } from './Icons';
import LazyChart from './LazyChart';
import '../styles/AdvancedAnalytics.css';
import '../styles/animations.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// Componentes optimizados
const SummaryCard = React.memo(({ title, value }: { title: string; value: string }) => (
  <div className="summary-card card-hover">
    <h3>{title}</h3>
    <p className="stat-value">{value}</p>
  </div>
));

const MetricSelector = React.memo(({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void;
}) => (
  <div className="metric-selector">
    <label>Métrica:</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="transition-all hover-bright"
    >
      <option value="spins">Giros</option>
      <option value="prizes">Premios</option>
      <option value="claims">Canjes</option>
    </select>
  </div>
));

const IntervalSelector = React.memo(({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void;
}) => (
  <div className="interval-selector">
    <label>Intervalo:</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="transition-all hover-bright"
    >
      <option value="hour">Por Hora</option>
      <option value="day">Por Día</option>
      <option value="week">Por Semana</option>
      <option value="month">Por Mes</option>
    </select>
  </div>
));

const ExportButton = React.memo(({ 
  format, 
  onClick, 
  icon, 
  label 
}: { 
  format: 'pdf' | 'xlsx' | 'csv'; 
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button 
    onClick={onClick} 
    className="transition-all hover-lift button-press"
  >
    {icon} {label}
  </button>
));

const PerformanceMetric = React.memo(({ 
  label, 
  value 
}: { 
  label: string; 
  value: string;
}) => (
  <div className="metric-item transition-all">
    <label>{label}</label>
    <span>{value}</span>
  </div>
));

const AdvancedAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  });
  const [selectedMetric, setSelectedMetric] = useState<'spins' | 'prizes' | 'claims'>('spins');
  const [timeInterval, setTimeInterval] = useState<'hour' | 'day' | 'week' | 'month'>('day');

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getGeneralAnalytics(
        dateRange.startDate,
        dateRange.endDate
      );
      setAnalytics(data);
    } catch (error) {
      setError('Error al cargar las analíticas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleExport = useCallback(async (format: 'pdf' | 'xlsx' | 'csv') => {
    try {
      const blob = await analyticsService.generateReport('general', format, {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString()
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('Error al exportar el reporte');
      console.error(error);
    }
  }, [dateRange]);

  const handleMetricChange = useCallback((value: string) => {
    setSelectedMetric(value as 'spins' | 'prizes' | 'claims');
  }, []);

  const handleIntervalChange = useCallback((value: string) => {
    setTimeInterval(value as 'hour' | 'day' | 'week' | 'month');
  }, []);

  const timeSeriesChartData = useMemo(() => {
    if (!analytics?.timeSeriesData) return null;

    return {
      labels: analytics.timeSeriesData.map(d => d.date),
      datasets: [
        {
          label: selectedMetric === 'spins' ? 'Giros' : 
                 selectedMetric === 'prizes' ? 'Premios' : 'Canjes',
          data: analytics.timeSeriesData.map(d => d[selectedMetric]),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
  }, [analytics?.timeSeriesData, selectedMetric]);

  const distributionChartData = useMemo(() => {
    if (!analytics?.prizeDistribution) return null;

    return {
      labels: Object.keys(analytics.prizeDistribution),
      datasets: [{
        data: Object.values(analytics.prizeDistribution).map(d => d.percentage),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }]
    };
  }, [analytics?.prizeDistribution]);

  const engagementChartData = useMemo(() => {
    if (!analytics?.userEngagement) return null;

    return {
      labels: ['Diarios', 'Semanales', 'Mensuales'],
      datasets: [{
        label: 'Usuarios Activos',
        data: [
          analytics.userEngagement.dailyActiveUsers,
          analytics.userEngagement.weeklyActiveUsers,
          analytics.userEngagement.monthlyActiveUsers
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.5)'
      }]
    };
  }, [analytics?.userEngagement]);

  if (loading) {
    return (
      <div className="analytics-loading animate-fade-in">
        <Icons.Spinner className="spin" />
        <p>Cargando analíticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error animate-fade-in error-shake">
        <Icons.Error />
        <p>{error}</p>
        <button onClick={loadAnalytics} className="button-press">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="advanced-analytics animate-fade-in" data-testid="advanced-analytics">
      <div className="analytics-header animate-slide-top">
        <h2>
          <Icons.Chart /> Analíticas Avanzadas
        </h2>
        <div className="header-controls">
          <div className="date-range transition-all">
            <input
              type="date"
              value={dateRange.startDate.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({
                ...prev,
                startDate: new Date(e.target.value)
              }))}
              className="transition-all hover-bright"
            />
            <span>hasta</span>
            <input
              type="date"
              value={dateRange.endDate.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({
                ...prev,
                endDate: new Date(e.target.value)
              }))}
              className="transition-all hover-bright"
            />
          </div>
          <div className="export-controls">
            <ExportButton
              format="pdf"
              onClick={() => handleExport('pdf')}
              icon={<Icons.Document />}
              label="PDF"
            />
            <ExportButton
              format="xlsx"
              onClick={() => handleExport('xlsx')}
              icon={<Icons.Table />}
              label="Excel"
            />
            <ExportButton
              format="csv"
              onClick={() => handleExport('csv')}
              icon={<Icons.Download />}
              label="CSV"
            />
          </div>
        </div>
      </div>

      <div className="analytics-summary stagger-enter">
        <SummaryCard
          title="Total de Giros"
          value={analytics?.totalSpins.toLocaleString() || '0'}
        />
        <SummaryCard
          title="Premios Ganados"
          value={analytics?.totalPrizesWon.toLocaleString() || '0'}
        />
        <SummaryCard
          title="Tasa de Canje"
          value={`${((analytics?.totalPrizesClaimed || 0) / (analytics?.totalPrizesWon || 1) * 100).toFixed(1)}%`}
        />
        <SummaryCard
          title="Tiempo Promedio de Canje"
          value={`${Math.round(analytics?.averageClaimTime || 0)} min`}
        />
      </div>

      <div className="chart-controls animate-slide-left">
        <MetricSelector value={selectedMetric} onChange={handleMetricChange} />
        <IntervalSelector value={timeInterval} onChange={handleIntervalChange} />
      </div>

      <div className="charts-grid stagger-enter">
        <div className="chart-container card-hover">
          {timeSeriesChartData && (
            <LazyChart
              type="line"
              data={timeSeriesChartData}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Tendencia en el Tiempo'
                  }
                }
              }}
            />
          )}
        </div>
        <div className="chart-container card-hover">
          {distributionChartData && (
            <LazyChart
              type="pie"
              data={distributionChartData}
              options={{
                plugins: {
                  title: {
                    display: true,
                    text: 'Distribución de Premios'
                  }
                }
              }}
            />
          )}
        </div>
        <div className="chart-container card-hover">
          {engagementChartData && (
            <LazyChart
              type="bar"
              data={engagementChartData}
              options={{
                plugins: {
                  title: {
                    display: true,
                    text: 'Engagement de Usuarios'
                  }
                }
              }}
            />
          )}
        </div>
      </div>

      {analytics?.performanceMetrics && (
        <div className="performance-metrics animate-slide-bottom card-hover">
          <h3>Métricas de Rendimiento</h3>
          <div className="metrics-grid">
            <PerformanceMetric
              label="Tiempo de Carga Promedio"
              value={`${analytics.performanceMetrics.averageLoadTime.toFixed(2)}s`}
            />
            <PerformanceMetric
              label="Tasa de Error"
              value={`${(analytics.performanceMetrics.errorRate * 100).toFixed(2)}%`}
            />
            <PerformanceMetric
              label="Tasa de Éxito"
              value={`${(analytics.performanceMetrics.successRate * 100).toFixed(2)}%`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(AdvancedAnalytics);