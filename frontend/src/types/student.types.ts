// ── Student Compatibility Interface (for mock/legacy utilities) ─────────────
export interface Student {
  id: number | string;
  email?: string;
  role?: string;
  name?: string;
  institutionId?: number | string;
  institutionName?: string;
  degree?: string;
  major?: string;
  graduationYear?: number | null;
  bio?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  createdAt?: string;
  skills?: any[];
  [key: string]: any;
}

// ── Student Profile (from /api/v1/students/me/profile) ──────────────────────
export interface StudentProfile {
  id: number;
  userId: number;
  studentId?: string | null;
  headline?: string | null;
  bio?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  institutionId?: number | null;
  departmentId?: number | null;
  collegeName?: string | null;
  department?: string | null;
  course?: string | null;
  specialization?: string | null;
  currentSemester?: number | null;
  graduationYear?: number | null;
  cgpa?: number | null;
  resumeUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  careerGoal?: string | null;
  availabilityStatus?: string | null;
  profileCompletion?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ── Create/Update Profile DTOs ───────────────────────────────────────────────
export type CreateStudentProfileDTO = Partial<Omit<StudentProfile, 'id' | 'userId' | 'profileCompletion' | 'createdAt' | 'updatedAt'>>;
export type UpdateStudentProfileDTO = CreateStudentProfileDTO;

// ── Education ────────────────────────────────────────────────────────────────
export interface StudentEducation {
  id: number;
  studentId: number;
  institutionName: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number | null;
  grade?: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEducationDTO {
  institutionName: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number | null;
  grade?: string | null;
  description?: string | null;
}

export type UpdateEducationDTO = Partial<CreateEducationDTO>;

// ── Dashboard Analytics ──────────────────────────────────────────────────────
export interface StudentDashboardData {
  profile?: {
    id: number;
    headline?: string | null;
    profileCompletion?: number;
  } | null;
  skillsCount?: number;
  verifiedSkillsCount?: number;
  assessmentsCount?: number;
  skillGapsCount?: number;
  openGapsCount?: number;
  recentAttempts?: Array<{
    id: number;
    assessmentId: number;
    status: string;
    percentage?: number | null;
    completedAt?: string | null;
    assessment?: { title: string } | null;
  }>;
}
