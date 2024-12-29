import { storage } from './storage';

export interface Prize {
  id: number;
  name: string;
  code: string;
  timestamp: number;
  claimed: boolean;
}

const PRIZES_KEY = 'prizes';
const PRIZE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

class PrizeService {
  private getPrizes(): Prize[] {
    return storage.get<Prize[]>(PRIZES_KEY) || [];
  }

  savePrize(prize: Omit<Prize, 'timestamp' | 'claimed'>): void {
    const prizes = this.getPrizes();
    const newPrize: Prize = {
      ...prize,
      timestamp: Date.now(),
      claimed: false
    };

    prizes.push(newPrize);
    storage.set(PRIZES_KEY, prizes, PRIZE_EXPIRY);
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
    storage.set(PRIZES_KEY, prizes, PRIZE_EXPIRY);
    return true;
  }

  isPrizeValid(code: string): boolean {
    const prize = this.getPrizeByCode(code);
    if (!prize) return false;

    const now = Date.now();
    const prizeAge = now - prize.timestamp;

    return !prize.claimed && prizeAge < PRIZE_EXPIRY;
  }

  getTimeToExpiry(code: string): number | null {
    const prize = this.getPrizeByCode(code);
    if (!prize) return null;

    const now = Date.now();
    const expirationTime = prize.timestamp + PRIZE_EXPIRY;
    const timeLeft = expirationTime - now;

    return timeLeft > 0 ? timeLeft : null;
  }

  getActivePrizes(): Prize[] {
    const now = Date.now();
    return this.getPrizes().filter(prize => {
      const prizeAge = now - prize.timestamp;
      return !prize.claimed && prizeAge < PRIZE_EXPIRY;
    });
  }

  getAvailablePrizes(): Prize[] {
    return this.getActivePrizes();
  }

  getClaimedPrizes(): Prize[] {
    return this.getPrizes().filter(prize => prize.claimed);
  }

  getExpiredPrizes(): Prize[] {
    const now = Date.now();
    return this.getPrizes().filter(prize => {
      const prizeAge = now - prize.timestamp;
      return !prize.claimed && prizeAge >= PRIZE_EXPIRY;
    });
  }

  clearExpiredPrizes(): void {
    const prizes = this.getPrizes();
    const now = Date.now();
    const validPrizes = prizes.filter(prize => {
      const prizeAge = now - prize.timestamp;
      return prize.claimed || prizeAge < PRIZE_EXPIRY;
    });

    storage.set(PRIZES_KEY, validPrizes, PRIZE_EXPIRY);
  }
}

export const prizeService = new PrizeService(); 