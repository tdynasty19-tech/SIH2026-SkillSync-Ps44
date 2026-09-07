import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { JwtPayload, PasswordResetJwtPayload } from '../types/auth.types';
import { AuthenticationError } from '../errors/app.error';

/**
 * Signs an access token
 */
export const signAccessToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};

/**
 * Signs a refresh token with unique jti
 */
export const signRefreshToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(
    { ...payload, jti: crypto.randomUUID() },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    }
  );
};

/**
 * Signs a secure 15-minute password reset token
 */
export const signPasswordResetToken = (
  payload: Omit<PasswordResetJwtPayload, 'iat' | 'exp'>
): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

/**
 * Verifies an access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired access token');
  }
};

/**
 * Verifies a refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }
};

/**
 * Verifies a password reset token
 */
export const verifyPasswordResetToken = (token: string): PasswordResetJwtPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as PasswordResetJwtPayload;
    if (decoded.action !== 'password_reset') {
      throw new AuthenticationError('Invalid reset token purpose');
    }
    return decoded;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired password reset token');
  }
};
