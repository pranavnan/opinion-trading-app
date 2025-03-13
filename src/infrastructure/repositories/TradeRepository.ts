import { injectable } from 'inversify';

import { Trade } from '../../models/Trade';
import { TradeModel } from '../database/schemas/TradeSchema';
import { ITradeRepository } from '@/repositories/ITradeRepository';

@injectable()
export class TradeRepository implements ITradeRepository {
  async findAll(): Promise<Trade[]> {
    return TradeModel.find().lean();
  }

  async findById(id: string): Promise<Trade | null> {
    return TradeModel.findById(id).lean();
  }

  async findByUserId(userId: string): Promise<Trade[]> {
    return TradeModel.find({ userId }).lean();
  }

  async findByEventId(eventId: string): Promise<Trade[]> {
    return TradeModel.find({ eventId }).lean();
  }

  async create(trade: Omit<Trade, '_id'>): Promise<Trade> {
    const newTrade = new TradeModel(trade);
    return (await newTrade.save()).toObject();
  }

  async update(id: string, updates: Partial<Trade>): Promise<Trade | null> {
    return TradeModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean();
  }

  async updateStatus(
    id: string, 
    status: Trade['status'], 
    outcome?: Trade['outcome'],
    settlementAmount?: number
  ): Promise<Trade | null> {
    const updates: Partial<Trade> = { 
      status, 
      updatedAt: new Date() 
    };
    
    if (outcome) {
      updates.outcome = outcome;
    }
    
    if (settlementAmount !== undefined) {
      updates.settlementAmount = settlementAmount;
    }
    
    return TradeModel.findByIdAndUpdate(id, updates, { new: true }).lean();
  }

  async delete(id: string): Promise<boolean> {
    const result = await TradeModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
} 