import mongoose, { Schema } from 'mongoose';
import { Trade } from '../../../models/Trade';

const TradeSchema = new Schema<Trade>({
  userId: { type: String, required: true },
  eventId: { type: String, required: true },
  optionId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'executed', 'settled', 'cancelled'], 
    default: 'pending' 
  },
  outcome: { 
    type: String, 
    enum: ['win', 'loss'], 
    default: null 
  },
  settlementAmount: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
TradeSchema.index({ userId: 1 });
TradeSchema.index({ eventId: 1 });
TradeSchema.index({ status: 1 });

export const TradeModel = mongoose.model<Trade>('Trade', TradeSchema); 