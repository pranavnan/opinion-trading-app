import { User } from '../../../models/User';

export interface AuthResult {
  user: Omit<User, 'password'>;
  token: string;
}

export interface IAuthService {
  register(username: string, email: string, password: string): Promise<AuthResult>;
  login(email: string, password: string): Promise<AuthResult>;
  verifyToken(token: string): Promise<User | null>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean>;
} 