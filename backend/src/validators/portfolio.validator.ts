import { z } from 'zod';

export const createPortfolioSchema = z.object({
  customDomain: z.string().trim().max(255).optional().nullable(),
  theme: z.string().trim().max(50).optional(),
  isPublished: z.boolean().optional(),
});

export const updatePortfolioSchema = createPortfolioSchema.partial();

export const createPortfolioProjectSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().trim().min(5, 'Description must be at least 5 characters'),
  role: z.string().trim().max(100).optional().nullable(),
  technologies: z.string().trim().max(500).optional().nullable(),
  projectUrl: z.string().trim().url('Invalid project URL').max(1024).optional().nullable().or(z.literal('')),
  githubUrl: z.string().trim().url('Invalid GitHub URL').max(1024).optional().nullable().or(z.literal('')),
  order: z.coerce.number().int().min(0).optional(),
});

export const updatePortfolioProjectSchema = createPortfolioProjectSchema.partial();

export const createPortfolioCertificationSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
  issuer: z.string().trim().min(2, 'Issuer must be at least 2 characters').max(200),
  issueDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Issue date must be YYYY-MM-DD'),
  credentialUrl: z.string().trim().url('Invalid credential URL').max(1024).optional().nullable().or(z.literal('')),
  order: z.coerce.number().int().min(0).optional(),
});

export const updatePortfolioCertificationSchema = createPortfolioCertificationSchema.partial();

export const createPortfolioAchievementSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional().nullable(),
  order: z.coerce.number().int().min(0).optional(),
});

export const updatePortfolioAchievementSchema = createPortfolioAchievementSchema.partial();

export const createPortfolioExperienceSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(150),
  organization: z.string().trim().min(2, 'Organization must be at least 2 characters').max(200),
  startDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  endDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD').optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  order: z.coerce.number().int().min(0).optional(),
});

export const updatePortfolioExperienceSchema = createPortfolioExperienceSchema.partial();

export const createPortfolioDocumentSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(200),
  documentUrl: z.string().trim().url('Invalid document URL').max(1024).or(z.string().trim().startsWith('/')),
  order: z.coerce.number().int().min(0).optional(),
});

export const updatePortfolioDocumentSchema = createPortfolioDocumentSchema.partial();

export const portfolioQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreatePortfolioInput = z.infer<typeof createPortfolioSchema>;
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>;
export type CreatePortfolioProjectInput = z.infer<typeof createPortfolioProjectSchema>;
export type UpdatePortfolioProjectInput = z.infer<typeof updatePortfolioProjectSchema>;
export type CreatePortfolioCertificationInput = z.infer<typeof createPortfolioCertificationSchema>;
export type UpdatePortfolioCertificationInput = z.infer<typeof updatePortfolioCertificationSchema>;
export type CreatePortfolioAchievementInput = z.infer<typeof createPortfolioAchievementSchema>;
export type UpdatePortfolioAchievementInput = z.infer<typeof updatePortfolioAchievementSchema>;
export type CreatePortfolioExperienceInput = z.infer<typeof createPortfolioExperienceSchema>;
export type UpdatePortfolioExperienceInput = z.infer<typeof updatePortfolioExperienceSchema>;
export type CreatePortfolioDocumentInput = z.infer<typeof createPortfolioDocumentSchema>;
export type UpdatePortfolioDocumentInput = z.infer<typeof updatePortfolioDocumentSchema>;
