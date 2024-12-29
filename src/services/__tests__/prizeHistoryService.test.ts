import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prizeHistoryService } from '../prizeHistoryService';
import type { PrizeHistoryItem } from '../prizeHistoryService';

// Mock de datos para pruebas
const mockPrizes: PrizeHistoryItem[] = [
  {
    id: 1,
    code: 'ABC123',
    name: 'Premio Test 1',
    description: 'Descripción del premio 1',
    color: '#FF0000',
    icon: null,
    timestamp: Date.now(),
    claimed: false,
    expiresAt: Date.now() + 86400000 // 24 horas
  },
  {
    id: 2,
    code: 'DEF456',
    name: 'Premio Test 2',
    description: 'Descripción del premio 2',
    color: '#00FF00',
    icon: null,
    timestamp: Date.now() - 3600000, // 1 hora atrás
    claimed: true,
    expiresAt: Date.now() + 82800000, // 23 horas
    redeemedAt: Date.now(),
    redeemedBy: 'Usuario Test',
    storeId: 'store123'
  }
];

// Mock de fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('PrizeHistoryService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getPrizeHistory', () => {
    it('debería obtener el historial de premios correctamente', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          prizes: mockPrizes,
          total: mockPrizes.length
        })
      });

      const result = await prizeHistoryService.getPrizeHistory();

      expect(result.success).toBe(true);
      expect(result.prizes).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('debería manejar errores de red', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Error de red'));

      const result = await prizeHistoryService.getPrizeHistory();

      expect(result.success).toBe(false);
      expect(result.prizes).toHaveLength(0);
      expect(result.message).toBe('Error al obtener el historial de premios');
    });

    it('debería aplicar filtros correctamente', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          prizes: [mockPrizes[0]],
          total: 1
        })
      });

      const filter = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        claimed: false,
        storeId: 'store123',
        page: 1,
        limit: 10
      };

      await prizeHistoryService.getPrizeHistory(filter);

      const url = new URL(mockFetch.mock.calls[0][0]);
      expect(url.searchParams.get('startDate')).toBe(filter.startDate.toISOString());
      expect(url.searchParams.get('endDate')).toBe(filter.endDate.toISOString());
      expect(url.searchParams.get('claimed')).toBe('false');
      expect(url.searchParams.get('storeId')).toBe('store123');
      expect(url.searchParams.get('page')).toBe('1');
      expect(url.searchParams.get('limit')).toBe('10');
    });
  });

  describe('exportHistory', () => {
    it('debería exportar el historial correctamente', async () => {
      const mockBlob = new Blob(['test data'], { type: 'application/vnd.ms-excel' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob
      });

      const result = await prizeHistoryService.exportHistory();

      expect(result).toBeInstanceOf(Blob);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('debería manejar errores en la exportación', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Error de exportación'));

      await expect(prizeHistoryService.exportHistory()).rejects.toThrow('No se pudo exportar el historial de premios');
    });

    it('debería aplicar filtros en la exportación', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob()
      });

      const filter = {
        startDate: new Date('2024-01-01'),
        claimed: true
      };

      await prizeHistoryService.exportHistory(filter);

      const url = new URL(mockFetch.mock.calls[0][0]);
      expect(url.searchParams.get('startDate')).toBe(filter.startDate.toISOString());
      expect(url.searchParams.get('claimed')).toBe('true');
    });
  });
}); 