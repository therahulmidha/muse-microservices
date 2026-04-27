import * as repo from '../repositories/journal.repository';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';

export const createJournalEntry = async (data: any, userId: string) => {
  await redis.del(`journals:${userId}`); // Cache Invalidation
  return repo.createJournal({
    userId,
    text: data.text
  });
};


export const getJournals = async (userId: string) => {
  const cacheKey = `journals:${userId}`;

  // 1. Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    logger.info(`Fetching journal items for userId ${userId} from redis cache`);
    return JSON.parse(cached);
  }

  // 2. Fetch from DB
  const journals = await repo.getJournalsByUser(userId);

  // 3. Store in cache
  await redis.set(cacheKey, JSON.stringify(journals), 'EX', 60); // 60 sec

  return journals;
};