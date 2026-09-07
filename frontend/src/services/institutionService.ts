import { apiClient } from './apiClient';
import { ApiResponse } from '../types/auth.types';
import {
  AcademicProgram,
  CreateAcademicProgramDTO,
  UpdateAcademicProgramDTO,
  AcademicBatch,
  CreateAcademicBatchDTO,
  UpdateAcademicBatchDTO,
  StudentAcademicEnrollment,
  EnrollStudentDTO,
  UpdateEnrollmentDTO,
  StudentAcademicContext,
} from '../types/institution.types';

export const institutionService = {
  // ── Programs ────────────────────────────────────────────────────────────────
  async getPrograms(params?: { departmentId?: number; degreeLevel?: string; page?: number; limit?: number; search?: string }) {
    const res = await apiClient.get<ApiResponse<{ programs: AcademicProgram[]; pagination: any }>>(
      '/institutions/programs',
      { params }
    );
    return res.data?.data ?? { programs: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  },

  async getProgramById(id: number): Promise<AcademicProgram> {
    const res = await apiClient.get<ApiResponse<AcademicProgram>>(`/institutions/programs/${id}`);
    if (!res.data?.data) throw new Error('Failed to load academic program');
    return res.data.data;
  },

  async createProgram(data: CreateAcademicProgramDTO): Promise<AcademicProgram> {
    const res = await apiClient.post<ApiResponse<AcademicProgram>>('/institutions/programs', data);
    if (!res.data?.data) throw new Error('Failed to create academic program');
    return res.data.data;
  },

  async updateProgram(id: number, data: UpdateAcademicProgramDTO): Promise<AcademicProgram> {
    const res = await apiClient.patch<ApiResponse<AcademicProgram>>(`/institutions/programs/${id}`, data);
    if (!res.data?.data) throw new Error('Failed to update academic program');
    return res.data.data;
  },

  async deleteProgram(id: number): Promise<void> {
    await apiClient.delete(`/institutions/programs/${id}`);
  },

  // ── Batches ─────────────────────────────────────────────────────────────────
  async getBatches(params?: { programId?: number; departmentId?: number; isActive?: boolean; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<{ batches: AcademicBatch[]; pagination: any }>>(
      '/institutions/batches',
      { params }
    );
    return res.data?.data ?? { batches: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  },

  async getBatchById(id: number): Promise<AcademicBatch> {
    const res = await apiClient.get<ApiResponse<AcademicBatch>>(`/institutions/batches/${id}`);
    if (!res.data?.data) throw new Error('Failed to load academic batch');
    return res.data.data;
  },

  async createBatch(data: CreateAcademicBatchDTO): Promise<AcademicBatch> {
    const res = await apiClient.post<ApiResponse<AcademicBatch>>('/institutions/batches', data);
    if (!res.data?.data) throw new Error('Failed to create academic batch');
    return res.data.data;
  },

  async updateBatch(id: number, data: UpdateAcademicBatchDTO): Promise<AcademicBatch> {
    const res = await apiClient.patch<ApiResponse<AcademicBatch>>(`/institutions/batches/${id}`, data);
    if (!res.data?.data) throw new Error('Failed to update academic batch');
    return res.data.data;
  },

  async deleteBatch(id: number): Promise<void> {
    await apiClient.delete(`/institutions/batches/${id}`);
  },

  // ── Enrollments ─────────────────────────────────────────────────────────────
  async getEnrollments(params?: { batchId?: number; studentId?: number; status?: string; isCurrent?: boolean; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<{ enrollments: StudentAcademicEnrollment[]; pagination: any }>>(
      '/institutions/enrollments',
      { params }
    );
    return res.data?.data ?? { enrollments: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  },

  async getEnrollmentById(id: number): Promise<StudentAcademicEnrollment> {
    const res = await apiClient.get<ApiResponse<StudentAcademicEnrollment>>(`/institutions/enrollments/${id}`);
    if (!res.data?.data) throw new Error('Failed to load academic enrollment');
    return res.data.data;
  },

  async enrollStudent(data: EnrollStudentDTO): Promise<StudentAcademicEnrollment> {
    const res = await apiClient.post<ApiResponse<StudentAcademicEnrollment>>('/institutions/enrollments', data);
    if (!res.data?.data) throw new Error('Failed to enroll student');
    return res.data.data;
  },

  async updateEnrollment(id: number, data: UpdateEnrollmentDTO): Promise<StudentAcademicEnrollment> {
    const res = await apiClient.patch<ApiResponse<StudentAcademicEnrollment>>(`/institutions/enrollments/${id}`, data);
    if (!res.data?.data) throw new Error('Failed to update enrollment');
    return res.data.data;
  },

  async deleteEnrollment(id: number): Promise<void> {
    await apiClient.delete(`/institutions/enrollments/${id}`);
  },

  // ── Discovery Endpoints (For Students & Public Dropdowns) ────────────────────
  async getDiscoveryPrograms(institutionId: number, departmentId: number) {
    const res = await apiClient.get<ApiResponse<AcademicProgram[]>>(
      `/institutions/${institutionId}/departments/${departmentId}/programs`
    );
    return res.data?.data ?? [];
  },

  async getDiscoveryBatches(institutionId: number, programId: number) {
    const res = await apiClient.get<ApiResponse<AcademicBatch[]>>(
      `/institutions/${institutionId}/programs/${programId}/batches`
    );
    return res.data?.data ?? [];
  },
};

export default institutionService;
