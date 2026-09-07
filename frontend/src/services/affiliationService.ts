import { apiClient } from './apiClient';
import { ApiResponse } from '../types/auth.types';
import {
  AffiliationDepartment,
  AffiliationInstitution,
  AffiliationListResponse,
  StudentInstitutionAffiliation,
  StudentAffiliationStatus,
} from '../types/affiliation.types';

export const affiliationService = {
  async getAvailableInstitutions(): Promise<AffiliationInstitution[]> {
    const response = await apiClient.get<ApiResponse<AffiliationInstitution[]>>('/institutions/available');
    return response.data.data ?? [];
  },

  async getDepartments(institutionId: number): Promise<AffiliationDepartment[]> {
    const response = await apiClient.get<ApiResponse<AffiliationDepartment[]>>(
      `/institutions/${institutionId}/departments`
    );
    return response.data.data ?? [];
  },

  async createRequest(input: { institutionId: number; departmentId: number; enrollmentNumber: string }) {
    const response = await apiClient.post<ApiResponse<StudentInstitutionAffiliation>>(
      '/students/me/affiliations',
      input
    );
    if (!response.data.data) throw new Error('Affiliation request was not created');
    return response.data.data;
  },

  async getMine(status?: StudentAffiliationStatus): Promise<AffiliationListResponse> {
    const response = await apiClient.get<ApiResponse<AffiliationListResponse>>('/students/me/affiliations', {
      params: status ? { status, page: 1, limit: 50 } : { page: 1, limit: 50 },
    });
    return response.data.data ?? { affiliations: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };
  },

  async getCurrent(): Promise<StudentInstitutionAffiliation | null> {
    const response = await apiClient.get<ApiResponse<StudentInstitutionAffiliation | null>>('/students/me/affiliation');
    return response.data.data ?? null;
  },

  async getInstitutionRequests(status: StudentAffiliationStatus = 'PENDING'): Promise<AffiliationListResponse> {
    const response = await apiClient.get<ApiResponse<AffiliationListResponse>>('/institutions/student-affiliations', {
      params: { status, page: 1, limit: 100 },
    });
    return response.data.data ?? { affiliations: [], pagination: { total: 0, page: 1, limit: 100, totalPages: 0 } };
  },

  async verify(affiliationId: number): Promise<StudentInstitutionAffiliation> {
    const response = await apiClient.post<ApiResponse<StudentInstitutionAffiliation>>(
      `/institutions/student-affiliations/${affiliationId}/verify`
    );
    if (!response.data.data) throw new Error('Affiliation was not verified');
    return response.data.data;
  },

  async reject(affiliationId: number, rejectionReason: string): Promise<StudentInstitutionAffiliation> {
    const response = await apiClient.post<ApiResponse<StudentInstitutionAffiliation>>(
      `/institutions/student-affiliations/${affiliationId}/reject`,
      { rejectionReason }
    );
    if (!response.data.data) throw new Error('Affiliation was not rejected');
    return response.data.data;
  },
};
