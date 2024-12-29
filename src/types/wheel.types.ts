import { ReactElement } from 'react';

export interface Prize {
  id: number;
  name: string;
  description: string;
  color: string;
  textColor?: string;
  probability?: number;
  isSpecial?: boolean;
  icon: React.ReactNode;
}

export interface PrizeWithCode extends Prize {
  code: string;
  timestamp: number;
  claimed: boolean;
  expiresAt: number;
}

export interface WheelProps {
  initialRotation?: number;
  spinDuration?: number;
  minSpins?: number;
  maxSpins?: number;
  onPrizeWon?: (prize: PrizeWithCode) => void;
}

export interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  scalar?: number;
}
