import { cacheService } from './cacheService';
import { UniqueCode } from '../types/uniqueCodes.types';

interface ListCodesOptions {
  page?: number;
  prizeId?: number;
  isUsed?: boolean;
}

interface ExportOptions {
  format: 'csv' | 'excel';
  dateRange: 'all' | 'week' | 'month' | 'year';
  includeUsed: boolean;
  includeExpired: boolean;
  prizeId?: number;
}

class UniqueCodeService {
  private readonly API_BASE = '/api/codes';
  private readonly CACHE_KEYS = {
    STATS: 'code_stats',
    LIST: 'code_list',
    DETAILS: 'code_details',
  };

  /**
   * Genera un nuevo código único
   * @param prizeId ID del premio
   * @returns Respuesta con el código generado
   */
  async generateCode(prizeId: number) {
    try {
      const response = await fetch(`${this.API_BASE}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prizeId }),
      });

      const data = await response.json();
      
      // Invalidar caché relacionado
      this.invalidateRelatedCache(prizeId);
      
      return data;
    } catch (error) {
      console.error('Error generating code:', error);
      return { success: false, error: 'Error al generar código' };
    }
  }

  /**
   * Valida un código
   * @param code Código a validar
   * @returns Respuesta con el estado de validación
   */
  async validateCode(code: string) {
    const cacheKey = `${this.CACHE_KEYS.DETAILS}_${code}`;
    
    try {
      return await cacheService.getOrGenerate(
        cacheKey,
        async () => {
          const response = await fetch(`${this.API_BASE}/${code}/validate`);
          return response.json();
        },
        30000 // 30 segundos de caché para validaciones
      );
    } catch (error) {
      console.error('Error validating code:', error);
      return { success: false, error: 'Error al validar código' };
    }
  }

  /**
   * Usa un código
   * @param code Código a usar
   * @param userId ID del usuario
   * @returns Respuesta con el resultado
   */
  async useCode(code: string, userId: string) {
    try {
      const response = await fetch(`${this.API_BASE}/${code}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      
      // Invalidar todo el caché relacionado
      if (data.success) {
        this.invalidateAllCache();
      }
      
      return data;
    } catch (error) {
      console.error('Error using code:', error);
      return { success: false, error: 'Error al usar código' };
    }
  }

  /**
   * Lista códigos con filtros
   * @param options Opciones de filtrado
   * @returns Lista de códigos
   */
  async listCodes(options: ListCodesOptions = {}) {
    const cacheKey = `${this.CACHE_KEYS.LIST}_${JSON.stringify(options)}`;
    
    try {
      return await cacheService.getOrGenerate(
        cacheKey,
        async () => {
          const queryParams = new URLSearchParams();
          if (options.page) queryParams.set('page', options.page.toString());
          if (options.prizeId) queryParams.set('prizeId', options.prizeId.toString());
          if (typeof options.isUsed === 'boolean') queryParams.set('isUsed', options.isUsed.toString());

          const response = await fetch(`${this.API_BASE}?${queryParams}`);
          return response.json();
        },
        60000 // 1 minuto de caché para listas
      );
    } catch (error) {
      console.error('Error listing codes:', error);
      return { success: false, error: 'Error al listar códigos' };
    }
  }

  /**
   * Obtiene estadísticas de códigos
   * @param timeRange Rango de tiempo
   * @returns Estadísticas
   */
  async getStatistics(timeRange: 'week' | 'month' | 'year') {
    const cacheKey = `${this.CACHE_KEYS.STATS}_${timeRange}`;
    
    try {
      return await cacheService.getOrGenerate(
        cacheKey,
        async () => {
          const response = await fetch(`${this.API_BASE}/statistics?timeRange=${timeRange}`);
          return response.json();
        },
        300000 // 5 minutos de caché para estadísticas
      );
    } catch (error) {
      console.error('Error getting statistics:', error);
      return { success: false, error: 'Error al obtener estadísticas' };
    }
  }

  /**
   * Exporta códigos
   * @param options Opciones de exportación
   * @returns Datos exportados
   */
  async exportCodes(options: ExportOptions) {
    try {
      const response = await fetch(`${this.API_BASE}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      return response.json();
    } catch (error) {
      console.error('Error exporting codes:', error);
      return { success: false, error: 'Error al exportar códigos' };
    }
  }

  /**
   * Invalida el caché relacionado con un premio
   * @param prizeId ID del premio
   */
  private invalidateRelatedCache(prizeId: number) {
    cacheService.invalidatePattern(`${this.CACHE_KEYS.LIST}.*prizeId":${prizeId}`);
    cacheService.invalidate(this.CACHE_KEYS.STATS);
  }

  /**
   * Invalida todo el caché del servicio
   */
  private invalidateAllCache() {
    Object.values(this.CACHE_KEYS).forEach(key => {
      cacheService.invalidatePattern(`^${key}`);
    });
  }
}

export const uniqueCodeService = new UniqueCodeService();
