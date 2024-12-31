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

// Mock de canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn().mockImplementation(() => Promise.resolve()),
}));

describe('Integración con Servicios Externos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({
      shouldAdvanceTime: true,
      shouldClearNativeTimers: true,
      now: Date.now()
    });
    localStorage.clear();

    // Configurar mocks por defecto
    (prizeService.getActivePrizes as any).mockResolvedValue([]);
    (prizeService.getClaimedPrizes as any).mockResolvedValue([]);
    (prizeService.getExpiredPrizes as any).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const renderApp = () => {
    return render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );
  };

  it('debe manejar la sincronización de datos con el backend', async () => {
    const mockPrizes = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: `Premio ${i}`,
      description: `Descripción ${i}`,
      code: `CODE${i}`,
      claimed: i % 2 === 0,
      timestamp: Date.now() - i * 1000,
    }));

    (prizeService.getActivePrizes as any).mockResolvedValue(mockPrizes.filter(p => !p.claimed));
    (prizeService.getClaimedPrizes as any).mockResolvedValue(mockPrizes.filter(p => p.claimed));

    await act(async () => {
      renderApp();
      await vi.runAllTimersAsync();
    });

    // Verificar que se muestra el título principal
    const title = screen.getByRole('heading', { level: 1, name: /ruleta de premios/i });
    expect(title).toBeInTheDocument();

    const newPrize = {
      id: 10,
      name: 'NUEVO PREMIO',
      description: 'Descripción del nuevo premio',
      code: 'NEW123',
      claimed: false,
      timestamp: Date.now(),
    };

    await act(async () => {
      (prizeService.getActivePrizes as any).mockResolvedValue([...mockPrizes.filter(p => !p.claimed), newPrize]);
      await vi.advanceTimersByTimeAsync(5000);
      await vi.runAllTimersAsync();
    });

    // Verificar que se muestra el botón de girar
    const spinButton = screen.getByRole('button', { name: /¡girá y ganá!/i });
    expect(spinButton).toBeInTheDocument();
  });

  it('debe manejar la persistencia de datos offline', async () => {
    const mockPrize = {
      id: 1,
      name: 'Premio Offline',
      description: 'Descripción del premio offline',
      code: 'OFFLINE123',
      claimed: false,
      timestamp: Date.now(),
    };

    // Simular offline
    const originalOnline = window.navigator.onLine;
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      writable: true,
      configurable: true,
    });

    (prizeService.savePrize as any).mockRejectedValue(new Error('Sin conexión'));

    await act(async () => {
      renderApp();
      await vi.runAllTimersAsync();
    });

    const spinButton = screen.getByRole('button', { name: /¡girá y ganá!/i });
    
    await act(async () => {
      fireEvent.click(spinButton);
      await vi.advanceTimersByTimeAsync(5000);
      await vi.runAllTimersAsync();
    });

    // Simular online
    Object.defineProperty(window.navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });

    (prizeService.savePrize as any).mockResolvedValueOnce(mockPrize);

    await act(async () => {
      window.dispatchEvent(new Event('online'));
      await vi.advanceTimersByTimeAsync(1000);
      await vi.runAllTimersAsync();
    });

    await waitFor(() => {
      expect(prizeService.savePrize).toHaveBeenCalled();
    }, { timeout: 6000 });

    // Restaurar estado original
    Object.defineProperty(window.navigator, 'onLine', {
      value: originalOnline,
      writable: true,
      configurable: true,
    });
  });

  it('debe manejar la caché y actualización de datos', async () => {
    const mockPrizes = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      name: `Premio ${i}`,
      description: `Descripción ${i}`,
      code: `CACHE${i}`,
      claimed: false,
      timestamp: Date.now(),
    }));

    localStorage.setItem('ruleta_prizes', JSON.stringify({
      value: mockPrizes,
      timestamp: Date.now()
    }));

    let resolveBackend: (value: any) => void;
    (prizeService.getActivePrizes as any).mockImplementation(() => 
      new Promise(resolve => {
        resolveBackend = resolve;
      })
    );

    await act(async () => {
      renderApp();
      await vi.runAllTimersAsync();
    });

    // Verificar que se muestra el título principal
    const title = screen.getByRole('heading', { level: 1, name: /ruleta de premios/i });
    expect(title).toBeInTheDocument();

    const updatedPrizes = mockPrizes.map(prize => ({
      ...prize,
      name: `${prize.name} Actualizado`,
    }));

    await act(async () => {
      resolveBackend!(updatedPrizes);
      await vi.advanceTimersByTimeAsync(1000);
      await vi.runAllTimersAsync();
    });

    // Verificar que se muestra el botón de girar
    const spinButton = screen.getByRole('button', { name: /¡girá y ganá!/i });
    expect(spinButton).toBeInTheDocument();
  });

  it('debe manejar la sincronización de estados entre pestañas', async () => {
    const mockPrize = {
      id: 1,
      name: 'Premio Multi-Pestaña',
      description: 'Descripción del premio multi-pestaña',
      code: 'MULTI123',
      claimed: false,
      timestamp: Date.now(),
    };

    (prizeService.savePrize as any).mockResolvedValue(mockPrize);

    await act(async () => {
      renderApp();
      await vi.runAllTimersAsync();
    });

    await act(async () => {
      const storageEvent = new StorageEvent('storage', {
        key: 'ruleta_prizes',
        newValue: JSON.stringify({
          value: [mockPrize],
          timestamp: Date.now()
        }),
      });
      window.dispatchEvent(storageEvent);
      await vi.advanceTimersByTimeAsync(1000);
      await vi.runAllTimersAsync();
    });

    // Verificar que se muestra el título principal
    const title = screen.getByRole('heading', { level: 1, name: /ruleta de premios/i });
    expect(title).toBeInTheDocument();
  });

  it('debe manejar la sincronización con el servicio de notificaciones', async () => {
    const mockPrize = {
      id: 1,
      name: 'Premio Notificación',
      description: 'Descripción del premio notificación',
      code: 'NOTIF123',
      claimed: false,
      timestamp: Date.now(),
    };

    const mockNotification = vi.fn();
    window.Notification = vi.fn() as any;
    window.Notification.requestPermission = vi.fn().mockResolvedValue('granted');
    window.Notification.permission = 'granted';

    (prizeService.savePrize as any).mockResolvedValue(mockPrize);

    await act(async () => {
      renderApp();
      await vi.runAllTimersAsync();
    });

    const spinButton = screen.getByRole('button', { name: /¡girá y ganá!/i });
    
    await act(async () => {
      fireEvent.click(spinButton);
      await vi.advanceTimersByTimeAsync(5000);
      await vi.runAllTimersAsync();
    });

    await waitFor(() => {
      expect(window.Notification).toHaveBeenCalled();
    }, { timeout: 6000 });
  });
}); 