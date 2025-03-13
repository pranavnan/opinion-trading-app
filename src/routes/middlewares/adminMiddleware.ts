import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: Authentication required' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    
    next();
  } catch {
    return res.status(500).json({ message: 'Internal server error' });
  }
};