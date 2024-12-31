import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdvancedAnalytics from '../AdvancedAnalytics';
import { analyticsService } from '../../services/analyticsService';

// Mock del servicio de analíticas
jest.mock('../../services/analyticsService');
const mockAnalyticsService = analyticsService as jest.Mocked<typeof analyticsService>;

// Mock de datos de prueba
const mockAnalyticsData = {
  totalSpins: 1000,
  totalPrizesWon: 500,
  totalPrizesClaimed: 300,
  averageClaimTime: 30,
  prizeDistribution: {
    'Premio 1': { count: 100, percentage: 20 }
  },
  timeSeriesData: [
    { date: '2024-01-01', spins: 100, prizes: 50, claims: 30 }
  ],
  userEngagement: {
    dailyActiveUsers: 100,
    weeklyActiveUsers: 500,
    monthlyActiveUsers: 1000,
    returnRate: 0.7
  },
  performanceMetrics: {
    averageLoadTime: 1.5,
    errorRate: 0.02,
    successRate: 0.98
  }
};

describe('AdvancedAnalytics', () => {
  beforeEach(() => {
    mockAnalyticsService.getGeneralAnalytics.mockClear();
    mockAnalyticsService.generateReport.mockClear();
  });

  it('debería mostrar el estado de carga inicialmente', () => {
    mockAnalyticsService.getGeneralAnalytics.mockImplementation(
      () => new Promise(() => {})
    );

    render(<AdvancedAnalytics />);
    expect(screen.getByText('Cargando analíticas...')).toBeInTheDocument();
  });

  it('debería cargar y mostrar los datos correctamente', async () => {
    mockAnalyticsService.getGeneralAnalytics.mockResolvedValueOnce(mockAnalyticsData);

    render(<AdvancedAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Analíticas Avanzadas')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument(); // Total de Giros
      expect(screen.getByText('500')).toBeInTheDocument(); // Premios Ganados
    });
  });

  it('debería manejar errores correctamente', async () => {
    mockAnalyticsService.getGeneralAnalytics.mockRejectedValueOnce(
      new Error('Error al cargar datos')
    );

    render(<AdvancedAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar las analíticas')).toBeInTheDocument();
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });
  });

  it('debería permitir cambiar el rango de fechas', async () => {
    mockAnalyticsService.getGeneralAnalytics.mockResolvedValue(mockAnalyticsData);

    render(<AdvancedAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Analíticas Avanzadas')).toBeInTheDocument();
    });

    const startDateInput = screen.getByLabelText(/fecha inicial/i);
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });

    expect(mockAnalyticsService.getGeneralAnalytics).toHaveBeenCalledTimes(2);
  });

  it('debería permitir exportar reportes', async () => {
    mockAnalyticsService.getGeneralAnalytics.mockResolvedValue(mockAnalyticsData);
    mockAnalyticsService.generateReport.mockResolvedValue(
      new Blob(['test data'], { type: 'application/pdf' })
    );

    render(<AdvancedAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('PDF'));

    expect(mockAnalyticsService.generateReport).toHaveBeenCalledWith(
      'general',
      'pdf',
      expect.any(Object)
    );
  });

  it('debería permitir cambiar la métrica seleccionada', async () => {
    mockAnalyticsService.getGeneralAnalytics.mockResolvedValue(mockAnalyticsData);

    render(<AdvancedAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Métrica:')).toBeInTheDocument();
    });

    const metricSelect = screen.getByLabelText(/métrica/i);
    fireEvent.change(metricSelect, { target: { value: 'prizes' } });

    // Verificar que el gráfico se actualiza (esto dependerá de la implementación específica)
    expect(screen.getByText('Premios')).toBeInTheDocument();
  });

  it('debería mostrar las métricas de rendimiento', async () => {
    mockAnalyticsService.getGeneralAnalytics.mockResolvedValue(mockAnalyticsData);

    render(<AdvancedAnalytics />);

    await waitFor(() => {
      expect(screen.getByText('Métricas de Rendimiento')).toBeInTheDocument();
      expect(screen.getByText('1.50s')).toBeInTheDocument(); // Tiempo de Carga Promedio
      expect(screen.getByText('2.00%')).toBeInTheDocument(); // Tasa de Error
      expect(screen.getByText('98.00%')).toBeInTheDocument(); // Tasa de Éxito
    });
  });

  it('debería ser responsive', async () => {
    mockAnalyticsService.getGeneralAnalytics.mockResolvedValue(mockAnalyticsData);

    render(<AdvancedAnalytics />);

    await waitFor(() => {
      const container = screen.getByTestId('advanced-analytics');
      expect(container).toHaveStyle({ maxWidth: '1200px' });
    });
  });
}); 