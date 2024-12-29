import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { act } from 'react-dom/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import App from '../../App';
import { prizeService } from '../../services/prizes';
import theme from '../../styles/theme';

expect.extend(toHaveNoViolations);

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

describe('Pruebas de Accesibilidad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('no debe tener violaciones de accesibilidad en el estado inicial', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('debe mantener la accesibilidad durante la interacción del usuario', async () => {
    const mockPrize = {
      id: 1,
      name: 'Premio Accesible',
      code: 'ACCESS123',
      claimed: false,
      timestamp: Date.now(),
    };

    (prizeService.savePrize as any).mockResolvedValue(mockPrize);
    
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Verificar accesibilidad inicial
    let results = await axe(container);
    expect(results).toHaveNoViolations();

    // Girar la ruleta
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // Verificar accesibilidad después de girar
    results = await axe(container);
    expect(results).toHaveNoViolations();

    // Verificar premio
    const codeInput = screen.getByPlaceholderText('Ingresa el código del premio');
    const verifyButton = screen.getByRole('button', { name: 'Verificar premio' });

    fireEvent.change(codeInput, { target: { value: mockPrize.code } });
    fireEvent.click(verifyButton);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    // Verificar accesibilidad después de verificar premio
    results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('debe tener una estructura de encabezados correcta', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels = Array.from(headings).map(h => parseInt(h.tagName[1]));

    // Verificar que los niveles de encabezado son secuenciales
    headingLevels.reduce((prevLevel, currentLevel) => {
      expect(currentLevel).toBeLessThanOrEqual(prevLevel + 1);
      return currentLevel;
    });
  });

  it('debe tener textos alternativos apropiados para imágenes', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const images = container.querySelectorAll('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('alt');
      expect(img.getAttribute('alt')).not.toBe('');
    });
  });

  it('debe tener contraste de color adecuado', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });

    expect(results).toHaveNoViolations();
  });

  it('debe ser navegable por teclado', async () => {
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    const interactiveElements = screen.getAllByRole(/button|textbox|link/);
    
    // Verificar que todos los elementos interactivos son alcanzables por teclado
    interactiveElements.forEach(element => {
      element.focus();
      expect(document.activeElement).toBe(element);
    });
  });

  it('debe tener etiquetas ARIA apropiadas', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Verificar roles ARIA
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    expect(spinButton).toHaveAttribute('aria-label');

    const verifyButton = screen.getByRole('button', { name: 'Verificar premio' });
    expect(verifyButton).toHaveAttribute('aria-label');

    // Verificar live regions
    const liveRegions = container.querySelectorAll('[aria-live]');
    expect(liveRegions.length).toBeGreaterThan(0);
  });

  it('debe manejar estados de carga de manera accesible', async () => {
    const mockPrize = {
      id: 1,
      name: 'Premio Carga',
      code: 'LOAD123',
      claimed: false,
    };

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
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);

    // Verificar estado de carga
    expect(screen.getByRole('alert')).toHaveAttribute('aria-busy', 'true');

    // Completar carga
    resolvePromise!(mockPrize);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // Verificar accesibilidad después de la carga
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('debe tener mensajes de error accesibles', async () => {
    // Simular error
    (prizeService.savePrize as any).mockRejectedValue(new Error('Error de prueba'));

    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Provocar error
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    // Verificar mensaje de error accesible
    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
    expect(errorMessage).toBeVisible();

    // Verificar accesibilidad general con error presente
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('debe tener tooltips y ayudas contextuales accesibles', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Verificar tooltips
    const elementsWithTooltips = container.querySelectorAll('[aria-describedby]');
    elementsWithTooltips.forEach(element => {
      const tooltipId = element.getAttribute('aria-describedby');
      expect(container.querySelector(`#${tooltipId}`)).toBeInTheDocument();
    });

    // Verificar que los tooltips son accesibles
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('debe mantener el foco apropiadamente durante las interacciones', async () => {
    render(
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    );

    // Verificar gestión del foco al abrir/cerrar modales
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    const initialFocusElement = document.activeElement;
    
    fireEvent.click(spinButton);
    
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    // El foco debe volver al elemento original después de cerrar el modal
    expect(document.activeElement).toBe(initialFocusElement);
  });
}); 