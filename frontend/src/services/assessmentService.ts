import { apiClient } from './apiClient';
import { ApiResponse } from '../types/auth.types';
import {
  Assessment,
  AssessmentDetail,
  AssessmentQuestion,
  AssessmentAttempt,
  AssessmentResult,
  SubmitAssessmentPayload,
} from '../types/assessment.types';

interface AssessmentsResponse {
  assessments: Assessment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface AttemptsResponse {
  attempts: AssessmentAttempt[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const normalizeQuestions = (rawQuestions: any[]): AssessmentQuestion[] => {
  return (rawQuestions || []).map(q => {
    let opts = q.options;
    if (typeof opts === 'string') {
      try {
        opts = JSON.parse(opts);
      } catch (_) {}
    }

    let optionsList: string[] = [];
    if (Array.isArray(opts)) {
      optionsList = opts;
    } else if (typeof opts === 'object' && opts !== null) {
      optionsList = Object.entries(opts).map(([k, v]) => `${k}. ${v}`);
    }

    return {
      id: q.id,
      question: q.question || q.questionText || '',
      questionText: q.questionText || q.question || '',
      questionType: q.questionType,
      options: optionsList,
      points: q.points ?? 1,
    };
  });
};

interface StartAttemptResponse {
  message: string;
  attempt: AssessmentAttempt;
  questions: AssessmentQuestion[];
}

export const assessmentService = {
  /**
   * List assessments from backend catalogue (public)
   * GET /api/v1/assessments?skillId=&difficulty=&page=&limit=
   */
  async getAssessments(params?: {
    skillId?: number;
    difficulty?: string;
    page?: number;
    limit?: number;
  }): Promise<AssessmentsResponse> {
    const res = await apiClient.get<ApiResponse<AssessmentsResponse>>('/assessments', { params });
    return res.data.data ?? { assessments: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  },

  /**
   * Get assessment details + safe questions (no correctAnswer)
   * GET /api/v1/assessments/:assessmentId
   */
  async getAssessmentById(assessmentId: number): Promise<AssessmentDetail> {
    const res = await apiClient.get<ApiResponse<AssessmentDetail>>(`/assessments/${assessmentId}`);
    if (!res.data?.data) throw new Error('Assessment not found');
    const data = res.data.data;
    return {
      ...data,
      questions: normalizeQuestions(data.questions),
    };
  },

  /**
   * Start or resume an attempt
   * POST /api/v1/assessments/:assessmentId/attempts
   * Returns: { message, attempt, questions }
   */
  async startAttempt(assessmentId: number): Promise<StartAttemptResponse> {
    const res = await apiClient.post<ApiResponse<StartAttemptResponse>>(
      `/assessments/${assessmentId}/attempts`
    );
    if (!res.data?.data) throw new Error('Failed to start assessment attempt');
    const data = res.data.data;
    return {
      ...data,
      questions: normalizeQuestions(data.questions),
    };
  },

  /**
   * Get an existing attempt + questions
   * GET /api/v1/assessments/attempts/:attemptId
   */
  async getAttempt(attemptId: number): Promise<StartAttemptResponse> {
    const res = await apiClient.get<ApiResponse<StartAttemptResponse>>(
      `/assessments/attempts/${attemptId}`
    );
    if (!res.data?.data) throw new Error('Assessment attempt not found');
    const data = res.data.data;
    return {
      ...data,
      questions: normalizeQuestions(data.questions),
    };
  },

  /**
   * Submit attempt answers for backend evaluation
   * POST /api/v1/assessments/attempts/:attemptId/submit
   * Body: { answers: [{ questionId: number, answer: string }] }
   */
  async submitAttempt(attemptId: number, payload: SubmitAssessmentPayload): Promise<AssessmentResult> {
    const res = await apiClient.post<ApiResponse<AssessmentResult>>(
      `/assessments/attempts/${attemptId}/submit`,
      payload
    );
    if (!res.data?.data) throw new Error('Failed to submit assessment');
    return res.data.data;
  },

  /**
   * Get student's previous attempts (requires auth — via student route)
   * GET /api/v1/students/me/assessment-attempts
   */
  async getMyAttempts(params?: { status?: string; page?: number; limit?: number }): Promise<AttemptsResponse> {
    const res = await apiClient.get<ApiResponse<AttemptsResponse>>(
      '/students/me/assessment-attempts',
      { params }
    );
    return res.data.data ?? { attempts: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  },
};

export default assessmentService;