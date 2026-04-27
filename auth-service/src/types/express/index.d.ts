import { User } from '../../generated/prisma/client';
export {}; // Forces file to be a module


declare global {
  namespace Express {
    interface Request {
      user?: User; 
    }
  }
}
