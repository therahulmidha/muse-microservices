import jwt from 'jsonwebtoken';

const SECRET = 'mysecret'; // later move to env

export const generateToken = (payload: any) => {
  return jwt.sign(payload, SECRET, { expiresIn: '1y' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET);
};