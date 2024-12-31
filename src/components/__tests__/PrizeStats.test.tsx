import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PrizeStats from '../PrizeStats';
import * as prizeStatsService from '../../services/prizeStatsService';

// Mock del servicio de estadísticas
jest.mock('../../services/prizeStatsService');

// Mock de los datos de prueba
const mockGeneralStats = {
  totalPrizes: 100,
  activePrizes: 75,
  redemptionRate: 65
};

const mockTimeSeriesData = {
  labels: ['Enero', 'Febrero', 'Marzo'],
  datasets: [
    {
      label: 'Premios',
      data: [30, 40, 30],
      borderColor: '#4a90e2',
      backgroundColor: 'rgba(74, 144, 226, 0.1)'
    }
  ]
};

const mockDistributionData = {
  labels: ['Categoría A', 'Categoría B', 'Categoría C'],
  datasets: [
    {
      data: [40, 35, 25],
      backgroundColor: ['#4a90e2', '#2ed573', '#ffa502']
    }
  ]
};

describe('PrizeStats', () => {
  beforeEach(() => {
    // Configurar los mocks antes de cada prueba
    jest.spyOn(prizeStatsService, 'getGeneralStats').mockResolvedValue(mockGeneralStats);
    jest.spyOn(prizeStatsService, 'getTimeSeriesStats').mockResolvedValue(mockTimeSeriesData);
    jest.spyOn(prizeStatsService, 'getPrizeDistribution').mockResolvedValue(mockDistributionData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería mostrar el estado de carga inicialmente', () => {
    render(<PrizeStats />);
    expect(screen.getByText('Cargando estadísticas...')).toBeInTheDocument();
  });

  it('debería cargar y mostrar las estadísticas correctamente', async () => {
    render(<PrizeStats />);

    // Verificar que se muestran las estadísticas generales
    await waitFor(() => {
      expect(screen.getByText('Total de Premios')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Premios Activos')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('Tasa de Canje')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument();
    });

    // Verificar que se llaman a todos los servicios
    expect(prizeStatsService.getGeneralStats).toHaveBeenCalledTimes(1);
    expect(prizeStatsService.getTimeSeriesStats).toHaveBeenCalledTimes(1);
    expect(prizeStatsService.getPrizeDistribution).toHaveBeenCalledTimes(1);
  });

  it('debería manejar errores correctamente', async () => {
    const error = new Error('Error al cargar las estadísticas');
    jest.spyOn(prizeStatsService, 'getGeneralStats').mockRejectedValue(error);

    render(<PrizeStats />);

    await waitFor(() => {
      expect(screen.getByText(error.message)).toBeInTheDocument();
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });
  });

  it('debería permitir reintentar la carga cuando hay un error', async () => {
    // Primero fallará, luego tendrá éxito
    jest.spyOn(prizeStatsService, 'getGeneralStats')
      .mockRejectedValueOnce(new Error('Error al cargar las estadísticas'))
      .mockResolvedValueOnce(mockGeneralStats);

    render(<PrizeStats />);

    // Esperar a que aparezca el error
    await waitFor(() => {
      expect(screen.getByText('Error al cargar las estadísticas')).toBeInTheDocument();
    });

    // Simular clic en el botón de reintentar
    const reloadButton = screen.getByText('Reintentar');
    userEvent.click(reloadButton);

    // Verificar que se cargan los datos correctamente
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  it('debería aplicar las clases y estilos personalizados', () => {
    const customClass = 'custom-stats';
    const customStyle = { backgroundColor: '#f5f5f5' };

    const { container } = render(
      <PrizeStats 
        className={customClass}
        style={customStyle}
      />
    );

    const statsContainer = container.firstChild as HTMLElement;
    expect(statsContainer).toHaveClass(customClass);
    expect(statsContainer).toHaveStyle(customStyle);
  });

  it('debería mostrar el botón de exportar', async () => {
    render(<PrizeStats />);

    await waitFor(() => {
      const exportButton = screen.getByText('Exportar Reporte');
      expect(exportButton).toBeInTheDocument();
    });
  });

  it('debería mostrar los gráficos cuando los datos están disponibles', async () => {
    render(<PrizeStats />);

    await waitFor(() => {
      expect(screen.getByText('Evolución Temporal')).toBeInTheDocument();
      expect(screen.getByText('Distribución de Premios')).toBeInTheDocument();
    });
  });

  it('debería manejar la ausencia de datos correctamente', async () => {
    jest.spyOn(prizeStatsService, 'getGeneralStats').mockResolvedValue(null);
    jest.spyOn(prizeStatsService, 'getTimeSeriesStats').mockResolvedValue(null);
    jest.spyOn(prizeStatsService, 'getPrizeDistribution').mockResolvedValue(null);

    render(<PrizeStats />);

    await waitFor(() => {
      expect(screen.queryByText('100')).not.toBeInTheDocument();
      expect(screen.queryByText('75')).not.toBeInTheDocument();
      expect(screen.queryByText('65%')).not.toBeInTheDocument();
    });
  });
}); 