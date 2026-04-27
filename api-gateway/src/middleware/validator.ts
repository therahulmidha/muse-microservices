import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateRequestBody =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    next();
  };
