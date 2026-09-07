import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app.error';
import { HttpStatus } from '../constants/http-status';
import { sendError } from '../utils/api-response';
import { logger } from '../utils/logger';
import { env } from '../config/env.config';

/**
 * 404 Not Found handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    errors: [],
  });
};

/**
 * Centralized error handling middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If headers are already sent, delegate to Express default handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle JSON parse syntax errors (e.g. malformed JSON in request body)
  if (err instanceof SyntaxError && 'body' in (err as any) && (err as any).status === 400) {
    logger.warn(`Malformed JSON in request body: ${err.message}`, {
      requestId: req.id,
      path: req.originalUrl,
      method: req.method,
    });
    sendError(res, 'Malformed JSON payload in request body', [], HttpStatus.BAD_REQUEST);
    return;
  }

  // Handle Zod schema validation errors
  if (err instanceof ZodError || err.name === 'ZodError') {
    const zodIssues = (err as any).issues || (err as any).errors || [];
    logger.warn(`Validation Error: ${err.message}`, {
      requestId: req.id,
      path: req.originalUrl,
      method: req.method,
      errors: zodIssues,
    });
    sendError(res, 'Validation failed', zodIssues, HttpStatus.BAD_REQUEST);
    return;
  }

  // Handle known operational AppError
  if (err instanceof AppError) {
    logger.warn(`Operational Error: ${err.message}`, {
      requestId: req.id,
      statusCode: err.statusCode,
      path: req.originalUrl,
      method: req.method,
      errors: err.errors,
    });

    sendError(res, err.message, err.errors, err.statusCode);
    return;
  }

  // Handle unexpected programmer or system errors
  logger.error(`Unhandled Exception: ${err.message}`, {
    requestId: req.id,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred'
      : err.message || 'Internal server error';

  const errors =
    env.NODE_ENV === 'production' ? [] : [{ stack: err.stack }];

  sendError(res, message, errors, HttpStatus.INTERNAL_SERVER_ERROR);
};
