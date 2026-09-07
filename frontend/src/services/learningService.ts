import { apiClient } from './apiClient';
import { ApiResponse } from '../types/auth.types';
import {
  LearningProgramItem,
  LearningRecommendationsResponse,
  LearningProgramsResponse,
} from '../types/learning.types';

export const learningService = {
  /**
   * Get learning recommendations based on student's skill gaps
   * GET /api/v1/recommendations/learning
   */
  async getLearningRecommendations(params?: {
    page?: number;
    limit?: number;
  }): Promise<LearningRecommendationsResponse> {
    const res = await apiClient.get<ApiResponse<LearningRecommendationsResponse>>(
      '/recommendations/learning',
      { params }
    );
    return (
      res.data?.data ?? {
        learningRecommendations: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      }
    );
  },

  /**
   * Get learning programs catalogue
   * GET /api/v1/learning-programs
   */
  async getLearningPrograms(params?: {
    search?: string;
    mode?: string;
    page?: number;
    limit?: number;
  }): Promise<LearningProgramsResponse> {
    const res = await apiClient.get<ApiResponse<LearningProgramsResponse>>(
      '/learning-programs',
      { params }
    );
    return (
      res.data?.data ?? {
        programs: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      }
    );
  },

  /**
   * Get learning program details by ID
   * GET /api/v1/learning-programs/:id
   */
  async getLearningProgramById(id: number): Promise<LearningProgramItem> {
    const res = await apiClient.get<ApiResponse<LearningProgramItem>>(
      `/learning-programs/${id}`
    );
    if (!res.data?.data) throw new Error('Learning program not found');
    return res.data.data;
  },
};

export default learningService;