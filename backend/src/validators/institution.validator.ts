import { z } from 'zod';
import { DegreeLevel, EnrollmentStatus } from '../constants/enums';

export const createInstitutionProfileSchema = z.object({
  institutionName: z.string().trim().min(2, 'Institution name must be at least 2 characters').max(255),
  aisheCode: z.string().trim().max(50).optional().or(z.literal('')),
  institutionType: z.string().trim().min(2, 'Institution type is required').max(100),
  affiliation: z.string().trim().max(255).optional().or(z.literal('')),
  accreditation: z.string().trim().max(255).optional().or(z.literal('')),
  websiteUrl: z.string().trim().url('Website URL must be valid').max(1024).optional().or(z.literal('')),
  location: z.string().trim().max(255).optional().or(z.literal('')),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  state: z.string().trim().max(100).optional().or(z.literal('')),
  country: z.string().trim().max(100).optional().or(z.literal('')),
  description: z.string().trim().optional(),
});

export const updateInstitutionProfileSchema = createInstitutionProfileSchema.partial();

export const createInstitutionDepartmentSchema = z.object({
  departmentName: z.string().trim().min(2, 'Department name must be at least 2 characters').max(150),
  departmentCode: z.string().trim().max(50).optional().or(z.literal('')),
  hodName: z.string().trim().max(150).optional().or(z.literal('')),
  email: z.string().trim().email('Valid email address required').optional().or(z.literal('')),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
});

export const updateInstitutionDepartmentSchema = createInstitutionDepartmentSchema.partial();

export const createPlacementSchema = z.object({
  academicYear: z.string().trim().min(4, 'Academic year is required (e.g., 2023-2024)').max(20),
  totalStudents: z.coerce.number().int().min(0, 'Total students cannot be negative'),
  placedStudents: z.coerce.number().int().min(0, 'Placed students cannot be negative'),
  higherStudiesStudents: z.coerce.number().int().min(0).optional(),
  entrepreneurshipStudents: z.coerce.number().int().min(0).optional(),
  averageSalary: z.coerce.number().min(0, 'Average salary cannot be negative').optional(),
  highestSalary: z.coerce.number().min(0, 'Highest salary cannot be negative').optional(),
  medianSalary: z.coerce.number().min(0, 'Median salary cannot be negative').optional(),
});

export const updatePlacementSchema = createPlacementSchema.partial();

export const createPlacementRecordSchema = z.object({
  studentId: z.coerce.number().int().positive('Student ID must be a positive integer').optional(),
  companyName: z.string().trim().min(2, 'Company name is required').max(255),
  packageOffered: z.coerce.number().min(0, 'Package offered cannot be negative'),
  roleOffered: z.string().trim().min(2, 'Role offered is required').max(150),
  offerDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Offer date must be YYYY-MM-DD format').optional().or(z.literal('')),
});

export const updatePlacementRecordSchema = createPlacementRecordSchema.partial();

export const institutionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
});

export const createAcademicProgramSchema = z.object({
  departmentId: z.coerce.number().int().positive('Department ID must be a positive integer'),
  programName: z.string().trim().min(2, 'Program name must be at least 2 characters').max(150),
  programCode: z.string().trim().max(50).optional().or(z.literal('')),
  degreeLevel: z.nativeEnum(DegreeLevel).default(DegreeLevel.UNDERGRADUATE),
  durationYears: z.coerce.number().min(0.5, 'Duration must be at least 0.5 years').max(10, 'Duration cannot exceed 10 years').default(4.0),
  totalSemesters: z.coerce.number().int().min(1, 'Total semesters must be at least 1').max(20, 'Total semesters cannot exceed 20').default(8),
  description: z.string().trim().optional(),
  isActive: z.boolean().default(true),
});

export const updateAcademicProgramSchema = createAcademicProgramSchema.partial();

export const academicProgramQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  departmentId: z.coerce.number().int().positive().optional(),
  degreeLevel: z.nativeEnum(DegreeLevel).optional(),
  isActive: z.preprocess((val) => {
    if (val === 'true' || val === true) return true;
    if (val === 'false' || val === false) return false;
    return undefined;
  }, z.boolean().optional()),
  search: z.string().trim().optional(),
});

export const createAcademicBatchSchema = z.object({
  programId: z.coerce.number().int().positive('Program ID must be a positive integer'),
  batchName: z.string().trim().min(2, 'Batch name must be at least 2 characters').max(100),
  startYear: z.coerce.number().int().min(1950).max(2100),
  endYear: z.coerce.number().int().min(1950).max(2100),
  currentSemester: z.coerce.number().int().min(1).max(20).optional().default(1),
  isActive: z.boolean().optional().default(true),
});

export const updateAcademicBatchSchema = createAcademicBatchSchema.partial();

export const academicBatchQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  departmentId: z.coerce.number().int().positive().optional(),
  programId: z.coerce.number().int().positive().optional(),
  startYear: z.coerce.number().int().optional(),
  endYear: z.coerce.number().int().optional(),
  isActive: z.preprocess((val) => {
    if (val === 'true' || val === true) return true;
    if (val === 'false' || val === false) return false;
    return undefined;
  }, z.boolean().optional()),
  search: z.string().trim().optional(),
});

export const createStudentAcademicEnrollmentSchema = z.object({
  studentId: z.coerce.number().int().positive('Student ID must be a positive integer'),
  batchId: z.coerce.number().int().positive('Batch ID must be a positive integer'),
  enrollmentNumber: z.string().trim().min(1, 'Enrollment number is required').max(100),
  rollNumber: z.string().trim().max(100).optional().or(z.literal('')),
  status: z.nativeEnum(EnrollmentStatus).optional().default(EnrollmentStatus.ACTIVE),
  currentSemester: z.coerce.number().int().min(1).max(20).optional().default(1),
  isCurrent: z.boolean().optional().default(true),
});

export const updateStudentAcademicEnrollmentSchema = createStudentAcademicEnrollmentSchema.partial();

export const studentAcademicEnrollmentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  studentId: z.coerce.number().int().positive().optional(),
  batchId: z.coerce.number().int().positive().optional(),
  programId: z.coerce.number().int().positive().optional(),
  departmentId: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(EnrollmentStatus).optional(),
  isCurrent: z.preprocess((val) => {
    if (val === 'true' || val === true) return true;
    if (val === 'false' || val === false) return false;
    return undefined;
  }, z.boolean().optional()),
  search: z.string().trim().optional(),
});

export type CreateInstitutionProfileInput = z.infer<typeof createInstitutionProfileSchema>;
export type UpdateInstitutionProfileInput = z.infer<typeof updateInstitutionProfileSchema>;
export type CreateInstitutionDepartmentInput = z.infer<typeof createInstitutionDepartmentSchema>;
export type UpdateInstitutionDepartmentInput = z.infer<typeof updateInstitutionDepartmentSchema>;
export type CreateAcademicProgramInput = z.infer<typeof createAcademicProgramSchema>;
export type UpdateAcademicProgramInput = z.infer<typeof updateAcademicProgramSchema>;
export type AcademicProgramQueryInput = z.infer<typeof academicProgramQuerySchema>;
export type CreateAcademicBatchInput = z.infer<typeof createAcademicBatchSchema>;
export type UpdateAcademicBatchInput = z.infer<typeof updateAcademicBatchSchema>;
export type AcademicBatchQueryInput = z.infer<typeof academicBatchQuerySchema>;
export type CreateStudentAcademicEnrollmentInput = z.infer<typeof createStudentAcademicEnrollmentSchema>;
export type UpdateStudentAcademicEnrollmentInput = z.infer<typeof updateStudentAcademicEnrollmentSchema>;
export type StudentAcademicEnrollmentQueryInput = z.infer<typeof studentAcademicEnrollmentQuerySchema>;
export type CreatePlacementInput = z.infer<typeof createPlacementSchema>;
export type UpdatePlacementInput = z.infer<typeof updatePlacementSchema>;
export type CreatePlacementRecordInput = z.infer<typeof createPlacementRecordSchema>;
export type UpdatePlacementRecordInput = z.infer<typeof updatePlacementRecordSchema>;
export type InstitutionQueryInput = z.infer<typeof institutionQuerySchema>;

