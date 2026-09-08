import rateLimit from 'express-rate-limit';
import { HttpStatus } from '../constants/http-status';

/**
 * Standard global rate limiter middleware
 * Set generously to avoid restricting multi-user environments or shared IPs
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50000, // Very generous limit
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => (process.env.NODE_ENV === 'test' && !process.env.TEST_RATE_LIMIT),
  statusCode: HttpStatus.TOO_MANY_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    errors: [],
  },
});

/**
 * Authentication endpoints rate limiter
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.TEST_RATE_LIMIT ? 20 : 5000, // Generous limit for normal runtime
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => (process.env.NODE_ENV === 'test' && !process.env.TEST_RATE_LIMIT),
  statusCode: HttpStatus.TOO_MANY_REQUESTS,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
    errors: [],
  },
});

/**
 * Targeted rate limiter for AI operations
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => (process.env.NODE_ENV === 'test' && !process.env.TEST_RATE_LIMIT),
  statusCode: HttpStatus.TOO_MANY_REQUESTS,
  message: {
    success: false,
    message: 'AI request limit reached, please slow down your requests',
    errors: [],
  },
});

/**
 * Targeted rate limiter for search queries
 */
export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => (process.env.NODE_ENV === 'test' && !process.env.TEST_RATE_LIMIT),
  statusCode: HttpStatus.TOO_MANY_REQUESTS,
  message: {
    success: false,
    message: 'Search rate limit exceeded, please try again in a few moments',
    errors: [],
  },
});
