import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import PrizeVerifier from '../PrizeVerifier';
import { NotificationProvider } from '../../contexts/NotificationContext';
import * as prizeServiceModule from '../../services/prizes';
import theme from '../../styles/theme';

// Mock de los servicios
vi.mock('../../services/prizes', () => ({
  prizeService: {
    getPrizeByCode: vi.fn(),
    isPrizeValid: vi.fn(),
    markPrizeAsClaimed: vi.fn(),
    getTimeToExpiry: vi.fn(),
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

const { prizeService } = prizeServiceModule;

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <NotificationProvider>
        {component}
      </NotificationProvider>
    </ThemeProvider>
  );
};

describe('PrizeVerifier', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar mensaje cuando no se ingresa código', async () => {
    renderWithProviders(<PrizeVerifier />);
    
    const submitButton = screen.getByRole('button', { name: 'Verificar' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor ingresa un código')).toBeInTheDocument();
    });
  });

  it('debe mostrar error cuando el premio no existe', async () => {
    vi.spyOn(prizeService, 'getPrizeByCode').mockResolvedValue(null);

    renderWithProviders(<PrizeVerifier />);
    
    const input = screen.getByPlaceholderText('Ingresa el código del premio');
    fireEvent.change(input, { target: { value: 'INVALID' } });
    
    const submitButton = screen.getByRole('button', { name: 'Verificar' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Código inválido')).toBeInTheDocument();
    });
  });

  it('debe mostrar información del premio cuando es válido', async () => {
    const validPrize = {
      id: 1,
      name: 'Premio Test',
      code: 'TEST123',
      claimed: false,
      timestamp: Date.now(),
    };

    vi.spyOn(prizeService, 'getPrizeByCode').mockResolvedValue(validPrize);
    vi.spyOn(prizeService, 'isPrizeValid').mockReturnValue(true);

    renderWithProviders(<PrizeVerifier />);
    
    const input = screen.getByPlaceholderText('Ingresa el código del premio');
    fireEvent.change(input, { target: { value: 'TEST123' } });
    
    const submitButton = screen.getByRole('button', { name: 'Verificar' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Información del Premio')).toBeInTheDocument();
      expect(screen.getByText('Nombre: Premio Test')).toBeInTheDocument();
      expect(screen.getByText('Estado: No reclamado')).toBeInTheDocument();
    });
  });

  it('debe permitir reclamar un premio válido', async () => {
    const validPrize = {
      id: 1,
      name: 'Premio Test',
      code: 'TEST123',
      claimed: false,
      timestamp: Date.now(),
    };

    vi.spyOn(prizeService, 'getPrizeByCode').mockResolvedValue(validPrize);
    vi.spyOn(prizeService, 'isPrizeValid').mockReturnValue(true);
    vi.spyOn(prizeService, 'markPrizeAsClaimed').mockResolvedValue(true);

    renderWithProviders(<PrizeVerifier />);
    
    const input = screen.getByPlaceholderText('Ingresa el código del premio');
    fireEvent.change(input, { target: { value: 'TEST123' } });
    
    const verifyButton = screen.getByRole('button', { name: 'Verificar' });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      const claimButton = screen.getByRole('button', { name: 'Reclamar premio' });
      fireEvent.click(claimButton);
    });

    await waitFor(() => {
      expect(screen.getByText('¡Premio reclamado con éxito!')).toBeInTheDocument();
      expect(screen.getByText('Estado: Reclamado')).toBeInTheDocument();
    });
  });

  it('debe mostrar error cuando el premio está expirado', async () => {
    const expiredPrize = {
      id: 1,
      name: 'Premio Test',
      code: 'TEST123',
      claimed: false,
      timestamp: Date.now() - 86400000, // 24 horas atrás
    };

    vi.spyOn(prizeService, 'getPrizeByCode').mockResolvedValue(expiredPrize);
    vi.spyOn(prizeService, 'isPrizeValid').mockReturnValue(false);

    renderWithProviders(<PrizeVerifier />);
    
    const input = screen.getByPlaceholderText('Ingresa el código del premio');
    fireEvent.change(input, { target: { value: 'TEST123' } });
    
    const submitButton = screen.getByRole('button', { name: 'Verificar' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Este premio ha expirado')).toBeInTheDocument();
    });
  });
});