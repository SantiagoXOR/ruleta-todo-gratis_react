import { storage } from './storage';

export interface Prize {
  id: number;
  name: string;
  code: string;
  timestamp: number;
  claimed: boolean;
  expiresAt: number;
}

const PRIZES_KEY = 'prizes';
const PRIZE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

class PrizeService {
  private getPrizes(): Prize[] {
    return storage.getItem<Prize[]>(PRIZES_KEY) || [];
  }

  async savePrize(prize: Omit<Prize, 'timestamp' | 'claimed' | 'expiresAt'>): Promise<Prize> {
    const prizes = this.getPrizes();
    const newPrize: Prize = {
      ...prize,
      timestamp: Date.now(),
      claimed: false,
      expiresAt: Date.now() + PRIZE_EXPIRY
    };

    prizes.push(newPrize);
    storage.setItem(PRIZES_KEY, prizes);
    return newPrize;
  }

  getPrizeByCode(code: string): Prize | null {
    const prizes = this.getPrizes();
    return prizes.find(prize => prize.code === code) || null;
  }

  markPrizeAsClaimed(code: string): boolean {
    const prizes = this.getPrizes();
    const prizeIndex = prizes.findIndex(prize => prize.code === code);
    
    if (prizeIndex === -1) return false;
    
    prizes[prizeIndex].claimed = true;
    storage.setItem(PRIZES_KEY, prizes);
    return true;
  }

  isPrizeValid(prize: Prize): boolean {
    if (!prize) return false;

    const now = Date.now();
    return !prize.claimed && now < prize.expiresAt;
  }

  getTimeToExpiry(prize: Prize): number | null {
    if (!prize) return null;

    const now = Date.now();
    const timeLeft = prize.expiresAt - now;

    return timeLeft > 0 ? timeLeft : null;
  }

  async getActivePrizes(): Promise<Prize[]> {
    const now = Date.now();
    return this.getPrizes().filter(prize => !prize.claimed && now < prize.expiresAt);
  }

  async getAvailablePrizes(): Promise<Prize[]> {
    return this.getActivePrizes();
  }

  async getClaimedPrizes(): Promise<Prize[]> {
    return this.getPrizes().filter(prize => prize.claimed);
  }

  async getExpiredPrizes(): Promise<Prize[]> {
    const now = Date.now();
    return this.getPrizes().filter(prize => !prize.claimed && now >= prize.expiresAt);
  }

  clearExpiredPrizes(): void {
    const prizes = this.getPrizes();
    const now = Date.now();
    const validPrizes = prizes.filter(prize => prize.claimed || now < prize.expiresAt);

    storage.setItem(PRIZES_KEY, validPrizes);
  }
}

export const prizeService = new PrizeService(); 