import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CodesList } from '../CodesList';
import { uniqueCodeService } from '../../services/uniqueCodeService';

// Mock del servicio
vi.mock('../../services/uniqueCodeService', () => ({
  uniqueCodeService: {
    listCodes: vi.fn(),
    useCode: vi.fn(),
  },
}));

describe('CodesList', () => {
  const mockCodes = [
    {
      code: 'TEST123',
      prizeId: 1,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isUsed: false,
    },
    {
      code: 'TEST456',
      prizeId: 1,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isUsed: true,
      usedAt: new Date().toISOString(),
      usedBy: 'user123',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (uniqueCodeService.listCodes as any).mockResolvedValue({
      success: true,
      data: {
        codes: [],
        totalPages: 0,
      },
    });

    render(<CodesList />);
    expect(screen.getByText('Cargando códigos...')).toBeInTheDocument();
  });

  it('displays codes when loaded successfully', async () => {
    (uniqueCodeService.listCodes as any).mockResolvedValue({
      success: true,
      data: {
        codes: mockCodes,
        totalPages: 1,
      },
    });

    render(<CodesList />);

    await waitFor(() => {
      expect(screen.getByText('TEST123')).toBeInTheDocument();
      expect(screen.getByText('TEST456')).toBeInTheDocument();
    });
  });

  it('shows error message when loading fails', async () => {
    (uniqueCodeService.listCodes as any).mockResolvedValue({
      success: false,
      error: 'Error al cargar los códigos',
    });

    render(<CodesList />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar los códigos')).toBeInTheDocument();
    });
  });

  it('filters codes by prizeId when provided', async () => {
    render(<CodesList prizeId={1} />);

    await waitFor(() => {
      expect(uniqueCodeService.listCodes).toHaveBeenCalledWith(
        expect.objectContaining({ prizeId: 1 })
      );
    });
  });

  it('shows only valid codes when showOnlyValid is true', async () => {
    render(<CodesList showOnlyValid={true} />);

    await waitFor(() => {
      expect(uniqueCodeService.listCodes).toHaveBeenCalledWith(
        expect.objectContaining({ isUsed: false })
      );
    });
  });

  it('handles pagination correctly', async () => {
    (uniqueCodeService.listCodes as any).mockResolvedValue({
      success: true,
      data: {
        codes: mockCodes,
        totalPages: 2,
      },
    });

    render(<CodesList />);

    await waitFor(() => {
      expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Siguiente');
    await fireEvent.click(nextButton);

    await waitFor(() => {
      expect(uniqueCodeService.listCodes).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });
  });

  it('disables pagination buttons appropriately', async () => {
    (uniqueCodeService.listCodes as any).mockResolvedValue({
      success: true,
      data: {
        codes: mockCodes,
        totalPages: 1,
      },
    });

    render(<CodesList />);

    await waitFor(() => {
      expect(screen.getByText('Anterior')).toBeDisabled();
      expect(screen.getByText('Siguiente')).toBeDisabled();
    });
  });

  it('shows empty state when no codes are available', async () => {
    (uniqueCodeService.listCodes as any).mockResolvedValue({
      success: true,
      data: {
        codes: [],
        totalPages: 0,
      },
    });

    render(<CodesList />);

    await waitFor(() => {
      expect(screen.getByText('No hay códigos disponibles')).toBeInTheDocument();
    });
  });

  it('handles code usage correctly', async () => {
    (uniqueCodeService.listCodes as any).mockResolvedValue({
      success: true,
      data: {
        codes: mockCodes,
        totalPages: 1,
      },
    });

    (uniqueCodeService.useCode as any).mockResolvedValue(true);

    render(<CodesList />);

    await waitFor(() => {
      expect(screen.getByText('TEST123')).toBeInTheDocument();
    });

    const useButton = screen.getByText('Usar Código');
    await fireEvent.click(useButton);

    await waitFor(() => {
      expect(uniqueCodeService.useCode).toHaveBeenCalledWith('TEST123', expect.any(String));
      expect(uniqueCodeService.listCodes).toHaveBeenCalledTimes(2); // Una vez al inicio y otra después de usar el código
    });
  });

  it('refreshes the list when a code is used', async () => {
    (uniqueCodeService.listCodes as any).mockResolvedValue({
      success: true,
      data: {
        codes: mockCodes,
        totalPages: 1,
      },
    });

    (uniqueCodeService.useCode as any).mockResolvedValue(true);

    render(<CodesList />);

    await waitFor(() => {
      expect(screen.getByText('TEST123')).toBeInTheDocument();
    });

    const useButton = screen.getByText('Usar Código');
    await fireEvent.click(useButton);

    await waitFor(() => {
      expect(uniqueCodeService.listCodes).toHaveBeenCalledTimes(2);
    });
  });
});
