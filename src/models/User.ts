export interface User {
  _id?: string;
  username: string;
  email: string;
  password: string;
  balance: number;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
} 