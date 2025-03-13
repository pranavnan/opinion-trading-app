import { Trade } from '../models/Trade';

export interface ITradeRepository {
  findAll(): Promise<Trade[]>;
  findById(id: string): Promise<Trade | null>;
  findByUserId(userId: string): Promise<Trade[]>;
  findByEventId(eventId: string): Promise<Trade[]>;
  create(trade: Omit<Trade, '_id'>): Promise<Trade>;
  update(id: string, updates: Partial<Trade>): Promise<Trade | null>;
  updateStatus(id: string, status: Trade['status'], outcome?: Trade['outcome'], settlementAmount?: number): Promise<Trade | null>;
  delete(id: string): Promise<boolean>;
} 