import rateLimit from 'express-rate-limit';
import { HttpStatus } from '../constants/http-status';

/**
 * Standard global rate limiter middleware
 * Limits requests per IP within a designated time window
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 general requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test' && !process.env.TEST_RATE_LIMIT,
  statusCode: HttpStatus.TOO_MANY_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    errors: [],
  },
});

/**
 * Strict rate limiter for sensitive authentication endpoints (Login, Register, Password Reset)
 * Brute-force & credential stuffing defense
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test' && !process.env.TEST_RATE_LIMIT,
  statusCode: HttpStatus.TOO_MANY_REQUESTS,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
    errors: [],
  },
});

/**
 * Targeted rate limiter for compute-intensive AI operations
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test' && !process.env.TEST_RATE_LIMIT,
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
  max: 60, // 60 search requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test' && !process.env.TEST_RATE_LIMIT,
  statusCode: HttpStatus.TOO_MANY_REQUESTS,
  message: {
    success: false,
    message: 'Search rate limit exceeded, please try again in a few moments',
    errors: [],
  },
});
