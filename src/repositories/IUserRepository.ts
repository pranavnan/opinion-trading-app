import { User } from '../models/User';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, '_id'>): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User | null>;
  updateBalance(id: string, amount: number): Promise<User | null>;
} 