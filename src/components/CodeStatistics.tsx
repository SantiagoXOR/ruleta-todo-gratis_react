import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { uniqueCodeService } from '../services/uniqueCodeService';
import './CodeStatistics.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface CodeStats {
  totalCodes: number;
  usedCodes: number;
  expiredCodes: number;
  validCodes: number;
  usageByDay: {
    date: string;
    count: number;
  }[];
  usageByPrize: {
    prizeName: string;
    count: number;
  }[];
}

export const CodeStatistics: React.FC = () => {
  const [stats, setStats] = useState<CodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await uniqueCodeService.getStatistics(timeRange);
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.error || 'Error al cargar estadísticas');
      }
    } catch (err) {
      setError('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stats-loading">
        <div className="spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="stats-error">
        <p>{error}</p>
        <button onClick={loadStats}>Reintentar</button>
      </div>
    );
  }

  const usageOverTimeData = {
    labels: stats.usageByDay.map(day => day.date),
    datasets: [
      {
        label: 'Códigos Usados',
        data: stats.usageByDay.map(day => day.count),
        borderColor: '#1a73e8',
        backgroundColor: 'rgba(26, 115, 232, 0.1)',
        fill: true,
      },
    ],
  };

  const usageByPrizeData = {
    labels: stats.usageByPrize.map(prize => prize.prizeName),
    datasets: [
      {
        label: 'Uso por Premio',
        data: stats.usageByPrize.map(prize => prize.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
      },
    ],
  };

  const statusDistributionData = {
    labels: ['Válidos', 'Usados', 'Expirados'],
    datasets: [
      {
        data: [stats.validCodes, stats.usedCodes, stats.expiredCodes],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
      },
    ],
  };

  return (
    <div className="stats-container">
      <div className="stats-header">
        <h2>Estadísticas de Códigos</h2>
        <div className="time-range-selector">
          <button
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            Semana
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            Mes
          </button>
          <button
            className={timeRange === 'year' ? 'active' : ''}
            onClick={() => setTimeRange('year')}
          >
            Año
          </button>
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <h3>Total de Códigos</h3>
          <p>{stats.totalCodes}</p>
        </div>
        <div className="stat-card">
          <h3>Códigos Válidos</h3>
          <p>{stats.validCodes}</p>
        </div>
        <div className="stat-card">
          <h3>Códigos Usados</h3>
          <p>{stats.usedCodes}</p>
        </div>
        <div className="stat-card">
          <h3>Códigos Expirados</h3>
          <p>{stats.expiredCodes}</p>
        </div>
      </div>

      <div className="stats-charts">
        <div className="chart-container">
          <h3>Uso de Códigos en el Tiempo</h3>
          <Line
            data={usageOverTimeData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>

        <div className="charts-row">
          <div className="chart-container half">
            <h3>Distribución por Estado</h3>
            <Pie
              data={statusDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                },
              }}
            />
          </div>

          <div className="chart-container half">
            <h3>Uso por Premio</h3>
            <Bar
              data={usageByPrizeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
