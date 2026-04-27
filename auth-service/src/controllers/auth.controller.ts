import { Request, Response } from "express";
import { signupUser } from "../services/auth.service";
import { loginUser } from '../services/auth.service';

export const signup = async (req: Request, res: Response) => {
  try {
    const user = await signupUser(req.body);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};


export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};