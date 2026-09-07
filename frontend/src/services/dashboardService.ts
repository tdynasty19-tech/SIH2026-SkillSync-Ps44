import { apiClient } from './apiClient';
import {
  StudentDashboardData,
  IndustryDashboardData,
  AcademicianDashboardData,
  InstitutionDashboardData,
} from '../types/dashboard.types';

export const dashboardService = {
  /**
   * Fetch real student dashboard metrics
   */
  async getStudentDashboard(): Promise<StudentDashboardData> {
    const response = await apiClient.get<{ success: boolean; data: StudentDashboardData }>('/students/me/dashboard');
    return response.data.data;
  },

  /**
   * Fetch real industry dashboard metrics
   */
  async getIndustryDashboard(): Promise<IndustryDashboardData> {
    const response = await apiClient.get<{ success: boolean; data: IndustryDashboardData }>('/industry/dashboard');
    return response.data.data;
  },

  /**
   * Fetch real academician dashboard metrics
   */
  async getAcademicianDashboard(): Promise<AcademicianDashboardData> {
    const response = await apiClient.get<{ success: boolean; data: AcademicianDashboardData }>('/academician/dashboard');
    return response.data.data;
  },

  /**
   * Fetch real institution dashboard metrics
   */
  async getInstitutionDashboard(): Promise<InstitutionDashboardData> {
    const response = await apiClient.get<{ success: boolean; data: InstitutionDashboardData }>('/institution/dashboard');
    return response.data.data;
  },
};
