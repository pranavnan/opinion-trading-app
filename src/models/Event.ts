export interface EventOption {
  _id?: string;
  name: string;
  odds: number;
  result?: boolean;
}

export interface Event {
  _id?: string;
  title: string;
  description: string;
  category: string;
  startTime: Date;
  endTime: Date;
  status: 'upcoming' | 'live' | 'closed' | 'settled';
  options: EventOption[];
  createdAt: Date;
  updatedAt: Date;
} 