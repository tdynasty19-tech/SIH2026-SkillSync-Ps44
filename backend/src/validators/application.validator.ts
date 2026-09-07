import { z } from 'zod';
import { ApplicationStatus, OpportunityType } from '../constants/enums';

export const submitApplicationSchema = z.object({
  opportunityId: z.coerce.number().int().positive('Opportunity ID must be a positive integer'),
  opportunityType: z.nativeEnum(OpportunityType),
  coverLetter: z.string().trim().max(5000, 'Cover letter cannot exceed 5000 characters').optional(),
  resumeUrl: z
    .string()
    .trim()
    .url('Resume URL must be a valid URL')
    .max(1024, 'Resume URL cannot exceed 1024 characters')
    .optional()
    .or(z.literal('')),
});

export const updateApplicationStatusSchema = z.object({
  status: z
    .nativeEnum(ApplicationStatus)
    .refine((val) => val !== ApplicationStatus.APPLIED, {
      message: 'Status cannot be transitioned back to APPLIED',
    }),
  reason: z.string().trim().max(1000, 'Reason cannot exceed 1000 characters').optional(),
});

export const applicationQuerySchema = z.object({
  status: z.nativeEnum(ApplicationStatus).optional(),
  opportunityType: z.nativeEnum(OpportunityType).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const opportunityApplicationParamsSchema = z.object({
  opportunityType: z.nativeEnum(OpportunityType),
  opportunityId: z.coerce.number().int().positive(),
});

export type SubmitApplicationInput = z.infer<typeof submitApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
export type ApplicationQueryInput = z.infer<typeof applicationQuerySchema>;
export type OpportunityApplicationParamsInput = z.infer<typeof opportunityApplicationParamsSchema>;
