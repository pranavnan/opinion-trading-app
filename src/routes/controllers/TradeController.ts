import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, httpPut, request, response } from 'inversify-express-utils';
import { TYPES } from '../../config/types';
import { ITradeService } from '../../application/services/interfaces/ITradeService';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

@controller('/api/trades')
export class TradeController {
  constructor(
    @inject(TYPES.TradeService) private tradeService: ITradeService
  ) {}

  @httpGet('/', authMiddleware, adminMiddleware)
  public async getAllTrades(@request() req: Request, @response() res: Response) {
    try {
      const trades = await this.tradeService.getAllTrades();
      return res.status(200).json(trades);
    } catch {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @httpGet('/:id', authMiddleware)
  public async getTradeById(@request() req: Request, @response() res: Response) {
    try {
      const trade = await this.tradeService.getTradeById(req.params.id);
      
      if (!trade) {
        return res.status(404).json({ message: 'Trade not found' });
      }
      
      if (req.user.role !== 'admin' && trade.userId !== req.user._id) {
        return res.status(403).json({ message: 'Forbidden: Not authorized to view this trade' });
      }
      
      return res.status(200).json(trade);
    } catch {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @httpGet('/user/:userId', authMiddleware)
  public async getTradesByUserId(@request() req: Request, @response() res: Response) {
    try {
      const userId = req.params.userId;
      
      if (req.user.role !== 'admin' && userId !== req.user._id) {
        return res.status(403).json({ message: 'Forbidden: Not authorized to view these trades' });
      }
      
      const trades = await this.tradeService.getTradesByUserId(userId);
      return res.status(200).json(trades);
    } catch {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @httpGet('/event/:eventId', authMiddleware)
  public async getTradesByEventId(@request() req: Request, @response() res: Response) {
    try {
      const eventId = req.params.eventId;
      
      if (req.user.role !== 'admin') {
        const trades = await this.tradeService.getTradesByEventId(eventId);
        const summary = trades.reduce((acc, trade) => {
          acc.totalTrades++;
          acc.totalAmount += trade.amount;
          
          const optionId = trade.optionId;
          if (!acc.options[optionId]) {
            acc.options[optionId] = {
              count: 0,
              amount: 0
            };
          }
          
          acc.options[optionId].count++;
          acc.options[optionId].amount += trade.amount;
          
          return acc;
        }, { totalTrades: 0, totalAmount: 0, options: {} as Record<string, { count: number, amount: number }> });
        
        return res.status(200).json(summary);
      }
      
      const trades = await this.tradeService.getTradesByEventId(eventId);
      return res.status(200).json(trades);
    } catch {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @httpPost('/', authMiddleware)
  public async createTrade(@request() req: Request, @response() res: Response) {
    try {
      const { eventId, optionId, amount } = req.body;
      
      if (!eventId || !optionId || !amount) {
        return res.status(400).json({ message: 'Please provide eventId, optionId, and amount' });
      }
      
      if (amount <= 0) {
        return res.status(400).json({ message: 'Amount must be greater than 0' });
      }
      
      const userId = req.user._id;
      
      const trade = await this.tradeService.createTrade({
        userId,
        eventId,
        optionId,
        amount
      });
      
      return res.status(201).json(trade);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @httpPut('/:id/cancel', authMiddleware)
  public async cancelTrade(@request() req: Request, @response() res: Response) {
    try {
      const tradeId = req.params.id;
      
      const trade = await this.tradeService.getTradeById(tradeId);
      
      if (!trade) {
        return res.status(404).json({ message: 'Trade not found' });
      }
      
      if (req.user.role !== 'admin' && trade.userId !== req.user._id) {
        return res.status(403).json({ message: 'Forbidden: Not authorized to cancel this trade' });
      }
      
      const updatedTrade = await this.tradeService.cancelTrade(tradeId);
      
      if (!updatedTrade) {
        return res.status(400).json({ message: 'Failed to cancel trade' });
      }
      
      return res.status(200).json(updatedTrade);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @httpPut('/settle/:eventId', authMiddleware, adminMiddleware)
  public async settleTrades(@request() req: Request, @response() res: Response) {
    try {
      const { eventId } = req.params;
      const { winningOptionId } = req.body;
      
      if (!winningOptionId) {
        return res.status(400).json({ message: 'Please provide winningOptionId' });
      }
      
      const settledTrades = await this.tradeService.settleTrades(eventId, winningOptionId);
      
      return res.status(200).json({
        message: `Successfully settled ${settledTrades.length} trades`,
        settledTradesCount: settledTrades.length
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 