import { createUser, findUserByEmail } from '../repositories/user.repository';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcrypt';
// import { publishEvent } from '../utils/rabbitmq';
import { PrismaClient } from '../generated/prisma/client';
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export const signupUser = async (data: any) => {
  const existing = await findUserByEmail(data.email);

  if (existing) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  await createUser({
    email: data.email,
    password: hashedPassword
  });

  // await publishEvent('user_created', {
  //   email: data.email
  // });
  // config();
  const connectionString = `${process.env.DATABASE_URL}`;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  await prisma.outboxEvent.create({
    data: {
      type: 'USER_CREATED',
      payload: JSON.stringify({
        email: data.email
      })
    }
  });
};


export const loginUser = async (data: any) => {
  const user = await findUserByEmail(data.email);

  if (!user) {
    throw new Error('User not found');
  }

  const isValid = await bcrypt.compare(data.password, user.password);

  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken({
    userId: user.id,
    email: user.email
  });

  return { token };
};