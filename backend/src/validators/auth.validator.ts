import { z } from 'zod';
import { UserRole } from '../constants/roles';

// Normalize role from any casing to standard UserRole
const roleEnumSchema = z.string().transform((val, ctx) => {
  const normalized = val.trim().toLowerCase();
  switch (normalized) {
    case 'student':
      return UserRole.STUDENT;
    case 'industry':
      return UserRole.INDUSTRY;
    case 'academician':
      return UserRole.ACADEMICIAN;
    case 'institution':
      return UserRole.INSTITUTION;
    default:
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid role. Allowed roles are: Student, Industry, Academician, Institution`,
      });
      return z.NEVER;
  }
});

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().trim().min(1, 'Last name is required').max(100, 'Last name too long'),
  email: z.string().trim().toLowerCase().email('Invalid email address').max(255, 'Email too long'),
  phone: z.string().trim().max(20, 'Phone too long').optional().nullable(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must not exceed 100 characters'),
  role: roleEnumSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must not exceed 100 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
