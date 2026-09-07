import { z } from 'zod';

export const createAcademicianProfileSchema = z.object({
  department: z.string().trim().min(2, 'Department must be at least 2 characters').max(100).optional(),
  designation: z.string().trim().min(2, 'Designation must be at least 2 characters').max(100),
  qualification: z.string().trim().max(255).optional(),
  specialization: z.string().trim().max(255).optional(),
  experienceYears: z.coerce.number().min(0, 'Experience years cannot be negative').max(70).optional(),
  bio: z.string().trim().optional(),
  researchInterests: z.string().trim().optional(),
  publications: z.string().trim().optional(),
  linkedinUrl: z
    .string()
    .trim()
    .url('LinkedIn URL must be a valid URL')
    .max(1024)
    .optional()
    .or(z.literal('')),
  googleScholarUrl: z
    .string()
    .trim()
    .url('Google Scholar URL must be a valid URL')
    .max(1024)
    .optional()
    .or(z.literal('')),
  institutionId: z.coerce.number().int().positive().optional(),
  departmentId: z.coerce.number().int().positive().optional(),
});

export const updateAcademicianProfileSchema = createAcademicianProfileSchema.partial();

export const createInstitutionAssociationSchema = z.object({
  institutionId: z.coerce.number().int().positive('Institution ID must be a positive integer'),
  designation: z.string().trim().min(2, 'Designation must be at least 2 characters').max(100),
  department: z.string().trim().min(2, 'Department must be at least 2 characters').max(100),
  startDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
  isCurrent: z.boolean().optional(),
});

export const updateInstitutionAssociationSchema = createInstitutionAssociationSchema.partial();

export const associationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateAcademicianProfileInput = z.infer<typeof createAcademicianProfileSchema>;
export type UpdateAcademicianProfileInput = z.infer<typeof updateAcademicianProfileSchema>;
export type CreateInstitutionAssociationInput = z.infer<typeof createInstitutionAssociationSchema>;
export type UpdateInstitutionAssociationInput = z.infer<typeof updateInstitutionAssociationSchema>;
export type AssociationQueryInput = z.infer<typeof associationQuerySchema>;
