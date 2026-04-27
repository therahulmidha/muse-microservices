import { config } from 'dotenv';
config();
import express from 'express';
import authRoutes from './routes/auth.routes';
import { connectRabbitMQ } from './utils/rabbitmq';
import { startOutboxWorker } from './workers/outbox.worker';
import { logger } from './utils/logger';

const app = express();

connectRabbitMQ();
app.use(express.json())

startOutboxWorker();

app.use((req, res, next) => {
  logger.info({ correlationId: req.headers['x-correlation-id']}, `AUTH Service request ${req.method} ${req.url}`);
  next();
});
app.use('/auth', authRoutes);

const PORT = 3001;

app.listen(PORT, () => {
  logger.info(`Auth Service running on port ${PORT}`);
});