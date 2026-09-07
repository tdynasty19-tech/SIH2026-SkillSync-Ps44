// ── Backend-canonical Skill Level Enum ──────────────────────────────────────
export type StudentSkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

// ── Skill Taxonomy (from /api/v1/skills) ────────────────────────────────────
export interface SkillCatalogItem {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  categoryId?: number | null;
  category_id?: number | null; // backend returns snake_case on joined attrs
  isActive?: boolean;
  is_active?: boolean;
}

// ── Student Skill (from /api/v1/students/me/skills) ─────────────────────────
export interface StudentSkill {
  id: number;                    // StudentSkill record id (NOT skillId)
  studentId: number;
  skillId: number;
  level: StudentSkillLevel;
  score: number | null;          // assessment score 0-100
  verified: boolean;
  source: string | null;
  yearsOfExperience: number | null;
  lastAssessedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
  skill: {
    id: number;
    name: string;
    slug: string;
    category_id?: number | null;
    is_active?: boolean;
  };
}

// ── Add/Update Skill DTOs ────────────────────────────────────────────────────
export interface AddStudentSkillDTO {
  skillId: number;
  level?: StudentSkillLevel;
  yearsOfExperience?: number | null;
  source?: string;
}

export interface UpdateStudentSkillDTO {
  level?: StudentSkillLevel;
  yearsOfExperience?: number | null;
}

// ── Skill Gap (from /api/v1/students/me/skill-gaps) ─────────────────────────
export type SkillGapPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type SkillGapStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface SkillGap {
  id: number;
  studentId: number;
  skillId: number;
  targetRoleId: number;
  currentLevel: StudentSkillLevel | null;
  requiredLevel: StudentSkillLevel;
  currentScore: number;
  requiredScore: number;
  gapScore: number;
  priority: SkillGapPriority;
  status: SkillGapStatus;
  skill: {
    id: number;
    name: string;
    slug: string;
  };
  targetRole: {
    id: number;
    title: string;
    slug: string;
  };
}

// ── UI Helpers ────────────────────────────────────────────────────────────────
export const SKILL_LEVEL_SCORE: Record<StudentSkillLevel, number> = {
  BEGINNER: 25,
  INTERMEDIATE: 50,
  ADVANCED: 75,
  EXPERT: 100,
};

export const SKILL_LEVEL_LABELS: Record<StudentSkillLevel, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
};

export const SKILL_LEVELS: StudentSkillLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

// ── Compatibility Interface for Legacy / Matching Utilities ─────────────────
export interface Skill {
  id?: number | string;
  name: string;
  proficiency: number;
  category?: string;
  verified?: boolean;
}
