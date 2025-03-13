import { Event } from '../../../models/Event';

export interface IEventService {
  getAllEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | null>;
  getEventsByCategory(category: string): Promise<Event[]>;
  createEvent(eventData: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>): Promise<Event>;
  updateEvent(id: string, updates: Partial<Event>): Promise<Event | null>;
  settleEvent(id: string, winningOptionId: string): Promise<Event | null>;
  deleteEvent(id: string): Promise<boolean>;
  fetchExternalEvents(): Promise<void>;
} 