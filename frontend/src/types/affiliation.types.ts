export type StudentAffiliationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface AffiliationInstitution {
  id: number;
  institutionName: string;
  institutionType: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

export interface AffiliationDepartment {
  id: number;
  institutionId: number;
  departmentName: string;
  departmentCode?: string | null;
}

export interface StudentInstitutionAffiliation {
  id: number;
  studentId: number;
  institutionId: number;
  departmentId: number;
  enrollmentNumber: string;
  status: StudentAffiliationStatus;
  requestedAt: string;
  reviewedAt?: string | null;
  reviewedByUserId?: number | null;
  rejectionReason?: string | null;
  institution?: AffiliationInstitution;
  department?: AffiliationDepartment;
  student?: {
    id: number;
    userId: number;
    studentId?: string | null;
    collegeName?: string | null;
    department?: string | null;
    course?: string | null;
    specialization?: string | null;
    user?: { id: number; firstName: string; lastName: string; email: string };
  };
}

export interface AffiliationListResponse {
  affiliations: StudentInstitutionAffiliation[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}
