export interface Trade {
  _id?: string;
  userId: string;
  eventId: string;
  optionId: string;
  amount: number;
  status: 'pending' | 'executed' | 'settled' | 'cancelled';
  outcome?: 'win' | 'loss';
  settlementAmount?: number;
  createdAt: Date;
  updatedAt: Date;
} 