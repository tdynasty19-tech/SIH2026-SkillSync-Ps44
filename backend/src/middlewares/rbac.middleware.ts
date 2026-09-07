import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { UserRole } from '../constants/roles';
import { AuthorizationError, AuthenticationError } from '../errors/app.error';

/**
 * Role-Based Access Control (RBAC) Middleware Skeleton
 * Enforces access based on defined roles: Student, Industry, Academician, Institution
 */
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AuthorizationError(
        `Role '${req.user.role}' is not authorized to access this resource`
      );
    }

    next();
  };
};
