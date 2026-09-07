export type OpportunityKind = 'JOB' | 'INTERNSHIP' | 'PROJECT';

export type WorkplaceType = 'ON_SITE' | 'REMOTE' | 'HYBRID';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';

export type OpportunityStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'ARCHIVED' | 'CANCELLED';

export interface IndustrySummary {
  id: number;
  companyName: string;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  verified?: boolean;
}

export interface InstitutionSummary {
  id: number;
  institutionName: string;
  code?: string | null;
  location?: string | null;
}

export interface JobItem {
  id: number;
  industryId: number;
  title: string;
  description: string;
  requirements?: string | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  salaryMin?: number | string | null;
  salaryMax?: number | string | null;
  applicationDeadline?: string | null;
  openings: number;
  status: OpportunityStatus;
  createdAt: string;
  updatedAt: string;
  industry?: IndustrySummary | null;
}

export interface InternshipItem {
  id: number;
  industryId: number;
  title: string;
  description: string;
  requirements?: string | null;
  durationMonths: number;
  stipend?: number | string | null;
  workplaceType: WorkplaceType;
  location?: string | null;
  openings: number;
  applicationDeadline?: string | null;
  startDate?: string | null;
  status: OpportunityStatus;
  createdAt: string;
  updatedAt: string;
  industry?: IndustrySummary | null;
}

export interface ProjectItem {
  id: number;
  industryId: number;
  title: string;
  description: string;
  deliverables?: string | null;
  durationWeeks?: number | null;
  budget?: number | string | null;
  status: OpportunityStatus;
  createdAt: string;
  updatedAt: string;
  industry?: IndustrySummary | null;
}

export interface FacultyOpportunityItem {
  id: number;
  institutionId?: number | null;
  industryId?: number | null;
  title: string;
  description: string;
  department: string;
  eligibility?: string | null;
  applicationDeadline?: string | null;
  status: OpportunityStatus;
  createdAt: string;
  updatedAt: string;
  institution?: InstitutionSummary | null;
  industry?: IndustrySummary | null;
}

export interface ResearchOpportunityItem {
  id: number;
  institutionId?: number | null;
  industryId?: number | null;
  title: string;
  fieldOfStudy: string;
  description: string;
  fundingAmount?: number | string | null;
  durationMonths?: number | null;
  status: OpportunityStatus;
  createdAt: string;
  updatedAt: string;
  institution?: InstitutionSummary | null;
  industry?: IndustrySummary | null;
}

// ── Unified Adapter for Frontend Listings ────────────────────────────────────
export interface UnifiedOpportunity {
  id: number;
  kind: OpportunityKind;
  title: string;
  description: string;
  requirements?: string | null;
  companyName: string;
  companyId?: number;
  location: string;
  workplaceType: WorkplaceType;
  compensation?: string | null;
  duration?: string | null;
  applicationDeadline?: string | null;
  openings?: number;
  status: OpportunityStatus;
  createdAt: string;
  matchScore?: number;
}

// ── Query DTOs ────────────────────────────────────────────────────────────────
export interface OpportunityFilterParams {
  search?: string;
  kind?: OpportunityKind | 'ALL';
  workplaceType?: WorkplaceType | 'ALL';
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ── Create DTOs ──────────────────────────────────────────────────────────────
export interface CreateJobDTO {
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  city?: string;
  state?: string;
  workplaceType: WorkplaceType;
  employmentType?: EmploymentType;
  salaryMin?: number;
  salaryMax?: number;
  applicationDeadline?: string;
  openings?: number;
  status?: OpportunityStatus;
}

export interface CreateInternshipDTO {
  title: string;
  description: string;
  requirements?: string;
  durationMonths: number;
  stipend?: number;
  workplaceType: WorkplaceType;
  location?: string;
  openings?: number;
  applicationDeadline?: string;
  startDate?: string;
  status?: OpportunityStatus;
}

export interface CreateProjectDTO {
  title: string;
  description: string;
  deliverables?: string;
  durationWeeks?: number;
  budget?: number;
  status?: OpportunityStatus;
}

export interface CreateFacultyOpportunityDTO {
  title: string;
  description: string;
  department: string;
  eligibility?: string;
  applicationDeadline?: string;
  status?: OpportunityStatus;
}

export interface CreateResearchOpportunityDTO {
  title: string;
  fieldOfStudy: string;
  description: string;
  fundingAmount?: number;
  durationMonths?: number;
  status?: OpportunityStatus;
}

// Legacy compatibility
export type OpportunityType = 'job' | 'internship' | 'project';
export interface Opportunity {
  id: string | number;
  title: string;
  companyId?: string | number;
  companyName: string;
  type: OpportunityType;
  location: string;
  isRemote?: boolean;
  workplaceType?: WorkplaceType;
  stipend?: string;
  salary?: string;
  description: string;
  requiredSkills?: { name: string; level: number }[];
  matchScore?: number;
  postedAt?: string;
  deadline?: string;
  applicantsCount?: number;
}
