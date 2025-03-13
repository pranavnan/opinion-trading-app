import mongoose, { Schema } from 'mongoose';
import { User } from '../../../models/User';

const UserSchema = new Schema<User>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

export const UserModel = mongoose.model<User>('User', UserSchema); 