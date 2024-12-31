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

describe('Pruebas de Rendimiento', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    if (typeof performance.clearMarks === 'function') {
      performance.clearMarks();
    }
    if (typeof performance.clearMeasures === 'function') {
      performance.clearMeasures();
    }
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe renderizar la aplicación en menos de 200ms', () => {
    const startTime = performance.now();
    
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(200);
  });

  it('debe manejar múltiples giros de ruleta sin degradación', async () => {
    const { rerender } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const spinTimes = 5;
    const spinButton = screen.getByRole('button', { name: /girar/i });
    const spinDurations: number[] = [];

    for (let i = 0; i < spinTimes; i++) {
      const startTime = performance.now();
      
      await act(async () => {
        fireEvent.click(spinButton);
        await new Promise(resolve => setTimeout(resolve, 1000));
      });
      
      const endTime = performance.now();
      spinDurations.push(endTime - startTime);
      
      rerender(
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      );
    }

    const averageTime = spinDurations.reduce((a, b) => a + b, 0) / spinDurations.length;
    const maxDeviation = Math.max(...spinDurations) - Math.min(...spinDurations);
    
    expect(maxDeviation).toBeLessThan(averageTime * 0.3); // Max 30% de variación
  });

  it('debe manejar grandes cantidades de premios en las estadísticas', async () => {
    const largePrizeList = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `Premio ${i}`,
      code: `CODE${i}`,
      timestamp: Date.now(),
      claimed: i % 2 === 0,
    }));

    (prizeService.getActivePrizes as any).mockResolvedValue(largePrizeList.filter(p => !p.claimed));
    (prizeService.getClaimedPrizes as any).mockResolvedValue(largePrizeList.filter(p => p.claimed));

    const startTime = performance.now();
    
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(300); // Renderizado con datos masivos
  });

  it('debe mantener un rendimiento estable con múltiples verificaciones', async () => {
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const verificationTimes: number[] = [];
    const codeInput = screen.getByPlaceholderText(/ingresa el código/i);
    const verifyButton = screen.getByRole('button', { name: /verificar/i });

    for (let i = 0; i < 10; i++) {
      const startTime = performance.now();
      
      await act(async () => {
        fireEvent.change(codeInput, { target: { value: `TEST${i}` } });
        fireEvent.click(verifyButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      const endTime = performance.now();
      verificationTimes.push(endTime - startTime);
    }

    const averageTime = verificationTimes.reduce((a, b) => a + b, 0) / verificationTimes.length;
    expect(averageTime).toBeLessThan(150); // Menos de 150ms por verificación
  });

  it('debe manejar actualizaciones frecuentes de estadísticas', async () => {
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const updateTimes: number[] = [];

    for (let i = 0; i < 10; i++) {
      const startTime = performance.now();
      
      await act(async () => {
        (prizeService.getActivePrizes as any).mockResolvedValue(
          Array.from({ length: 10 }, (_, j) => ({
            id: j,
            name: `Premio ${j}`,
            code: `CODE${j}`,
            timestamp: Date.now(),
            claimed: false,
          }))
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      const endTime = performance.now();
      updateTimes.push(endTime - startTime);
    }

    const maxUpdateTime = Math.max(...updateTimes);
    expect(maxUpdateTime).toBeLessThan(200); // Actualizaciones rápidas
  });

  it('debe mantener un rendimiento fluido durante las animaciones', async () => {
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const spinButton = screen.getByRole('button', { name: /girar/i });
    const frameRates: number[] = [];
    let lastTimestamp = performance.now();

    for (let i = 0; i < 30; i++) {
      if (typeof performance.mark === 'function') {
        performance.mark(`frame-start-${i}`);
      }
      
      await act(async () => {
        fireEvent.click(spinButton);
        await new Promise(resolve => setTimeout(resolve, 16.67));
      });
      
      if (typeof performance.mark === 'function') {
        performance.mark(`frame-end-${i}`);
        performance.measure(`frame-${i}`, `frame-start-${i}`, `frame-end-${i}`);
      }
      
      const currentTimestamp = performance.now();
      const frameDuration = currentTimestamp - lastTimestamp;
      if (frameDuration > 0) {
        frameRates.push(1000 / frameDuration);
      }
      lastTimestamp = currentTimestamp;
    }

    const averageFPS = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
    expect(averageFPS).toBeGreaterThan(25); // Mínimo 25fps
  });
}); 