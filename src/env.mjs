import { z } from "zod";

export const env = {
  DATABASE_URL: z.string().min(1).parse(process.env.DATABASE_URL),
  NEXTAUTH_SECRET: z.string().min(1).parse(process.env.NEXTAUTH_SECRET),
  NEXTAUTH_URL: z.string().url().parse(process.env.NEXTAUTH_URL),
  APP_ENCRYPTION_KEY: z.string().min(32).parse(process.env.APP_ENCRYPTION_KEY),
};
