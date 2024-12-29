import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PrizeHistory from '../PrizeHistory';
import { prizeHistoryService } from '../../services/prizeHistoryService';

// Mock del servicio
vi.mock('../../services/prizeHistoryService', () => ({
  prizeHistoryService: {
    getPrizeHistory: vi.fn(),
    exportHistory: vi.fn()
  }
}));

const mockPrizes = [
  {
    id: 1,
    code: 'ABC123',
    name: 'Premio Test 1',
    description: 'Descripción del premio 1',
    color: '#FF0000',
    icon: null,
    timestamp: Date.now(),
    claimed: false,
    expiresAt: Date.now() + 86400000
  },
  {
    id: 2,
    code: 'DEF456',
    name: 'Premio Test 2',
    description: 'Descripción del premio 2',
    color: '#00FF00',
    icon: null,
    timestamp: Date.now() - 3600000,
    claimed: true,
    expiresAt: Date.now() + 82800000,
    redeemedAt: Date.now(),
    redeemedBy: 'Usuario Test',
    storeId: 'store123'
  }
];

describe('PrizeHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prizeHistoryService.getPrizeHistory as any).mockResolvedValue({
      success: true,
      prizes: mockPrizes,
      total: mockPrizes.length
    });
  });

  it('debería renderizar el componente correctamente', async () => {
    render(<PrizeHistory />);
    
    expect(screen.getByText('Historial de Premios')).toBeInTheDocument();
    expect(screen.getByText('Exportar')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('ABC123')).toBeInTheDocument();
      expect(screen.getByText('DEF456')).toBeInTheDocument();
    });
  });

  it('debería mostrar mensaje de carga', () => {
    render(<PrizeHistory />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('debería mostrar mensaje de error', async () => {
    (prizeHistoryService.getPrizeHistory as any).mockResolvedValue({
      success: false,
      message: 'Error al cargar el historial',
      prizes: [],
      total: 0
    });

    render(<PrizeHistory />);
    
    await waitFor(() => {
      expect(screen.getByText('Error al cargar el historial')).toBeInTheDocument();
    });
  });

  it('debería filtrar por estado', async () => {
    render(<PrizeHistory />);
    
    const select = screen.getByLabelText('Estado:');
    await userEvent.selectOptions(select, 'true');
    
    await waitFor(() => {
      expect(prizeHistoryService.getPrizeHistory).toHaveBeenCalledWith(
        expect.objectContaining({ claimed: true })
      );
    });
  });

  it('debería filtrar por fechas', async () => {
    render(<PrizeHistory />);
    
    const startDate = screen.getByLabelText('Desde:');
    const endDate = screen.getByLabelText('Hasta:');
    
    await userEvent.type(startDate, '2024-01-01');
    await userEvent.type(endDate, '2024-12-31');
    
    await waitFor(() => {
      expect(prizeHistoryService.getPrizeHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date)
        })
      );
    });
  });

  it('debería exportar el historial', async () => {
    const mockBlob = new Blob(['test data'], { type: 'application/vnd.ms-excel' });
    (prizeHistoryService.exportHistory as any).mockResolvedValue(mockBlob);
    
    // Mock de URL.createObjectURL y document.createElement
    const mockUrl = 'blob:test';
    global.URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);
    const mockAnchor = { click: vi.fn(), href: '', download: '' };
    document.createElement = vi.fn().mockReturnValue(mockAnchor);
    
    render(<PrizeHistory />);
    
    const exportButton = screen.getByText('Exportar');
    await userEvent.click(exportButton);
    
    await waitFor(() => {
      expect(prizeHistoryService.exportHistory).toHaveBeenCalled();
      expect(mockAnchor.click).toHaveBeenCalled();
    });
  });

  it('debería manejar la paginación', async () => {
    (prizeHistoryService.getPrizeHistory as any).mockResolvedValue({
      success: true,
      prizes: mockPrizes,
      total: 20 // Más premios que el límite por página
    });

    render(<PrizeHistory />);
    
    await waitFor(() => {
      expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Siguiente');
    await userEvent.click(nextButton);
    
    await waitFor(() => {
      expect(prizeHistoryService.getPrizeHistory).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });
  });
}); 