import mongoose, { Schema } from 'mongoose';
import { Event, EventOption } from '../../../models/Event';

const EventOptionSchema = new Schema<EventOption>({
  name: { type: String, required: true },
  odds: { type: Number, required: true },
  result: { type: Boolean, default: null }
}, { _id: true });

const EventSchema = new Schema<Event>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['upcoming', 'live', 'closed', 'settled'], 
    default: 'upcoming' 
  },
  options: [EventOptionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
EventSchema.index({ category: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ startTime: 1 });

export const EventModel = mongoose.model<Event>('Event', EventSchema); 