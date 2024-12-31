import { cacheService } from './cacheService';
import { 
  UniqueCode, 
  CodeStatistics, 
  ListCodesResponse, 
  StatisticsResponse,
  ExportResponse 
} from '../types/uniqueCodes.types';

export interface ListCodesOptions {
  page?: number;
  prizeId?: number;
  isUsed?: boolean;
}

export interface ExportOptions {
  format: 'csv' | 'excel';
  dateRange: 'all' | 'week' | 'month' | 'year';
  includeUsed: boolean;
  includeExpired: boolean;
  prizeId?: number;
}

export class UniqueCodeService {
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
  async generateCode(prizeId: number): Promise<{ success: boolean; data?: UniqueCode; error?: string }> {
    try {
      // Simular generación de código en desarrollo
      if (process.env.NODE_ENV === 'development') {
        const code = `TEST${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const data: UniqueCode = {
          code,
          prizeId,
          timestamp: Date.now(),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
          isUsed: false
        };
        return { success: true, data };
      }

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
      
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data.error || 'Error al generar código' : undefined
      };
    } catch (error) {
      console.error('Error generating code:', error);
      // En desarrollo, generar un código de prueba incluso si hay error
      if (process.env.NODE_ENV === 'development') {
        const code = `TEST${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const data: UniqueCode = {
          code,
          prizeId,
          timestamp: Date.now(),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
          isUsed: false
        };
        return { success: true, data };
      }
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
      // En desarrollo, simular validación
      if (process.env.NODE_ENV === 'development') {
        const isValid = code.startsWith('TEST');
        return { success: true, data: { isValid, code } };
      }

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
      // En desarrollo, retornar validación simulada
      if (process.env.NODE_ENV === 'development') {
        const isValid = code.startsWith('TEST');
        return { success: true, data: { isValid, code } };
      }
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
      // En desarrollo, simular uso de código
      if (process.env.NODE_ENV === 'development') {
        return { success: true, data: { code, userId } };
      }

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
      // En desarrollo, retornar éxito simulado
      if (process.env.NODE_ENV === 'development') {
        return { success: true, data: { code, userId } };
      }
      return { success: false, error: 'Error al usar código' };
    }
  }

  /**
   * Lista códigos con filtros
   * @param options Opciones de filtrado
   * @returns Lista de códigos
   */
  async listCodes(options: ListCodesOptions = {}): Promise<ListCodesResponse> {
    const cacheKey = `${this.CACHE_KEYS.LIST}_${JSON.stringify(options)}`;
    
    try {
      // En desarrollo, retornar lista simulada
      if (process.env.NODE_ENV === 'development') {
        const codes = Array.from({ length: 10 }, (_, i) => ({
          code: `TEST${i}`,
          prizeId: options.prizeId || 1,
          timestamp: Date.now() - i * 1000,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          isUsed: false
        }));
        return {
          success: true,
          data: {
            codes,
            pagination: {
              page: options.page || 1,
              totalPages: 1,
              totalItems: codes.length
            }
          }
        };
      }

      return await cacheService.getOrGenerate(
        cacheKey,
        async () => {
          const queryParams = new URLSearchParams();
          if (options.page) queryParams.set('page', options.page.toString());
          if (options.prizeId) queryParams.set('prizeId', options.prizeId.toString());
          if (typeof options.isUsed === 'boolean') queryParams.set('isUsed', options.isUsed.toString());

          const response = await fetch(`${this.API_BASE}?${queryParams}`);
          const data = await response.json();

          return {
            success: response.ok,
            data: response.ok ? {
              codes: data.codes,
              pagination: data.pagination
            } : undefined,
            error: !response.ok ? data.error || 'Error al listar códigos' : undefined
          };
        },
        60000 // 1 minuto de caché para listas
      );
    } catch (error) {
      console.error('Error listing codes:', error);
      // En desarrollo, retornar lista simulada incluso si hay error
      if (process.env.NODE_ENV === 'development') {
        const codes = Array.from({ length: 10 }, (_, i) => ({
          code: `TEST${i}`,
          prizeId: options.prizeId || 1,
          timestamp: Date.now() - i * 1000,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          isUsed: false
        }));
        return {
          success: true,
          data: {
            codes,
            pagination: {
              page: options.page || 1,
              totalPages: 1,
              totalItems: codes.length
            }
          }
        };
      }
      return { success: false, error: 'Error al listar códigos' };
    }
  }

  /**
   * Obtiene estadísticas de códigos
   * @param timeRange Rango de tiempo
   * @returns Estadísticas
   */
  async getStatistics(timeRange: 'week' | 'month' | 'year'): Promise<StatisticsResponse> {
    const cacheKey = `${this.CACHE_KEYS.STATS}_${timeRange}`;
    
    try {
      // En desarrollo, retornar estadísticas simuladas
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          data: {
            total: 100,
            used: 50,
            expired: 10,
            active: 40,
            timeRange
          }
        };
      }

      return await cacheService.getOrGenerate(
        cacheKey,
        async () => {
          const response = await fetch(`${this.API_BASE}/statistics?timeRange=${timeRange}`);
          const data = await response.json();

          return {
            success: response.ok,
            data: response.ok ? data : undefined,
            error: !response.ok ? data.error || 'Error al obtener estadísticas' : undefined
          };
        },
        300000 // 5 minutos de caché para estadísticas
      );
    } catch (error) {
      console.error('Error getting statistics:', error);
      // En desarrollo, retornar estadísticas simuladas incluso si hay error
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          data: {
            total: 100,
            used: 50,
            expired: 10,
            active: 40,
            timeRange
          }
        };
      }
      return { success: false, error: 'Error al obtener estadísticas' };
    }
  }

  /**
   * Exporta códigos según las opciones especificadas
   * @param options Opciones de exportación
   * @returns Respuesta con la URL y nombre del archivo exportado
   */
  async exportCodes(options: ExportOptions): Promise<ExportResponse> {
    try {
      // En desarrollo, simular exportación
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          data: {
            url: 'data:text/csv;base64,Q09ESUdPLEZFQ0hBLEVTVEFETw==',
            filename: `codigos_${Date.now()}.${options.format}`
          }
        };
      }

      const queryParams = new URLSearchParams();
      queryParams.set('format', options.format);
      queryParams.set('dateRange', options.dateRange);
      queryParams.set('includeUsed', options.includeUsed.toString());
      queryParams.set('includeExpired', options.includeExpired.toString());
      if (options.prizeId) queryParams.set('prizeId', options.prizeId.toString());

      const response = await fetch(`${this.API_BASE}/export?${queryParams}`);
      const data = await response.json();

      return {
        success: response.ok,
        data: response.ok ? {
          url: data.url,
          filename: data.filename
        } : undefined,
        error: !response.ok ? data.error || 'Error al exportar códigos' : undefined
      };
    } catch (error) {
      console.error('Error exporting codes:', error);
      // En desarrollo, retornar exportación simulada incluso si hay error
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          data: {
            url: 'data:text/csv;base64,Q09ESUdPLEZFQ0hBLEVTVEFETw==',
            filename: `codigos_${Date.now()}.${options.format}`
          }
        };
      }
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
export type { UniqueCode };
export default uniqueCodeService;
