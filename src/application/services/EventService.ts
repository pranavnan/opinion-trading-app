import { injectable, inject } from 'inversify';
import { TYPES } from '../../config/types';
import { IEventService } from './interfaces/IEventService';

import { Event } from '../../models/Event';
import { IExternalApiService } from './interfaces/IExternalApiService';
import { IWebSocketService } from '../../infrastructure/services/interfaces/IWebSocketService';
import { container } from '../../config/inversify.config';
import { IEventRepository } from '@/repositories/IEventRepository';

@injectable()
export class EventService implements IEventService {
  constructor(
    @inject(TYPES.EventRepository) private eventRepository: IEventRepository,
    @inject(TYPES.ExternalApiService) private externalApiService: IExternalApiService,
    @inject(TYPES.WebSocketService) private webSocketService: IWebSocketService
  ) {}

  private getWebSocketService(): IWebSocketService {
    return container.get<IWebSocketService>(TYPES.WebSocketService);
  }

  async getAllEvents(): Promise<Event[]> {
    return this.eventRepository.findAll();
  }

  async getEventById(id: string): Promise<Event | null> {
    return this.eventRepository.findById(id);
  }

  async getEventsByCategory(category: string): Promise<Event[]> {
    return this.eventRepository.findByCategory(category);
  }

  async createEvent(eventData: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    const event = await this.eventRepository.create({
      ...eventData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    try {
      const wsService = this.getWebSocketService();
      wsService.broadcastToAll('event_created', event);
    } catch(error) {
      // Silently catch errors from websocket broadcasts
      console.error('Error broadcasting event creation:', error);
    }
    
    return event;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
    const updatedEvent = await this.eventRepository.update(id, {
      ...updates,
      updatedAt: new Date()
    });
    
    if (updatedEvent) {
      try {
        const wsService = this.getWebSocketService();
        wsService.broadcastToAll('event_updated', updatedEvent);
      } catch {
        // Silently catch errors from websocket broadcasts
      }
    }
    
    return updatedEvent;
  }

  async settleEvent(id: string, winningOptionId: string): Promise<Event | null> {
    const event = await this.eventRepository.findById(id);
    
    if (!event) {
      return null;
    }
    
    const updatedOptions = event.options.map(option => ({
      ...option,
      result: option._id?.toString() === winningOptionId
    }));
    
    const settledEvent = await this.eventRepository.update(id, {
      status: 'settled',
      options: updatedOptions,
      updatedAt: new Date()
    });
    
    if (settledEvent) {
      try {
        const wsService = this.getWebSocketService();
        wsService.broadcastToAll('event_settled', {
          ...settledEvent,
          winningOptionId
        });
      } catch {
        // Silently catch errors from websocket broadcasts
      }
    }
    
    return settledEvent;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await this.eventRepository.delete(id);
    
    if (result) {
      try {
        const wsService = this.getWebSocketService();
        wsService.broadcastToAll('event_deleted', { id });
      } catch {
        // Silently catch errors from websocket broadcasts
      }
    }
    
    return result;
  }

  async fetchExternalEvents(): Promise<void> {
    try {
      const externalEvents = await this.externalApiService.fetchEvents();
      
      for (const externalEvent of externalEvents) {
        const existingEvents = await this.eventRepository.findByCategory(externalEvent.category);
        const existingEvent = existingEvents.find(e => e.title === externalEvent.title);
        
        if (!existingEvent) {
          await this.eventRepository.create({
            title: externalEvent.title,
            description: externalEvent.description,
            category: externalEvent.category,
            startTime: new Date(externalEvent.startTime),
            endTime: new Date(externalEvent.endTime),
            status: 'upcoming',
            options: externalEvent.options,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    } catch {
      // Silently catch errors from external API
    }
  }
} 