import { z } from 'zod';
import { AssessmentAttemptStatus } from '../constants/enums';

export const assessmentQuerySchema = z.object({
  skillId: z.coerce.number().int().positive().optional(),
  difficulty: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const submitAnswerItemSchema = z.object({
  questionId: z.number().int().positive('Valid questionId is required'),
  answer: z.string().trim().min(1, 'Answer is required'),
});

export const submitAssessmentSchema = z.object({
  answers: z.array(submitAnswerItemSchema).min(1, 'At least one answer must be provided'),
});

export const attemptQuerySchema = z.object({
  status: z.nativeEnum(AssessmentAttemptStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type AssessmentQueryInput = z.infer<typeof assessmentQuerySchema>;
export type SubmitAssessmentInput = z.infer<typeof submitAssessmentSchema>;
export type AttemptQueryInput = z.infer<typeof attemptQuerySchema>;
