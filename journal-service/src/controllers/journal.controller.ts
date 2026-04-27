import { Request, Response } from 'express';
import { createJournalEntry, getJournals } from '../services/journal.service';
import { logger } from '../utils/logger';

export const create = async (req: Request, res: Response) => {
  try {
    const userId: string= req.headers['x-user-id'] as string;
    logger.info({ correlationId: req.headers['x-correlation-id']}, `Creating journal item for userId ${userId}`);
    const journal = await createJournalEntry(req.body, userId);
    res.status(201).json(journal);
  } catch (err) {
    logger.error({ err }, 'Error occurred');
    res.status(500).json({ error: 'Internal error' });
  }
};

export const getAll = async (req: any, res: Response) => {
  try {
    const userId = req.headers['x-user-id'];
    logger.info({ correlationId: req.headers['x-correlation-id']}, `Fetching journal items for userId ${userId}`);
    const journals = await getJournals(userId);
    res.json(journals);
  } catch (err) {
    logger.error({ err }, 'Error occurred');
    res.status(500).json({ error: 'Internal error' });
  }
};