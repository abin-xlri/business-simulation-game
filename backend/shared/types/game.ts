export interface GameState {
  id: string;
  status: 'WAITING' | 'ACTIVE' | 'PAUSED' | 'FINISHED';
  currentRound: number;
  maxRounds: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketData {
  id: string;
  name: string;
  demand: number;
  supply: number;
  price: number;
  volatility: number;
}

export interface GameEvent {
  id: string;
  type: 'MARKET_CHANGE' | 'CRISIS' | 'OPPORTUNITY' | 'SYSTEM';
  title: string;
  description: string;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  affectedMarkets?: string[];
  duration?: number;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 