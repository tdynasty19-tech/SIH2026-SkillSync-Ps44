import { apiClient } from './apiClient';
import { ApiResponse } from '../types/auth.types';
import { SkillCatalogItem } from '../types/skill.types';

interface SkillsResponse {
  skills: SkillCatalogItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface SkillCategoriesResponse {
  categories: Array<{ id: number; name: string; slug: string; description?: string | null }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const skillService = {
  /**
   * Search / browse skill catalog (taxonomy)
   * GET /api/v1/skills?search=&categoryId=&page=&limit=
   */
  async getSkills(params?: {
    search?: string;
    categoryId?: number;
    page?: number;
    limit?: number;
  }): Promise<SkillsResponse> {
    const res = await apiClient.get<ApiResponse<SkillsResponse>>('/skills', { params });
    return res.data.data ?? { skills: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  },

  /**
   * Get single skill by id
   * GET /api/v1/skills/:skillId
   */
  async getSkillById(skillId: number): Promise<SkillCatalogItem> {
    const res = await apiClient.get<ApiResponse<SkillCatalogItem>>(`/skills/${skillId}`);
    if (!res.data?.data) throw new Error('Skill not found');
    return res.data.data;
  },

  /**
   * Get skill categories
   * GET /api/v1/skill-categories
   */
  async getCategories(page = 1, limit = 50): Promise<SkillCategoriesResponse> {
    const res = await apiClient.get<ApiResponse<SkillCategoriesResponse>>('/skill-categories', {
      params: { page, limit },
    });
    return res.data.data ?? { categories: [], pagination: { total: 0, page, limit, totalPages: 0 } };
  },
};

export default skillService;