import { apiClient } from './apiClient';
import { ApiResponse } from '../types/auth.types';
import {
  CareerRoleItem,
  CareerRecommendationsResponse,
  CareerRolesResponse,
} from '../types/career.types';

export interface StudentCareerInterestItem {
  id: number;
  studentId: number;
  careerRoleId: number;
  priorityOrder: number;
  careerRole?: {
    id: number;
    title: string;
    slug: string;
    description?: string;
  };
}

export const careerService = {
  /**
   * Get deterministic career recommendations for the authenticated student
   * GET /api/v1/recommendations/careers
   */
  async getCareerRecommendations(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<CareerRecommendationsResponse> {
    const res = await apiClient.get<ApiResponse<CareerRecommendationsResponse>>(
      '/recommendations/careers',
      { params }
    );
    return (
      res.data.data ?? {
        careerRecommendations: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      }
    );
  },

  /**
   * Get career roles catalog
   * GET /api/v1/careers
   */
  async getCareerRoles(params?: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<CareerRolesResponse> {
    const res = await apiClient.get<ApiResponse<CareerRolesResponse>>('/careers', { params });
    return (
      res.data.data ?? {
        careerRoles: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      }
    );
  },

  /**
   * Get career role details by ID
   * GET /api/v1/careers/:id
   */
  async getCareerRoleById(id: number): Promise<CareerRoleItem> {
    const res = await apiClient.get<ApiResponse<CareerRoleItem>>(`/careers/${id}`);
    if (!res.data?.data) throw new Error('Career role not found');
    return res.data.data;
  },

  /**
   * Get student's current career interests/goals
   * GET /api/v1/students/me/career-interests
   */
  async getStudentCareerInterests(): Promise<StudentCareerInterestItem[]> {
    const res = await apiClient.get<ApiResponse<StudentCareerInterestItem[]>>(
      '/students/me/career-interests'
    );
    return res.data.data ?? [];
  },

  /**
   * Add a career interest / set active target goal
   * POST /api/v1/students/me/career-interests
   */
  async addCareerInterest(careerRoleId: number, priorityOrder = 1): Promise<StudentCareerInterestItem> {
    const res = await apiClient.post<ApiResponse<StudentCareerInterestItem>>(
      '/students/me/career-interests',
      { careerRoleId, priorityOrder }
    );
    if (!res.data?.data) throw new Error('Failed to set career goal');
    return res.data.data;
  },

  /**
   * Delete career interest
   * DELETE /api/v1/students/me/career-interests/:interestId
   */
  async deleteCareerInterest(interestId: number): Promise<{ message: string }> {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/students/me/career-interests/${interestId}`
    );
    return res.data?.data ?? { message: 'Success' };
  },

  /**
   * Set primary target career goal (clears other primary or sets as top priority)
   */
  async setPrimaryCareerGoal(careerRoleId: number): Promise<void> {
    const current = await this.getStudentCareerInterests();
    const existing = current.find(c => c.careerRoleId === careerRoleId);
    if (!existing) {
      await this.addCareerInterest(careerRoleId, 1);
    }
  },
};

export default careerService;
