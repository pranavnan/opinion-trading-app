import { Trade } from '../../../models/Trade';

export interface ITradeService {
  getAllTrades(): Promise<Trade[]>;
  getTradeById(id: string): Promise<Trade | null>;
  getTradesByUserId(userId: string): Promise<Trade[]>;
  getTradesByEventId(eventId: string): Promise<Trade[]>;
  createTrade(tradeData: Omit<Trade, '_id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Trade>;
  cancelTrade(id: string): Promise<Trade | null>;
  settleTrades(eventId: string, winningOptionId: string): Promise<Trade[]>;
} 