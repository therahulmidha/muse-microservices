import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client';
import { publishEvent } from '../utils/rabbitmq';

import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
// config();
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export const startOutboxWorker = () => {
  setInterval(async () => {
    const events = await prisma.outboxEvent.findMany({
      where: { processed: false }
    });

    for (const event of events) {
      try {
        await publishEvent('user_created', JSON.parse(event.payload));

        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: { processed: true }
        });

      } catch (err) {
        console.error('Failed to publish event', err);
      }
    }
  }, 5000); // every 5 sec
};