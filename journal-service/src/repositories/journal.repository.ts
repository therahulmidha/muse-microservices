import { Journal } from '../models/journal.model';

export const createJournal = async (data: any) => {
  return Journal.create(data);
};

// TODO: handle idempotence
export const createJournalIfNotExists = async (data: any) => {
  const exists = await Journal.findOne({ externalId: data.id });

  if (exists) return;

  return Journal.create({
    ...data,
    externalId: data.id
  });
};

export const getJournalsByUser = async (userId: string) => {
  return Journal.find({ userId });
};