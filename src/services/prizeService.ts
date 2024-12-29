import { Prize } from '../types/prizes.types';
import { prizesApi } from '../api/prizes';
import { storage } from './storage';
import { uniqueCodeService } from './uniqueCodeService';

const CACHE_KEY = 'prizes_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const prizeService = {
  async getPrizeByCode(code: string): Promise<Prize | null> {
    const response = await prizesApi.getPrizeByCode(code);
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  },

  async claimPrize(code: string): Promise<boolean> {
    const response = await prizesApi.claimPrize(code);
    if (response.success) {
      await this.clearCache();
      return true;
    }
    return false;
  },

  async getAvailablePrizes(): Promise<Prize[]> {
    const cached = this.getCachedPrizes();
    if (cached) {
      return cached;
    }

    try {
      const prizes = await prizesApi.getAvailablePrizes();
      this.cachePrizes(prizes);
      return prizes;
    } catch (error) {
      console.error('Error fetching available prizes:', error);
      return [];
    }
  },

  async getClaimedPrizes(): Promise<Prize[]> {
    try {
      return await prizesApi.getClaimedPrizes();
    } catch (error) {
      console.error('Error fetching claimed prizes:', error);
      return [];
    }
  },

  async savePrize(prize: Omit<Prize, 'timestamp' | 'claimed' | 'code'>): Promise<Prize | null> {
    try {
      const uniqueCode = await uniqueCodeService.generateUniqueCode(prize.id);
      if (!uniqueCode) return null;

      const newPrize: Prize = {
        ...prize,
        code: uniqueCode.code,
        timestamp: Date.now(),
        claimed: false
      };

      const prizes = this.getPrizes();
      prizes.push(newPrize);
      storage.set(CACHE_KEY, prizes, CACHE_DURATION);
      return newPrize;
    } catch (error) {
      console.error('Error saving prize:', error);
      return null;
    }
  },

  async markPrizeAsClaimed(code: string, userId: string): Promise<boolean> {
    try {
      const isCodeValid = await uniqueCodeService.validateCode(code);
      if (!isCodeValid) return false;

      const codeUsed = await uniqueCodeService.useCode(code, userId);
      if (!codeUsed) return false;

      const prizes = this.getPrizes();
      const prizeIndex = prizes.findIndex(prize => prize.code === code);
      
      if (prizeIndex === -1) return false;
      
      prizes[prizeIndex].claimed = true;
      storage.set(CACHE_KEY, prizes, CACHE_DURATION);
      return true;
    } catch (error) {
      console.error('Error claiming prize:', error);
      return false;
    }
  },

  async isPrizeValid(code: string): Promise<boolean> {
    try {
      const isCodeValid = await uniqueCodeService.validateCode(code);
      if (!isCodeValid) return false;

      const prize = this.getPrizeByCode(code);
      if (!prize) return false;

      const codeDetails = uniqueCodeService.getCodeDetails(code);
      if (!codeDetails) return false;

      if (uniqueCodeService.isCodeExpired(codeDetails)) return false;
      if (uniqueCodeService.isCodeUsed(codeDetails)) return false;

      return true;
    } catch (error) {
      console.error('Error validating prize:', error);
      return false;
    }
  },

  private getCachedPrizes(): Prize[] | null {
    const cached = storage.get<{ prizes: Prize[], timestamp: number }>(CACHE_KEY);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
    if (isExpired) {
      storage.remove(CACHE_KEY);
      return null;
    }

    return cached.prizes;
  },

  private cachePrizes(prizes: Prize[]): void {
    storage.set(CACHE_KEY, {
      prizes,
      timestamp: Date.now()
    });
  },

  async clearCache(): Promise<void> {
    storage.remove(CACHE_KEY);
  }
};
