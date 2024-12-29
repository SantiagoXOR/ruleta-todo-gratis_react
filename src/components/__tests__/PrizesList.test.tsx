import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../utils/test-utils';
import PrizesList from '../PrizesList';
import { prizeService } from '../../services/prizes';
import { prizesApi } from '../../api/prizes';

// Mock the prize service
vi.mock('../../services/prizes');
vi.mock('../../api/prizes');

describe('PrizesList', () => {
  const mockPrizes = [
    {
      id: 1,
      name: 'Premio 1',
      description: 'Descripción del premio 1',
      icon: '/assets/prizes/prize1.jpg',
      claimed: false,
      timestamp: Date.now(),
      code: 'ABC123'
    },
    {
      id: 2,
      name: 'Premio 2',
      description: 'Descripción del premio 2',
      icon: '/assets/prizes/prize2.jpg',
      claimed: true,
      timestamp: Date.now() - 1000 * 60 * 60, // 1 hora atrás
      code: 'DEF456'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock default implementations
    vi.mocked(prizeService.getAvailablePrizes).mockResolvedValue(mockPrizes);
    vi.mocked(prizeService.claimPrize).mockResolvedValue(true);
  });

  it('renders loading state initially', () => {
    renderWithProviders(<PrizesList />);
    expect(screen.getByText('Cargando premios...')).toBeInTheDocument();
  });

  it('renders prizes after loading', async () => {
    renderWithProviders(<PrizesList />);
    
    await waitFor(() => {
      expect(screen.getByText('Premio 1')).toBeInTheDocument();
      expect(screen.getByText('Premio 2')).toBeInTheDocument();
    });
  });

  it('shows empty state when no prizes available', async () => {
    vi.mocked(prizeService.getAvailablePrizes).mockResolvedValue([]);
    
    renderWithProviders(<PrizesList />);
    
    await waitFor(() => {
      expect(screen.getByText('No tienes premios disponibles')).toBeInTheDocument();
      expect(screen.getByText('¡Gira la ruleta para ganar increíbles premios!')).toBeInTheDocument();
    });
  });

  it('handles claim prize successfully', async () => {
    renderWithProviders(<PrizesList />);
    
    await waitFor(() => {
      expect(screen.getByText('Premio 1')).toBeInTheDocument();
    });

    const claimButton = screen.getByText('Reclamar Premio');
    fireEvent.click(claimButton);

    expect(claimButton).toBeDisabled();
    expect(screen.getByText('Reclamando...')).toBeInTheDocument();

    await waitFor(() => {
      expect(prizeService.claimPrize).toHaveBeenCalledWith('ABC123');
      expect(prizeService.getAvailablePrizes).toHaveBeenCalledTimes(2);
    });
  });

  it('handles claim prize error', async () => {
    vi.mocked(prizeService.claimPrize).mockRejectedValue(new Error('Error al reclamar'));
    
    renderWithProviders(<PrizesList />);
    
    await waitFor(() => {
      expect(screen.getByText('Premio 1')).toBeInTheDocument();
    });

    const claimButton = screen.getByText('Reclamar Premio');
    fireEvent.click(claimButton);

    await waitFor(() => {
      expect(screen.getByText('Error al reclamar el premio. Por favor, intenta nuevamente.')).toBeInTheDocument();
    });
  });

  it('shows expiration time correctly', async () => {
    const currentTime = Date.now();
    const recentPrize = {
      ...mockPrizes[0],
      timestamp: currentTime - 1000 * 60 * 30 // 30 minutos atrás
    };

    vi.mocked(prizeService.getAvailablePrizes).mockResolvedValue([recentPrize]);
    
    renderWithProviders(<PrizesList />);
    
    await waitFor(() => {
      const expiryText = screen.getByText(/23h \d+m restantes/);
      expect(expiryText).toBeInTheDocument();
    });
  });

  it('refreshes prizes automatically', async () => {
    vi.useFakeTimers();
    renderWithProviders(<PrizesList />);

    await waitFor(() => {
      expect(screen.getByText('Premio 1')).toBeInTheDocument();
    });

    vi.advanceTimersByTime(60000); // Avanzar 1 minuto

    await waitFor(() => {
      expect(prizeService.getAvailablePrizes).toHaveBeenCalledTimes(2);
    });

    vi.useRealTimers();
  });
});
