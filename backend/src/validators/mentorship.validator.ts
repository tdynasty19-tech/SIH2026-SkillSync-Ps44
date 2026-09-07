import { z } from 'zod';
import { MentorshipStatus } from '../constants/enums';

export const createMentorProfileSchema = z.object({
  expertiseAreas: z.string().trim().min(3, 'Expertise areas must be specified (e.g. AI, Backend, Cloud)').max(1000),
  maxMentees: z.coerce.number().int().min(1, 'Max mentees must be at least 1').max(50).optional(),
  isAvailable: z.boolean().optional(),
});

export const updateMentorProfileSchema = createMentorProfileSchema.partial();

export const mentorQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  expertise: z.string().trim().optional(),
  availableOnly: z.coerce.boolean().optional(),
});

export const createMentorshipRequestSchema = z.object({
  mentorId: z.coerce.number().int().positive('Valid mentorId is required'),
  goals: z.string().trim().min(5, 'Mentorship goals must be at least 5 characters').max(2000),
  message: z.string().trim().max(2000).optional().nullable(),
});

export const respondMentorshipRequestSchema = z.object({
  status: z.nativeEnum(MentorshipStatus),
});

export const mentorshipRequestQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(MentorshipStatus).optional(),
});

export const createMentorshipSessionSchema = z.object({
  mentorshipRequestId: z.coerce.number().int().positive('Valid mentorshipRequestId is required'),
  sessionDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Session date must be YYYY-MM-DD'),
  startTime: z.string().trim().min(2, 'Start time is required (e.g., 14:00)').max(20),
  durationMinutes: z.coerce.number().int().min(15, 'Duration must be at least 15 minutes').max(240).optional(),
  meetingLink: z.string().trim().url('Invalid meeting URL').max(1024).optional().nullable().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const updateMentorshipSessionSchema = createMentorshipSessionSchema.partial().extend({
  isCompleted: z.boolean().optional(),
});

export const mentorshipSessionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  completed: z.coerce.boolean().optional(),
});

export type CreateMentorProfileInput = z.infer<typeof createMentorProfileSchema>;
export type UpdateMentorProfileInput = z.infer<typeof updateMentorProfileSchema>;
export type CreateMentorshipRequestInput = z.infer<typeof createMentorshipRequestSchema>;
export type RespondMentorshipRequestInput = z.infer<typeof respondMentorshipRequestSchema>;
export type CreateMentorshipSessionInput = z.infer<typeof createMentorshipSessionSchema>;
export type UpdateMentorshipSessionInput = z.infer<typeof updateMentorshipSessionSchema>;
