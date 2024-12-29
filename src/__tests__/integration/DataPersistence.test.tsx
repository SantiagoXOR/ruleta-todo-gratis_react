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

describe('Persistencia y Manejo de Datos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.clear();
    sessionStorage.clear();
    indexedDB.deleteDatabase('ruletaDB');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe persistir el estado de la aplicación entre recargas', async () => {
    const mockPrize = {
      id: 1,
      name: 'Premio Persistente',
      code: 'PERSIST123',
      claimed: false,
      timestamp: Date.now(),
    };

    // Primera renderización
    const { unmount } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Simular ganancia de premio
    (prizeService.savePrize as any).mockResolvedValue(mockPrize);
    fireEvent.click(screen.getByRole('button', { name: 'Girar' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // Verificar que se guarda en localStorage
    expect(JSON.parse(localStorage.getItem('appState')!)).toEqual(
      expect.objectContaining({
        lastPrize: mockPrize,
      })
    );

    // Desmontar y volver a montar
    unmount();

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Verificar que se restaura el estado
    expect(screen.getByText(mockPrize.name)).toBeInTheDocument();
  });

  it('debe manejar la migración de datos entre versiones', async () => {
    // Simular datos de versión anterior
    const oldData = {
      version: '1.0.0',
      prizes: [
        { id: 1, name: 'Premio Antiguo', code: 'OLD123' },
      ],
    };

    localStorage.setItem('appData', JSON.stringify(oldData));

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Verificar migración de datos
    const newData = JSON.parse(localStorage.getItem('appState')!);
    expect(newData.version).toBe('2.0.0');
    expect(newData.prizes[0]).toEqual(
      expect.objectContaining({
        id: 1,
        name: 'Premio Antiguo',
        code: 'OLD123',
        claimed: false, // Nuevo campo
      })
    );
  });

  it('debe manejar el almacenamiento en IndexedDB', async () => {
    const mockPrizes = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `Premio Grande ${i}`,
      code: `BIG${i}`,
      claimed: false,
      timestamp: Date.now(),
    }));

    // Configurar IndexedDB
    const dbName = 'ruletaDB';
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      db.createObjectStore('prizes', { keyPath: 'id' });
    };

    await new Promise(resolve => {
      request.onsuccess = resolve;
    });

    // Renderizar app
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Simular carga de datos grandes
    (prizeService.getActivePrizes as any).mockResolvedValue(mockPrizes);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    // Verificar que se usa IndexedDB para datos grandes
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const transaction = db.transaction(['prizes'], 'readonly');
    const store = transaction.objectStore('prizes');
    const count = await new Promise<number>(resolve => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
    });

    expect(count).toBe(mockPrizes.length);
  });

  it('debe manejar la limpieza de datos antiguos', async () => {
    const oldPrizes = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: `Premio Antiguo ${i}`,
      code: `OLD${i}`,
      claimed: false,
      timestamp: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 días atrás
    }));

    const recentPrizes = Array.from({ length: 5 }, (_, i) => ({
      id: i + 10,
      name: `Premio Reciente ${i}`,
      code: `NEW${i}`,
      claimed: false,
      timestamp: Date.now(),
    }));

    localStorage.setItem('prizes', JSON.stringify([...oldPrizes, ...recentPrizes]));

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Forzar limpieza
    await act(async () => {
      await vi.advanceTimersByTimeAsync(24 * 60 * 60 * 1000); // 1 día
    });

    const storedPrizes = JSON.parse(localStorage.getItem('prizes')!);
    expect(storedPrizes).toHaveLength(recentPrizes.length);
    expect(storedPrizes[0].code).toMatch(/^NEW/);
  });

  it('debe manejar la sincronización de datos entre contextos', async () => {
    const mockPrize = {
      id: 1,
      name: 'Premio Contexto',
      code: 'CTX123',
      claimed: false,
      timestamp: Date.now(),
    };

    (prizeService.savePrize as any).mockResolvedValue(mockPrize);

    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Simular acción que actualiza múltiples contextos
    fireEvent.click(screen.getByRole('button', { name: 'Girar' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // Verificar que todos los contextos están actualizados
    expect(screen.getByText(mockPrize.name)).toBeInTheDocument();
    expect(screen.getByText('Premios activos: 1')).toBeInTheDocument();
    expect(container.querySelector('.notification')).toBeInTheDocument();
  });

  it('debe manejar la recuperación de datos corruptos', async () => {
    // Simular datos corruptos
    localStorage.setItem('prizes', 'invalid-json{');
    localStorage.setItem('stats', '{missing-bracket');

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Verificar que la app se recupera
    expect(screen.getByRole('button', { name: 'Girar' })).toBeEnabled();
    expect(localStorage.getItem('prizes')).toBe('[]');
    expect(localStorage.getItem('stats')).toBe('{}');
  });

  it('debe manejar la persistencia de preferencias de usuario', async () => {
    // Configurar preferencias iniciales
    const userPrefs = {
      soundEnabled: true,
      theme: 'dark',
      notifications: true,
    };

    localStorage.setItem('userPreferences', JSON.stringify(userPrefs));

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Cambiar preferencias
    const soundToggle = screen.getByRole('switch', { name: /sonido/i });
    fireEvent.click(soundToggle);

    // Verificar persistencia
    const savedPrefs = JSON.parse(localStorage.getItem('userPreferences')!);
    expect(savedPrefs.soundEnabled).toBe(false);
  });

  it('debe manejar cuotas de almacenamiento', async () => {
    // Simular límite de almacenamiento
    const mockQuota = 1024 * 1024; // 1MB
    const mockUsage = 1023 * 1024; // Casi lleno

    Object.defineProperty(navigator, 'storage', {
      value: {
        estimate: () => Promise.resolve({
          quota: mockQuota,
          usage: mockUsage,
        }),
      },
    });

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Intentar guardar datos grandes
    const largePrize = {
      id: 1,
      name: 'Premio Grande',
      code: 'LARGE123',
      data: 'x'.repeat(1024 * 1024), // 1MB de datos
    };

    (prizeService.savePrize as any).mockResolvedValue(largePrize);
    fireEvent.click(screen.getByRole('button', { name: 'Girar' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // Verificar manejo de error de cuota
    expect(screen.getByText(/espacio insuficiente/i)).toBeInTheDocument();
  });

  it('debe manejar la exportación e importación de datos', async () => {
    const mockPrizes = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: `Premio ${i}`,
      code: `EXP${i}`,
      claimed: false,
      timestamp: Date.now(),
    }));

    // Preparar datos para exportación
    localStorage.setItem('prizes', JSON.stringify(mockPrizes));

    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Simular exportación
    const exportButton = screen.getByRole('button', { name: /exportar/i });
    fireEvent.click(exportButton);

    // Verificar formato de exportación
    const exportedData = JSON.parse(localStorage.getItem('lastExport')!);
    expect(exportedData.version).toBeDefined();
    expect(exportedData.prizes).toHaveLength(mockPrizes.length);

    // Simular importación
    localStorage.clear();
    const importButton = screen.getByRole('button', { name: /importar/i });
    const input = container.querySelector('input[type="file"]')!;

    const file = new File(
      [JSON.stringify(exportedData)],
      'ruleta-backup.json',
      { type: 'application/json' }
    );

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      const importedPrizes = JSON.parse(localStorage.getItem('prizes')!);
      expect(importedPrizes).toEqual(mockPrizes);
    });
  });
}); 