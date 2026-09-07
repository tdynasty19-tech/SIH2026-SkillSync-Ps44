import { z } from 'zod';

export const skillQuerySchema = z.object({
  search: z.string().trim().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const categoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type SkillQueryInput = z.infer<typeof skillQuerySchema>;
export type CategoryQueryInput = z.infer<typeof categoryQuerySchema>;
