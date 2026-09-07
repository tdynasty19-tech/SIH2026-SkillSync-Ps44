import winston from 'winston';
import { env } from '../config/env.config';

// Keys to redact from logs
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'refreshtoken',
  'secret',
  'authorization',
  'jwt_secret',
  'jwt_refresh_secret',
  'openai_api_key',
  'gemini_api_key',
  'storage_access_key',
  'storage_secret_key',
]);

const maskSensitiveData = winston.format((info) => {
  const mask = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(mask);

    const masked: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        masked[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = mask(value);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  };

  return mask(info);
});

const isProduction = env.NODE_ENV === 'production';

export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    maskSensitiveData(),
    isProduction
      ? winston.format.json()
      : winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
          let log = `[${timestamp}] [${String(level).toUpperCase()}]: ${message}`;
          if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
          }
          if (stack) {
            log += `\n${stack}`;
          }
          return log;
        })
  ),
  defaultMeta: { service: 'sih-ps44-backend' },
  transports: [
    new winston.transports.Console(),
  ],
});
