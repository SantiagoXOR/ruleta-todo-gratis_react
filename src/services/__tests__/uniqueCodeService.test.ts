import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uniqueCodeService } from '../uniqueCodeService';

describe('uniqueCodeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  describe('exportCodes', () => {
    it('maneja la exportación exitosa', async () => {
      const mockResponse = {
        success: true,
        data: {
          url: 'http://example.com/export.csv',
          filename: 'export.csv'
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const options = {
        format: 'csv' as const,
        dateRange: 'all' as const,
        includeUsed: true,
        includeExpired: false
      };

      const result = await uniqueCodeService.exportCodes(options);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('/api/codes/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });
    });

    it('maneja errores de la API', async () => {
      const mockError = {
        success: false,
        error: 'Error al exportar códigos'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(mockError)
      });

      const options = {
        format: 'csv' as const,
        dateRange: 'all' as const,
        includeUsed: true,
        includeExpired: false
      };

      const result = await uniqueCodeService.exportCodes(options);

      expect(result).toEqual({
        success: false,
        error: 'Error al exportar códigos'
      });
    });

    it('maneja errores de red', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const options = {
        format: 'csv' as const,
        dateRange: 'all' as const,
        includeUsed: true,
        includeExpired: false
      };

      const result = await uniqueCodeService.exportCodes(options);

      expect(result).toEqual({
        success: false,
        error: 'Error al exportar códigos'
      });
    });
  });
});
