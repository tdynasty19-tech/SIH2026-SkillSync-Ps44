// ── Assessment Question (safe — no correctAnswer) ────────────────────────────
export type QuestionType = 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'CODING' | 'SHORT_ANSWER';

export interface AssessmentQuestion {
  id: number;
  question: string;
  questionText: string;
  questionType: QuestionType;
  options: string[];   // JSON array of option strings
  points: number;
}

// ── Assessment Catalogue Item ─────────────────────────────────────────────────
export interface Assessment {
  id: number;
  title: string;
  description?: string | null;
  skillId: number;
  difficulty: string;
  durationMinutes: number;
  totalQuestions: number;
  passingScore: number;
  isActive?: boolean;
  skill?: { id: number; name: string; slug: string } | null;
}

// ── Full Assessment Detail (includes questions) ───────────────────────────────
export interface AssessmentDetail extends Assessment {
  questions: AssessmentQuestion[];
}

// ── Attempt Status ────────────────────────────────────────────────────────────
export type AssessmentAttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

// ── Attempt returned after startAttempt / getAttempt ─────────────────────────
export interface AssessmentAttempt {
  id: number;
  assessmentId: number;
  studentId: number;
  status: AssessmentAttemptStatus;
  score: number | null;
  percentage: number | null;
  startedAt: string;
  completedAt: string | null;
}

// ── Result from submitAttempt ─────────────────────────────────────────────────
export interface AssessmentResult {
  attemptId: number;
  assessmentId: number;
  assessmentTitle: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passingScore: number;
  passed: boolean;
  level: string;
  status: AssessmentAttemptStatus;
  completedAt: string;
}

// ── Submit Payload ────────────────────────────────────────────────────────────
export interface SubmitAnswerItem {
  questionId: number;   // numeric — backend validates against assessment questions
  answer: string;
}

export interface SubmitAssessmentPayload {
  answers: SubmitAnswerItem[];
}
