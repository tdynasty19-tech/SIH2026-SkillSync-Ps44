import { z } from 'zod';
import { StudentSkillLevel } from '../constants/enums';

// ----------------------------------------------------
// Student Profile Schemas
// ----------------------------------------------------
export const createStudentProfileSchema = z.object({
  studentId: z.string().trim().max(50).optional().nullable(),
  headline: z.string().trim().max(255).optional().nullable(),
  bio: z.string().trim().optional().nullable(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional().nullable(),
  gender: z.string().trim().max(20).optional().nullable(),
  location: z.string().trim().max(255).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().max(100).optional().nullable(),
  country: z.string().trim().max(100).optional().nullable(),
  collegeName: z.string().trim().max(255).optional().nullable(),
  department: z.string().trim().max(100).optional().nullable(),
  course: z.string().trim().max(100).optional().nullable(),
  specialization: z.string().trim().max(100).optional().nullable(),
  currentSemester: z.number().int().min(1).max(12).optional().nullable(),
  graduationYear: z.number().int().min(2000).max(2100).optional().nullable(),
  cgpa: z.number().min(0).max(10).optional().nullable(),
  resumeUrl: z.string().url().max(1024).optional().nullable(),
  githubUrl: z.string().url().max(1024).optional().nullable(),
  linkedinUrl: z.string().url().max(1024).optional().nullable(),
  portfolioUrl: z.string().url().max(1024).optional().nullable(),
  careerGoal: z.string().trim().max(255).optional().nullable(),
  availabilityStatus: z.string().trim().max(50).optional().nullable(),
});

export const updateStudentProfileSchema = createStudentProfileSchema.partial();

// ----------------------------------------------------
// Education Schemas
// ----------------------------------------------------
export const createEducationSchema = z.object({
  institutionName: z.string().trim().min(1, 'Institution name is required').max(255),
  degree: z.string().trim().min(1, 'Degree is required').max(100),
  fieldOfStudy: z.string().trim().min(1, 'Field of study is required').max(100),
  startYear: z.number().int().min(1950).max(2100),
  endYear: z.number().int().min(1950).max(2100).optional().nullable(),
  grade: z.string().trim().max(50).optional().nullable(),
  description: z.string().trim().optional().nullable(),
});

export const updateEducationSchema = createEducationSchema.partial();

// ----------------------------------------------------
// Skill Schemas
// ----------------------------------------------------
export const createStudentSkillSchema = z.object({
  skillId: z.number().int().positive('Valid skillId is required'),
  level: z.nativeEnum(StudentSkillLevel).default(StudentSkillLevel.BEGINNER),
  yearsOfExperience: z.number().min(0).max(50).optional().nullable(),
  source: z.string().trim().max(50).optional().nullable(),
});

export const updateStudentSkillSchema = z.object({
  level: z.nativeEnum(StudentSkillLevel).optional(),
  yearsOfExperience: z.number().min(0).max(50).optional().nullable(),
});

// ----------------------------------------------------
// Certification Schemas
// ----------------------------------------------------
export const createCertificationSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255),
  issuingOrganization: z.string().trim().min(1, 'Issuing organization is required').max(255),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Issue date must be YYYY-MM-DD'),
  expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expiration date must be YYYY-MM-DD').optional().nullable(),
  credentialId: z.string().trim().max(255).optional().nullable(),
  credentialUrl: z.string().url().max(1024).optional().nullable(),
});

export const updateCertificationSchema = createCertificationSchema.partial();

// ----------------------------------------------------
// Experience Schemas
// ----------------------------------------------------
export const createExperienceSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255),
  companyName: z.string().trim().min(1, 'Company name is required').max(255),
  location: z.string().trim().max(255).optional().nullable(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD').optional().nullable(),
  isCurrent: z.boolean().default(false),
  description: z.string().trim().optional().nullable(),
});

export const updateExperienceSchema = createExperienceSchema.partial();

// ----------------------------------------------------
// Achievement Schemas
// ----------------------------------------------------
export const createAchievementSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255),
  description: z.string().trim().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional().nullable(),
});

export const updateAchievementSchema = createAchievementSchema.partial();

// ----------------------------------------------------
// Interest Schemas
// ----------------------------------------------------
export const createInterestSchema = z.object({
  interestArea: z.string().trim().min(1, 'Interest area is required').max(100),
});

export const updateInterestSchema = createInterestSchema.partial();

// ----------------------------------------------------
// Language Schemas
// ----------------------------------------------------
export const createLanguageSchema = z.object({
  language: z.string().trim().min(1, 'Language is required').max(50),
  proficiency: z.string().trim().max(50).optional().default('Proficient'),
});

export const updateLanguageSchema = z.object({
  language: z.string().trim().min(1).max(50).optional(),
  proficiency: z.string().trim().max(50).optional(),
});

// ----------------------------------------------------
// Portfolio Schemas
// ----------------------------------------------------
export const createPortfolioSchema = z.object({
  customDomain: z.string().trim().max(255).optional().nullable(),
  theme: z.string().trim().max(50).optional().default('modern'),
  isPublished: z.boolean().optional().default(false),
});

export const updatePortfolioSchema = createPortfolioSchema.partial();

export const createPortfolioProjectSchema = z.object({
  title: z.string().trim().min(1, 'Project title is required').max(255),
  description: z.string().trim().min(1, 'Project description is required'),
  projectUrl: z.string().url().max(1024).optional().nullable(),
  githubUrl: z.string().url().max(1024).optional().nullable(),
  technologies: z.string().trim().max(500).optional().nullable(),
});

export const updatePortfolioProjectSchema = createPortfolioProjectSchema.partial();

// Pagination Query Schema
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateStudentProfileInput = z.infer<typeof createStudentProfileSchema>;
export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type CreateEducationInput = z.infer<typeof createEducationSchema>;
export type UpdateEducationInput = z.infer<typeof updateEducationSchema>;
export type CreateStudentSkillInput = z.input<typeof createStudentSkillSchema>;
export type UpdateStudentSkillInput = z.input<typeof updateStudentSkillSchema>;
export type CreateCertificationInput = z.input<typeof createCertificationSchema>;
export type UpdateCertificationInput = z.input<typeof updateCertificationSchema>;
export type CreateExperienceInput = z.input<typeof createExperienceSchema>;
export type UpdateExperienceInput = z.input<typeof updateExperienceSchema>;
export type CreateAchievementInput = z.input<typeof createAchievementSchema>;
export type UpdateAchievementInput = z.input<typeof updateAchievementSchema>;
export type CreateInterestInput = z.input<typeof createInterestSchema>;
export type UpdateInterestInput = z.input<typeof updateInterestSchema>;
export type CreateLanguageInput = z.input<typeof createLanguageSchema>;
export type UpdateLanguageInput = z.input<typeof updateLanguageSchema>;
export type CreatePortfolioInput = z.input<typeof createPortfolioSchema>;
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>;
export type CreatePortfolioProjectInput = z.infer<typeof createPortfolioProjectSchema>;
export type UpdatePortfolioProjectInput = z.infer<typeof updatePortfolioProjectSchema>;
