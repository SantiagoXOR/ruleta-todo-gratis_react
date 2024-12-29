import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CodeStatistics } from '../CodeStatistics';
import { uniqueCodeService } from '../../services/uniqueCodeService';

// Mock del servicio
vi.mock('../../services/uniqueCodeService', () => ({
  uniqueCodeService: {
    getStatistics: vi.fn(),
  },
}));

// Mock de chart.js para evitar errores de canvas en tests
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: class {},
  LinearScale: class {},
  PointElement: class {},
  LineElement: class {},
  BarElement: class {},
  Title: class {},
  Tooltip: class {},
  Legend: class {},
  ArcElement: class {},
}));

// Mock de react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
}));

describe('CodeStatistics', () => {
  const mockStats = {
    totalCodes: 100,
    usedCodes: 30,
    expiredCodes: 20,
    validCodes: 50,
    usageByDay: [
      { date: '2024-01-01', count: 5 },
      { date: '2024-01-02', count: 8 },
    ],
    usageByPrize: [
      { prizeName: 'Premio 1', count: 15 },
      { prizeName: 'Premio 2', count: 10 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el estado de carga inicialmente', () => {
    (uniqueCodeService.getStatistics as any).mockResolvedValue({
      success: true,
      data: mockStats,
    });

    render(<CodeStatistics />);
    expect(screen.getByText('Cargando estadísticas...')).toBeInTheDocument();
  });

  it('muestra las estadísticas cuando se cargan exitosamente', async () => {
    (uniqueCodeService.getStatistics as any).mockResolvedValue({
      success: true,
      data: mockStats,
    });

    render(<CodeStatistics />);

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument(); // Total de códigos
      expect(screen.getByText('30')).toBeInTheDocument(); // Códigos usados
      expect(screen.getByText('20')).toBeInTheDocument(); // Códigos expirados
      expect(screen.getByText('50')).toBeInTheDocument(); // Códigos válidos
    });

    // Verificar que los gráficos se renderizan
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('muestra error cuando falla la carga', async () => {
    (uniqueCodeService.getStatistics as any).mockResolvedValue({
      success: false,
      error: 'Error al cargar estadísticas',
    });

    render(<CodeStatistics />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar estadísticas')).toBeInTheDocument();
    });

    // Verificar botón de reintentar
    const retryButton = screen.getByText('Reintentar');
    expect(retryButton).toBeInTheDocument();

    // Simular click en reintentar
    fireEvent.click(retryButton);
    expect(uniqueCodeService.getStatistics).toHaveBeenCalledTimes(2);
  });

  it('cambia el rango de tiempo correctamente', async () => {
    (uniqueCodeService.getStatistics as any).mockResolvedValue({
      success: true,
      data: mockStats,
    });

    render(<CodeStatistics />);

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    // Cambiar a vista mensual
    const monthButton = screen.getByText('Mes');
    fireEvent.click(monthButton);

    expect(uniqueCodeService.getStatistics).toHaveBeenCalledWith('month');

    // Cambiar a vista anual
    const yearButton = screen.getByText('Año');
    fireEvent.click(yearButton);

    expect(uniqueCodeService.getStatistics).toHaveBeenCalledWith('year');
  });

  it('mantiene el estado activo del botón de rango seleccionado', async () => {
    (uniqueCodeService.getStatistics as any).mockResolvedValue({
      success: true,
      data: mockStats,
    });

    render(<CodeStatistics />);

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    const weekButton = screen.getByText('Semana');
    const monthButton = screen.getByText('Mes');

    expect(weekButton.className).toContain('active');
    expect(monthButton.className).not.toContain('active');

    fireEvent.click(monthButton);

    expect(weekButton.className).not.toContain('active');
    expect(monthButton.className).toContain('active');
  });

  it('maneja errores de red apropiadamente', async () => {
    (uniqueCodeService.getStatistics as any).mockRejectedValue(new Error('Network error'));

    render(<CodeStatistics />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar estadísticas')).toBeInTheDocument();
    });
  });

  it('actualiza las estadísticas al cambiar el rango de tiempo', async () => {
    (uniqueCodeService.getStatistics as any).mockResolvedValue({
      success: true,
      data: mockStats,
    });

    render(<CodeStatistics />);

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    // Cambiar rango de tiempo varias veces
    const ranges = ['Semana', 'Mes', 'Año'];
    for (const range of ranges) {
      fireEvent.click(screen.getByText(range));
      await waitFor(() => {
        expect(uniqueCodeService.getStatistics).toHaveBeenCalledWith(
          range === 'Semana' ? 'week' : range === 'Mes' ? 'month' : 'year'
        );
      });
    }
  });
});
