import { useState, useCallback, useEffect } from 'react';
import { uniqueCodeService } from '../services/uniqueCodeService';
import { useNotification } from './useNotification';
import {
  UniqueCode,
  CodeStatistics,
  ExportOptions
} from '../types/uniqueCodes.types';

interface UseUniqueCodeOptions {
  initialTimeRange?: 'week' | 'month' | 'year';
  autoLoad?: boolean;
}

interface UniqueCodeFilters {
  page: number;
  prizeId?: number;
  isUsed?: boolean;
}

export const useUniqueCode = (options: UseUniqueCodeOptions = {}) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<CodeStatistics | null>(null);
  const [codes, setCodes] = useState<UniqueCode[]>([]);
  const [timeRange, setTimeRange] = useState(options.initialTimeRange || 'week');
  const [filters, setFilters] = useState<UniqueCodeFilters>({
    page: 1,
    prizeId: undefined,
    isUsed: undefined,
  });

  // Cargar estadísticas
  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await uniqueCodeService.getStatistics(timeRange);
      
      if (response.success && response.data) {
        setStatistics(response.data);
      } else {
        setError(response.error || 'Error al cargar estadísticas');
        showNotification('error', 'Error al cargar estadísticas');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      showNotification('error', message);
    } finally {
      setLoading(false);
    }
  }, [timeRange, showNotification]);

  // Cargar códigos
  const loadCodes = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      setError(null);

      const updatedFilters = resetPage ? { ...filters, page: 1 } : filters;
      const response = await uniqueCodeService.listCodes(updatedFilters);

      if (response.success && response.data) {
        setCodes(prevCodes =>
          resetPage ? response.data!.codes : [...prevCodes, ...response.data!.codes]
        );
        setFilters(prev => ({
          ...prev,
          page: resetPage ? 1 : prev.page,
        }));
      } else {
        setError(response.error || 'Error al cargar códigos');
        showNotification('error', 'Error al cargar códigos');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      showNotification('error', message);
    } finally {
      setLoading(false);
    }
  }, [filters, showNotification]);

  // Generar código
  const generateCode = useCallback(async (prizeId: number): Promise<UniqueCode | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await uniqueCodeService.generateCode(prizeId);

      if (response.success && response.data) {
        setCodes(prevCodes => [response.data!, ...prevCodes]);
        showNotification('success', 'Código generado exitosamente');
        await loadStatistics(); // Actualizar estadísticas
        return response.data;
      } else {
        setError(response.error || 'Error al generar código');
        showNotification('error', 'Error al generar código');
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      showNotification('error', message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadStatistics, showNotification]);

  // Exportar códigos
  const exportCodes = useCallback(async (options: ExportOptions): Promise<{ url: string; filename: string; } | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await uniqueCodeService.exportCodes(options);

      if (response.success && response.data) {
        showNotification('success', 'Códigos exportados exitosamente');
        return response.data;
      } else {
        const errorMessage = response.error || 'Error al exportar códigos';
        setError(errorMessage);
        showNotification('error', errorMessage);
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      showNotification('error', message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Cargar más códigos
  const loadMore = useCallback(() => {
    if (!loading) {
      setFilters(prev => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  }, [loading]);

  // Actualizar filtros
  const updateFilters = useCallback((newFilters: Partial<UniqueCodeFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Resetear página al cambiar filtros
    }));
  }, []);

  // Cambiar rango de tiempo
  const changeTimeRange = useCallback((newRange: 'week' | 'month' | 'year') => {
    setTimeRange(newRange);
  }, []);

  // Reiniciar estado
  const reset = useCallback(() => {
    setCodes([]);
    setStatistics(null);
    setFilters({
      page: 1,
      prizeId: undefined,
      isUsed: undefined,
    });
    setTimeRange(options.initialTimeRange || 'week');
    setError(null);
  }, [options.initialTimeRange]);

  // Cargar datos iniciales
  useEffect(() => {
    if (options.autoLoad) {
      loadStatistics();
      loadCodes(true);
    }
  }, [options.autoLoad, loadStatistics, loadCodes]);

  // Recargar cuando cambian los filtros
  useEffect(() => {
    loadCodes();
  }, [filters.page, filters.prizeId, filters.isUsed, loadCodes]);

  // Recargar estadísticas cuando cambia el rango de tiempo
  useEffect(() => {
    loadStatistics();
  }, [timeRange, loadStatistics]);

  return {
    loading,
    error,
    statistics,
    codes,
    timeRange,
    filters,
    loadStatistics,
    loadCodes,
    generateCode,
    exportCodes,
    loadMore,
    updateFilters,
    changeTimeRange,
    reset,
  };
};
