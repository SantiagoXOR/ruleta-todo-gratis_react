import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { act } from 'react-dom/test-utils';
import App from '../../App';
import { prizeService } from '../../services/prizes';
import theme from '../../styles/theme';

// Mock de los servicios
vi.mock('../../services/prizes', () => ({
  prizeService: {
    savePrize: vi.fn(),
    getPrizeByCode: vi.fn(),
    isPrizeValid: vi.fn(),
    markPrizeAsClaimed: vi.fn(),
    getTimeToExpiry: vi.fn(),
    getActivePrizes: vi.fn(),
    getClaimedPrizes: vi.fn(),
    getExpiredPrizes: vi.fn(),
  },
}));

// Mock del hook de sonido
vi.mock('../../hooks/useSound', () => ({
  default: () => ({
    playSound: vi.fn(),
    stopSound: vi.fn(),
    stopAllSounds: vi.fn(),
  }),
}));

describe('Pruebas de Integración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe completar el flujo completo de girar y reclamar premio', async () => {
    // Configurar mocks
    const mockPrize = {
      id: 1,
      name: 'Premio Test',
      code: 'TEST123',
      claimed: false,
      timestamp: Date.now(),
    };

    (prizeService.savePrize as any).mockResolvedValue(mockPrize);
    (prizeService.getPrizeByCode as any).mockResolvedValue(mockPrize);
    (prizeService.isPrizeValid as any).mockResolvedValue(true);

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Girar la ruleta
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);

    // Esperar animación
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // Verificar que se guardó el premio
    expect(prizeService.savePrize).toHaveBeenCalled();

    // Verificar el premio
    const codeInput = screen.getByPlaceholderText('Ingresa el código del premio');
    const verifyButton = screen.getByRole('button', { name: 'Verificar premio' });

    fireEvent.change(codeInput, { target: { value: mockPrize.code } });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(prizeService.getPrizeByCode).toHaveBeenCalledWith(mockPrize.code);
    });

    // Verificar que se muestra el resultado
    expect(screen.getByText(/Premio Test/i)).toBeInTheDocument();
  });

  it('debe manejar correctamente la interacción entre componentes', async () => {
    const mockPrizes = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: `Premio ${i}`,
      code: `CODE${i}`,
      claimed: i % 2 === 0,
      timestamp: Date.now() - i * 1000,
    }));

    (prizeService.getActivePrizes as any).mockResolvedValue(mockPrizes.filter(p => !p.claimed));
    (prizeService.getClaimedPrizes as any).mockResolvedValue(mockPrizes.filter(p => p.claimed));

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Verificar que las estadísticas se actualizan después de girar
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // Verificar actualización de estadísticas
    expect(prizeService.getActivePrizes).toHaveBeenCalled();
    expect(prizeService.getClaimedPrizes).toHaveBeenCalled();

    // Verificar que los componentes están sincronizados
    mockPrizes.forEach(prize => {
      if (!prize.claimed) {
        expect(screen.getByText(new RegExp(prize.name, 'i'))).toBeInTheDocument();
      }
    });
  });

  it('debe mantener el estado global consistente', async () => {
    const mockPrize = {
      id: 1,
      name: 'Premio Global',
      code: 'GLOBAL123',
      claimed: false,
      timestamp: Date.now(),
    };

    (prizeService.savePrize as any).mockResolvedValue(mockPrize);
    (prizeService.getPrizeByCode as any).mockResolvedValue(mockPrize);
    (prizeService.isPrizeValid as any).mockResolvedValue(true);

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Realizar múltiples acciones
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    const codeInput = screen.getByPlaceholderText('Ingresa el código del premio');
    const verifyButton = screen.getByRole('button', { name: 'Verificar premio' });

    // Primera acción: Girar
    fireEvent.click(spinButton);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // Segunda acción: Verificar
    fireEvent.change(codeInput, { target: { value: mockPrize.code } });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(prizeService.getPrizeByCode).toHaveBeenCalledWith(mockPrize.code);
    });

    // Tercera acción: Girar de nuevo
    fireEvent.click(spinButton);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // Verificar consistencia del estado
    expect(screen.getByText(/Premio Global/i)).toBeInTheDocument();
  });

  it('debe manejar correctamente los errores y recuperación', async () => {
    // Simular error en el servicio
    (prizeService.savePrize as any).mockRejectedValueOnce(new Error('Error de red'));
    
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Intentar girar (fallará)
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // Verificar mensaje de error
    expect(screen.getByText(/error/i)).toBeInTheDocument();

    // Restaurar servicio y reintentar
    (prizeService.savePrize as any).mockResolvedValueOnce({
      id: 1,
      name: 'Premio Recuperación',
      code: 'RECOVERY123',
      claimed: false,
      timestamp: Date.now(),
    });

    // Intentar girar de nuevo
    fireEvent.click(spinButton);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // Verificar recuperación exitosa
    expect(screen.getByText(/Premio Recuperación/i)).toBeInTheDocument();
  });

  it('debe mantener la sincronización entre componentes durante operaciones largas', async () => {
    const mockPrizes = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      name: `Premio Largo ${i}`,
      code: `LONG${i}`,
      claimed: false,
      timestamp: Date.now(),
    }));

    let processingDelay = 2000; // Simular operación larga

    (prizeService.savePrize as any).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, processingDelay));
      return mockPrizes[0];
    });

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Iniciar operación larga
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);

    // Verificar estado de carga
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();

    // Avanzar tiempo
    await act(async () => {
      await vi.advanceTimersByTimeAsync(processingDelay);
    });

    // Verificar sincronización después de la operación
    expect(screen.getByText(/Premio Largo 0/i)).toBeInTheDocument();

    // Reducir delay y probar otra operación
    processingDelay = 500;
    fireEvent.click(spinButton);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(processingDelay);
    });

    // Verificar que los componentes siguen sincronizados
    expect(screen.getByText(/Premio Largo 0/i)).toBeInTheDocument();
  });
}); 