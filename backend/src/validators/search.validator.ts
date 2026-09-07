import { z } from 'zod';

export enum SearchCategory {
  JOBS = 'jobs',
  INTERNSHIPS = 'internships',
  PROJECTS = 'projects',
  LEARNING_PROGRAMS = 'learningPrograms',
  MENTORS = 'mentors',
  SKILLS = 'skills',
  CAREER_ROLES = 'careerRoles',
  COMPANIES = 'companies',
  INSTITUTIONS = 'institutions',
}

export const globalSearchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, 'Search query cannot be empty')
    .max(200, 'Search query is too long (maximum 200 characters)'),
  type: z.nativeEnum(SearchCategory).optional(),
  page: z.coerce
    .number()
    .int('Page must be an integer')
    .min(1, 'Page must be greater than or equal to 1')
    .default(1),
  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
});

export type GlobalSearchQuery = z.infer<typeof globalSearchQuerySchema>;

export interface SearchResultItem {
  id: number;
  type: SearchCategory;
  title: string;
  description: string | null;
  location?: string | null;
  metadata?: Record<string, any>;
  createdAt?: Date;
}

export interface SearchResponseData {
  query: string;
  type: SearchCategory | 'all';
  results: SearchResultItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
