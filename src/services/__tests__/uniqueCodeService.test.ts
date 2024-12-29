import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uniqueCodeService } from '../uniqueCodeService';
import { uniqueCodesApi } from '../../api/uniqueCodes';
import { storage } from '../storage';

// Mock the API
vi.mock('../../api/uniqueCodes', () => ({
  uniqueCodesApi: {
    generateCode: vi.fn(),
    validateCode: vi.fn(),
    useCode: vi.fn(),
  },
}));

// Mock storage
vi.mock('../storage', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe('UniqueCodeService', () => {
  const mockCode = {
    code: 'ABC12345',
    prizeId: 1,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    isUsed: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (storage.get as any).mockReturnValue([]);
  });

  describe('generateUniqueCode', () => {
    it('should generate a unique code successfully', async () => {
      (uniqueCodesApi.generateCode as any).mockResolvedValue({
        success: true,
        data: mockCode,
      });

      const result = await uniqueCodeService.generateUniqueCode(1);

      expect(result).toEqual(mockCode);
      expect(storage.set).toHaveBeenCalled();
      expect(uniqueCodesApi.generateCode).toHaveBeenCalledWith(1, expect.any(String));
    });

    it('should return null when API call fails', async () => {
      (uniqueCodesApi.generateCode as any).mockResolvedValue({
        success: false,
        error: 'Error',
      });

      const result = await uniqueCodeService.generateUniqueCode(1);

      expect(result).toBeNull();
      expect(storage.set).not.toHaveBeenCalled();
    });
  });

  describe('validateCode', () => {
    it('should validate a code successfully', async () => {
      (uniqueCodesApi.validateCode as any).mockResolvedValue({
        success: true,
        isValid: true,
        code: mockCode,
      });

      const result = await uniqueCodeService.validateCode('ABC12345');

      expect(result).toBe(true);
      expect(uniqueCodesApi.validateCode).toHaveBeenCalledWith('ABC12345');
    });

    it('should return false when code is invalid', async () => {
      (uniqueCodesApi.validateCode as any).mockResolvedValue({
        success: true,
        isValid: false,
      });

      const result = await uniqueCodeService.validateCode('INVALID');

      expect(result).toBe(false);
    });
  });

  describe('useCode', () => {
    it('should use a code successfully', async () => {
      (uniqueCodesApi.useCode as any).mockResolvedValue({
        success: true,
        code: { ...mockCode, isUsed: true },
      });

      const result = await uniqueCodeService.useCode('ABC12345', 'user123');

      expect(result).toBe(true);
      expect(uniqueCodesApi.useCode).toHaveBeenCalledWith('ABC12345', 'user123');
      expect(storage.set).toHaveBeenCalled();
    });

    it('should return false when using code fails', async () => {
      (uniqueCodesApi.useCode as any).mockResolvedValue({
        success: false,
        error: 'Error',
      });

      const result = await uniqueCodeService.useCode('ABC12345', 'user123');

      expect(result).toBe(false);
      expect(storage.set).not.toHaveBeenCalled();
    });
  });

  describe('getCodeDetails', () => {
    it('should return code details when code exists', () => {
      (storage.get as any).mockReturnValue([mockCode]);

      const result = uniqueCodeService.getCodeDetails('ABC12345');

      expect(result).toEqual(mockCode);
    });

    it('should return null when code does not exist', () => {
      const result = uniqueCodeService.getCodeDetails('NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('isCodeExpired', () => {
    it('should return true for expired codes', () => {
      const expiredCode = {
        ...mockCode,
        expiresAt: Date.now() - 1000,
      };

      const result = uniqueCodeService.isCodeExpired(expiredCode);

      expect(result).toBe(true);
    });

    it('should return false for valid codes', () => {
      const validCode = {
        ...mockCode,
        expiresAt: Date.now() + 1000,
      };

      const result = uniqueCodeService.isCodeExpired(validCode);

      expect(result).toBe(false);
    });
  });

  describe('isCodeUsed', () => {
    it('should return true for used codes', () => {
      const usedCode = {
        ...mockCode,
        isUsed: true,
      };

      const result = uniqueCodeService.isCodeUsed(usedCode);

      expect(result).toBe(true);
    });

    it('should return false for unused codes', () => {
      const unusedCode = {
        ...mockCode,
        isUsed: false,
      };

      const result = uniqueCodeService.isCodeUsed(unusedCode);

      expect(result).toBe(false);
    });
  });
});
