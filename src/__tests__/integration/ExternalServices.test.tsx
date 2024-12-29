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

describe('Integración con Servicios Externos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe manejar la sincronización de datos con el backend', async () => {
    const mockPrizes = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: `Premio ${i}`,
      code: `CODE${i}`,
      claimed: i % 2 === 0,
      timestamp: Date.now() - i * 1000,
    }));

    // Simular respuestas del backend
    (prizeService.getActivePrizes as any).mockResolvedValue(mockPrizes.filter(p => !p.claimed));
    (prizeService.getClaimedPrizes as any).mockResolvedValue(mockPrizes.filter(p => p.claimed));

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Verificar carga inicial
    await waitFor(() => {
      mockPrizes.forEach(prize => {
        if (!prize.claimed) {
          expect(screen.getByText(prize.name)).toBeInTheDocument();
        }
      });
    });

    // Simular actualización del backend
    const newPrize = {
      id: 10,
      name: 'Nuevo Premio',
      code: 'NEW123',
      claimed: false,
      timestamp: Date.now(),
    };

    (prizeService.getActivePrizes as any).mockResolvedValue([...mockPrizes.filter(p => !p.claimed), newPrize]);

    // Forzar actualización
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000); // Intervalo de actualización
    });

    expect(screen.getByText(newPrize.name)).toBeInTheDocument();
  });

  it('debe manejar la persistencia de datos offline', async () => {
    const mockPrize = {
      id: 1,
      name: 'Premio Offline',
      code: 'OFFLINE123',
      claimed: false,
      timestamp: Date.now(),
    };

    // Simular estado offline
    const originalOnline = window.navigator.onLine;
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      writable: true,
    });

    (prizeService.savePrize as any).mockRejectedValue(new Error('Sin conexión'));

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Intentar guardar premio offline
    fireEvent.click(screen.getByRole('button', { name: 'Girar' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // Verificar que se guarda localmente
    expect(localStorage.getItem('pendingPrizes')).toBeTruthy();

    // Simular recuperación de conexión
    Object.defineProperty(window.navigator, 'onLine', {
      value: true,
      writable: true,
    });

    (prizeService.savePrize as any).mockResolvedValue(mockPrize);

    // Disparar evento online
    window.dispatchEvent(new Event('online'));

    await waitFor(() => {
      expect(prizeService.savePrize).toHaveBeenCalled();
      expect(localStorage.getItem('pendingPrizes')).toBeFalsy();
    });

    // Restaurar estado original
    Object.defineProperty(window.navigator, 'onLine', {
      value: originalOnline,
      writable: true,
    });
  });

  it('debe manejar la caché y actualización de datos', async () => {
    const mockPrizes = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      name: `Premio Cache ${i}`,
      code: `CACHE${i}`,
      claimed: false,
      timestamp: Date.now(),
    }));

    // Simular datos en caché
    localStorage.setItem('cachedPrizes', JSON.stringify(mockPrizes));

    // Simular respuesta lenta del backend
    let resolveBackend: (value: any) => void;
    (prizeService.getActivePrizes as any).mockImplementation(() => 
      new Promise(resolve => {
        resolveBackend = resolve;
      })
    );

    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Verificar que se muestran los datos de caché inmediatamente
    mockPrizes.forEach(prize => {
      expect(screen.getByText(prize.name)).toBeInTheDocument();
    });

    // Simular respuesta del backend con datos actualizados
    const updatedPrizes = mockPrizes.map(prize => ({
      ...prize,
      name: `${prize.name} Actualizado`,
    }));

    resolveBackend!(updatedPrizes);

    await waitFor(() => {
      updatedPrizes.forEach(prize => {
        expect(screen.getByText(prize.name)).toBeInTheDocument();
      });
    });
  });

  it('debe manejar la sincronización de estados entre pestañas', async () => {
    const mockPrize = {
      id: 1,
      name: 'Premio Multi-Pestaña',
      code: 'MULTI123',
      claimed: false,
      timestamp: Date.now(),
    };

    (prizeService.savePrize as any).mockResolvedValue(mockPrize);

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Simular acción en otra pestaña
    const storageEvent = new StorageEvent('storage', {
      key: 'prizes',
      newValue: JSON.stringify([mockPrize]),
    });
    window.dispatchEvent(storageEvent);

    await waitFor(() => {
      expect(screen.getByText(mockPrize.name)).toBeInTheDocument();
    });
  });

  it('debe manejar la sincronización con el servicio de notificaciones', async () => {
    const mockPrize = {
      id: 1,
      name: 'Premio Notificación',
      code: 'NOTIF123',
      claimed: false,
      timestamp: Date.now(),
    };

    // Mock del servicio de notificaciones
    const mockNotification = vi.fn();
    window.Notification = vi.fn() as any;
    window.Notification.requestPermission = vi.fn().mockResolvedValue('granted');
    window.Notification.permission = 'granted';

    (prizeService.savePrize as any).mockResolvedValue(mockPrize);

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Girar y ganar premio
    fireEvent.click(screen.getByRole('button', { name: 'Girar' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(window.Notification).toHaveBeenCalledWith(
      expect.stringContaining('¡Felicitaciones!'),
      expect.objectContaining({
        body: expect.stringContaining(mockPrize.name),
      })
    );
  });

  it('debe manejar la integración con el servicio de estadísticas', async () => {
    const mockStats = {
      totalSpins: 100,
      totalPrizes: 50,
      claimedPrizes: 30,
      activeUsers: 20,
    };

    // Mock del servicio de estadísticas
    const mockStatsService = {
      trackSpin: vi.fn(),
      trackPrize: vi.fn(),
      getStats: vi.fn().mockResolvedValue(mockStats),
    };

    vi.mock('../../services/stats', () => ({
      statsService: mockStatsService,
    }));

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Verificar que se muestran las estadísticas
    await waitFor(() => {
      expect(screen.getByText(`Total de giros: ${mockStats.totalSpins}`)).toBeInTheDocument();
      expect(screen.getByText(`Premios entregados: ${mockStats.totalPrizes}`)).toBeInTheDocument();
    });

    // Verificar tracking de eventos
    fireEvent.click(screen.getByRole('button', { name: 'Girar' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(mockStatsService.trackSpin).toHaveBeenCalled();
  });

  it('debe manejar la integración con el servicio de análisis', async () => {
    // Mock del servicio de análisis
    const mockAnalytics = {
      trackEvent: vi.fn(),
      trackPageView: vi.fn(),
      trackUserAction: vi.fn(),
    };

    vi.mock('../../services/analytics', () => ({
      analytics: mockAnalytics,
    }));

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Verificar tracking de vista de página
    expect(mockAnalytics.trackPageView).toHaveBeenCalledWith('ruleta');

    // Verificar tracking de eventos
    fireEvent.click(screen.getByRole('button', { name: 'Girar' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('spin_wheel', expect.any(Object));
  });
}); 