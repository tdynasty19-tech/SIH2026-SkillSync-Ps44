import { z } from 'zod';
import { OpportunityStatus, WorkplaceType, EmploymentType } from '../constants/enums';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// ----------------------------------------------------
// 1. Job Validation Schemas
// ----------------------------------------------------
export const createJobSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  requirements: z.string().trim().optional(),
  location: z.string().trim().max(255).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  workplaceType: z.nativeEnum(WorkplaceType).default(WorkplaceType.ON_SITE),
  employmentType: z.nativeEnum(EmploymentType).default(EmploymentType.FULL_TIME),
  salaryMin: z.number().nonnegative().optional(),
  salaryMax: z.number().nonnegative().optional(),
  applicationDeadline: z.string().regex(dateRegex, 'Date format must be YYYY-MM-DD').optional(),
  openings: z.number().int().positive().default(1),
  status: z.nativeEnum(OpportunityStatus).default(OpportunityStatus.OPEN),
});

export const updateJobSchema = createJobSchema.partial();

export const jobQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.nativeEnum(OpportunityStatus).optional(),
  workplaceType: z.nativeEnum(WorkplaceType).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  location: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ----------------------------------------------------
// 2. Internship Validation Schemas
// ----------------------------------------------------
export const createInternshipSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  requirements: z.string().trim().optional(),
  durationMonths: z.number().int().positive().default(3),
  stipend: z.number().nonnegative().optional(),
  workplaceType: z.nativeEnum(WorkplaceType).default(WorkplaceType.ON_SITE),
  location: z.string().trim().max(255).optional(),
  openings: z.number().int().positive().default(1),
  applicationDeadline: z.string().regex(dateRegex, 'Date format must be YYYY-MM-DD').optional(),
  startDate: z.string().regex(dateRegex, 'Date format must be YYYY-MM-DD').optional(),
  status: z.nativeEnum(OpportunityStatus).default(OpportunityStatus.OPEN),
});

export const updateInternshipSchema = createInternshipSchema.partial();

export const internshipQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.nativeEnum(OpportunityStatus).optional(),
  workplaceType: z.nativeEnum(WorkplaceType).optional(),
  location: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ----------------------------------------------------
// 3. Project Validation Schemas
// ----------------------------------------------------
export const createProjectSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  deliverables: z.string().trim().optional(),
  durationWeeks: z.number().int().positive().optional(),
  budget: z.number().nonnegative().optional(),
  status: z.nativeEnum(OpportunityStatus).default(OpportunityStatus.OPEN),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.nativeEnum(OpportunityStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ----------------------------------------------------
// 4. Learning Program Validation Schemas
// ----------------------------------------------------
export const createLearningProgramSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  curriculum: z.string().trim().optional(),
  durationHours: z.number().int().positive().optional(),
  mode: z.string().trim().default('ONLINE'),
  cost: z.number().nonnegative().default(0.0),
  status: z.nativeEnum(OpportunityStatus).default(OpportunityStatus.OPEN),
});

export const updateLearningProgramSchema = createLearningProgramSchema.partial();

export const learningProgramQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.nativeEnum(OpportunityStatus).optional(),
  mode: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ----------------------------------------------------
// 5. Faculty Opportunity Validation Schemas
// ----------------------------------------------------
export const createFacultyOpportunitySchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  department: z.string().trim().min(2, 'Department is required').max(100),
  eligibility: z.string().trim().optional(),
  applicationDeadline: z.string().regex(dateRegex, 'Date format must be YYYY-MM-DD').optional(),
  status: z.nativeEnum(OpportunityStatus).default(OpportunityStatus.OPEN),
});

export const updateFacultyOpportunitySchema = createFacultyOpportunitySchema.partial();

export const facultyOpportunityQuerySchema = z.object({
  search: z.string().trim().optional(),
  department: z.string().trim().optional(),
  status: z.nativeEnum(OpportunityStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ----------------------------------------------------
// 6. FDP Validation Schemas
// ----------------------------------------------------
export const createFDPSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  startDate: z.string().regex(dateRegex, 'startDate format must be YYYY-MM-DD'),
  endDate: z.string().regex(dateRegex, 'endDate format must be YYYY-MM-DD'),
  mode: z.string().trim().default('ONLINE'),
  venue: z.string().trim().max(255).optional(),
  status: z.nativeEnum(OpportunityStatus).default(OpportunityStatus.OPEN),
});

export const updateFDPSchema = createFDPSchema.partial();

export const fdpQuerySchema = z.object({
  search: z.string().trim().optional(),
  mode: z.string().trim().optional(),
  status: z.nativeEnum(OpportunityStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ----------------------------------------------------
// 7. Research Opportunity Validation Schemas
// ----------------------------------------------------
export const createResearchOpportunitySchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
  fieldOfStudy: z.string().trim().min(2, 'fieldOfStudy is required').max(150),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  fundingAmount: z.number().nonnegative().optional(),
  durationMonths: z.number().int().positive().optional(),
  status: z.nativeEnum(OpportunityStatus).default(OpportunityStatus.OPEN),
});

export const updateResearchOpportunitySchema = createResearchOpportunitySchema.partial();

export const researchOpportunityQuerySchema = z.object({
  search: z.string().trim().optional(),
  fieldOfStudy: z.string().trim().optional(),
  status: z.nativeEnum(OpportunityStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ----------------------------------------------------
// 8. Consultancy Opportunity Validation Schemas
// ----------------------------------------------------
export const createConsultancyOpportunitySchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
  domain: z.string().trim().min(2, 'domain is required').max(150),
  problemStatement: z.string().trim().min(10, 'problemStatement must be at least 10 characters'),
  expectedOutcome: z.string().trim().optional(),
  budget: z.number().nonnegative().optional(),
  status: z.nativeEnum(OpportunityStatus).default(OpportunityStatus.OPEN),
});

export const updateConsultancyOpportunitySchema = createConsultancyOpportunitySchema.partial();

export const consultancyOpportunityQuerySchema = z.object({
  search: z.string().trim().optional(),
  domain: z.string().trim().optional(),
  status: z.nativeEnum(OpportunityStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Type exports
export type CreateJobInput = z.input<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type JobQueryInput = z.infer<typeof jobQuerySchema>;

export type CreateInternshipInput = z.input<typeof createInternshipSchema>;
export type UpdateInternshipInput = z.infer<typeof updateInternshipSchema>;
export type InternshipQueryInput = z.infer<typeof internshipQuerySchema>;

export type CreateProjectInput = z.input<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;

export type CreateLearningProgramInput = z.input<typeof createLearningProgramSchema>;
export type UpdateLearningProgramInput = z.infer<typeof updateLearningProgramSchema>;
export type LearningProgramQueryInput = z.infer<typeof learningProgramQuerySchema>;

export type CreateFacultyOpportunityInput = z.input<typeof createFacultyOpportunitySchema>;
export type UpdateFacultyOpportunityInput = z.infer<typeof updateFacultyOpportunitySchema>;
export type FacultyOpportunityQueryInput = z.infer<typeof facultyOpportunityQuerySchema>;

export type CreateFDPInput = z.input<typeof createFDPSchema>;
export type UpdateFDPInput = z.infer<typeof updateFDPSchema>;
export type FDPQueryInput = z.infer<typeof fdpQuerySchema>;

export type CreateResearchOpportunityInput = z.input<typeof createResearchOpportunitySchema>;
export type UpdateResearchOpportunityInput = z.infer<typeof updateResearchOpportunitySchema>;
export type ResearchOpportunityQueryInput = z.infer<typeof researchOpportunityQuerySchema>;

export type CreateConsultancyOpportunityInput = z.input<typeof createConsultancyOpportunitySchema>;
export type UpdateConsultancyOpportunityInput = z.infer<typeof updateConsultancyOpportunitySchema>;
export type ConsultancyOpportunityQueryInput = z.infer<typeof consultancyOpportunityQuerySchema>;
