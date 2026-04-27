import { config } from 'dotenv';
config();
import express from 'express';
import journalRoutes from './routes/journal.routes';
import { connectDB } from './config/db';
import { consumeEvents } from './utils/rabbitmq';
import { logger } from './utils/logger';

consumeEvents();
connectDB();
const app = express();
app.use(express.json())
app.use('/journal', journalRoutes);
const PORT = 3002;

app.listen(PORT, () => {
  logger.info(`Journal Service running on port ${PORT}`);
});