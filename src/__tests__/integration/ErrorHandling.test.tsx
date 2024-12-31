import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { act } from 'react';
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

    // Configurar mocks por defecto
    (prizeService.getActivePrizes as any).mockResolvedValue([]);
    (prizeService.getClaimedPrizes as any).mockResolvedValue([]);
    (prizeService.getExpiredPrizes as any).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderApp = () => {
    return render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );
  };

  it('debe manejar errores de red y reintentar automáticamente', async () => {
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

    renderApp();

    const spinButton = await screen.findByRole('button', { name: /girar/i });
    await act(async () => {
      fireEvent.click(spinButton);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    await waitFor(() => {
      expect(screen.getByText(/error de conexión/i)).toBeInTheDocument();
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    await waitFor(() => {
      expect(screen.getByText(/premio reintento/i)).toBeInTheDocument();
    });
  });

  it('debe manejar errores de validación y mostrar mensajes apropiados', async () => {
    const mockValidationErrors = [
      { code: 'INVALID', message: 'Código inválido' },
      { code: 'EXPIRED', message: 'Premio expirado' },
      { code: 'CLAIMED', message: 'Premio ya reclamado' },
    ];

    renderApp();

    for (const error of mockValidationErrors) {
      (prizeService.isPrizeValid as any).mockResolvedValueOnce(false);
      (prizeService.getPrizeByCode as any).mockResolvedValueOnce({
        error: error.message,
        code: error.code,
      });

      const codeInput = await screen.findByPlaceholderText(/ingresa el código/i);
      const verifyButton = await screen.findByRole('button', { name: /verificar/i });

      await act(async () => {
        fireEvent.change(codeInput, { target: { value: error.code } });
        fireEvent.click(verifyButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(screen.getByText(error.message)).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.change(codeInput, { target: { value: '' } });
      });
    }
  });

  it('debe recuperarse de errores de almacenamiento local', async () => {
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

    renderApp();

    const spinButton = await screen.findByRole('button', { name: /girar/i });
    await act(async () => {
      fireEvent.click(spinButton);
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    await waitFor(() => {
      expect(screen.getByText(/premio almacenamiento/i)).toBeInTheDocument();
    });

    localStorage.setItem = originalSetItem;
  });

  it('debe manejar errores durante la carga inicial de datos', async () => {
    (prizeService.getActivePrizes as any).mockRejectedValue(new Error('Error de carga'));
    (prizeService.getClaimedPrizes as any).mockRejectedValue(new Error('Error de carga'));

    renderApp();

    await waitFor(() => {
      expect(screen.getByText(/error al cargar datos/i)).toBeInTheDocument();
    });

    (prizeService.getActivePrizes as any).mockResolvedValue([{
      id: 1,
      name: 'Premio Recuperado',
      code: 'RECOVER123',
      claimed: false,
    }]);
    (prizeService.getClaimedPrizes as any).mockResolvedValue([]);

    const reloadButton = await screen.findByRole('button', { name: /recargar/i });
    await act(async () => {
      fireEvent.click(reloadButton);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    await waitFor(() => {
      expect(screen.getByText(/premio recuperado/i)).toBeInTheDocument();
    });
  });

  it('debe manejar errores de animación y sonido', async () => {
    const mockPlaySound = vi.fn().mockImplementation(() => {
      throw new Error('Error de audio');
    });

    vi.mock('../../hooks/useSound', () => ({
      default: () => ({
        playSound: mockPlaySound,
        stopSound: vi.fn(),
        stopAllSounds: vi.fn(),
      }),
    }), { virtual: true });

    renderApp();

    const spinButton = await screen.findByRole('button', { name: /girar/i });
    await act(async () => {
      fireEvent.click(spinButton);
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /girar/i })).toBeInTheDocument();
    });
  });

  it('debe manejar múltiples errores simultáneos', async () => {
    const errors = {
      save: new Error('Error al guardar'),
      load: new Error('Error al cargar'),
      validate: new Error('Error de validación'),
    };

    (prizeService.savePrize as any).mockRejectedValue(errors.save);
    (prizeService.getActivePrizes as any).mockRejectedValue(errors.load);
    (prizeService.isPrizeValid as any).mockRejectedValue(errors.validate);

    renderApp();

    const spinButton = await screen.findByRole('button', { name: /girar/i });
    const codeInput = await screen.findByPlaceholderText(/ingresa el código/i);
    const verifyButton = await screen.findByRole('button', { name: /verificar/i });

    await act(async () => {
      fireEvent.click(spinButton);
      fireEvent.change(codeInput, { target: { value: 'TEST123' } });
      fireEvent.click(verifyButton);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const errorMessages = await screen.findAllByText(/error/i);
    expect(errorMessages.length).toBeGreaterThanOrEqual(2);

    (prizeService.savePrize as any).mockResolvedValue({
      id: 1,
      name: 'Premio Recuperado',
      code: 'RECOVER123',
      claimed: false,
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    await waitFor(() => {
      expect(screen.getByText(/premio recuperado/i)).toBeInTheDocument();
    });
  });
}); 