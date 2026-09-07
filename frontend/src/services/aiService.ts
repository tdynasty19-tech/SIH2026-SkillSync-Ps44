import { apiClient } from './apiClient';
import { ApiResponse } from '../types/auth.types';
import {
  CareerCopilotResponse,
  SkillGapAssistanceResponse,
  LearningRoadmapResponse,
  OpportunityExplanationResponse,
  ResumeAnalysisResponse,
} from '../types/ai.types';

export const aiService = {
  /**
   * Interact with AI Career Copilot
   * POST /api/v1/ai/career-copilot
   */
  async getCareerCopilot(
    message: string,
    targetRoleId?: number
  ): Promise<CareerCopilotResponse> {
    const res = await apiClient.post<ApiResponse<CareerCopilotResponse>>(
      '/ai/career-copilot',
      { message, targetRoleId }
    );
    return (
      res.data?.data ?? {
        reply:
          'I am here to guide your career path based on your verified skills and target industry profiles.',
        suggestedActions: [
          'What careers fit my skills?',
          'What should I learn next?',
          'Explain my latest skill gaps',
        ],
        fallbackUsed: true,
      }
    );
  },

  /**
   * Get AI-enriched skill gap assistance and recommended learning order
   * GET /api/v1/ai/skill-gap
   */
  async getSkillGapAssistance(studentId?: number): Promise<SkillGapAssistanceResponse> {
    const url = studentId ? `/ai/skill-gap/${studentId}` : '/ai/skill-gap';
    const res = await apiClient.get<ApiResponse<SkillGapAssistanceResponse>>(url);
    return (
      res.data?.data ?? {
        identifiedGaps: [],
        aiExplanations: [],
        recommendedOrder: [],
        fallbackUsed: true,
      }
    );
  },

  /**
   * Generate or retrieve personalized learning roadmap
   * GET /api/v1/ai/learning-roadmap or POST /api/v1/ai/learning-roadmap
   */
  async getLearningRoadmap(params?: {
    targetRole?: string;
    timeframeWeeks?: number;
  }): Promise<LearningRoadmapResponse> {
    const res = await apiClient.get<ApiResponse<LearningRoadmapResponse>>(
      '/ai/learning-roadmap',
      { params }
    );
    return (
      res.data?.data ?? {
        roadmap: {
          targetRole: params?.targetRole || 'Software Engineer',
          totalDurationWeeks: params?.timeframeWeeks || 4,
          weeklyCommitmentHours: 10,
          milestones: [],
          recommendedCourses: [],
        },
        fallbackUsed: true,
      }
    );
  },

  /**
   * Get AI qualitative explanation for opportunity match score
   * GET /api/v1/ai/opportunities/:opportunityId/explanation?opportunityType=JOB
   */
  async getOpportunityExplanation(
    opportunityId: number,
    opportunityType = 'JOB'
  ): Promise<OpportunityExplanationResponse> {
    const res = await apiClient.get<ApiResponse<OpportunityExplanationResponse>>(
      `/ai/opportunities/${opportunityId}/explanation`,
      { params: { opportunityType } }
    );
    return (
      res.data?.data ?? {
        explanation: {
          matchScore: 0,
          suitabilitySummary: 'Analysis pending candidate assessment review.',
          strengths: [],
          areasToImprove: [],
          recommendation: 'Evaluate role requirements and verified skills.',
        },
        fallbackUsed: true,
      }
    );
  },

  /**
   * Advisory resume analysis
   * POST /api/v1/ai/analyze-resume
   */
  async analyzeResume(
    resumeText: string,
    documentId?: number
  ): Promise<ResumeAnalysisResponse> {
    const res = await apiClient.post<ApiResponse<ResumeAnalysisResponse>>(
      '/ai/analyze-resume',
      { resumeText, documentId }
    );
    return (
      res.data?.data ?? {
        extractedSkills: [],
        strengths: [],
        skillGaps: [],
        careerReadinessScore: 0,
        advisoryRecommendations: [],
        fallbackUsed: true,
      }
    );
  },
};

export default aiService;