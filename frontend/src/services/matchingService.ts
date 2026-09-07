import { apiClient } from './apiClient';
import { ApiResponse } from '../types/auth.types';
import { MatchResult } from '../types/matching.types';

export const matchingService = {
  /**
   * Fetch deterministic 5-factor match score and breakdown for an opportunity
   */
  async getOpportunityMatch(
    opportunityId: number | string,
    opportunityType: string = 'JOB',
    studentId?: number | string
  ): Promise<MatchResult> {
    const res = await apiClient.get<ApiResponse<MatchResult>>(
      `/matching/opportunities/${opportunityId}`,
      {
        params: {
          opportunityType: opportunityType.toUpperCase(),
          studentId: studentId ? Number(studentId) : undefined,
        },
      }
    );
    if (!res.data?.data) throw new Error('Failed to retrieve match calculation');
    return res.data.data;
  },

  /**
   * Fetch deterministic opportunity recommendations for authenticated student
   */
  async getOpportunityRecommendations(params?: {
    type?: string;
    minScore?: number;
    page?: number;
    limit?: number;
  }) {
    const res = await apiClient.get<ApiResponse<{ recommendations: any[]; pagination: any }>>(
      '/recommendations/opportunities',
      {
        params: {
          type: params?.type ? params.type.toUpperCase() : undefined,
          minScore: params?.minScore,
          page: params?.page || 1,
          limit: params?.limit || 20,
        },
      }
    );
    return res.data?.data ?? { recommendations: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  },

  /**
   * Fetch candidate recommendations for an owned industry opportunity
   */
  async getCandidateRecommendations(opportunityId: number | string, opportunityType = 'JOB') {
    const res = await apiClient.get<ApiResponse<{ candidates: any[]; pagination: any }>>(
      '/recommendations/candidates',
      {
        params: {
          opportunityId: Number(opportunityId),
          opportunityType: opportunityType.toUpperCase(),
        },
      }
    );
    return res.data?.data ?? { candidates: [], pagination: { total: 0 } };
  },
};
