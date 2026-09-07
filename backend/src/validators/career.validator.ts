import { z } from 'zod';
import { SkillGapPriority, SkillGapStatus } from '../constants/enums';

export const careerQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createCareerInterestSchema = z.object({
  careerRoleId: z.number().int().positive('Valid careerRoleId is required'),
  priorityOrder: z.number().int().min(1).max(10).default(1),
});

export const updateCareerInterestSchema = z.object({
  priorityOrder: z.number().int().min(1).max(10),
});

export const skillGapQuerySchema = z.object({
  priority: z.nativeEnum(SkillGapPriority).optional(),
  status: z.nativeEnum(SkillGapStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type CareerQueryInput = z.infer<typeof careerQuerySchema>;
export type CreateCareerInterestInput = z.input<typeof createCareerInterestSchema>;
export type UpdateCareerInterestInput = z.infer<typeof updateCareerInterestSchema>;
export type SkillGapQueryInput = z.infer<typeof skillGapQuerySchema>;
