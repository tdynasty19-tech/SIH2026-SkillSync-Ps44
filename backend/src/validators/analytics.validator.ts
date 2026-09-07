import { z } from 'zod';
import { OpportunityType, ApplicationStatus } from '../constants/enums';

export const dateRangeFilterSchema = z
  .object({
    from: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    to: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  })
  .refine(
    (data) => {
      if (data.from && data.to) {
        return new Date(data.from) <= new Date(data.to);
      }
      return true;
    },
    {
      message: "'from' date must be earlier than or equal to 'to' date",
      path: ['from'],
    }
  );

export const studentSkillAnalyticsQuerySchema = z.object({
  studentId: z.coerce.number().int().positive().optional(),
});

export const institutionAnalyticsQuerySchema = dateRangeFilterSchema.and(
  z.object({
    institutionId: z.coerce.number().int().positive().optional(),
    departmentId: z.coerce.number().int().positive().optional(),
    academicYear: z.string().trim().optional(),
  })
);

export const industryHiringAnalyticsQuerySchema = dateRangeFilterSchema.and(
  z.object({
    industryId: z.coerce.number().int().positive().optional(),
    opportunityType: z.nativeEnum(OpportunityType).optional(),
  })
);

export const applicationAnalyticsQuerySchema = dateRangeFilterSchema.and(
  z.object({
    opportunityType: z.nativeEnum(OpportunityType).optional(),
    status: z.nativeEnum(ApplicationStatus).optional(),
    opportunityId: z.coerce.number().int().positive().optional(),
  })
);

export const skillDemandAnalyticsQuerySchema = dateRangeFilterSchema.and(
  z.object({
    opportunityType: z.nativeEnum(OpportunityType).optional(),
    industryId: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
);

export type DateRangeFilter = z.infer<typeof dateRangeFilterSchema>;
export type StudentSkillAnalyticsQuery = z.infer<typeof studentSkillAnalyticsQuerySchema>;
export type InstitutionAnalyticsQuery = z.infer<typeof institutionAnalyticsQuerySchema>;
export type IndustryHiringAnalyticsQuery = z.infer<typeof industryHiringAnalyticsQuerySchema>;
export type ApplicationAnalyticsQuery = z.infer<typeof applicationAnalyticsQuerySchema>;
export type SkillDemandAnalyticsQuery = z.infer<typeof skillDemandAnalyticsQuerySchema>;
