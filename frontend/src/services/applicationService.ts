import { apiClient } from './apiClient';
import { ApiResponse } from '../types/auth.types';
import {
  ApplicationItem,
  SubmitApplicationDTO,
  UpdateApplicationStatusDTO,
  ApplicationQueryDTO,
  PaginatedApplications,
} from '../types/application.types';

export const applicationService = {
  // ── Student Endpoints ──────────────────────────────────────────────────────
  async submitApplication(data: SubmitApplicationDTO): Promise<ApplicationItem> {
    const res = await apiClient.post<ApiResponse<ApplicationItem>>('/applications', data);
    if (!res.data?.data) throw new Error(res.data?.message || 'Failed to submit application');
    return res.data.data;
  },

  async getMyApplications(query: ApplicationQueryDTO = {}): Promise<PaginatedApplications> {
    const res = await apiClient.get<ApiResponse<PaginatedApplications>>('/applications/me', {
      params: {
        status: query.status || undefined,
        opportunityType: query.opportunityType || undefined,
        page: query.page || 1,
        limit: query.limit || 20,
      },
    });
    return res.data.data ?? { applications: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  },

  async getMyApplicationById(applicationId: number | string): Promise<ApplicationItem> {
    const res = await apiClient.get<ApiResponse<ApplicationItem>>(`/applications/me/${applicationId}`);
    if (!res.data?.data) throw new Error('Application not found');
    return res.data.data;
  },

  // ── Industry / Opportunity Owner Endpoints ─────────────────────────────────
  async getOpportunityApplications(
    opportunityType: string,
    opportunityId: number | string,
    query: ApplicationQueryDTO = {}
  ): Promise<PaginatedApplications> {
    const res = await apiClient.get<ApiResponse<PaginatedApplications>>(
      `/applications/opportunity/${opportunityType}/${opportunityId}`,
      {
        params: {
          status: query.status || undefined,
          page: query.page || 1,
          limit: query.limit || 50,
        },
      }
    );
    return res.data.data ?? { applications: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };
  },

  async getApplicationReview(applicationId: number | string): Promise<ApplicationItem> {
    const res = await apiClient.get<ApiResponse<ApplicationItem>>(`/applications/review/${applicationId}`);
    if (!res.data?.data) throw new Error('Application details not found');
    return res.data.data;
  },

  async updateApplicationStatus(
    applicationId: number | string,
    dto: UpdateApplicationStatusDTO
  ): Promise<ApplicationItem> {
    const res = await apiClient.patch<ApiResponse<ApplicationItem>>(
      `/applications/${applicationId}/status`,
      dto
    );
    if (!res.data?.data) throw new Error(res.data?.message || 'Failed to update application status');
    return res.data.data;
  },

  // ── Compatibility Helpers ──────────────────────────────────────────────────
  async getStudentApplications(studentId?: string): Promise<any[]> {
    const res = await this.getMyApplications({ limit: 100 });
    return res.applications.map((app) => ({
      id: String(app.id),
      studentId: String(app.studentId),
      opportunityId: String(app.opportunityId),
      companyName: app.opportunity?.industry?.companyName || 'Enterprise Partner',
      role: app.opportunity?.title || `${app.opportunityType} #${app.opportunityId}`,
      status: app.status,
      appliedAt: app.appliedAt || app.createdAt,
      matchScore: 0,
      opportunityType: app.opportunityType,
    }));
  },

  async applyForOpportunity(
    _studentId: string,
    _studentName: string,
    opp: { id: number | string; kind?: string; type?: string },
    _matchScore: number,
    coverLetter?: string
  ) {
    const normType = (opp.kind || opp.type || 'JOB').toUpperCase();
    return this.submitApplication({
      opportunityId: Number(opp.id),
      opportunityType: normType as any,
      coverLetter,
    });
  },
};
