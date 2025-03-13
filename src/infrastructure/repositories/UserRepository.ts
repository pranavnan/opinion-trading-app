import { injectable } from 'inversify';
import { IUserRepository } from '../../repositories/IUserRepository';
import { User } from '../../models/User';
import { UserModel } from '../database/schemas/UserSchema';

@injectable()
export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return UserModel.findById(id).lean();
  }

  async findByEmail(email: string): Promise<User | null> {
    return UserModel.findOne({ email }).lean();
  }

  async create(user: Omit<User, '_id'>): Promise<User> {
    const newUser = new UserModel(user);
    return (await newUser.save()).toObject();
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    return UserModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean();
  }

  async updateBalance(id: string, amount: number): Promise<User | null> {
    return UserModel.findByIdAndUpdate(
      id,
      { $inc: { balance: amount }, updatedAt: new Date() },
      { new: true }
    ).lean();
  }
} 