import { z } from 'zod';
import { CollaborationStatus, CollaborationType } from '../constants/enums';

export const createCollaborationSchema = z.object({
  industryId: z.coerce.number().int().positive().optional(),
  institutionId: z.coerce.number().int().positive().optional(),
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(255),
  collaborationType: z.nativeEnum(CollaborationType),
  description: z.string().trim().min(5, 'Description must be at least 5 characters'),
  startDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  endDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
});

export const updateCollaborationSchema = z.object({
  title: z.string().trim().min(3).max(255).optional(),
  description: z.string().trim().min(5).optional(),
  startDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.nativeEnum(CollaborationStatus).optional(),
});

export const createWorkshopSchema = z.object({
  topic: z.string().trim().min(2, 'Topic is required').max(255),
  speakerName: z.string().trim().min(2, 'Speaker name is required').max(150),
  speakerDesignation: z.string().trim().max(150).optional().or(z.literal('')),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  durationHours: z.coerce.number().int().min(1, 'Duration must be at least 1 hour').optional(),
  venue: z.string().trim().max(255).optional().or(z.literal('')),
  attendeesCount: z.coerce.number().int().min(0).optional(),
});

export const updateWorkshopSchema = createWorkshopSchema.partial();

export const createGuestLectureSchema = z.object({
  topic: z.string().trim().min(2, 'Topic is required').max(255),
  lecturerName: z.string().trim().min(2, 'Lecturer name is required').max(150),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  durationMinutes: z.coerce.number().int().min(15, 'Duration must be at least 15 minutes').optional(),
});

export const updateGuestLectureSchema = createGuestLectureSchema.partial();

export const createIndustrialTrainingSchema = z.object({
  domain: z.string().trim().min(2, 'Domain is required').max(150),
  durationWeeks: z.coerce.number().int().min(1, 'Duration must be at least 1 week').optional(),
  batchSize: z.coerce.number().int().min(1, 'Batch size must be at least 1').optional(),
});

export const updateIndustrialTrainingSchema = createIndustrialTrainingSchema.partial();

export const createLiveProjectSchema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(255),
  problemStatement: z.string().trim().min(5, 'Problem statement must be at least 5 characters'),
  studentsCount: z.coerce.number().int().min(1, 'Students count must be at least 1').optional(),
  deadline: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Deadline must be YYYY-MM-DD').optional().or(z.literal('')),
});

export const updateLiveProjectSchema = createLiveProjectSchema.partial();

export const collaborationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(CollaborationStatus).optional(),
  collaborationType: z.nativeEnum(CollaborationType).optional(),
  search: z.string().trim().optional(),
});

export type CreateCollaborationInput = z.infer<typeof createCollaborationSchema>;
export type UpdateCollaborationInput = z.infer<typeof updateCollaborationSchema>;
export type CreateWorkshopInput = z.infer<typeof createWorkshopSchema>;
export type UpdateWorkshopInput = z.infer<typeof updateWorkshopSchema>;
export type CreateGuestLectureInput = z.infer<typeof createGuestLectureSchema>;
export type UpdateGuestLectureInput = z.infer<typeof updateGuestLectureSchema>;
export type CreateIndustrialTrainingInput = z.infer<typeof createIndustrialTrainingSchema>;
export type UpdateIndustrialTrainingInput = z.infer<typeof updateIndustrialTrainingSchema>;
export type CreateLiveProjectInput = z.infer<typeof createLiveProjectSchema>;
export type UpdateLiveProjectInput = z.infer<typeof updateLiveProjectSchema>;
export type CollaborationQueryInput = z.infer<typeof collaborationQuerySchema>;
