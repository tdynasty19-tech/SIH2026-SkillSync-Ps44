import { Request } from 'express';
import { UserRole } from '../constants/roles';

export interface JwtPayload {
  userId: number;
  uuid: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface PasswordResetJwtPayload {
  userId: number;
  email: string;
  action: 'password_reset';
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: number;
  uuid: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
