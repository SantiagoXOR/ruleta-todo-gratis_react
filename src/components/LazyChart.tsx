import React, { useEffect, useRef, useState } from 'react';
import { Chart as ChartJS, ChartData, ChartOptions, ChartType } from 'chart.js/auto';
import { Spinner } from './Icons';
import '../styles/LazyChart.css';

interface LazyChartProps {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  className?: string;
  style?: React.CSSProperties;
}

const LazyChart: React.FC<LazyChartProps> = ({
  type,
  data,
  options,
  className = '',
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initChart = async () => {
      try {
        if (!canvasRef.current) return;

        // Destruir el gráfico anterior si existe
        if (chartRef.current) {
          chartRef.current.destroy();
        }

        // Crear el nuevo gráfico
        chartRef.current = new ChartJS(canvasRef.current, {
          type,
          data,
          options: {
            responsive: true,
            ...options,
          },
        });

        setIsLoading(false);
      } catch (err) {
        setError('Error al cargar el gráfico');
        setIsLoading(false);
        console.error('Error al inicializar el gráfico:', err);
      }
    };

    initChart();

    // Cleanup al desmontar
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [type, data, options]);

  // Actualizar el gráfico cuando cambian los datos
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.data = data;
      chartRef.current.update();
    }
  }, [data]);

  if (error) {
    return (
      <div className={`lazy-chart lazy-chart-error ${className}`} style={style}>
        <div className="lazy-chart-error-message">
          {error}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`lazy-chart lazy-chart-loading ${className}`} style={style}>
        <Spinner className="lazy-chart-spinner" />
        <div className="lazy-chart-loading-text">
          Cargando gráfico...
        </div>
      </div>
    );
  }

  return (
    <div className={`lazy-chart ${className}`} style={style}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default LazyChart; 