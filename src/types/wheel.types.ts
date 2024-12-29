import { ReactElement } from 'react';

export interface Prize {
  name: string;
  description: string;
  icon: ReactElement;
  color: string;
}

export interface ConfettiOptions {
  origin?: { y: number };
  zIndex?: number;
  colors?: string[];
  spread?: number;
  startVelocity?: number;
  particleCount?: number;
  decay?: number;
  scalar?: number;
}

export interface WheelProps {
  initialRotation?: number;
  spinDuration?: number;
  minSpins?: number;
  maxSpins?: number;
}
