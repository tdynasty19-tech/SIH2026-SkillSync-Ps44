import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database Connection URL (e.g. Railway MySQL: mysql://user:password@host:port/dbname)
  DATABASE_URL: z.string().optional().default(''),

  // Discrete Database Parameters (fallback or standard deployment)
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.coerce.number().default(3306),
  DATABASE_NAME: z.string().default('sih_ps44_dev'),
  DATABASE_USER: z.string().default('root'),
  DATABASE_PASSWORD: z.string().default(''),

  // JWT
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required').default('development_jwt_secret_must_be_configured_in_production'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required').default('development_jwt_refresh_secret_must_be_configured_in_production'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Frontend URL (for CORS - comma-separated list or single URL)
  FRONTEND_URL: z.string().default('http://localhost:3000,http://localhost:5173'),

  // AI Configuration
  AI_PROVIDER: z.string().default('gemini'),
  OPENAI_API_KEY: z.string().optional().default(''),
  GEMINI_API_KEY: z.string().optional().default(''),

  // Storage Configuration
  STORAGE_PROVIDER: z.string().default('local'),
  STORAGE_BUCKET: z.string().optional().default(''),
  STORAGE_ACCESS_KEY: z.string().optional().default(''),
  STORAGE_SECRET_KEY: z.string().optional().default(''),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment configuration:', result.error.format());
    throw new Error('Environment variable validation failed');
  }
  return result.data;
};

export const env = parseEnv();
export type Environment = z.infer<typeof envSchema>;
