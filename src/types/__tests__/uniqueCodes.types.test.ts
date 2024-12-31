import { describe, it, expect } from 'vitest';
import type {
  UniqueCode,
  CodeStatistics,
  ListCodesResponse,
  StatisticsResponse,
  ExportResponse,
  ExportOptions
} from '../uniqueCodes.types';

describe('Tipos de Códigos Únicos', () => {
  describe('UniqueCode', () => {
    it('debería tener la estructura correcta', () => {
      const code: UniqueCode = {
        code: 'TEST123',
        prizeId: 1,
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        isUsed: false
      };

      expect(code).toHaveProperty('code');
      expect(code).toHaveProperty('prizeId');
      expect(code).toHaveProperty('timestamp');
      expect(code).toHaveProperty('expiresAt');
      expect(code).toHaveProperty('isUsed');
    });
  });

  describe('CodeStatistics', () => {
    it('debería tener la estructura correcta', () => {
      const stats: CodeStatistics = {
        total: 100,
        used: 50,
        expired: 10,
        active: 40
      };

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('used');
      expect(stats).toHaveProperty('expired');
      expect(stats).toHaveProperty('active');
    });
  });

  describe('ListCodesResponse', () => {
    it('debería tener la estructura correcta para una respuesta exitosa', () => {
      const response: ListCodesResponse = {
        success: true,
        data: {
          codes: [
            {
              code: 'TEST123',
              prizeId: 1,
              timestamp: Date.now(),
              expiresAt: Date.now() + 24 * 60 * 60 * 1000,
              isUsed: false
            }
          ],
          pagination: {
            page: 1,
            totalPages: 10,
            totalItems: 100
          }
        }
      };

      expect(response).toHaveProperty('success', true);
      expect(response.data).toBeDefined();
      expect(response.data?.codes).toBeInstanceOf(Array);
      expect(response.data?.pagination).toHaveProperty('page');
      expect(response.data?.pagination).toHaveProperty('totalPages');
      expect(response.data?.pagination).toHaveProperty('totalItems');
    });

    it('debería tener la estructura correcta para una respuesta con error', () => {
      const response: ListCodesResponse = {
        success: false,
        error: 'Error al listar códigos'
      };

      expect(response).toHaveProperty('success', false);
      expect(response).toHaveProperty('error');
      expect(response.data).toBeUndefined();
    });
  });

  describe('StatisticsResponse', () => {
    it('debería tener la estructura correcta para una respuesta exitosa', () => {
      const response: StatisticsResponse = {
        success: true,
        data: {
          total: 100,
          used: 50,
          expired: 10,
          active: 40
        }
      };

      expect(response).toHaveProperty('success', true);
      expect(response.data).toBeDefined();
      expect(response.data).toHaveProperty('total');
      expect(response.data).toHaveProperty('used');
      expect(response.data).toHaveProperty('expired');
      expect(response.data).toHaveProperty('active');
    });

    it('debería tener la estructura correcta para una respuesta con error', () => {
      const response: StatisticsResponse = {
        success: false,
        error: 'Error al obtener estadísticas'
      };

      expect(response).toHaveProperty('success', false);
      expect(response).toHaveProperty('error');
      expect(response.data).toBeUndefined();
    });
  });

  describe('ExportResponse', () => {
    it('debería tener la estructura correcta para una respuesta exitosa', () => {
      const response: ExportResponse = {
        success: true,
        data: {
          url: 'https://example.com/export.csv',
          filename: 'export.csv'
        }
      };

      expect(response).toHaveProperty('success', true);
      expect(response.data).toBeDefined();
      expect(response.data).toHaveProperty('url');
      expect(response.data).toHaveProperty('filename');
    });

    it('debería tener la estructura correcta para una respuesta con error', () => {
      const response: ExportResponse = {
        success: false,
        error: 'Error al exportar datos'
      };

      expect(response).toHaveProperty('success', false);
      expect(response).toHaveProperty('error');
      expect(response.data).toBeUndefined();
    });
  });

  describe('ExportOptions', () => {
    it('debería tener la estructura correcta', () => {
      const options: ExportOptions = {
        format: 'csv',
        dateRange: 'month',
        includeUsed: true,
        includeExpired: false,
        prizeId: 1
      };

      expect(options).toHaveProperty('format');
      expect(options).toHaveProperty('dateRange');
      expect(options).toHaveProperty('includeUsed');
      expect(options).toHaveProperty('includeExpired');
      expect(options).toHaveProperty('prizeId');
    });

    it('debería permitir valores opcionales', () => {
      const options: ExportOptions = {
        format: 'excel',
        dateRange: 'all',
        includeUsed: true,
        includeExpired: true
      };

      expect(options).toHaveProperty('format');
      expect(options).toHaveProperty('dateRange');
      expect(options).toHaveProperty('includeUsed');
      expect(options).toHaveProperty('includeExpired');
      expect(options.prizeId).toBeUndefined();
    });
  });
}); 