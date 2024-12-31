import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('Rendimiento de Animaciones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.clear();
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

  const measureFrameRate = async (duration: number, callback: () => void) => {
    const frames: number[] = [];
    let lastTime = performance.now();

    for (let elapsed = 0; elapsed < duration; elapsed += 16.67) {
      callback();
      
      const currentTime = performance.now();
      const frameDuration = currentTime - lastTime;
      if (frameDuration > 0) {
        frames.push(1000 / frameDuration);
      }
      lastTime = currentTime;

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 16.67));
      });
    }

    return frames;
  };

  it('debe mantener un framerate estable durante la animación de la ruleta', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const spinButton = screen.getByRole('button', { name: /girar/i });
    await act(async () => {
      fireEvent.click(spinButton);
    });

    const frameRates = await measureFrameRate(1000, () => {
      const wheel = container.querySelector('.wheel');
      if (wheel) {
        wheel.dispatchEvent(new Event('animationframe'));
      }
    });

    const averageFPS = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
    const minFPS = Math.min(...frameRates);

    expect(averageFPS).toBeGreaterThan(30); // Promedio mayor a 30fps
    expect(minFPS).toBeGreaterThan(20); // Nunca menos de 20fps
  });

  it('debe optimizar las animaciones múltiples simultáneas', async () => {
    const mockPrizes = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: `Premio ${i}`,
      code: `CODE${i}`,
      claimed: false,
      timestamp: Date.now(),
    }));

    (prizeService.getActivePrizes as any).mockResolvedValue(mockPrizes);

    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const frameRates = await measureFrameRate(1000, () => {
      const animations = container.querySelectorAll('.animated');
      animations.forEach(element => {
        element.dispatchEvent(new Event('animationframe'));
      });
    });

    const averageFPS = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
    expect(averageFPS).toBeGreaterThan(30); // Mantener rendimiento aceptable
  });

  it('debe optimizar el rendimiento de las animaciones en bucle', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const frameRates = await measureFrameRate(1000, () => {
      const loopingElements = container.querySelectorAll('.loop-animation');
      loopingElements.forEach(element => {
        element.dispatchEvent(new Event('animationframe'));
      });
    });

    const averageFPS = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
    expect(averageFPS).toBeGreaterThan(30);
  });

  it('debe mantener el rendimiento durante animaciones con carga de CPU', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const frameRates = await measureFrameRate(1000, () => {
      // Simular trabajo pesado
      Array.from({ length: 100 }).forEach(() => Math.random() * Math.random());
      
      const wheel = container.querySelector('.wheel');
      if (wheel) {
        wheel.dispatchEvent(new Event('animationframe'));
      }
    });

    const averageFPS = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
    expect(averageFPS).toBeGreaterThan(25); // Mantener al menos 25fps bajo carga
  });

  it('debe optimizar las animaciones basadas en requestAnimationFrame', async () => {
    let rafCallCount = 0;
    const originalRAF = window.requestAnimationFrame;
    
    window.requestAnimationFrame = callback => {
      rafCallCount++;
      return originalRAF(callback);
    };

    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const spinButton = screen.getByRole('button', { name: /girar/i });
    await act(async () => {
      fireEvent.click(spinButton);
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    expect(rafCallCount).toBeGreaterThan(0);
    window.requestAnimationFrame = originalRAF;
  });

  it('debe mantener el rendimiento con múltiples observadores de animación', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const frameRates = await measureFrameRate(1000, () => {
      const animatedElements = container.querySelectorAll('.animated');
      animatedElements.forEach(element => {
        element.dispatchEvent(new Event('animationframe'));
      });
    });

    const averageFPS = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
    expect(averageFPS).toBeGreaterThan(30);
  });
}); 