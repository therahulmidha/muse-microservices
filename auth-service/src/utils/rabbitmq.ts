import amqp from 'amqplib';

let channel: any;

export const connectRabbitMQ = async () => {
  const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
  const connection = await amqp.connect(rabbitUrl);
  channel = await connection.createChannel();
  await channel.assertQueue('user_created');
};

export const publishEvent = async (queue: string, message: any) => {
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
};