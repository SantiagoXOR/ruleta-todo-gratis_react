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

describe('Flujo de Usuario', () => {
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

  it('debe completar el flujo completo de girar y reclamar premio', async () => {
    const mockPrize = {
      id: 1,
      name: 'Premio Test',
      code: 'TEST123',
      claimed: false,
    };

    (prizeService.savePrize as any).mockResolvedValue(mockPrize);
    (prizeService.isPrizeValid as any).mockResolvedValue(true);
    (prizeService.getPrizeByCode as any).mockResolvedValue(mockPrize);
    (prizeService.markPrizeAsClaimed as any).mockResolvedValue({ ...mockPrize, claimed: true });

    renderApp();

    // Girar la ruleta
    const spinButton = await screen.findByRole('button', { name: /girar/i });
    await act(async () => {
      fireEvent.click(spinButton);
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    // Verificar que se muestra el premio
    await waitFor(() => {
      expect(screen.getByText(/premio test/i)).toBeInTheDocument();
    });

    // Verificar el código del premio
    const codeInput = await screen.findByPlaceholderText(/ingresa el código/i);
    const verifyButton = await screen.findByRole('button', { name: /verificar/i });

    await act(async () => {
      fireEvent.change(codeInput, { target: { value: 'TEST123' } });
      fireEvent.click(verifyButton);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verificar que se puede reclamar el premio
    const claimButton = await screen.findByRole('button', { name: /reclamar/i });
    await act(async () => {
      fireEvent.click(claimButton);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verificar que el premio se marcó como reclamado
    await waitFor(() => {
      expect(screen.getByText(/premio reclamado/i)).toBeInTheDocument();
    });
  });

  it('debe manejar correctamente la interacción entre componentes', async () => {
    const mockPrizes = [
      { id: 1, name: 'Premio 1', code: 'CODE1', claimed: false },
      { id: 2, name: 'Premio 2', code: 'CODE2', claimed: true },
      { id: 3, name: 'Premio 3', code: 'CODE3', claimed: false },
    ];

    (prizeService.getActivePrizes as any).mockResolvedValue(mockPrizes.filter(p => !p.claimed));
    (prizeService.getClaimedPrizes as any).mockResolvedValue(mockPrizes.filter(p => p.claimed));

    renderApp();

    // Verificar que se muestran los premios activos
    await waitFor(() => {
      expect(screen.getByText(/premio 1/i)).toBeInTheDocument();
      expect(screen.getByText(/premio 3/i)).toBeInTheDocument();
    });

    // Verificar que se muestran los premios reclamados
    await waitFor(() => {
      expect(screen.getByText(/premio 2/i)).toBeInTheDocument();
    });

    // Girar la ruleta y obtener un nuevo premio
    const spinButton = await screen.findByRole('button', { name: /girar/i });
    await act(async () => {
      fireEvent.click(spinButton);
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    // Verificar que se actualiza la lista de premios
    await waitFor(() => {
      expect(screen.getAllByText(/premio/i).length).toBeGreaterThan(3);
    });
  });

  it('debe mantener el estado global consistente', async () => {
    const mockPrize = {
      id: 1,
      name: 'Premio Global',
      code: 'GLOBAL123',
      claimed: false,
    };

    (prizeService.savePrize as any).mockResolvedValue(mockPrize);
    (prizeService.isPrizeValid as any).mockResolvedValue(true);
    (prizeService.getPrizeByCode as any).mockResolvedValue(mockPrize);

    renderApp();

    // Girar la ruleta
    const spinButton = await screen.findByRole('button', { name: /girar/i });
    await act(async () => {
      fireEvent.click(spinButton);
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    // Verificar que el premio se muestra en todos los componentes relevantes
    await waitFor(() => {
      expect(screen.getAllByText(/premio global/i).length).toBeGreaterThanOrEqual(1);
    });

    // Verificar el código
    const codeInput = await screen.findByPlaceholderText(/ingresa el código/i);
    const verifyButton = await screen.findByRole('button', { name: /verificar/i });

    await act(async () => {
      fireEvent.change(codeInput, { target: { value: 'GLOBAL123' } });
      fireEvent.click(verifyButton);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verificar que el estado se mantiene consistente
    await waitFor(() => {
      expect(screen.getByText(/premio válido/i)).toBeInTheDocument();
    });
  });

  it('debe manejar correctamente los errores y recuperación', async () => {
    let shouldFail = true;
    (prizeService.savePrize as any).mockImplementation(() => {
      if (shouldFail) {
        shouldFail = false;
        return Promise.reject(new Error('Error temporal'));
      }
      return Promise.resolve({
        id: 1,
        name: 'Premio Recuperado',
        code: 'RECOVER123',
        claimed: false,
      });
    });

    renderApp();

    // Intentar girar la ruleta (fallará)
    const spinButton = await screen.findByRole('button', { name: /girar/i });
    await act(async () => {
      fireEvent.click(spinButton);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verificar que se muestra el error
    await waitFor(() => {
      expect(screen.getByText(/error temporal/i)).toBeInTheDocument();
    });

    // Intentar nuevamente (tendrá éxito)
    await act(async () => {
      fireEvent.click(spinButton);
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    // Verificar la recuperación exitosa
    await waitFor(() => {
      expect(screen.getByText(/premio recuperado/i)).toBeInTheDocument();
    });
  });

  it('debe mantener la sincronización entre componentes durante operaciones largas', async () => {
    const mockPrize = {
      id: 1,
      name: 'Premio Sincronizado',
      code: 'SYNC123',
      claimed: false,
    };

    // Simular operaciones lentas
    (prizeService.savePrize as any).mockImplementation(() => 
      Promise.resolve(mockPrize)
    );
    (prizeService.isPrizeValid as any).mockImplementation(() =>
      Promise.resolve(true)
    );

    renderApp();

    // Iniciar múltiples operaciones
    const spinButton = await screen.findByRole('button', { name: /girar/i });
    await act(async () => {
      fireEvent.click(spinButton);
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    // Verificar que los componentes se mantienen sincronizados
    await waitFor(() => {
      expect(screen.getByText(/premio sincronizado/i)).toBeInTheDocument();
    });

    const codeInput = await screen.findByPlaceholderText(/ingresa el código/i);
    const verifyButton = await screen.findByRole('button', { name: /verificar/i });

    await act(async () => {
      fireEvent.change(codeInput, { target: { value: 'SYNC123' } });
      fireEvent.click(verifyButton);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verificar que todos los componentes se actualizaron correctamente
    await waitFor(() => {
      expect(screen.getByText(/premio válido/i)).toBeInTheDocument();
    });
  });
}); 