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
    const spinButton = screen.getByRole('button', { name: /girar/i });
    fireEvent.click(spinButton);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
  }

  private async verifyPrize() {
    const codeInput = screen.getByPlaceholderText(/ingresa el código del premio/i);
    const verifyButton = screen.getByRole('button', { name: /verificar/i });
    
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
}); 