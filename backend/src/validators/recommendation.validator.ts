import { z } from 'zod';
import { OpportunityType } from '../constants/enums';

export const opportunityRecommendationQuerySchema = z.object({
  type: z.nativeEnum(OpportunityType).or(z.string().trim()).optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const careerRecommendationQuerySchema = z.object({
  status: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const learningRecommendationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const mentorRecommendationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const candidateRecommendationQuerySchema = z.object({
  opportunityId: z.coerce
    .number()
    .int()
    .positive('Opportunity ID is required and must be a positive integer'),
  opportunityType: z
    .nativeEnum(OpportunityType)
    .or(z.string().trim())
    .default(OpportunityType.JOB),
  minScore: z.coerce.number().min(0).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type OpportunityRecommendationQuery = z.infer<typeof opportunityRecommendationQuerySchema>;
export type CareerRecommendationQuery = z.infer<typeof careerRecommendationQuerySchema>;
export type LearningRecommendationQuery = z.infer<typeof learningRecommendationQuerySchema>;
export type MentorRecommendationQuery = z.infer<typeof mentorRecommendationQuerySchema>;
export type CandidateRecommendationQuery = z.infer<typeof candidateRecommendationQuerySchema>;
