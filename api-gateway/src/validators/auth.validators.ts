import { z } from "zod";

const signupSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export { signupSchema, loginSchema };
