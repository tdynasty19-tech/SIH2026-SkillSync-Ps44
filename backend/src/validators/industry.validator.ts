import { z } from 'zod';

export const createIndustryProfileSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name must be at least 2 characters').max(255),
  cin: z.string().trim().max(50, 'CIN cannot exceed 50 characters').optional(),
  industryType: z.string().trim().min(2, 'Industry type must be at least 2 characters').max(100),
  websiteUrl: z
    .string()
    .trim()
    .url('Website URL must be a valid URL')
    .max(1024, 'Website URL cannot exceed 1024 characters')
    .optional()
    .or(z.literal('')),
  location: z.string().trim().max(255, 'Location cannot exceed 255 characters').optional(),
  city: z.string().trim().max(100, 'City cannot exceed 100 characters').optional(),
  state: z.string().trim().max(100, 'State cannot exceed 100 characters').optional(),
  country: z.string().trim().max(100, 'Country cannot exceed 100 characters').optional(),
  description: z.string().trim().optional(),
});

export const updateIndustryProfileSchema = createIndustryProfileSchema.partial();

export const createIndustryContactSchema = z.object({
  name: z.string().trim().min(2, 'Contact name must be at least 2 characters').max(150),
  designation: z.string().trim().max(100, 'Designation cannot exceed 100 characters').optional(),
  email: z.string().trim().email('Invalid contact email format').max(255),
  phone: z.string().trim().max(20, 'Phone number cannot exceed 20 characters').optional(),
  isPrimary: z.boolean().default(false),
});

export const updateIndustryContactSchema = createIndustryContactSchema.partial();

export const industryContactQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateIndustryProfileInput = z.infer<typeof createIndustryProfileSchema>;
export type UpdateIndustryProfileInput = z.infer<typeof updateIndustryProfileSchema>;
export type CreateIndustryContactInput = z.infer<typeof createIndustryContactSchema>;
export type UpdateIndustryContactInput = z.infer<typeof updateIndustryContactSchema>;
export type IndustryContactQueryInput = z.infer<typeof industryContactQuerySchema>;
