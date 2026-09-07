import { apiClient } from './apiClient';
import { ApiResponse } from '../types/auth.types';
import {
  StudentProfile,
  CreateStudentProfileDTO,
  UpdateStudentProfileDTO,
  StudentEducation,
  CreateEducationDTO,
  UpdateEducationDTO,
  StudentDashboardData,
} from '../types/student.types';
import {
  StudentSkill,
  AddStudentSkillDTO,
  UpdateStudentSkillDTO,
} from '../types/skill.types';
import { StudentAcademicContext } from '../types/institution.types';

type PaginatedResponse<K extends string, T> = {
  [key in K]: T[];
} & {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export const studentService = {
  // ── Profile ────────────────────────────────────────────────────────────────
  async getProfile(): Promise<StudentProfile> {
    const res = await apiClient.get<ApiResponse<StudentProfile>>('/students/me/profile');
    if (!res.data?.data) throw new Error('Failed to load student profile');
    return res.data.data;
  },

  async createProfile(data: CreateStudentProfileDTO): Promise<StudentProfile> {
    const res = await apiClient.post<ApiResponse<StudentProfile>>('/students/me/profile', data);
    if (!res.data?.data) throw new Error('Failed to create student profile');
    return res.data.data;
  },

  async updateProfile(data: UpdateStudentProfileDTO): Promise<StudentProfile> {
    const res = await apiClient.patch<ApiResponse<StudentProfile>>('/students/me/profile', data);
    if (!res.data?.data) throw new Error('Failed to update student profile');
    return res.data.data;
  },

  // ── Education ─────────────────────────────────────────────────────────────
  async getEducation(page = 1, limit = 20): Promise<PaginatedResponse<'education', StudentEducation>> {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<'education', StudentEducation>>>(
      '/students/me/education',
      { params: { page, limit } }
    );
    return res.data.data ?? { education: [], pagination: { total: 0, page, limit, totalPages: 0 } };
  },

  async addEducation(data: CreateEducationDTO): Promise<StudentEducation> {
    const res = await apiClient.post<ApiResponse<StudentEducation>>('/students/me/education', data);
    if (!res.data?.data) throw new Error('Failed to add education');
    return res.data.data;
  },

  async updateEducation(educationId: number, data: UpdateEducationDTO): Promise<StudentEducation> {
    const res = await apiClient.patch<ApiResponse<StudentEducation>>(
      `/students/me/education/${educationId}`,
      data
    );
    if (!res.data?.data) throw new Error('Failed to update education');
    return res.data.data;
  },

  async deleteEducation(educationId: number): Promise<void> {
    await apiClient.delete(`/students/me/education/${educationId}`);
  },

  // ── Skills ────────────────────────────────────────────────────────────────
  async getSkills(page = 1, limit = 50): Promise<PaginatedResponse<'skills', StudentSkill>> {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<'skills', StudentSkill>>>(
      '/students/me/skills',
      { params: { page, limit } }
    );
    return res.data.data ?? { skills: [], pagination: { total: 0, page, limit, totalPages: 0 } };
  },

  async addSkill(data: AddStudentSkillDTO): Promise<StudentSkill> {
    const res = await apiClient.post<ApiResponse<StudentSkill>>('/students/me/skills', data);
    if (!res.data?.data) throw new Error('Failed to add skill');
    return res.data.data;
  },

  async updateSkill(skillId: number, data: UpdateStudentSkillDTO): Promise<StudentSkill> {
    const res = await apiClient.patch<ApiResponse<StudentSkill>>(
      `/students/me/skills/${skillId}`,
      data
    );
    if (!res.data?.data) throw new Error('Failed to update skill');
    return res.data.data;
  },

  async deleteSkill(skillId: number): Promise<void> {
    await apiClient.delete(`/students/me/skills/${skillId}`);
  },

  // ── Assessment Attempts History ───────────────────────────────────────────
  async getAssessmentAttempts(page = 1, limit = 20) {
    const res = await apiClient.get<ApiResponse<any>>('/students/me/assessment-attempts', {
      params: { page, limit },
    });
    return res.data.data ?? { attempts: [], pagination: { total: 0, page, limit, totalPages: 0 } };
  },

  // ── Skill Gaps ────────────────────────────────────────────────────────────
  async getSkillGaps(params?: { priority?: string; status?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<any>>('/students/me/skill-gaps', { params });
    return res.data.data ?? { skillGaps: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };
  },

  async recalculateSkillGaps() {
    const res = await apiClient.post<ApiResponse<any>>('/students/me/skill-gaps/recalculate');
    return res.data.data;
  },

  // ── Academic Context ──────────────────────────────────────────────────────
  async getAcademicContext(): Promise<StudentAcademicContext> {
    const res = await apiClient.get<ApiResponse<StudentAcademicContext>>('/students/me/academic-context');
    return res.data?.data ?? { enrollment: null, institution: null, department: null, program: null, batch: null };
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  async getDashboard(): Promise<StudentDashboardData> {
    const res = await apiClient.get<ApiResponse<StudentDashboardData>>('/students/me/dashboard');
    return res.data.data ?? {};
  },
};

export default studentService;