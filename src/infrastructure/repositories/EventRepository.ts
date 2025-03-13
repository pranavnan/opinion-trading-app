import { injectable } from 'inversify';

import { Event } from '../../models/Event';
import { EventModel } from '../database/schemas/EventSchema';
import { IEventRepository } from '@/repositories/IEventRepository';

@injectable()
export class EventRepository implements IEventRepository {
  async findAll(): Promise<Event[]> {
    return EventModel.find().lean();
  }

  async findById(id: string): Promise<Event | null> {
    return EventModel.findById(id).lean();
  }

  async findByCategory(category: string): Promise<Event[]> {
    return EventModel.find({ category }).lean();
  }

  async create(event: Omit<Event, '_id'>): Promise<Event> {
    const newEvent = new EventModel(event);
    return (await newEvent.save()).toObject();
  }

  async update(id: string, updates: Partial<Event>): Promise<Event | null> {
    return EventModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean();
  }

  async delete(id: string): Promise<boolean> {
    const result = await EventModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
} 