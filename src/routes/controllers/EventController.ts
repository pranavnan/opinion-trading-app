import { Request, Response } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, request, response } from 'inversify-express-utils';
import { TYPES } from '../../config/types';
import { IEventService } from '../../application/services/interfaces/IEventService';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

@controller('/api/events')
export class EventController {
  constructor(
    @inject(TYPES.EventService) private eventService: IEventService
  ) {}

  @httpGet('/')
  public async getAllEvents(@request() req: Request, @response() res: Response) {
    try {
      const events = await this.eventService.getAllEvents();
      return res.status(200).json(events);
    } catch {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @httpGet('/:id')
  public async getEventById(@request() req: Request, @response() res: Response) {
    try {
      const event = await this.eventService.getEventById(req.params.id);
      
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      return res.status(200).json(event);
    } catch {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @httpGet('/category/:category')
  public async getEventsByCategory(@request() req: Request, @response() res: Response) {
    try {
      const events = await this.eventService.getEventsByCategory(req.params.category);
      return res.status(200).json(events);
    } catch {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @httpPost('/', authMiddleware, adminMiddleware)
  public async createEvent(@request() req: Request, @response() res: Response) {
    try {
      const eventData = req.body;
      
      if (!eventData.title || !eventData.description || !eventData.category || !eventData.startTime || !eventData.endTime || !eventData.options) {
        return res.status(400).json({ message: 'Missing required event fields' });
      }
      
      if (!Array.isArray(eventData.options) || eventData.options.length === 0) {
        return res.status(400).json({ message: 'Event must have at least one option' });
      }
      
      const newEvent = await this.eventService.createEvent(eventData);
      return res.status(201).json(newEvent);
    } catch {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @httpPut('/:id', authMiddleware, adminMiddleware)
  public async updateEvent(@request() req: Request, @response() res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedEvent = await this.eventService.updateEvent(id, updates);
      
      if (!updatedEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      return res.status(200).json(updatedEvent);
    } catch {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @httpPut('/:id/settle', authMiddleware, adminMiddleware)
  public async settleEvent(@request() req: Request, @response() res: Response) {
    try {
      const { id } = req.params;
      const { winningOptionId } = req.body;
      
      if (!winningOptionId) {
        return res.status(400).json({ message: 'Winning option ID is required' });
      }
      
      const settledEvent = await this.eventService.settleEvent(id, winningOptionId);
      
      if (!settledEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      return res.status(200).json(settledEvent);
    } catch {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @httpDelete('/:id', authMiddleware, adminMiddleware)
  public async deleteEvent(@request() req: Request, @response() res: Response) {
    try {
      const { id } = req.params;
      
      const result = await this.eventService.deleteEvent(id);
      
      if (!result) {
        return res.status(404).json({ message: 'Event not found or could not be deleted' });
      }
      
      return res.status(200).json({ message: 'Event deleted successfully' });
    } catch {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 