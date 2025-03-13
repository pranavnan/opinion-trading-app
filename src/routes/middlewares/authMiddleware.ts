/* eslint-disable @typescript-eslint/no-namespace */
import { Request, Response, NextFunction } from 'express';
import { container } from '../../config/inversify.config';
import { TYPES } from '../../config/types';
import { IAuthService } from '../../application/services/interfaces/IAuthService';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || (req.headers.Authorization as string);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
    }
    
    const authService = container.get<IAuthService>(TYPES.AuthService);
    const user = await authService.verifyToken(token);
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized: Authentication failed' });
  }
}; 