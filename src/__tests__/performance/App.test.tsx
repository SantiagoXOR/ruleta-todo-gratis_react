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

describe('Pruebas de Rendimiento', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Limpiar performance marks
    performance.clearMarks();
    performance.clearMeasures();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe renderizar la aplicación en menos de 100ms', () => {
    const startTime = performance.now();
    
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(100);
  });

  it('debe manejar múltiples giros de ruleta sin degradación', async () => {
    const { rerender } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const spinTimes = 10;
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    const spinDurations: number[] = [];

    for (let i = 0; i < spinTimes; i++) {
      const startTime = performance.now();
      
      fireEvent.click(spinButton);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });
      
      const endTime = performance.now();
      spinDurations.push(endTime - startTime);
      
      rerender(
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      );
    }

    // Verificar que no hay degradación significativa
    const averageTime = spinDurations.reduce((a, b) => a + b) / spinDurations.length;
    const maxDeviation = Math.max(...spinDurations) - Math.min(...spinDurations);
    
    expect(maxDeviation).toBeLessThan(averageTime * 0.2); // Max 20% de variación
  });

  it('debe manejar grandes cantidades de premios en las estadísticas', async () => {
    const largePrizeList = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Premio ${i}`,
      code: `CODE${i}`,
      timestamp: Date.now(),
      claimed: i % 2 === 0,
    }));

    (prizeService.getActivePrizes as any).mockReturnValue(largePrizeList.filter(p => !p.claimed));
    (prizeService.getClaimedPrizes as any).mockReturnValue(largePrizeList.filter(p => p.claimed));

    const startTime = performance.now();
    
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(200); // Renderizado con datos masivos
  });

  it('debe mantener un rendimiento estable con múltiples verificaciones', async () => {
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const verificationTimes: number[] = [];
    const codeInput = screen.getByPlaceholderText('Ingresa el código del premio');
    const verifyButton = screen.getByRole('button', { name: 'Verificar premio' });

    for (let i = 0; i < 50; i++) {
      const startTime = performance.now();
      
      fireEvent.change(codeInput, { target: { value: `TEST${i}` } });
      fireEvent.click(verifyButton);
      
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });
      
      const endTime = performance.now();
      verificationTimes.push(endTime - startTime);
    }

    const averageTime = verificationTimes.reduce((a, b) => a + b) / verificationTimes.length;
    expect(averageTime).toBeLessThan(50); // Menos de 50ms por verificación
  });

  it('debe manejar actualizaciones frecuentes de estadísticas', async () => {
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const updateTimes: number[] = [];

    for (let i = 0; i < 60; i++) { // Simular 1 minuto de actualizaciones
      const startTime = performance.now();
      
      (prizeService.getActivePrizes as any).mockReturnValue(
        Array.from({ length: Math.floor(Math.random() * 100) }, (_, j) => ({
          id: j,
          name: `Premio ${j}`,
          code: `CODE${j}`,
          timestamp: Date.now(),
          claimed: false,
        }))
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000); // 1 segundo
      });
      
      const endTime = performance.now();
      updateTimes.push(endTime - startTime);
    }

    const maxUpdateTime = Math.max(...updateTimes);
    expect(maxUpdateTime).toBeLessThan(100); // Actualizaciones rápidas
  });

  it('debe mantener un uso de memoria estable', async () => {
    const memorySnapshots: number[] = [];
    const getMemoryUsage = () => {
      // @ts-ignore - Performance memory no está en los tipos estándar
      return performance?.memory?.usedJSHeapSize || 0;
    };

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Simular uso intensivo
    for (let i = 0; i < 100; i++) {
      fireEvent.click(screen.getByRole('button', { name: 'Girar' }));
      
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });
      
      memorySnapshots.push(getMemoryUsage());
    }

    // Verificar que el uso de memoria no crece exponencialmente
    const memoryGrowth = memorySnapshots[memorySnapshots.length - 1] - memorySnapshots[0];
    const averageGrowthPerOperation = memoryGrowth / memorySnapshots.length;
    
    expect(averageGrowthPerOperation).toBeLessThan(1024 * 1024); // Menos de 1MB por operación
  });

  it('debe mantener un rendimiento fluido durante las animaciones', async () => {
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const spinButton = screen.getByRole('button', { name: 'Girar' });
    const frameRates: number[] = [];
    let lastTimestamp = performance.now();

    // Simular 60 frames (1 segundo a 60fps)
    for (let i = 0; i < 60; i++) {
      performance.mark(`frame-start-${i}`);
      
      fireEvent.click(spinButton);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(16.67); // ~60fps
      });
      
      performance.mark(`frame-end-${i}`);
      performance.measure(`frame-${i}`, `frame-start-${i}`, `frame-end-${i}`);
      
      const currentTimestamp = performance.now();
      const frameDuration = currentTimestamp - lastTimestamp;
      frameRates.push(1000 / frameDuration); // Convertir a FPS
      lastTimestamp = currentTimestamp;
    }

    const averageFPS = frameRates.reduce((a, b) => a + b) / frameRates.length;
    expect(averageFPS).toBeGreaterThan(30); // Mínimo 30fps
  });

  it('debe manejar eventos de usuario rápidos sin pérdida de respuesta', async () => {
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const spinButton = screen.getByRole('button', { name: 'Girar' });
    const verifyButton = screen.getByRole('button', { name: 'Verificar premio' });
    const codeInput = screen.getByPlaceholderText('Ingresa el código del premio');
    
    const responseTimes: number[] = [];

    // Simular interacciones rápidas del usuario
    for (let i = 0; i < 20; i++) {
      const startTime = performance.now();
      
      // Simular clics rápidos y entrada de texto
      fireEvent.click(spinButton);
      fireEvent.change(codeInput, { target: { value: `RAPID${i}` } });
      fireEvent.click(verifyButton);
      
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50); // 50ms entre interacciones
      });
      
      const endTime = performance.now();
      responseTimes.push(endTime - startTime);
    }

    const maxResponseTime = Math.max(...responseTimes);
    const averageResponseTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
    
    expect(maxResponseTime).toBeLessThan(100); // Máximo 100ms de respuesta
    expect(averageResponseTime).toBeLessThan(50); // Promedio menor a 50ms
  });

  it('debe mantener el rendimiento con múltiples componentes actualizándose', async () => {
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const updateTimes: number[] = [];
    const components = ['ruleta', 'estadísticas', 'verificador'];

    // Simular actualizaciones simultáneas
    for (let i = 0; i < 30; i++) {
      const startTime = performance.now();
      
      // Actualizar múltiples componentes
      await act(async () => {
        // Actualizar ruleta
        fireEvent.click(screen.getByRole('button', { name: 'Girar' }));
        
        // Actualizar estadísticas
        (prizeService.getActivePrizes as any).mockReturnValue([
          { id: i, name: `Premio ${i}`, code: `CODE${i}`, claimed: false }
        ]);
        
        // Actualizar verificador
        const input = screen.getByPlaceholderText('Ingresa el código del premio');
        fireEvent.change(input, { target: { value: `TEST${i}` } });
        
        await vi.advanceTimersByTimeAsync(33); // ~30fps
      });
      
      const endTime = performance.now();
      updateTimes.push(endTime - startTime);
    }

    const averageUpdateTime = updateTimes.reduce((a, b) => a + b) / updateTimes.length;
    expect(averageUpdateTime).toBeLessThan(16.67); // Mantener 60fps (16.67ms por frame)
  });

  it('debe mantener el rendimiento bajo carga de red simulada', async () => {
    // Simular latencia de red
    const networkLatency = 200; // 200ms de latencia
    
    // Mock de respuestas lentas
    (prizeService.getPrizeByCode as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ 
        id: 1, 
        name: 'Premio Test', 
        code: 'TEST123' 
      }), networkLatency))
    );

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const responseTimes: number[] = [];
    const verifyButton = screen.getByRole('button', { name: 'Verificar premio' });
    const codeInput = screen.getByPlaceholderText('Ingresa el código del premio');

    // Realizar verificaciones bajo latencia
    for (let i = 0; i < 10; i++) {
      const startTime = performance.now();
      
      fireEvent.change(codeInput, { target: { value: `SLOW${i}` } });
      fireEvent.click(verifyButton);
      
      await act(async () => {
        await vi.advanceTimersByTimeAsync(networkLatency + 50);
      });
      
      const endTime = performance.now();
      responseTimes.push(endTime - startTime);
    }

    const uiBlockingTime = Math.max(...responseTimes) - networkLatency;
    expect(uiBlockingTime).toBeLessThan(50); // UI no debe bloquearse más de 50ms
  });
}); 