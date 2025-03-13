import { injectable, inject } from 'inversify';
import { TYPES } from '../../config/types';
import { ITradeService } from './interfaces/ITradeService';
import { Trade } from '../../models/Trade';
import { IWebSocketService } from '../../infrastructure/services/interfaces/IWebSocketService';
import { container } from '../../config/inversify.config';
import { ITradeRepository } from '@/repositories/ITradeRepository';
import { IUserRepository } from '@/repositories/IUserRepository';
import { IEventRepository } from '@/repositories/IEventRepository';

@injectable()
export class TradeService implements ITradeService {
  constructor(
    @inject(TYPES.TradeRepository) private tradeRepository: ITradeRepository,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.EventRepository) private eventRepository: IEventRepository,
    @inject(TYPES.WebSocketService) private webSocketService: IWebSocketService
  ) {}

  private getWebSocketService(): IWebSocketService {
    return container.get<IWebSocketService>(TYPES.WebSocketService);
  }

  async getAllTrades(): Promise<Trade[]> {
    return this.tradeRepository.findAll();
  }

  async getTradeById(id: string): Promise<Trade | null> {
    return this.tradeRepository.findById(id);
  }

  async getTradesByUserId(userId: string): Promise<Trade[]> {
    return this.tradeRepository.findByUserId(userId);
  }

  async getTradesByEventId(eventId: string): Promise<Trade[]> {
    return this.tradeRepository.findByEventId(eventId);
  }

  async createTrade(tradeData: Omit<Trade, '_id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Trade> {
    const user = await this.userRepository.findById(tradeData.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.balance < tradeData.amount) {
      throw new Error('Insufficient balance');
    }

    const event = await this.eventRepository.findById(tradeData.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.status !== 'live') {
      throw new Error('Event is not live for trading');
    }

    const option = event.options.find(opt => opt._id?.toString() === tradeData.optionId);
    if (!option) {
      throw new Error('Option not found');
    }

    const newTrade: Omit<Trade, '_id'> = {
      ...tradeData,
      status: 'executed',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const trade = await this.tradeRepository.create(newTrade);

    if (user._id) {
      await this.userRepository.updateBalance(user._id, -tradeData.amount);
    }

    try {
      const wsService = this.getWebSocketService();
      if (user._id) {
        wsService.broadcastToRoom(`user-${user._id}`, 'trade_created', trade);
      }
      if (event._id) {
        wsService.broadcastToRoom(`event-${event._id}`, 'trade_created', {
          tradeId: trade._id,
          eventId: event._id,
          optionId: option._id,
          amount: trade.amount
        });
      }
    } catch {
      // Silently catch errors from websocket broadcasts
    }

    return trade;
  }

  async cancelTrade(id: string): Promise<Trade | null> {
    const trade = await this.tradeRepository.findById(id);
    
    if (!trade) {
      throw new Error('Trade not found');
    }
    
    if (trade.status !== 'executed') {
      throw new Error('Only executed trades can be cancelled');
    }
    
    await this.userRepository.updateBalance(trade.userId, trade.amount);
    
    const updatedTrade = await this.tradeRepository.updateStatus(id, 'cancelled');
    
    if (updatedTrade) {
      try {
        const wsService = this.getWebSocketService();
        wsService.broadcastToRoom(`user-${trade.userId}`, 'trade_cancelled', updatedTrade);
        wsService.broadcastToRoom(`event-${trade.eventId}`, 'trade_cancelled', {
          tradeId: updatedTrade._id,
          eventId: updatedTrade.eventId
        });
      } catch {
        // Silently catch errors from websocket broadcasts
      }
    }
    
    return updatedTrade;
  }

  async settleTrades(eventId: string, winningOptionId: string): Promise<Trade[]> {
    const event = await this.eventRepository.findById(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    if (event.status !== 'live' && event.status !== 'closed') {
      throw new Error('Event is not available for settlement');
    }
    
    const option = event.options.find(opt => opt._id?.toString() === winningOptionId);
    if (!option) {
      throw new Error('Option not found');
    }
    
    const trades = await this.tradeRepository.findByEventId(eventId);
    const settledTrades: Trade[] = [];
    
    for (const trade of trades) {
      if (trade.status !== 'executed') {
        continue;
      }
      
      const isWinningTrade = trade.optionId === winningOptionId;
      let payout = 0;
      
      if (isWinningTrade) {
        const winningOdds = 1 / (option.odds || 0.5);
        payout = trade.amount * winningOdds;
        await this.userRepository.updateBalance(trade.userId, payout);
      }
      
      const outcome = isWinningTrade ? 'win' : 'loss';
      const settlementAmount = isWinningTrade ? payout : 0;
      
      const settledTrade = await this.tradeRepository.updateStatus(
        trade._id || '',
        'settled',
        outcome,
        settlementAmount
      );
      
      if (settledTrade) {
        settledTrades.push(settledTrade);
        
        try {
          const wsService = this.getWebSocketService();
          wsService.broadcastToRoom(`user-${trade.userId}`, 'trade_settled', {
            ...settledTrade,
            won: isWinningTrade,
            payout: settlementAmount
          });
        } catch {
          // Silently catch errors from websocket broadcasts
        }
      }
    }
    
    await this.eventRepository.update(eventId, {
      status: 'settled',
    });
    
    try {
      const wsService = this.getWebSocketService();
      wsService.broadcastToRoom(`event-${eventId}`, 'event_settled', {
        eventId,
        winningOptionId,
        settledAt: new Date()
      });
    } catch {
      // Silently catch errors from websocket broadcasts
    }
    
    return settledTrades;
  }
} 