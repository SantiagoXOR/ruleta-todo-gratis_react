import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('Rendimiento de Animaciones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.clear();
    performance.clearMarks();
    performance.clearMeasures();
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
      frames.push(1000 / frameDuration); // Convertir a FPS
      lastTime = currentTime;

      await act(async () => {
        await vi.advanceTimersByTimeAsync(16.67); // ~60fps
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

    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);

    const frameRates = await measureFrameRate(5000, () => {
      const wheel = container.querySelector('.wheel');
      wheel?.dispatchEvent(new Event('animationframe'));
    });

    const averageFPS = frameRates.reduce((a, b) => a + b) / frameRates.length;
    const minFPS = Math.min(...frameRates);

    expect(averageFPS).toBeGreaterThan(55); // Promedio mayor a 55fps
    expect(minFPS).toBeGreaterThan(30); // Nunca menos de 30fps
  });

  it('debe optimizar las animaciones múltiples simultáneas', async () => {
    const mockPrizes = Array.from({ length: 10 }, (_, i) => ({
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

    // Iniciar múltiples animaciones
    const animations = container.querySelectorAll('.animated');
    const frameRates = await measureFrameRate(2000, () => {
      animations.forEach(element => {
        element.dispatchEvent(new Event('animationframe'));
      });
    });

    const averageFPS = frameRates.reduce((a, b) => a + b) / frameRates.length;
    expect(averageFPS).toBeGreaterThan(50); // Mantener buen rendimiento
  });

  it('debe manejar eficientemente las transiciones CSS', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const elements = container.querySelectorAll('.transition-element');
    const transitionTimes: number[] = [];

    elements.forEach(async element => {
      const startTime = performance.now();
      
      element.classList.add('active');
      
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300); // Duración típica de transición
      });
      
      const endTime = performance.now();
      transitionTimes.push(endTime - startTime);
    });

    const averageTransitionTime = transitionTimes.reduce((a, b) => a + b) / transitionTimes.length;
    expect(averageTransitionTime).toBeLessThan(16.67); // Menos de un frame
  });

  it('debe optimizar el rendimiento de las animaciones en bucle', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const loopingElements = container.querySelectorAll('.loop-animation');
    const memoryUsage: number[] = [];

    // Monitorear uso de memoria durante animaciones en bucle
    for (let i = 0; i < 100; i++) {
      loopingElements.forEach(element => {
        element.dispatchEvent(new Event('animationframe'));
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(16.67);
      });

      // @ts-ignore
      memoryUsage.push(performance?.memory?.usedJSHeapSize || 0);
    }

    // Verificar que no hay fugas de memoria
    const memoryGrowth = memoryUsage[memoryUsage.length - 1] - memoryUsage[0];
    expect(memoryGrowth).toBeLessThan(1024 * 1024); // Menos de 1MB de crecimiento
  });

  it('debe mantener el rendimiento durante animaciones con carga de CPU', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const wheel = container.querySelector('.wheel');
    const frameRates: number[] = [];
    let lastFrameTime = performance.now();

    // Simular carga de CPU durante la animación
    for (let i = 0; i < 100; i++) {
      // Simular trabajo pesado
      Array.from({ length: 1000 }).forEach(() => Math.random() * Math.random());

      wheel?.dispatchEvent(new Event('animationframe'));
      
      const currentTime = performance.now();
      frameRates.push(1000 / (currentTime - lastFrameTime));
      lastFrameTime = currentTime;

      await act(async () => {
        await vi.advanceTimersByTimeAsync(16.67);
      });
    }

    const averageFPS = frameRates.reduce((a, b) => a + b) / frameRates.length;
    expect(averageFPS).toBeGreaterThan(45); // Mantener al menos 45fps bajo carga
  });

  it('debe optimizar las animaciones basadas en requestAnimationFrame', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const rafCallbacks: number[] = [];
    const originalRAF = window.requestAnimationFrame;
    
    window.requestAnimationFrame = callback => {
      rafCallbacks.push(performance.now());
      return originalRAF(callback);
    };

    // Iniciar animación
    fireEvent.click(screen.getByRole('button', { name: 'Girar' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    // Verificar timing de los callbacks
    const callbackIntervals = rafCallbacks.slice(1).map((time, i) => 
      time - rafCallbacks[i]
    );

    const averageInterval = callbackIntervals.reduce((a, b) => a + b) / callbackIntervals.length;
    expect(averageInterval).toBeCloseTo(16.67, 1); // Cerca del intervalo ideal

    // Restaurar RAF original
    window.requestAnimationFrame = originalRAF;
  });

  it('debe mantener el rendimiento con múltiples observadores de animación', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const animatedElements = container.querySelectorAll('.animated');
    const observers: IntersectionObserver[] = [];
    const observerCallbacks: number = 0;

    // Crear múltiples observadores
    animatedElements.forEach(element => {
      const observer = new IntersectionObserver(() => {
        observerCallbacks + 1;
      });
      observer.observe(element);
      observers.push(observer);
    });

    // Simular scroll y animaciones
    for (let i = 0; i < 50; i++) {
      window.dispatchEvent(new Event('scroll'));
      
      await act(async () => {
        await vi.advanceTimersByTimeAsync(16.67);
      });
    }

    // Limpiar observadores
    observers.forEach(observer => observer.disconnect());

    expect(observerCallbacks).toBeLessThan(animatedElements.length * 2);
  });

  it('debe optimizar las animaciones en dispositivos de bajo rendimiento', async () => {
    // Simular dispositivo de bajo rendimiento
    const originalDeviceMemory = (navigator as any).deviceMemory;
    (navigator as any).deviceMemory = 1; // 1GB RAM

    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const wheel = container.querySelector('.wheel');
    const frameRates = await measureFrameRate(3000, () => {
      wheel?.dispatchEvent(new Event('animationframe'));
    });

    const averageFPS = frameRates.reduce((a, b) => a + b) / frameRates.length;
    
    // Restaurar configuración original
    (navigator as any).deviceMemory = originalDeviceMemory;

    // Verificar que aún mantiene un rendimiento aceptable
    expect(averageFPS).toBeGreaterThan(30);
  });
}); 