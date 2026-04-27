import amqp from "amqplib";
import { logger } from "./logger";

export const consumeEvents = async () => {
  const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
  const connection = await amqp.connect(rabbitUrl);
  const channel = await connection.createChannel();

  await channel.assertQueue("user_created");

  channel.consume("user_created", (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg.content.toString());
        logger.info(`User Created Event Received: ${JSON.stringify(data)}`);

        // process
        channel.ack(msg);
      } catch (err) {
        console.error(err);

        // DON'T ack → message retried
      }
    }
  });
};
