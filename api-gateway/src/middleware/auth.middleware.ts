// same as auth service, for now copied but will come from shared service later
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = 'mysecret'; // later move to env
const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET);
};
export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
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