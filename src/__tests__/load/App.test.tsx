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

// Simulador de usuario
class UserSimulator {
  private app: any;
  private sessionId: string;
  private actionLog: Array<{ action: string; timestamp: number; duration: number }> = [];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.app = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );
  }

  async performRandomAction() {
    const startTime = performance.now();
    const actions = ['spin', 'verify', 'viewStats'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    try {
      switch (randomAction) {
        case 'spin':
          await this.spinWheel();
          break;
        case 'verify':
          await this.verifyPrize();
          break;
        case 'viewStats':
          await this.viewStatistics();
          break;
      }
    } catch (error) {
      console.error(`Error en sesión ${this.sessionId}:`, error);
    }

    const endTime = performance.now();
    this.actionLog.push({
      action: randomAction,
      timestamp: Date.now(),
      duration: endTime - startTime
    });
  }

  private async spinWheel() {
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
  }

  private async verifyPrize() {
    const codeInput = screen.getByPlaceholderText('Ingresa el código del premio');
    const verifyButton = screen.getByRole('button', { name: 'Verificar premio' });
    
    fireEvent.change(codeInput, { target: { value: `TEST${Math.random()}` } });
    fireEvent.click(verifyButton);
    
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
  }

  private async viewStatistics() {
    (prizeService.getActivePrizes as any).mockReturnValue(
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        name: `Premio ${i}`,
        code: `CODE${i}`,
        claimed: false
      }))
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
  }

  getPerformanceMetrics() {
    const actionCounts = this.actionLog.reduce((acc, curr) => {
      acc[curr.action] = (acc[curr.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageDuration = this.actionLog.reduce((acc, curr) => acc + curr.duration, 0) / this.actionLog.length;

    return {
      sessionId: this.sessionId,
      totalActions: this.actionLog.length,
      actionCounts,
      averageDuration,
      maxDuration: Math.max(...this.actionLog.map(log => log.duration))
    };
  }
}

describe('Pruebas de Carga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    performance.clearMarks();
    performance.clearMeasures();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe soportar múltiples usuarios concurrentes', async () => {
    const numUsers = 50;
    const sessionDuration = 60000; // 1 minuto
    const users = Array.from({ length: numUsers }, (_, i) => new UserSimulator(`user-${i}`));
    
    // Simular actividad de usuarios
    for (let time = 0; time < sessionDuration; time += 1000) {
      await Promise.all(users.map(user => user.performRandomAction()));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
    }

    // Analizar métricas
    const metrics = users.map(user => user.getPerformanceMetrics());
    const totalActions = metrics.reduce((sum, m) => sum + m.totalActions, 0);
    const overallAverageDuration = metrics.reduce((sum, m) => sum + m.averageDuration, 0) / metrics.length;
    
    expect(totalActions).toBeGreaterThan(numUsers * 30); // Al menos 30 acciones por usuario
    expect(overallAverageDuration).toBeLessThan(100); // Promedio menor a 100ms
  });

  it('debe manejar picos de carga', async () => {
    const baseUsers = 10;
    const peakUsers = 100;
    const users: UserSimulator[] = [];
    const performanceSnapshots: Array<{ timestamp: number; averageResponseTime: number }> = [];

    // Iniciar con carga base
    for (let i = 0; i < baseUsers; i++) {
      users.push(new UserSimulator(`base-user-${i}`));
    }

    // Simular actividad normal
    for (let i = 0; i < 30; i++) {
      await Promise.all(users.map(user => user.performRandomAction()));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
    }

    // Añadir pico de usuarios
    const startPeak = performance.now();
    for (let i = 0; i < peakUsers; i++) {
      users.push(new UserSimulator(`peak-user-${i}`));
    }

    // Simular pico de carga
    for (let i = 0; i < 30; i++) {
      const startTime = performance.now();
      await Promise.all(users.map(user => user.performRandomAction()));
      const endTime = performance.now();
      
      performanceSnapshots.push({
        timestamp: Date.now(),
        averageResponseTime: (endTime - startTime) / users.length
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
    }

    const peakResponseTimes = performanceSnapshots.map(s => s.averageResponseTime);
    const maxPeakResponseTime = Math.max(...peakResponseTimes);
    
    expect(maxPeakResponseTime).toBeLessThan(200); // Máximo 200ms durante picos
  });

  it('debe mantener la consistencia bajo carga sostenida', async () => {
    const numUsers = 25;
    const sessionDuration = 300000; // 5 minutos
    const users = Array.from({ length: numUsers }, (_, i) => new UserSimulator(`sustained-${i}`));
    const performanceLog: Array<{ timestamp: number; memoryUsage: number; responseTime: number }> = [];

    // Simular carga sostenida
    for (let time = 0; time < sessionDuration; time += 5000) {
      const startTime = performance.now();
      
      await Promise.all(users.map(user => user.performRandomAction()));
      
      const endTime = performance.now();
      performanceLog.push({
        timestamp: Date.now(),
        // @ts-ignore
        memoryUsage: performance?.memory?.usedJSHeapSize || 0,
        responseTime: (endTime - startTime) / users.length
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });
    }

    // Analizar estabilidad
    const responseTimes = performanceLog.map(log => log.responseTime);
    const memoryUsage = performanceLog.map(log => log.memoryUsage);
    
    const averageResponseTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
    const responseTimeVariation = Math.max(...responseTimes) - Math.min(...responseTimes);
    const memoryGrowth = memoryUsage[memoryUsage.length - 1] - memoryUsage[0];

    expect(averageResponseTime).toBeLessThan(100); // Promedio menor a 100ms
    expect(responseTimeVariation).toBeLessThan(150); // Variación menor a 150ms
    expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // Crecimiento menor a 50MB
  });

  it('debe manejar patrones de uso realistas', async () => {
    const patterns = [
      { users: 10, duration: 10000, interval: 1000 }, // Uso normal
      { users: 50, duration: 5000, interval: 200 },   // Pico moderado
      { users: 100, duration: 2000, interval: 100 },  // Pico alto
      { users: 20, duration: 10000, interval: 500 },  // Recuperación
    ];

    const metrics: Array<{ pattern: string; averageResponseTime: number; errorRate: number }> = [];

    for (const [index, pattern] of patterns.entries()) {
      const users = Array.from(
        { length: pattern.users }, 
        (_, i) => new UserSimulator(`pattern-${index}-user-${i}`)
      );

      const startTime = performance.now();
      let errors = 0;

      // Simular patrón de uso
      for (let time = 0; time < pattern.duration; time += pattern.interval) {
        try {
          await Promise.all(users.map(user => user.performRandomAction()));
        } catch (error) {
          errors++;
        }

        await act(async () => {
          await vi.advanceTimersByTimeAsync(pattern.interval);
        });
      }

      const endTime = performance.now();
      const totalActions = users.reduce(
        (sum, user) => sum + user.getPerformanceMetrics().totalActions, 
        0
      );

      metrics.push({
        pattern: `Pattern ${index}`,
        averageResponseTime: (endTime - startTime) / totalActions,
        errorRate: errors / totalActions
      });
    }

    // Verificar métricas
    metrics.forEach(metric => {
      expect(metric.averageResponseTime).toBeLessThan(200); // Máximo 200ms
      expect(metric.errorRate).toBeLessThan(0.01); // Menos del 1% de errores
    });
  });
}); 