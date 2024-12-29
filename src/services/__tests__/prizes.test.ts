import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prizeService } from '../prizes';
import { storage } from '../storage';

// Mock del servicio de almacenamiento
vi.mock('../storage', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe('PrizeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Resetear el almacenamiento antes de cada prueba
    (storage.get as any).mockReturnValue([]);
  });

  describe('savePrize', () => {
    it('debe guardar un nuevo premio correctamente', () => {
      const newPrize = {
        id: 1,
        name: 'Premio Test',
        code: 'TEST123'
      };

      prizeService.savePrize(newPrize);

      expect(storage.set).toHaveBeenCalledWith(
        'prizes',
        [expect.objectContaining({
          ...newPrize,
          claimed: false,
          timestamp: expect.any(Number)
        })],
        24 * 60 * 60 * 1000
      );
    });
  });

  describe('getPrizeByCode', () => {
    it('debe retornar null si no existe el premio', () => {
      const result = prizeService.getPrizeByCode('NOEXISTE');
      expect(result).toBeNull();
    });

    it('debe encontrar un premio existente por código', () => {
      const existingPrize = {
        id: 1,
        name: 'Premio Test',
        code: 'TEST123',
        timestamp: Date.now(),
        claimed: false
      };

      (storage.get as any).mockReturnValue([existingPrize]);

      const result = prizeService.getPrizeByCode('TEST123');
      expect(result).toEqual(existingPrize);
    });
  });

  describe('isPrizeValid', () => {
    it('debe retornar false para un premio que no existe', () => {
      expect(prizeService.isPrizeValid('NOEXISTE')).toBe(false);
    });

    it('debe retornar false para un premio reclamado', () => {
      const claimedPrize = {
        id: 1,
        name: 'Premio Test',
        code: 'TEST123',
        timestamp: Date.now(),
        claimed: true
      };

      (storage.get as any).mockReturnValue([claimedPrize]);

      expect(prizeService.isPrizeValid('TEST123')).toBe(false);
    });

    it('debe retornar false para un premio expirado', () => {
      const expiredPrize = {
        id: 1,
        name: 'Premio Test',
        code: 'TEST123',
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 horas atrás
        claimed: false
      };

      (storage.get as any).mockReturnValue([expiredPrize]);

      expect(prizeService.isPrizeValid('TEST123')).toBe(false);
    });

    it('debe retornar true para un premio válido', () => {
      const validPrize = {
        id: 1,
        name: 'Premio Test',
        code: 'TEST123',
        timestamp: Date.now(),
        claimed: false
      };

      (storage.get as any).mockReturnValue([validPrize]);

      expect(prizeService.isPrizeValid('TEST123')).toBe(true);
    });
  });

  describe('markPrizeAsClaimed', () => {
    it('debe retornar false si el premio no existe', () => {
      expect(prizeService.markPrizeAsClaimed('NOEXISTE')).toBe(false);
    });

    it('debe marcar un premio como reclamado correctamente', () => {
      const prize = {
        id: 1,
        name: 'Premio Test',
        code: 'TEST123',
        timestamp: Date.now(),
        claimed: false
      };

      (storage.get as any).mockReturnValue([prize]);

      expect(prizeService.markPrizeAsClaimed('TEST123')).toBe(true);
      expect(storage.set).toHaveBeenCalledWith(
        'prizes',
        [expect.objectContaining({ ...prize, claimed: true })],
        24 * 60 * 60 * 1000
      );
    });
  });

  describe('getTimeToExpiry', () => {
    it('debe retornar null para un premio que no existe', () => {
      expect(prizeService.getTimeToExpiry('NOEXISTE')).toBeNull();
    });

    it('debe retornar el tiempo restante correcto', () => {
      const now = Date.now();
      const prize = {
        id: 1,
        name: 'Premio Test',
        code: 'TEST123',
        timestamp: now - (12 * 60 * 60 * 1000), // 12 horas atrás
        claimed: false
      };

      (storage.get as any).mockReturnValue([prize]);

      const timeLeft = prizeService.getTimeToExpiry('TEST123');
      expect(timeLeft).toBeGreaterThan(0);
      expect(timeLeft).toBeLessThanOrEqual(12 * 60 * 60 * 1000);
    });
  });
}); 