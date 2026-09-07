import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { PasswordResetJwtPayload } from '../types/auth.types';
import { authRepository, AuthRepository } from '../repositories/auth.repository';
import { sequelize } from '../config/database';
import {
  RegisterInput,
  LoginInput,
  ResetPasswordInput,
} from '../validators/auth.validator';
import {
  signAccessToken,
  signRefreshToken,
  signPasswordResetToken,
  verifyRefreshToken,
  verifyPasswordResetToken,
} from '../utils/jwt.util';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from '../errors/app.error';
import { appEvents, AppEventType } from '../events';
import { UserRole } from '../constants/roles';
import { StudentProfile } from '../models/student-profile.model';

const BCRYPT_SALT_ROUNDS = 10;

/**
 * AuthService
 * Handles all business logic for authentication, tokens, password hashing, and user sessions.
 */
export class AuthService {
  constructor(private readonly repository: AuthRepository = authRepository) {}

  /**
   * Register a new user
   */
  public async register(input: RegisterInput) {
    const existingUser = await this.repository.findUserByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

    const user = await this.repository.createUser({
      uuid: crypto.randomUUID(),
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone || null,
      passwordHash,
      role: input.role,
      isVerified: false,
      isActive: true,
    });

    if (input.role === UserRole.STUDENT) {
      try {
        await StudentProfile.create({
          userId: user.id,
          headline: 'Student Engineer',
          profileCompletion: 10,
        });
      } catch {
        // Non-blocking if profile creation succeeds or is already handled
      }
    }

    return {
      user: user.toJSON(),
    };
  }

  /**
   * Login user and issue access and refresh tokens
   */
  public async login(input: LoginInput, ipAddress?: string, userAgent?: string) {
    const user = await this.repository.findUserByEmail(input.email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account has been deactivated. Please contact support.');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new AuthenticationError('Invalid email or password');
    }

    const accessToken = signAccessToken({
      userId: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role,
    });

    // 7 days expiration for refresh token record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Persist refresh token and update lastLoginAt in transaction
    await sequelize.transaction(async (t) => {
      await this.repository.createRefreshToken(
        {
          userId: user.id,
          token: refreshToken,
          expiresAt,
          isRevoked: false,
        },
        t
      );

      await this.repository.updateUser(
        user.id,
        { lastLoginAt: new Date() },
        t
      );
    });

    appEvents.emitSafe(AppEventType.USER_LOGGED_IN, {
      userId: user.id,
      ipAddress,
      userAgent,
    });

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Rotate a refresh token and issue a new access token
   */
  public async refreshToken(refreshTokenStr: string) {
    // 1. Verify signature & payload
    const decoded = verifyRefreshToken(refreshTokenStr);

    // 2. Lookup in database
    const tokenRecord = await this.repository.findRefreshToken(refreshTokenStr);
    if (!tokenRecord || tokenRecord.isRevoked || new Date() > tokenRecord.expiresAt) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    // 3. Verify user active status
    const user = await this.repository.findUserById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AuthenticationError('User account is inactive or no longer exists');
    }

    // 4. Rotate tokens in transaction
    const newAccessToken = signAccessToken({
      userId: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = signRefreshToken({
      userId: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await sequelize.transaction(async (t) => {
      // Invalidate old token
      await this.repository.revokeRefreshToken(refreshTokenStr, t);

      // Create new token
      await this.repository.createRefreshToken(
        {
          userId: user.id,
          token: newRefreshToken,
          expiresAt,
          isRevoked: false,
        },
        t
      );
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Revoke a refresh token on logout
   */
  public async logout(refreshTokenStr?: string) {
    if (refreshTokenStr) {
      await this.repository.revokeRefreshToken(refreshTokenStr);
    }
    return {
      message: 'Logged out successfully',
    };
  }

  /**
   * Initiate forgot password flow
   */
  public async forgotPassword(email: string) {
    const user = await this.repository.findUserByEmail(email);

    let resetToken: string | undefined;

    if (user && user.isActive) {
      resetToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          action: 'password_reset',
        },
        env.JWT_SECRET + user.passwordHash,
        { expiresIn: '15m' }
      );
    }

    // Always return neutral message to prevent account enumeration
    return {
      message: 'If the provided email is registered, you will receive password reset instructions.',
      // Expose resetToken in non-production environments to allow testing and demo without external email setup
      ...(process.env.NODE_ENV !== 'production' && resetToken ? { resetToken } : {}),
    };
  }

  /**
   * Reset password using a valid token
   */
  public async resetPassword(input: ResetPasswordInput) {
    const unverified = jwt.decode(input.token) as PasswordResetJwtPayload | null;
    if (!unverified || !unverified.userId || unverified.action !== 'password_reset') {
      throw new AuthenticationError('Invalid or expired password reset token');
    }

    const user = await this.repository.findUserById(unverified.userId);
    if (!user || !user.isActive) {
      throw new AuthenticationError('Invalid or expired password reset token');
    }

    try {
      jwt.verify(input.token, env.JWT_SECRET + user.passwordHash);
    } catch {
      throw new AuthenticationError('Invalid or expired password reset token');
    }

    const newPasswordHash = await bcrypt.hash(input.newPassword, BCRYPT_SALT_ROUNDS);

    await sequelize.transaction(async (t) => {
      await this.repository.updateUser(user.id, { passwordHash: newPasswordHash }, t);
      // Revoke all existing refresh token sessions for security
      await this.repository.revokeAllUserRefreshTokens(user.id, t);
    });

    return {
      message: 'Password has been reset successfully. Please log in with your new password.',
    };
  }

  /**
   * Fetch current authoritative user data from database
   */
  public async getCurrentUser(userId: number) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account is inactive');
    }

    return user.toJSON();
  }
}

export const authService = new AuthService();
