import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { AuthenticationError, AuthorizationError } from '../errors/app.error';
import { verifyAccessToken } from '../utils/jwt.util';
import { UserRole } from '../constants/roles';

/**
 * Authentication Middleware
 * Extracts and verifies the JWT Bearer token from the Authorization header.
 * Attaches the authenticated identity to req.user.
 */
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Authentication token missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AuthenticationError('Authentication token missing');
    }

    const decoded = verifyAccessToken(token);

    req.user = {
      id: decoded.userId,
      uuid: decoded.uuid,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * Verifies that the authenticated user possesses one of the authorized roles.
 */
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AuthorizationError(
          `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
        )
      );
    }

    next();
  };
};
