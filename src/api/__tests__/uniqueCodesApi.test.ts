import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uniqueCodesApi } from '../uniqueCodesApi';

// Mock de fetch global
vi.stubGlobal('fetch', vi.fn());

describe('uniqueCodesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateCode', () => {
    it('debería generar un código exitosamente', async () => {
      const mockData = {
        code: 'TEST123',
        prizeId: 1,
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        isUsed: false
      };

      const mockResponse = {
        success: true,
        data: mockData
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockData })
      });

      const result = await uniqueCodesApi.generateCode(1);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('/api/codes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prizeId: 1 }),
      });
    });

    it('debería manejar errores de la API', async () => {
      const mockError = 'Error al generar código';

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: mockError })
      });

      const result = await uniqueCodesApi.generateCode(1);

      expect(result).toEqual({
        success: false,
        error: mockError
      });
    });

    it('debería manejar errores de red', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Error de red'));

      const result = await uniqueCodesApi.generateCode(1);

      expect(result).toEqual({
        success: false,
        error: 'Error al generar código'
      });
    });
  });

  describe('validateCode', () => {
    it('debería validar un código exitosamente', async () => {
      const mockData = {
        isValid: true,
        code: 'TEST123'
      };

      const mockResponse = {
        success: true,
        data: mockData
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockData })
      });

      const result = await uniqueCodesApi.validateCode('TEST123');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('/api/codes/TEST123/validate');
    });

    it('debería manejar errores de la API', async () => {
      const mockError = 'Error al validar código';

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: mockError })
      });

      const result = await uniqueCodesApi.validateCode('TEST123');

      expect(result).toEqual({
        success: false,
        error: mockError
      });
    });

    it('debería manejar errores de red', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Error de red'));

      const result = await uniqueCodesApi.validateCode('TEST123');

      expect(result).toEqual({
        success: false,
        error: 'Error al validar código'
      });
    });
  });

  describe('useCode', () => {
    it('debería usar un código exitosamente', async () => {
      const mockData = {
        code: 'TEST123',
        userId: 'user123'
      };

      const mockResponse = {
        success: true,
        data: mockData
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockData })
      });

      const result = await uniqueCodesApi.useCode('TEST123', 'user123');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('/api/codes/TEST123/use', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 'user123' }),
      });
    });

    it('debería manejar errores de la API', async () => {
      const mockError = 'Error al usar código';

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: mockError })
      });

      const result = await uniqueCodesApi.useCode('TEST123', 'user123');

      expect(result).toEqual({
        success: false,
        error: mockError
      });
    });

    it('debería manejar errores de red', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Error de red'));

      const result = await uniqueCodesApi.useCode('TEST123', 'user123');

      expect(result).toEqual({
        success: false,
        error: 'Error al usar código'
      });
    });
  });
}); 