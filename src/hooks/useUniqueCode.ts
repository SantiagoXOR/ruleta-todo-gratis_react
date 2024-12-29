import { useState, useCallback, useEffect } from 'react';
import { uniqueCodeService } from '../services/uniqueCodeService';
import { useNotification } from './useNotification';

interface UseUniqueCodeOptions {
  initialTimeRange?: 'week' | 'month' | 'year';
  autoLoad?: boolean;
}

export const useUniqueCode = (options: UseUniqueCodeOptions = {}) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [codes, setCodes] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState(options.initialTimeRange || 'week');
  const [filters, setFilters] = useState({
    page: 1,
    prizeId: undefined as number | undefined,
    isUsed: undefined as boolean | undefined,
  });

  // Cargar estadísticas
  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await uniqueCodeService.getStatistics(timeRange);
      
      if (response.success) {
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

      if (response.success) {
        setCodes(prevCodes => 
          resetPage ? response.data.codes : [...prevCodes, ...response.data.codes]
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
  const generateCode = useCallback(async (prizeId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await uniqueCodeService.generateCode(prizeId);

      if (response.success) {
        setCodes(prevCodes => [response.data, ...prevCodes]);
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
  const exportCodes = useCallback(async (options: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await uniqueCodeService.exportCodes(options);

      if (response.success) {
        showNotification('success', 'Códigos exportados exitosamente');
        return response.data;
      } else {
        setError(response.error || 'Error al exportar códigos');
        showNotification('error', 'Error al exportar códigos');
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
    setFilters(prev => ({
      ...prev,
      page: prev.page + 1,
    }));
  }, []);

  // Actualizar filtros
  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
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
