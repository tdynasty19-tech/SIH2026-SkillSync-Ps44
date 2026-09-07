import { z } from 'zod';
import { OpportunityType } from '../constants/enums';

export const analyzeResumeSchema = z.object({
  resumeText: z.string().max(25000, 'Resume text exceeds maximum length of 25,000 characters').optional(),
  documentId: z.coerce.number().int().positive('Document ID must be a positive integer').optional(),
});

export const analyzeOpportunitySchema = z.object({
  opportunityId: z.coerce.number().int().positive('Opportunity ID must be a positive integer'),
  opportunityType: z.nativeEnum(OpportunityType),
  customDescription: z.string().max(10000, 'Custom description exceeds maximum length').optional(),
});

export const skillGapParamsSchema = z.object({
  studentId: z
    .union([z.literal('me'), z.coerce.number().int().positive()])
    .optional(),
});

export const careerCopilotSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty').max(2000, 'Message cannot exceed 2000 characters'),
  careerRoleId: z.coerce.number().int().positive().optional(),
});

export const learningRoadmapSchema = z.object({
  targetRole: z.string().trim().max(150).optional(),
  targetRoleId: z.coerce.number().int().positive().optional(),
  timeframeWeeks: z.coerce.number().int().min(1).max(52).default(8),
});

export const opportunityExplanationParamsSchema = z.object({
  opportunityId: z.coerce.number().int().positive('Opportunity ID must be a positive integer'),
});

export const opportunityExplanationQuerySchema = z.object({
  opportunityType: z.string().default('JOB'),
});

export type AnalyzeResumeInput = z.infer<typeof analyzeResumeSchema>;
export type AnalyzeOpportunityInput = z.infer<typeof analyzeOpportunitySchema>;
export type SkillGapParams = z.infer<typeof skillGapParamsSchema>;
export type CareerCopilotInput = z.infer<typeof careerCopilotSchema>;
export type LearningRoadmapInput = z.infer<typeof learningRoadmapSchema>;
export type OpportunityExplanationParams = z.infer<typeof opportunityExplanationParamsSchema>;
export type OpportunityExplanationQuery = z.infer<typeof opportunityExplanationQuerySchema>;

