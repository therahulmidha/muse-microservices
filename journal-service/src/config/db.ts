import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDB = async () => {
  await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/journaldb?replicaSet=rs0');
  logger.info('MongoDB connected');
};