import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PredictiveAnalytics from '../../components/PredictiveAnalytics';
import { predictiveAnalyticsService } from '../../services/predictiveAnalyticsService';

// Mock del servicio
jest.mock('../../services/predictiveAnalyticsService');

describe('PredictiveAnalytics Integration Tests', () => {
  const mockPredictions = {
    expectedValue: 100,
    confidence: 0.85,
    trend: 'up' as const,
    factors: [
      { name: 'Temporada', impact: 0.7 },
      { name: 'Día de la semana', impact: 0.3 }
    ]
  };

  const mockTrends = {
    historicalData: [10, 20, 30],
    prediction: [35, 40, 45],
    seasonality: {
      daily: [1, 2, 3, 4, 5, 6, 7],
      weekly: [10, 15, 20, 25, 30, 35, 40],
      monthly: [100, 110, 120, 130]
    },
    correlations: {
      'Temperatura': 0.8,
      'Precipitación': -0.3
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (predictiveAnalyticsService.getPrizePredictions as jest.Mock).mockResolvedValue(mockPredictions);
    (predictiveAnalyticsService.analyzeTrends as jest.Mock).mockResolvedValue(mockTrends);
  });

  it('debería cargar y mostrar datos predictivos correctamente', async () => {
    render(<PredictiveAnalytics prizeId="prize-123" />);

    // Verificar estado de carga
    expect(screen.getByText('Cargando análisis predictivo...')).toBeInTheDocument();

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.getByText('Análisis Predictivo')).toBeInTheDocument();
    });

    // Verificar que se muestran las predicciones
    expect(screen.getByText('Tendencia Esperada')).toBeInTheDocument();
    expect(screen.getByText('Subida')).toBeInTheDocument();
    expect(screen.getByText('Confianza: 85.0%')).toBeInTheDocument();

    // Verificar que se muestran los factores
    expect(screen.getByText('Factores de Influencia')).toBeInTheDocument();
    expect(screen.getByText('Temporada')).toBeInTheDocument();
    expect(screen.getByText('Día de la semana')).toBeInTheDocument();
  });

  it('debería manejar errores correctamente', async () => {
    (predictiveAnalyticsService.getPrizePredictions as jest.Mock).mockRejectedValue(
      new Error('Error al cargar datos')
    );

    render(<PredictiveAnalytics prizeId="prize-123" />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar los datos predictivos')).toBeInTheDocument();
    });

    // Verificar que se muestra el botón de reintentar
    const retryButton = screen.getByText('Reintentar');
    expect(retryButton).toBeInTheDocument();

    // Simular clic en reintentar
    (predictiveAnalyticsService.getPrizePredictions as jest.Mock).mockResolvedValueOnce(mockPredictions);
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Análisis Predictivo')).toBeInTheDocument();
    });
  });

  it('debería actualizar datos al cambiar el timeframe', async () => {
    render(<PredictiveAnalytics prizeId="prize-123" />);

    await waitFor(() => {
      expect(screen.getByText('Análisis Predictivo')).toBeInTheDocument();
    });

    // Cambiar timeframe
    const timeframeSelect = screen.getByRole('combobox', { name: '' });
    fireEvent.change(timeframeSelect, { target: { value: 'month' } });

    // Verificar que se llamó al servicio con los nuevos parámetros
    await waitFor(() => {
      expect(predictiveAnalyticsService.analyzeTrends).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Date),
        expect.any(Date)
      );
    });
  });

  it('debería mostrar gráficos y correlaciones correctamente', async () => {
    render(<PredictiveAnalytics prizeId="prize-123" />);

    await waitFor(() => {
      expect(screen.getByText('Tendencias y Predicciones')).toBeInTheDocument();
      expect(screen.getByText('Patrones de Estacionalidad')).toBeInTheDocument();
    });

    // Verificar que se muestran las correlaciones
    expect(screen.getByText('Correlaciones')).toBeInTheDocument();
    expect(screen.getByText('Temperatura')).toBeInTheDocument();
    expect(screen.getByText('Precipitación')).toBeInTheDocument();
  });

  it('debería permitir cambiar la métrica de análisis', async () => {
    render(<PredictiveAnalytics prizeId="prize-123" />);

    await waitFor(() => {
      expect(screen.getByText('Análisis Predictivo')).toBeInTheDocument();
    });

    // Cambiar métrica
    const metricSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(metricSelect, { target: { value: 'claims' } });

    // Verificar que se llamó al servicio con la nueva métrica
    await waitFor(() => {
      expect(predictiveAnalyticsService.analyzeTrends).toHaveBeenCalledWith(
        'claims',
        expect.any(Date),
        expect.any(Date)
      );
    });
  });

  it('debería mantener el estado de la UI durante las actualizaciones', async () => {
    render(<PredictiveAnalytics prizeId="prize-123" />);

    await waitFor(() => {
      expect(screen.getByText('Análisis Predictivo')).toBeInTheDocument();
    });

    // Cambiar timeframe y métrica
    const timeframeSelect = screen.getByRole('combobox', { name: '' });
    const metricSelect = screen.getAllByRole('combobox')[1];

    fireEvent.change(timeframeSelect, { target: { value: 'month' } });
    fireEvent.change(metricSelect, { target: { value: 'claims' } });

    // Verificar que la UI mantiene los valores seleccionados
    expect(timeframeSelect).toHaveValue('month');
    expect(metricSelect).toHaveValue('claims');

    // Simular actualización de datos
    const newTrends = { ...mockTrends };
    (predictiveAnalyticsService.analyzeTrends as jest.Mock).mockResolvedValueOnce(newTrends);

    await waitFor(() => {
      expect(timeframeSelect).toHaveValue('month');
      expect(metricSelect).toHaveValue('claims');
    });
  });

  it('debería manejar la ausencia de datos correctamente', async () => {
    (predictiveAnalyticsService.getPrizePredictions as jest.Mock).mockResolvedValue(null);
    (predictiveAnalyticsService.analyzeTrends as jest.Mock).mockResolvedValue(null);

    render(<PredictiveAnalytics prizeId="prize-123" />);

    await waitFor(() => {
      expect(screen.getByText('Análisis Predictivo')).toBeInTheDocument();
    });

    // Verificar que no se muestran las secciones que requieren datos
    expect(screen.queryByText('Tendencia Esperada')).not.toBeInTheDocument();
    expect(screen.queryByText('Factores de Influencia')).not.toBeInTheDocument();
  });
}); 