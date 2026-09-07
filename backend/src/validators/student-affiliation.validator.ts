import { z } from 'zod';
import { StudentAffiliationStatus } from '../constants/enums';

export const createStudentAffiliationSchema = z.object({
  institutionId: z.coerce.number().int().positive(),
  departmentId: z.coerce.number().int().positive(),
  enrollmentNumber: z.string().trim().min(1, 'Enrollment number is required').max(100),
});

export const affiliationStatusQuerySchema = z.object({
  status: z.nativeEnum(StudentAffiliationStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const rejectStudentAffiliationSchema = z.object({
  rejectionReason: z.string().trim().min(3, 'Rejection reason is required').max(500),
});

export type CreateStudentAffiliationInput = z.infer<typeof createStudentAffiliationSchema>;
export type AffiliationStatusQueryInput = z.infer<typeof affiliationStatusQuerySchema>;
export type RejectStudentAffiliationInput = z.infer<typeof rejectStudentAffiliationSchema>;
