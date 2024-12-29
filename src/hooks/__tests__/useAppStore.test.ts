import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppStore } from '../../store/useAppStore';
import { uniqueCodeService } from '../../services/uniqueCodeService';

// Mock del servicio
vi.mock('../../services/uniqueCodeService', () => ({
  uniqueCodeService: {
    listCodes: vi.fn(),
    getStatistics: vi.fn(),
    generateCode: vi.fn(),
    exportCodes: vi.fn(),
  },
}));

describe('useAppStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const { result } = renderHook(() => useAppStore());
    act(() => {
      result.current.actions.resetState();
      result.current.actions.resetTheme();
      result.current.actions.clearNotifications();
    });
  });

  describe('Code Actions', () => {
    it('carga códigos correctamente', async () => {
      const mockResponse = {
        success: true,
        data: {
          codes: [{ id: 1, code: 'ABC123' }],
        },
      };

      (uniqueCodeService.listCodes as any).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAppStore());

      await act(async () => {
        await result.current.actions.loadCodes();
      });

      expect(result.current.codes).toEqual(mockResponse.data.codes);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('maneja errores al cargar códigos', async () => {
      const mockError = {
        success: false,
        error: 'Error al cargar códigos',
      };

      (uniqueCodeService.listCodes as any).mockResolvedValue(mockError);

      const { result } = renderHook(() => useAppStore());

      await act(async () => {
        await result.current.actions.loadCodes();
      });

      expect(result.current.error).toBe(mockError.error);
      expect(result.current.loading).toBe(false);
    });

    it('genera códigos y actualiza el estado', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1, code: 'NEW123' },
      };

      (uniqueCodeService.generateCode as any).mockResolvedValue(mockResponse);
      (uniqueCodeService.listCodes as any).mockResolvedValue({ success: true, data: { codes: [] } });
      (uniqueCodeService.getStatistics as any).mockResolvedValue({ success: true, data: {} });

      const { result } = renderHook(() => useAppStore());

      await act(async () => {
        await result.current.actions.generateCode(1);
      });

      expect(uniqueCodeService.generateCode).toHaveBeenCalledWith(1);
      expect(uniqueCodeService.listCodes).toHaveBeenCalled();
      expect(uniqueCodeService.getStatistics).toHaveBeenCalled();
    });
  });

  describe('Theme Actions', () => {
    it('alterna el modo oscuro', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.actions.toggleDarkMode();
      });

      expect(result.current.darkMode).toBe(true);

      act(() => {
        result.current.actions.toggleDarkMode();
      });

      expect(result.current.darkMode).toBe(false);
    });

    it('cambia el tamaño de fuente', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.actions.setFontSize('large');
      });

      expect(result.current.fontSize).toBe('large');
    });

    it('alterna el alto contraste', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.actions.toggleHighContrast();
      });

      expect(result.current.highContrast).toBe(true);
    });
  });

  describe('UI Actions', () => {
    it('maneja notificaciones', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.actions.addNotification('success', 'Test notification');
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].type).toBe('success');
      expect(result.current.notifications[0].message).toBe('Test notification');

      const notificationId = result.current.notifications[0].id;

      act(() => {
        result.current.actions.removeNotification(notificationId);
      });

      expect(result.current.notifications).toHaveLength(0);
    });

    it('maneja el estado del modal', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.actions.openModal('test-modal');
      });

      expect(result.current.modalOpen).toBe('test-modal');

      act(() => {
        result.current.actions.closeModal();
      });

      expect(result.current.modalOpen).toBeNull();
    });

    it('alterna la barra lateral', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.actions.toggleSidebar();
      });

      expect(result.current.sidebarOpen).toBe(false);

      act(() => {
        result.current.actions.toggleSidebar();
      });

      expect(result.current.sidebarOpen).toBe(true);
    });
  });

  describe('Filter Actions', () => {
    it('actualiza filtros y recarga datos', async () => {
      const { result } = renderHook(() => useAppStore());

      await act(async () => {
        await result.current.actions.updateFilters({
          timeRange: 'month',
          prizeId: 1,
        });
      });

      expect(result.current.filters.timeRange).toBe('month');
      expect(result.current.filters.prizeId).toBe(1);
      expect(result.current.filters.page).toBe(1);
      expect(uniqueCodeService.listCodes).toHaveBeenCalled();
      expect(uniqueCodeService.getStatistics).toHaveBeenCalled();
    });
  });
});
