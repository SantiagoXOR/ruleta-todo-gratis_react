import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import Wheel from '../Wheel';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { prizeService } from '../../services/prizes';
import theme from '../../styles/theme';
import { Prize } from '../../types/wheel.types';

// Mock de los servicios
vi.mock('../../services/prizes', () => ({
  prizeService: {
    savePrize: vi.fn(),
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

// Mock de Math.random para pruebas deterministas
const mockMath = Object.create(global.Math);
mockMath.random = () => 0.5; // Valor fijo para pruebas
global.Math = mockMath;

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <NotificationProvider>
        {component}
      </NotificationProvider>
    </ThemeProvider>
  );
};

describe('Wheel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('debe renderizar correctamente con las propiedades por defecto', () => {
    renderWithProviders(<Wheel />);
    expect(screen.getByText('¡Gira la Ruleta!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Girar' })).toBeInTheDocument();
    
    // Verificar que los premios por defecto están presentes
    const prizes = screen.getAllByRole('listitem');
    expect(prizes).toHaveLength(8); // 8 premios por defecto
  });

  it('debe deshabilitar el botón durante el giro', async () => {
    renderWithProviders(<Wheel />);
    
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);
    
    expect(spinButton).toBeDisabled();
    
    // Esperar a que termine el giro
    await waitFor(() => {
      expect(spinButton).not.toBeDisabled();
    }, { timeout: 5000 });
  });

  it('debe generar un premio al terminar el giro', async () => {
    renderWithProviders(<Wheel />);
    
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);
    
    await waitFor(() => {
      expect(prizeService.savePrize).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('debe mostrar el código del premio al terminar', async () => {
    (prizeService.savePrize as any).mockImplementation((prize) => {
      // Simular que el servicio guarda el premio y devuelve el código
      return { ...prize, code: 'TEST123' };
    });

    renderWithProviders(<Wheel />);
    
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);
    
    await waitFor(() => {
      expect(screen.getByText(/TEST123/)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('debe manejar errores durante el giro', async () => {
    (prizeService.savePrize as any).mockRejectedValue(new Error('Error al guardar premio'));

    renderWithProviders(<Wheel />);
    
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Error al generar el premio/)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('debe manejar errores del servicio correctamente', async () => {
    const error = new Error('Error al guardar el premio');
    (prizeService.savePrize as any).mockRejectedValueOnce(error);

    renderWithProviders(<Wheel />);
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);

    await waitFor(() => {
      expect(screen.getByText(/Error al guardar el premio/)).toBeInTheDocument();
    });
  });

  it('debe permitir personalizar los premios', () => {
    const customPrizes: Prize[] = [
      { id: 1, name: 'Premio Personalizado 1', probability: 0.5, color: '#FF0000' },
      { id: 2, name: 'Premio Personalizado 2', probability: 0.5, color: '#00FF00' }
    ];

    renderWithProviders(<Wheel prizes={customPrizes} />);
    
    expect(screen.getByText('Premio Personalizado 1')).toBeInTheDocument();
    expect(screen.getByText('Premio Personalizado 2')).toBeInTheDocument();
  });

  it('debe llamar al callback onSpinComplete cuando termina el giro', async () => {
    const onSpinComplete = vi.fn();
    renderWithProviders(<Wheel onSpinComplete={onSpinComplete} />);

    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);

    await waitFor(() => {
      expect(onSpinComplete).toHaveBeenCalledWith(expect.any(Object));
    }, { timeout: 5000 });
  });

  it('debe reproducir sonidos durante el giro', async () => {
    const playSound = vi.fn();
    const stopSound = vi.fn();
    
    vi.mock('../../hooks/useSound', () => ({
      default: () => ({
        playSound,
        stopSound,
        stopAllSounds: vi.fn(),
      }),
    }));

    renderWithProviders(<Wheel />);
    
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);
    
    expect(playSound).toHaveBeenCalledWith('spin');
    
    await waitFor(() => {
      expect(stopSound).toHaveBeenCalledWith('spin');
      expect(playSound).toHaveBeenCalledWith('win');
    }, { timeout: 5000 });
  });

  it('debe mostrar la animación de confeti al ganar', async () => {
    const mockConfetti = vi.fn();
    global.confetti = mockConfetti;

    renderWithProviders(<Wheel />);
    
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    fireEvent.click(spinButton);
    
    await waitFor(() => {
      expect(mockConfetti).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('debe generar códigos únicos para cada premio', async () => {
    const prizes = new Set();
    
    renderWithProviders(<Wheel />);
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    
    // Realizar varios giros
    for (let i = 0; i < 5; i++) {
      fireEvent.click(spinButton);
      await waitFor(() => {
        const prizeCall = (prizeService.savePrize as any).mock.calls[i][0];
        prizes.add(prizeCall.code);
      }, { timeout: 5000 });
    }
    
    // Verificar que todos los códigos son únicos
    expect(prizes.size).toBe(5);
  });

  it('debe mantener el estado correcto durante todo el ciclo de giro', async () => {
    renderWithProviders(<Wheel />);
    
    const spinButton = screen.getByRole('button', { name: 'Girar' });
    
    // Estado inicial
    expect(spinButton).not.toBeDisabled();
    expect(screen.queryByText(/Código del premio/)).not.toBeInTheDocument();
    
    // Iniciar giro
    fireEvent.click(spinButton);
    expect(spinButton).toBeDisabled();
    
    // Esperar a que termine el giro
    await waitFor(() => {
      expect(spinButton).not.toBeDisabled();
      expect(screen.getByText(/Código del premio/)).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});