import { ReactElement, ReactNode } from 'react';

export interface Prize {
  id: number;
  name: string;
  description: string;
  color: string;
  textColor?: string;
  probability?: number;
  isSpecial?: boolean;
  icon: ReactNode;
}

export interface PrizeWithCode {
  id: string;
  name: string;
  code: string;
  claimed: boolean;
  expiresAt: number;
}

export interface WheelConfig {
  prizes: PrizeWithCode[];
  spinDuration: number;
  spinRevolutions: number;
}

export interface WheelState {
  isSpinning: boolean;
  selectedPrize: PrizeWithCode | null;
  spinAngle: number;
}

export interface WheelProps {
  config?: WheelConfig;
  onPrizeSelected?: (prize: PrizeWithCode) => void;
  onSpinComplete?: () => void;
}

export interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  scalar?: number;
}

export type { Prize, PrizeWithCode, WheelProps, ConfettiOptions };
