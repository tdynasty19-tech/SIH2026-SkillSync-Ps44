export type BackendApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'REJECTED';

export type OpportunityType =
  | 'JOB'
  | 'INTERNSHIP'
  | 'PROJECT'
  | 'LEARNING_PROGRAM'
  | 'FACULTY_OPPORTUNITY'
  | 'FDP'
  | 'RESEARCH_OPPORTUNITY'
  | 'CONSULTANCY_OPPORTUNITY';

export interface ApplicationStatusHistory {
  id: number;
  applicationId: number;
  fromStatus: BackendApplicationStatus | null;
  toStatus: BackendApplicationStatus;
  changedByUserId: number;
  reason?: string | null;
  createdAt: string;
}

export interface ApplicationItem {
  id: number;
  studentId: number;
  opportunityId: number;
  opportunityType: OpportunityType;
  status: BackendApplicationStatus;
  coverLetter?: string | null;
  resumeUrl?: string | null;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
  opportunity?: {
    id: number;
    title: string;
    status: string;
    industry?: {
      id: number;
      companyName: string;
      location?: string;
      city?: string;
      state?: string;
    } | null;
    institution?: {
      id: number;
      institutionName: string;
    } | null;
  } | null;
  student?: {
    id: number;
    userId: number;
    studentId?: string | null;
    headline?: string | null;
    city?: string | null;
    state?: string | null;
    user?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  } | null;
  statusHistory?: ApplicationStatusHistory[];
}

export interface SubmitApplicationDTO {
  opportunityId: number;
  opportunityType: OpportunityType;
  coverLetter?: string;
  resumeUrl?: string;
}

export interface UpdateApplicationStatusDTO {
  status: BackendApplicationStatus;
  reason?: string;
}

export interface ApplicationQueryDTO {
  status?: BackendApplicationStatus;
  opportunityType?: OpportunityType;
  page?: number;
  limit?: number;
}

export interface PaginatedApplications {
  applications: ApplicationItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ── Helpers & Mappings ────────────────────────────────────────────────────────
export const STATUS_LABELS: Record<BackendApplicationStatus, string> = {
  APPLIED: 'Applied',
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interviewing',
  SELECTED: 'Selected',
  REJECTED: 'Not Selected',
};

export const STATUS_BADGE_CLASSES: Record<BackendApplicationStatus, string> = {
  APPLIED: 'bg-blue-50 text-blue-700 border-blue-200',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  SHORTLISTED: 'bg-purple-50 text-purple-700 border-purple-200',
  INTERVIEW: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  SELECTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const ALLOWED_TRANSITIONS: Record<BackendApplicationStatus, BackendApplicationStatus[]> = {
  APPLIED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['SELECTED', 'REJECTED'],
  SELECTED: [],
  REJECTED: [],
};
