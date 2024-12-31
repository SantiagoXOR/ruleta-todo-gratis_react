import { ReactElement } from 'react';

export interface Prize {
  id: string;
  name: string;
  description: string;
  icon: ReactElement;
  color: string;
}

export interface PrizeWithCode extends Prize {
  code: string;
  claimed: boolean;
  expiresAt: number;
}

export interface ClaimResponse {
  success: boolean;
  message?: string;
}

export interface PrizeService {
  getPrizeByCode(code: string): Promise<PrizeWithCode | null>;
  claimPrize(code: string): Promise<boolean>;
  getAvailablePrizes(): Promise<Prize[]>;
  getClaimedPrizes(): Promise<PrizeWithCode[]>;
  getExpiredPrizes(): Promise<PrizeWithCode[]>;
  generateCode(prizeId: string): Promise<string>;
  validateCode(code: string): Promise<boolean>;
  clearCache(): Promise<void>;
} 