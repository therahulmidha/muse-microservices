import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new Error('No token');
    }

    const decoded = verifyToken(token);
    (req.user as any) = decoded; // as any fix later

    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};