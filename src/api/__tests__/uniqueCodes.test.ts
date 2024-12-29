import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { uniqueCodesApi } from '../uniqueCodes';

vi.mock('axios');

describe('uniqueCodesApi', () => {
  const mockCode = {
    code: 'ABC12345',
    prizeId: 1,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    isUsed: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateCode', () => {
    it('should generate a code successfully', async () => {
      (axios.post as any).mockResolvedValue({ data: mockCode });

      const result = await uniqueCodesApi.generateCode(1, 'ABC12345');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCode);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/codes/generate'),
        { prizeId: 1, code: 'ABC12345' }
      );
    });

    it('should handle axios error', async () => {
      const error = {
        response: {
          data: {
            message: 'Error al generar el código',
          },
        },
      };
      (axios.post as any).mockRejectedValue(error);

      const result = await uniqueCodesApi.generateCode(1, 'ABC12345');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error al generar el código');
    });

    it('should handle unexpected error', async () => {
      (axios.post as any).mockRejectedValue(new Error());

      const result = await uniqueCodesApi.generateCode(1, 'ABC12345');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error inesperado al generar el código');
    });
  });

  describe('validateCode', () => {
    it('should validate a code successfully', async () => {
      (axios.get as any).mockResolvedValue({
        data: { isValid: true, code: mockCode },
      });

      const result = await uniqueCodesApi.validateCode('ABC12345');

      expect(result.success).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.code).toEqual(mockCode);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/codes/ABC12345/validate')
      );
    });

    it('should handle axios error', async () => {
      const error = {
        response: {
          data: {
            message: 'Error al validar el código',
          },
        },
      };
      (axios.get as any).mockRejectedValue(error);

      const result = await uniqueCodesApi.validateCode('ABC12345');

      expect(result.success).toBe(false);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Error al validar el código');
    });

    it('should handle unexpected error', async () => {
      (axios.get as any).mockRejectedValue(new Error());

      const result = await uniqueCodesApi.validateCode('ABC12345');

      expect(result.success).toBe(false);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Error inesperado al validar el código');
    });
  });

  describe('useCode', () => {
    it('should use a code successfully', async () => {
      const usedCode = { ...mockCode, isUsed: true };
      (axios.post as any).mockResolvedValue({ data: usedCode });

      const result = await uniqueCodesApi.useCode('ABC12345', 'user123');

      expect(result.success).toBe(true);
      expect(result.code).toEqual(usedCode);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/codes/ABC12345/use'),
        { userId: 'user123' }
      );
    });

    it('should handle axios error', async () => {
      const error = {
        response: {
          data: {
            message: 'Error al usar el código',
          },
        },
      };
      (axios.post as any).mockRejectedValue(error);

      const result = await uniqueCodesApi.useCode('ABC12345', 'user123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error al usar el código');
    });

    it('should handle unexpected error', async () => {
      (axios.post as any).mockRejectedValue(new Error());

      const result = await uniqueCodesApi.useCode('ABC12345', 'user123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error inesperado al usar el código');
    });
  });
});
