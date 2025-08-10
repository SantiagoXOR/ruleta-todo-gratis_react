import React from 'react';
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
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { TimeStats, PrizeDistribution } from '../../services/prizeStatsService';
import './PrizeChart.css';

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
  Legend
);

// Tipos de gráficos disponibles
export type ChartType = 'line' | 'bar' | 'pie';

interface PrizeChartProps {
  type: ChartType;
  data: TimeStats[] | PrizeDistribution[];
  title: string;
  height?: number;
  chartId?: string;
}

const PrizeChart: React.FC<PrizeChartProps> = ({
  type,
  data,
  title,
  height = 300,
  chartId
}) => {
  // Configuración base para todos los gráficos
  const baseOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: "'Montserrat', sans-serif",
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: 'rgba(255, 255, 255, 0.9)',
        font: {
          family: "'Montserrat', sans-serif",
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: "'Montserrat', sans-serif",
          size: 14
        },
        bodyFont: {
          family: "'Montserrat', sans-serif",
          size: 13
        }
      }
    },
    scales: type !== 'pie' ? {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: "'Montserrat', sans-serif"
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: "'Montserrat', sans-serif"
          }
        }
      }
    } : undefined
  };

  // Preparar datos según el tipo de gráfico
  const prepareTimeSeriesData = (timeStats: TimeStats[]): any => ({
    labels: timeStats.map(stat => new Date(stat.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Total de Premios',
        data: timeStats.map(stat => stat.total),
        borderColor: '#F4DE00',
        backgroundColor: 'rgba(244, 222, 0, 0.2)',
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: 'Premios Canjeados',
        data: timeStats.map(stat => stat.claimed),
        borderColor: '#2ED573',
        backgroundColor: 'rgba(46, 213, 115, 0.2)',
        borderWidth: 2,
        tension: 0.4
      }
    ]
  });

  const prepareDistributionData = (distribution: PrizeDistribution[]): ChartData<'pie'> => ({
    labels: distribution.map(item => item.name),
    datasets: [
      {
        data: distribution.map(item => item.count),
        backgroundColor: [
          'rgba(244, 222, 0, 0.6)',
          'rgba(46, 213, 115, 0.6)',
          'rgba(255, 168, 46, 0.6)',
          'rgba(108, 92, 231, 0.6)',
          'rgba(255, 107, 107, 0.6)',
          'rgba(78, 205, 196, 0.6)'
        ],
        borderColor: [
          '#F4DE00',
          '#2ED573',
          '#FFA82E',
          '#6C5CE7',
          '#FF6B6B',
          '#4ECDC4'
        ],
        borderWidth: 2
      }
    ]
  });

  // Renderizar el gráfico según el tipo
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <Line
            data={prepareTimeSeriesData(data as TimeStats[])}
            options={baseOptions}
            height={height}
          />
        );
      case 'bar':
        return (
          <Bar
            data={prepareTimeSeriesData(data as TimeStats[])}
            options={baseOptions}
            height={height}
          />
        );
      case 'pie':
        return (
          <Pie
            data={prepareDistributionData(data as PrizeDistribution[])}
            options={baseOptions}
            height={height}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="prize-chart" style={{ height }} id={chartId}>
      {renderChart()}
    </div>
  );
};

export default PrizeChart; 