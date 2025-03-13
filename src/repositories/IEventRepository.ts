import { Event } from '../models/Event';

export interface IEventRepository {
  findAll(): Promise<Event[]>;
  findById(id: string): Promise<Event | null>;
  findByCategory(category: string): Promise<Event[]>;
  create(event: Omit<Event, '_id'>): Promise<Event>;
  update(id: string, updates: Partial<Event>): Promise<Event | null>;
  delete(id: string): Promise<boolean>;
} 