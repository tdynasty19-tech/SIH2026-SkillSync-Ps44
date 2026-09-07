import { z } from 'zod';
import { OpportunityType } from '../constants/enums';

export const matchingOpportunityParamsSchema = z.object({
  opportunityId: z.coerce.number().int().positive('Opportunity ID must be a positive integer'),
});

export const matchingOpportunityQuerySchema = z.object({
  opportunityType: z
    .nativeEnum(OpportunityType)
    .or(z.string().trim())
    .default(OpportunityType.JOB),
  studentId: z.coerce.number().int().positive().optional(),
});

export const matchingStudentParamsSchema = z.object({
  studentId: z.coerce.number().int().positive('Student ID must be a positive integer'),
});

export const matchingStudentQuerySchema = z.object({
  opportunityId: z.coerce.number().int().positive('Opportunity ID must be a positive integer'),
  opportunityType: z
    .nativeEnum(OpportunityType)
    .or(z.string().trim())
    .default(OpportunityType.JOB),
});

export const candidateMatchingQuerySchema = z.object({
  opportunityId: z.coerce.number().int().positive('Opportunity ID is required and must be a positive integer'),
  opportunityType: z
    .nativeEnum(OpportunityType)
    .or(z.string().trim())
    .default(OpportunityType.JOB),
  minScore: z.coerce.number().min(0).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type MatchingOpportunityParams = z.infer<typeof matchingOpportunityParamsSchema>;
export type MatchingOpportunityQuery = z.infer<typeof matchingOpportunityQuerySchema>;
export type MatchingStudentParams = z.infer<typeof matchingStudentParamsSchema>;
export type MatchingStudentQuery = z.infer<typeof matchingStudentQuerySchema>;
export type CandidateMatchingQuery = z.infer<typeof candidateMatchingQuerySchema>;
