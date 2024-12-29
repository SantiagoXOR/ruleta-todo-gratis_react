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

describe('Animaciones y Efectos Visuales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe animar la ruleta suavemente durante el giro', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const wheel = container.querySelector('.wheel');
    const spinButton = screen.getByRole('button', { name: 'Girar' });

    // Capturar estado inicial
    const initialTransform = window.getComputedStyle(wheel!).transform;

    // Iniciar giro
    fireEvent.click(spinButton);

    // Verificar animación en diferentes puntos
    for (let i = 0; i < 10; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      const currentTransform = window.getComputedStyle(wheel!).transform;
      expect(currentTransform).not.toBe(initialTransform);
    }

    // Verificar que la animación termina suavemente
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    const finalTransform = window.getComputedStyle(wheel!).transform;
    expect(finalTransform).not.toBe(initialTransform);
  });

  it('debe mostrar efectos de transición en los premios', async () => {
    const mockPrize = {
      id: 1,
      name: 'Premio Animado',
      code: 'ANIM123',
      claimed: false,
      timestamp: Date.now(),
    };

    (prizeService.savePrize as any).mockResolvedValue(mockPrize);

    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Girar la ruleta
    fireEvent.click(screen.getByRole('button', { name: 'Girar' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // Verificar animación de aparición del premio
    const prizeElement = screen.getByText(mockPrize.name);
    const styles = window.getComputedStyle(prizeElement);

    expect(styles.opacity).toBe('1');
    expect(styles.transform).not.toBe('none');
  });

  it('debe animar las notificaciones correctamente', async () => {
    (prizeService.savePrize as any).mockRejectedValue(new Error('Error de prueba'));

    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Provocar notificación de error
    fireEvent.click(screen.getByRole('button', { name: 'Girar' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    const notification = container.querySelector('.notification');
    const styles = window.getComputedStyle(notification!);

    // Verificar entrada de la notificación
    expect(styles.opacity).toBe('1');
    expect(styles.transform).not.toBe('translateY(100%)');

    // Verificar salida de la notificación
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(window.getComputedStyle(notification!).opacity).toBe('0');
  });

  it('debe animar los efectos de hover y focus', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const buttons = container.querySelectorAll('button');
    
    buttons.forEach(button => {
      const initialStyles = window.getComputedStyle(button);
      
      // Simular hover
      fireEvent.mouseEnter(button);
      const hoverStyles = window.getComputedStyle(button);
      expect(hoverStyles.transform).not.toBe(initialStyles.transform);
      
      // Simular focus
      button.focus();
      const focusStyles = window.getComputedStyle(button);
      expect(focusStyles.boxShadow).not.toBe(initialStyles.boxShadow);
    });
  });

  it('debe animar las transiciones de estado', async () => {
    const mockPrize = {
      id: 1,
      name: 'Premio Estado',
      code: 'STATE123',
      claimed: false,
      timestamp: Date.now(),
    };

    (prizeService.savePrize as any).mockResolvedValue(mockPrize);
    (prizeService.markPrizeAsClaimed as any).mockResolvedValue({ ...mockPrize, claimed: true });

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Girar y obtener premio
    fireEvent.click(screen.getByRole('button', { name: 'Girar' }));
    
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // Verificar premio
    const codeInput = screen.getByPlaceholderText('Ingresa el código del premio');
    fireEvent.change(codeInput, { target: { value: mockPrize.code } });
    fireEvent.click(screen.getByRole('button', { name: 'Verificar premio' }));

    // Verificar animación de transición de estado
    const prizeStatus = screen.getByText(/no reclamado/i);
    const initialStyles = window.getComputedStyle(prizeStatus);

    // Reclamar premio
    fireEvent.click(screen.getByRole('button', { name: 'Reclamar premio' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    const finalStyles = window.getComputedStyle(prizeStatus);
    expect(finalStyles.color).not.toBe(initialStyles.color);
  });

  it('debe animar los elementos de carga', async () => {
    let resolvePromise: (value: any) => void;
    (prizeService.savePrize as any).mockImplementation(() => 
      new Promise(resolve => {
        resolvePromise = resolve;
      })
    );

    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Iniciar carga
    fireEvent.click(screen.getByRole('button', { name: 'Girar' }));

    // Verificar animación de carga
    const loader = container.querySelector('.loader');
    const initialRotation = window.getComputedStyle(loader!).transform;

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    const midRotation = window.getComputedStyle(loader!).transform;
    expect(midRotation).not.toBe(initialRotation);

    // Completar carga
    resolvePromise!({
      id: 1,
      name: 'Premio Carga',
      code: 'LOAD123',
      claimed: false,
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(loader).not.toBeInTheDocument();
  });

  it('debe animar las transiciones entre vistas', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Cambiar entre vistas
    const statsButton = screen.getByRole('button', { name: /estadísticas/i });
    
    // Capturar estado inicial
    const initialLayout = window.getComputedStyle(container.firstChild as Element).transform;

    // Cambiar vista
    fireEvent.click(statsButton);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // Verificar animación de transición
    const transitionLayout = window.getComputedStyle(container.firstChild as Element).transform;
    expect(transitionLayout).not.toBe(initialLayout);
  });

  it('debe sincronizar animaciones con efectos de sonido', async () => {
    const mockPlaySound = vi.fn();
    const mockStopSound = vi.fn();

    vi.mock('../../hooks/useSound', () => ({
      default: () => ({
        playSound: mockPlaySound,
        stopSound: mockStopSound,
        stopAllSounds: vi.fn(),
      }),
    }));

    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Iniciar giro
    fireEvent.click(screen.getByRole('button', { name: 'Girar' }));

    // Verificar sincronización de sonido con animación
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });

      expect(mockPlaySound).toHaveBeenCalledTimes(i + 1);
    }

    // Verificar detención del sonido al finalizar
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(mockStopSound).toHaveBeenCalled();
  });
}); 