import { Request, Response, NextFunction } from 'express';
import { authService, AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import { AuthenticatedRequest } from '../types/auth.types';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

/**
 * AuthController
 * Thin controller layer: validates input, invokes AuthService, and formats standardized HTTP responses.
 */
export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  /**
   * POST /api/v1/auth/register
   */
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await this.service.register(validatedData);
      sendSuccess(res, 'User registered successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/auth/login
   */
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await this.service.login(validatedData, req.ip, req.headers['user-agent'] as string);
      sendSuccess(res, 'Login successful', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/auth/refresh
   */
  public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = refreshTokenSchema.parse(req.body);
      const result = await this.service.refreshToken(validatedData.refreshToken);
      sendSuccess(res, 'Tokens refreshed successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/auth/logout
   */
  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.body?.refreshToken;
      const result = await this.service.logout(token);
      sendSuccess(res, 'Logged out successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/auth/forgot-password
   */
  public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      const result = await this.service.forgotPassword(validatedData.email);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/auth/reset-password
   */
  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      const result = await this.service.resetPassword(validatedData);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/auth/me
   */
  public getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.getCurrentUser(req.user!.id);
      sendSuccess(res, 'Current user profile fetched successfully', user, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
