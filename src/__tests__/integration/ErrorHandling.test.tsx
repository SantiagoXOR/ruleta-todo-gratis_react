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

describe('Manejo de Errores y Recuperación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe manejar errores de red y reintentar automáticamente', async () => {
    // Simular error de red inicial
    let attemptCount = 0;
    (prizeService.savePrize as any).mockImplementation(() => {
      attemptCount++;
      if (attemptCount === 1) {
        return Promise.reject(new Error('Error de conexión'));
      }
      return Promise.resolve({
        id: 1,
        name: 'Premio Reintento',
        code: 'RETRY123',
        claimed: false,
      });
    });

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);

    // Verificar error inicial
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(screen.getByText(/Error de conexión/i)).toBeInTheDocument();

    // Verificar reintento automático
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(screen.getByText(/Premio Reintento/i)).toBeInTheDocument();
  });

  it('debe manejar errores de validación y mostrar mensajes apropiados', async () => {
    const mockValidationErrors = [
      { code: 'INVALID', message: 'Código inválido' },
      { code: 'EXPIRED', message: 'Premio expirado' },
      { code: 'CLAIMED', message: 'Premio ya reclamado' },
    ];

    for (const error of mockValidationErrors) {
      (prizeService.isPrizeValid as any).mockResolvedValueOnce(false);
      (prizeService.getPrizeByCode as any).mockResolvedValueOnce({
        error: error.message,
        code: error.code,
      });

      const codeInput = screen.getByPlaceholderText('Ingresa el código del premio');
      const verifyButton = screen.getByRole('button', { name: 'Verificar premio' });

      fireEvent.change(codeInput, { target: { value: error.code } });
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByText(error.message)).toBeInTheDocument();
      });

      // Limpiar para siguiente iteración
      fireEvent.change(codeInput, { target: { value: '' } });
    }
  });

  it('debe recuperarse de errores de almacenamiento local', async () => {
    // Simular error de localStorage
    const mockError = new Error('Error de almacenamiento');
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn().mockImplementation(() => {
      throw mockError;
    });

    const mockPrize = {
      id: 1,
      name: 'Premio Almacenamiento',
      code: 'STORAGE123',
      claimed: false,
    };

    (prizeService.savePrize as any).mockResolvedValue(mockPrize);

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // Verificar que la aplicación sigue funcionando
    expect(screen.getByText(/Premio Almacenamiento/i)).toBeInTheDocument();

    // Restaurar localStorage
    localStorage.setItem = originalSetItem;
  });

  it('debe manejar errores durante la carga inicial de datos', async () => {
    // Simular error en la carga de datos
    (prizeService.getActivePrizes as any).mockRejectedValue(new Error('Error de carga'));
    (prizeService.getClaimedPrizes as any).mockRejectedValue(new Error('Error de carga'));

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Verificar mensaje de error de carga
    expect(screen.getByText(/Error al cargar datos/i)).toBeInTheDocument();

    // Simular recuperación
    (prizeService.getActivePrizes as any).mockResolvedValue([{
      id: 1,
      name: 'Premio Recuperado',
      code: 'RECOVER123',
      claimed: false,
    }]);
    (prizeService.getClaimedPrizes as any).mockResolvedValue([]);

    // Forzar recarga
    const reloadButton = screen.getByRole('button', { name: /recargar/i });
    fireEvent.click(reloadButton);

    await waitFor(() => {
      expect(screen.getByText(/Premio Recuperado/i)).toBeInTheDocument();
    });
  });

  it('debe manejar errores de animación y sonido', async () => {
    // Simular error en la reproducción de sonido
    const mockPlaySound = vi.fn().mockImplementation(() => {
      throw new Error('Error de audio');
    });

    vi.mock('../../hooks/useSound', () => ({
      default: () => ({
        playSound: mockPlaySound,
        stopSound: vi.fn(),
        stopAllSounds: vi.fn(),
      }),
    }));

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);

    // Verificar que la aplicación continúa funcionando
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // La ruleta debería seguir girando incluso sin sonido
    expect(screen.getByRole('button', { name: 'Girar' })).toBeInTheDocument();
  });

  it('debe manejar múltiples errores simultáneos', async () => {
    // Simular múltiples errores
    const errors = {
      save: new Error('Error al guardar'),
      load: new Error('Error al cargar'),
      validate: new Error('Error de validación'),
    };

    let errorCount = 0;
    (prizeService.savePrize as any).mockRejectedValue(errors.save);
    (prizeService.getActivePrizes as any).mockRejectedValue(errors.load);
    (prizeService.isPrizeValid as any).mockRejectedValue(errors.validate);

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Intentar múltiples operaciones
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    const codeInput = screen.getByPlaceholderText('Ingresa el código del premio');
    const verifyButton = screen.getByRole('button', { name: 'Verificar premio' });

    // Realizar acciones simultáneas
    fireEvent.click(spinButton);
    fireEvent.change(codeInput, { target: { value: 'TEST123' } });
    fireEvent.click(verifyButton);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    // Verificar que se muestran los errores
    expect(screen.getAllByText(/error/i)).toHaveLength(2); // Dos mensajes de error visibles

    // Simular recuperación gradual
    (prizeService.savePrize as any).mockResolvedValue({
      id: 1,
      name: 'Premio Recuperación',
      code: 'RECOVERY123',
      claimed: false,
    });

    fireEvent.click(spinButton);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // Verificar recuperación
    expect(screen.getByText(/Premio Recuperación/i)).toBeInTheDocument();
  });
}); 