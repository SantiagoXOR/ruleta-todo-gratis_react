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

describe('Experiencia Móvil y Adaptabilidad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.clear();
    
    // Restaurar dimensiones originales
    window.innerWidth = 1024;
    window.innerHeight = 768;
    window.dispatchEvent(new Event('resize'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const setMobileViewport = () => {
    window.innerWidth = 375;
    window.innerHeight = 667;
    window.dispatchEvent(new Event('resize'));
  };

  const setTabletViewport = () => {
    window.innerWidth = 768;
    window.innerHeight = 1024;
    window.dispatchEvent(new Event('resize'));
  };

  it('debe ser completamente funcional en dispositivos móviles', async () => {
    setMobileViewport();
    
    const mockPrize = {
      id: 1,
      name: 'Premio Móvil',
      code: 'MOBILE123',
      claimed: false,
      timestamp: Date.now(),
    };

    (prizeService.savePrize as any).mockResolvedValue(mockPrize);

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Verificar que los elementos principales son visibles y accesibles
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    expect(spinButton).toBeVisible();
    expect(spinButton.clientHeight).toBeGreaterThanOrEqual(44); // Tamaño mínimo para touch

    // Realizar acciones táctiles
    fireEvent.touchStart(spinButton);
    fireEvent.touchEnd(spinButton);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // Verificar respuesta a gestos táctiles
    const codeInput = screen.getByPlaceholderText('Ingresa el código del premio');
    expect(codeInput).toHaveAttribute('inputmode', 'text');
    expect(codeInput.clientHeight).toBeGreaterThanOrEqual(44);
  });

  it('debe adaptar el diseño a diferentes tamaños de pantalla', async () => {
    const { container, rerender } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Probar diseño móvil
    setMobileViewport();
    rerender(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const mobileLayout = container.firstChild;
    expect(window.getComputedStyle(mobileLayout as Element).flexDirection).toBe('column');

    // Probar diseño tablet
    setTabletViewport();
    rerender(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const tabletLayout = container.firstChild;
    expect(window.getComputedStyle(tabletLayout as Element).flexDirection).toBe('row');
  });

  it('debe manejar correctamente la orientación del dispositivo', async () => {
    const { container, rerender } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Simular orientación vertical
    window.innerWidth = 375;
    window.innerHeight = 667;
    window.dispatchEvent(new Event('resize'));

    rerender(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Verificar layout vertical
    expect(container.querySelector('.ruleta-container')).toHaveStyle({
      maxWidth: '100%',
    });

    // Simular orientación horizontal
    window.innerWidth = 667;
    window.innerHeight = 375;
    window.dispatchEvent(new Event('resize'));

    rerender(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Verificar layout horizontal
    expect(container.querySelector('.ruleta-container')).toHaveStyle({
      maxHeight: '100vh',
    });
  });

  it('debe tener controles táctiles optimizados', async () => {
    setMobileViewport();
    
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const touchTargets = screen.getAllByRole('button');
    
    touchTargets.forEach(target => {
      const styles = window.getComputedStyle(target);
      const targetSize = parseInt(styles.width) * parseInt(styles.height);
      
      // Verificar que el área táctil es suficientemente grande (44x44px mínimo)
      expect(targetSize).toBeGreaterThanOrEqual(44 * 44);
      
      // Verificar espaciado entre elementos táctiles
      const margin = parseInt(styles.marginBottom) + parseInt(styles.marginTop);
      expect(margin).toBeGreaterThanOrEqual(8);
    });
  });

  it('debe manejar gestos táctiles de manera eficiente', async () => {
    setMobileViewport();
    
    const mockPrize = {
      id: 1,
      name: 'Premio Táctil',
      code: 'TOUCH123',
      claimed: false,
    };

    (prizeService.savePrize as any).mockResolvedValue(mockPrize);

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const wheel = screen.getByTestId('wheel');
    
    // Simular gesto de swipe
    fireEvent.touchStart(wheel, {
      touches: [{ clientX: 0, clientY: 0 }],
    });
    
    fireEvent.touchMove(wheel, {
      touches: [{ clientX: 100, clientY: 0 }],
    });
    
    fireEvent.touchEnd(wheel);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // Verificar que la ruleta respondió al gesto
    expect(prizeService.savePrize).toHaveBeenCalled();
  });

  it('debe optimizar el rendimiento en dispositivos móviles', async () => {
    setMobileViewport();
    
    const startTime = performance.now();
    
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );
    
    const renderTime = performance.now() - startTime;
    expect(renderTime).toBeLessThan(100); // Renderizado inicial rápido

    // Simular interacciones rápidas
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    
    const interactionTimes: number[] = [];
    
    for (let i = 0; i < 10; i++) {
      const start = performance.now();
      
      fireEvent.touchStart(spinButton);
      fireEvent.touchEnd(spinButton);
      
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });
      
      interactionTimes.push(performance.now() - start);
    }

    // Verificar que las interacciones son fluidas
    const averageInteractionTime = interactionTimes.reduce((a, b) => a + b) / interactionTimes.length;
    expect(averageInteractionTime).toBeLessThan(16.67); // 60fps
  });

  it('debe manejar correctamente el teclado virtual', async () => {
    setMobileViewport();
    
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const codeInput = screen.getByPlaceholderText('Ingresa el código del premio');
    
    // Simular apertura del teclado virtual
    const originalHeight = window.innerHeight;
    window.innerHeight = originalHeight / 2;
    window.dispatchEvent(new Event('resize'));

    // Verificar que la interfaz se ajusta
    expect(codeInput).toBeVisible();
    expect(screen.getByRole('button', { name: 'Verificar premio' })).toBeVisible();

    // Simular cierre del teclado
    window.innerHeight = originalHeight;
    window.dispatchEvent(new Event('resize'));

    // Verificar que la interfaz vuelve a su estado normal
    expect(codeInput).toBeVisible();
    expect(screen.getByRole('button', { name: 'Girar' })).toBeVisible();
  });

  it('debe proporcionar retroalimentación táctil apropiada', async () => {
    setMobileViewport();
    
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const interactiveElements = container.querySelectorAll('button, input, a');
    
    interactiveElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      
      // Verificar estados activos y hover
      expect(styles.getPropertyValue('--touch-feedback')).toBeDefined();
      
      // Verificar transiciones suaves
      expect(styles.transition).toContain('transform');
      expect(styles.transition).toContain('opacity');
    });
  });
}); 