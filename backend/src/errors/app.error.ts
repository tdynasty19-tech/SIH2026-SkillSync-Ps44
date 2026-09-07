import { HttpStatus, HttpStatusCode } from '../constants/http-status';

/**
 * Base Application Error
 */
export abstract class AppError extends Error {
  public abstract readonly statusCode: HttpStatusCode;
  public readonly errors: any[];
  public readonly isOperational: boolean;

  constructor(message: string, errors: any[] = [], isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.errors = errors;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error - HTTP 400 / 422
 */
export class ValidationError extends AppError {
  public readonly statusCode: HttpStatusCode = HttpStatus.BAD_REQUEST;

  constructor(message = 'Validation failed', errors: any[] = []) {
    super(message, errors);
  }
}

/**
 * Authentication Error - HTTP 401
 */
export class AuthenticationError extends AppError {
  public readonly statusCode: HttpStatusCode = HttpStatus.UNAUTHORIZED;

  constructor(message = 'Authentication required', errors: any[] = []) {
    super(message, errors);
  }
}

/**
 * Authorization Error - HTTP 403
 */
export class AuthorizationError extends AppError {
  public readonly statusCode: HttpStatusCode = HttpStatus.FORBIDDEN;

  constructor(message = 'Access forbidden: Insufficient permissions', errors: any[] = []) {
    super(message, errors);
  }
}

/**
 * Not Found Error - HTTP 404
 */
export class NotFoundError extends AppError {
  public readonly statusCode: HttpStatusCode = HttpStatus.NOT_FOUND;

  constructor(message = 'Requested resource not found', errors: any[] = []) {
    super(message, errors);
  }
}

/**
 * Conflict Error - HTTP 409
 */
export class ConflictError extends AppError {
  public readonly statusCode: HttpStatusCode = HttpStatus.CONFLICT;

  constructor(message = 'Resource conflict occurred', errors: any[] = []) {
    super(message, errors);
  }
}

/**
 * Database Error - HTTP 500
 */
export class DatabaseError extends AppError {
  public readonly statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR;

  constructor(message = 'Database operation failed', errors: any[] = []) {
    super(message, errors, false);
  }
}

/**
 * AI Provider Error - HTTP 502
 */
export class AIProviderError extends AppError {
  public readonly statusCode: HttpStatusCode = HttpStatus.BAD_GATEWAY;

  constructor(message = 'AI Provider service error', errors: any[] = []) {
    super(message, errors);
  }
}

/**
 * File Upload Error - HTTP 400
 */
export class FileUploadError extends AppError {
  public readonly statusCode: HttpStatusCode = HttpStatus.BAD_REQUEST;

  constructor(message = 'File upload failed', errors: any[] = []) {
    super(message, errors);
  }
}
