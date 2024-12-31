import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUniqueCode } from '../useUniqueCode';
import { uniqueCodeService } from '../../services/uniqueCodeService';

// Mock del servicio
vi.mock('../../services/uniqueCodeService', () => ({
  uniqueCodeService: {
    getStatistics: vi.fn(),
    listCodes: vi.fn(),
    generateCode: vi.fn(),
    exportCodes: vi.fn(),
  },
}));

// Mock del hook de notificaciones
vi.mock('../useNotification', () => ({
  useNotification: () => ({
    showNotification: vi.fn(),
  }),
}));

describe('useUniqueCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga estadísticas correctamente', async () => {
    const mockStats = {
      success: true,
      data: {
        totalCodes: 100,
        usedCodes: 30,
        expiredCodes: 10,
        activeCodesByPrize: [],
        recentActivity: []
      },
    };

    (uniqueCodeService.getStatistics as any).mockResolvedValue(mockStats);

    const { result } = renderHook(() => useUniqueCode({ autoLoad: true }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.statistics).toEqual(mockStats.data);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('maneja errores de carga de estadísticas', async () => {
    const mockError = {
      success: false,
      error: 'Error al cargar estadísticas',
    };

    (uniqueCodeService.getStatistics as any).mockResolvedValue(mockError);

    const { result } = renderHook(() => useUniqueCode({ autoLoad: true }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.statistics).toBeNull();
    expect(result.current.error).toBe(mockError.error);
  });

  it('carga códigos correctamente', async () => {
    const mockCodes = {
      success: true,
      data: {
        codes: [{ id: 1, code: 'ABC123', prizeId: 1, createdAt: Date.now(), expiresAt: Date.now() + 86400000, isUsed: false }],
        pagination: { page: 1, totalPages: 2, totalItems: 3 },
      },
    };

    (uniqueCodeService.listCodes as any).mockResolvedValue(mockCodes);

    const { result } = renderHook(() => useUniqueCode({ autoLoad: true }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.codes).toEqual(mockCodes.data.codes);
  });

  it('genera códigos correctamente', async () => {
    const mockNewCode = {
      success: true,
      data: { 
        id: 1, 
        code: 'XYZ789', 
        prizeId: 1, 
        createdAt: Date.now(), 
        expiresAt: Date.now() + 86400000, 
        isUsed: false 
      },
    };

    (uniqueCodeService.generateCode as any).mockResolvedValue(mockNewCode);
    (uniqueCodeService.getStatistics as any).mockResolvedValue({ success: true, data: {} });

    const { result } = renderHook(() => useUniqueCode());

    await act(async () => {
      await result.current.generateCode(1);
    });

    expect(result.current.codes[0]).toEqual(mockNewCode.data);
  });

  it('exporta códigos correctamente', async () => {
    const mockExport = {
      success: true,
      data: { 
        url: 'export.csv',
        filename: 'codes.csv'
      },
    };

    (uniqueCodeService.exportCodes as any).mockResolvedValue(mockExport);

    const { result } = renderHook(() => useUniqueCode());

    let exportResult;
    await act(async () => {
      exportResult = await result.current.exportCodes({
        format: 'csv',
        dateRange: 'week',
        includeUsed: true,
        includeExpired: false
      });
    });

    expect(exportResult).toEqual(mockExport.data);
  });

  it('actualiza filtros y recarga datos', async () => {
    const mockCodes = {
      success: true,
      data: {
        codes: [{ id: 1, code: 'ABC123', prizeId: 1, createdAt: Date.now(), expiresAt: Date.now() + 86400000, isUsed: false }],
        pagination: { page: 1, totalPages: 2, totalItems: 3 },
      },
    };

    (uniqueCodeService.listCodes as any).mockResolvedValue(mockCodes);

    const { result } = renderHook(() => useUniqueCode());

    await act(async () => {
      result.current.updateFilters({ prizeId: 1 });
    });

    expect(result.current.filters.prizeId).toBe(1);
    expect(uniqueCodeService.listCodes).toHaveBeenCalledWith(
      expect.objectContaining({ prizeId: 1 })
    );
  });

  it('cambia rango de tiempo y actualiza estadísticas', async () => {
    const mockStats = {
      success: true,
      data: { 
        totalCodes: 200,
        usedCodes: 50,
        expiredCodes: 20,
        activeCodesByPrize: [],
        recentActivity: []
      },
    };

    (uniqueCodeService.getStatistics as any).mockResolvedValue(mockStats);

    const { result } = renderHook(() => useUniqueCode());

    await act(async () => {
      result.current.changeTimeRange('month');
    });

    expect(result.current.timeRange).toBe('month');
    expect(uniqueCodeService.getStatistics).toHaveBeenCalledWith('month');
  });

  it('reinicia el estado correctamente', async () => {
    const { result } = renderHook(() => useUniqueCode({
      initialTimeRange: 'week',
    }));

    // Modificar estado
    await act(async () => {
      result.current.updateFilters({ prizeId: 1 });
      result.current.changeTimeRange('month');
    });

    // Reiniciar
    act(() => {
      result.current.reset();
    });

    expect(result.current.codes).toEqual([]);
    expect(result.current.statistics).toBeNull();
    expect(result.current.filters).toEqual({
      page: 1,
      prizeId: undefined,
      isUsed: undefined,
    });
    expect(result.current.timeRange).toBe('week');
  });

  it('maneja la paginación correctamente', async () => {
    const mockCodes1 = {
      success: true,
      data: {
        codes: [{ id: 1, code: 'ABC123', prizeId: 1, createdAt: Date.now(), expiresAt: Date.now() + 86400000, isUsed: false }],
        pagination: { page: 1, totalPages: 2, totalItems: 3 },
      },
    };

    const mockCodes2 = {
      success: true,
      data: {
        codes: [{ id: 2, code: 'DEF456', prizeId: 1, createdAt: Date.now(), expiresAt: Date.now() + 86400000, isUsed: false }],
        pagination: { page: 2, totalPages: 2, totalItems: 3 },
      },
    };

    (uniqueCodeService.listCodes as any)
      .mockResolvedValueOnce(mockCodes1)
      .mockResolvedValueOnce(mockCodes2);

    const { result } = renderHook(() => useUniqueCode({ autoLoad: true }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.codes).toEqual(mockCodes1.data.codes);

    await act(async () => {
      result.current.loadMore();
    });

    expect(result.current.codes).toEqual([
      ...mockCodes1.data.codes,
      ...mockCodes2.data.codes,
    ]);
  });
});
