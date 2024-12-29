import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import Stats from '../Stats';
import { prizeService } from '../../services/prizes';
import theme from '../../styles/theme';

// Mock de los servicios
vi.mock('../../services/prizes', () => ({
  prizeService: {
    getActivePrizes: vi.fn(),
    getClaimedPrizes: vi.fn(),
    getExpiredPrizes: vi.fn(),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('Stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar correctamente sin datos', () => {
    (prizeService.getActivePrizes as any).mockReturnValue([]);
    (prizeService.getClaimedPrizes as any).mockReturnValue([]);
    (prizeService.getExpiredPrizes as any).mockReturnValue([]);

    renderWithProviders(<Stats />);
    
    expect(screen.getByText('Estadísticas')).toBeInTheDocument();
    expect(screen.getByText('Premios Activos: 0')).toBeInTheDocument();
    expect(screen.getByText('Premios Reclamados: 0')).toBeInTheDocument();
    expect(screen.getByText('Premios Expirados: 0')).toBeInTheDocument();
  });

  it('debe mostrar estadísticas correctamente con datos', () => {
    const activePrizes = [
      { id: 1, name: 'Premio 1', code: 'CODE1' },
      { id: 2, name: 'Premio 2', code: 'CODE2' },
    ];
    
    const claimedPrizes = [
      { id: 3, name: 'Premio 3', code: 'CODE3' },
    ];
    
    const expiredPrizes = [
      { id: 4, name: 'Premio 4', code: 'CODE4' },
      { id: 5, name: 'Premio 5', code: 'CODE5' },
      { id: 6, name: 'Premio 6', code: 'CODE6' },
    ];

    (prizeService.getActivePrizes as any).mockReturnValue(activePrizes);
    (prizeService.getClaimedPrizes as any).mockReturnValue(claimedPrizes);
    (prizeService.getExpiredPrizes as any).mockReturnValue(expiredPrizes);

    renderWithProviders(<Stats />);
    
    expect(screen.getByText('Premios Activos: 2')).toBeInTheDocument();
    expect(screen.getByText('Premios Reclamados: 1')).toBeInTheDocument();
    expect(screen.getByText('Premios Expirados: 3')).toBeInTheDocument();
  });

  it('debe mostrar detalles de los premios activos', () => {
    const activePrizes = [
      { id: 1, name: 'Premio Especial', code: 'CODE1', timestamp: Date.now() },
    ];

    (prizeService.getActivePrizes as any).mockReturnValue(activePrizes);
    (prizeService.getClaimedPrizes as any).mockReturnValue([]);
    (prizeService.getExpiredPrizes as any).mockReturnValue([]);

    renderWithProviders(<Stats />);
    
    expect(screen.getByText(/Premio Especial/)).toBeInTheDocument();
    expect(screen.getByText(/CODE1/)).toBeInTheDocument();
  });

  it('debe mostrar mensaje cuando no hay premios', () => {
    (prizeService.getActivePrizes as any).mockReturnValue([]);
    (prizeService.getClaimedPrizes as any).mockReturnValue([]);
    (prizeService.getExpiredPrizes as any).mockReturnValue([]);

    renderWithProviders(<Stats />);
    
    expect(screen.getByText(/No hay premios activos/)).toBeInTheDocument();
    expect(screen.getByText(/No hay premios reclamados/)).toBeInTheDocument();
    expect(screen.getByText(/No hay premios expirados/)).toBeInTheDocument();
  });

  it('debe formatear las fechas correctamente', () => {
    const now = Date.now();
    const activePrizes = [
      { 
        id: 1, 
        name: 'Premio', 
        code: 'CODE1', 
        timestamp: now 
      },
    ];

    (prizeService.getActivePrizes as any).mockReturnValue(activePrizes);

    renderWithProviders(<Stats />);
    
    // Verificar que la fecha se muestra en formato local
    const formattedDate = new Date(now).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    expect(screen.getByText(RegExp(formattedDate))).toBeInTheDocument();
  });

  it('debe actualizar las estadísticas periódicamente', () => {
    vi.useFakeTimers();

    const initialPrizes = [{ id: 1, name: 'Premio 1', code: 'CODE1' }];
    const updatedPrizes = [
      { id: 1, name: 'Premio 1', code: 'CODE1' },
      { id: 2, name: 'Premio 2', code: 'CODE2' }
    ];

    (prizeService.getActivePrizes as any)
      .mockReturnValueOnce(initialPrizes)
      .mockReturnValueOnce(updatedPrizes);

    renderWithProviders(<Stats />);
    
    expect(screen.getByText('Premios Activos: 1')).toBeInTheDocument();

    // Avanzar 1 minuto
    vi.advanceTimersByTime(60000);

    expect(screen.getByText('Premios Activos: 2')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('debe manejar errores al cargar los datos', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    (prizeService.getActivePrizes as any).mockImplementation(() => {
      throw new Error('Error al cargar datos');
    });

    renderWithProviders(<Stats />);
    
    expect(screen.getByText('Error al cargar las estadísticas')).toBeInTheDocument();
    
    consoleErrorSpy.mockRestore();
  });
}); 