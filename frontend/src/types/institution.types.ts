import { User } from './auth.types';

export interface Institution extends User {
  role: 'institution';
  institutionName: string;
  type: 'university' | 'college' | 'institute';
  accreditation: string;
  location: string;
  website: string;
}

export type DegreeLevel = 'DIPLOMA' | 'UNDERGRADUATE' | 'POSTGRADUATE' | 'DOCTORAL' | 'CERTIFICATE';

export type EnrollmentStatus = 'ENROLLED' | 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'SUSPENDED';

export interface AcademicProgram {
  id: number;
  institutionId: number;
  departmentId: number;
  programName: string;
  programCode?: string | null;
  degreeLevel: DegreeLevel;
  durationYears: number;
  totalSemesters: number;
  description?: string | null;
  isActive: boolean;
  department?: {
    id: number;
    departmentName: string;
    departmentCode?: string | null;
  };
  institution?: {
    id: number;
    institutionName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAcademicProgramDTO {
  departmentId: number;
  programName: string;
  programCode?: string;
  degreeLevel?: DegreeLevel;
  durationYears?: number;
  totalSemesters?: number;
  description?: string;
}

export interface UpdateAcademicProgramDTO {
  programName?: string;
  programCode?: string;
  degreeLevel?: DegreeLevel;
  durationYears?: number;
  totalSemesters?: number;
  description?: string;
  isActive?: boolean;
}

export interface AcademicBatch {
  id: number;
  institutionId: number;
  departmentId: number;
  programId: number;
  batchName: string;
  startYear: number;
  endYear: number;
  currentSemester: number;
  isActive: boolean;
  department?: {
    id: number;
    departmentName: string;
    departmentCode?: string | null;
  };
  program?: {
    id: number;
    programName: string;
    degreeLevel: DegreeLevel;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAcademicBatchDTO {
  programId: number;
  batchName: string;
  startYear: number;
  endYear: number;
  currentSemester?: number;
}

export interface UpdateAcademicBatchDTO {
  batchName?: string;
  startYear?: number;
  endYear?: number;
  currentSemester?: number;
  isActive?: boolean;
}

export interface StudentAcademicEnrollment {
  id: number;
  studentId: number;
  institutionId: number;
  departmentId: number;
  programId: number;
  batchId: number;
  enrollmentNumber: string;
  rollNumber?: string | null;
  status: EnrollmentStatus;
  currentSemester: number;
  isCurrent: boolean;
  enrolledAt: string;
  completedAt?: string | null;
  student?: {
    id: number;
    userId: number;
    studentId?: string | null;
    user?: { id: number; firstName: string; lastName: string; email: string };
  };
  department?: {
    id: number;
    departmentName: string;
  };
  program?: {
    id: number;
    programName: string;
    degreeLevel: DegreeLevel;
  };
  batch?: {
    id: number;
    batchName: string;
    startYear: number;
    endYear: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface EnrollStudentDTO {
  studentId: number;
  batchId: number;
  enrollmentNumber: string;
  rollNumber?: string;
  currentSemester?: number;
}

export interface UpdateEnrollmentDTO {
  rollNumber?: string;
  status?: EnrollmentStatus;
  currentSemester?: number;
  isCurrent?: boolean;
}

export interface StudentAcademicContext {
  enrollment: StudentAcademicEnrollment | null;
  institution: {
    id: number;
    institutionName: string;
    institutionType: string;
    city?: string | null;
    state?: string | null;
  } | null;
  department: {
    id: number;
    departmentName: string;
    departmentCode?: string | null;
  } | null;
  program: {
    id: number;
    programName: string;
    degreeLevel: DegreeLevel;
    durationYears: number;
    totalSemesters: number;
  } | null;
  batch: {
    id: number;
    batchName: string;
    startYear: number;
    endYear: number;
    currentSemester: number;
  } | null;
}
