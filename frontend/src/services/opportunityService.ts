import { apiClient } from './apiClient';
import { ApiResponse } from '../types/auth.types';
import {
  JobItem,
  InternshipItem,
  ProjectItem,
  FacultyOpportunityItem,
  ResearchOpportunityItem,
  CreateJobDTO,
  CreateInternshipDTO,
  CreateProjectDTO,
  CreateFacultyOpportunityDTO,
  CreateResearchOpportunityDTO,
  UnifiedOpportunity,
  OpportunityFilterParams,
  WorkplaceType,
} from '../types/opportunity.types';

export const opportunityService = {
  // ── Jobs ──────────────────────────────────────────────────────────────────
  async getJobs(params?: { search?: string; workplaceType?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<{ jobs: JobItem[]; pagination: any }>>('/jobs', {
      params: {
        search: params?.search || undefined,
        workplaceType: params?.workplaceType && params.workplaceType !== 'ALL' ? params.workplaceType : undefined,
        page: params?.page || 1,
        limit: params?.limit || 20,
      },
    });
    return res.data.data ?? { jobs: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  },

  async getJobById(id: number | string): Promise<JobItem> {
    const res = await apiClient.get<ApiResponse<JobItem>>(`/jobs/${id}`);
    if (!res.data?.data) throw new Error('Job not found');
    return res.data.data;
  },

  async createJob(data: CreateJobDTO): Promise<JobItem> {
    const res = await apiClient.post<ApiResponse<JobItem>>('/jobs', data);
    if (!res.data?.data) throw new Error('Failed to create job');
    return res.data.data;
  },

  // ── Internships ───────────────────────────────────────────────────────────
  async getInternships(params?: { search?: string; workplaceType?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<{ internships: InternshipItem[]; pagination: any }>>('/internships', {
      params: {
        search: params?.search || undefined,
        workplaceType: params?.workplaceType && params.workplaceType !== 'ALL' ? params.workplaceType : undefined,
        page: params?.page || 1,
        limit: params?.limit || 20,
      },
    });
    return res.data.data ?? { internships: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  },

  async getInternshipById(id: number | string): Promise<InternshipItem> {
    const res = await apiClient.get<ApiResponse<InternshipItem>>(`/internships/${id}`);
    if (!res.data?.data) throw new Error('Internship not found');
    return res.data.data;
  },

  async createInternship(data: CreateInternshipDTO): Promise<InternshipItem> {
    const res = await apiClient.post<ApiResponse<InternshipItem>>('/internships', data);
    if (!res.data?.data) throw new Error('Failed to create internship');
    return res.data.data;
  },

  // ── Projects ──────────────────────────────────────────────────────────────
  async getProjects(params?: { search?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<{ projects: ProjectItem[]; pagination: any }>>('/projects', {
      params: {
        search: params?.search || undefined,
        page: params?.page || 1,
        limit: params?.limit || 20,
      },
    });
    return res.data.data ?? { projects: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  },

  async getProjectById(id: number | string): Promise<ProjectItem> {
    const res = await apiClient.get<ApiResponse<ProjectItem>>(`/projects/${id}`);
    if (!res.data?.data) throw new Error('Project not found');
    return res.data.data;
  },

  async createProject(data: CreateProjectDTO): Promise<ProjectItem> {
    const res = await apiClient.post<ApiResponse<ProjectItem>>('/projects', data);
    if (!res.data?.data) throw new Error('Failed to create project');
    return res.data.data;
  },

  // ── Faculty Opportunities ─────────────────────────────────────────────────
  async getFacultyOpportunities(params?: { department?: string; status?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<{ facultyOpportunities: FacultyOpportunityItem[]; pagination: any }>>(
      '/faculty-opportunities',
      {
        params: {
          department: params?.department || undefined,
          status: params?.status || undefined,
          page: params?.page || 1,
          limit: params?.limit || 20,
        },
      }
    );
    return res.data.data ?? { facultyOpportunities: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  },

  async getFacultyOpportunityById(id: number | string): Promise<FacultyOpportunityItem> {
    const res = await apiClient.get<ApiResponse<FacultyOpportunityItem>>(`/faculty-opportunities/${id}`);
    if (!res.data?.data) throw new Error('Faculty opportunity not found');
    return res.data.data;
  },

  async createFacultyOpportunity(data: CreateFacultyOpportunityDTO): Promise<FacultyOpportunityItem> {
    const res = await apiClient.post<ApiResponse<FacultyOpportunityItem>>('/faculty-opportunities', data);
    if (!res.data?.data) throw new Error('Failed to create faculty opportunity');
    return res.data.data;
  },

  // ── Research Opportunities ────────────────────────────────────────────────
  async getResearchOpportunities(params?: { fieldOfStudy?: string; status?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<{ researchOpportunities: ResearchOpportunityItem[]; pagination: any }>>(
      '/research-opportunities',
      {
        params: {
          fieldOfStudy: params?.fieldOfStudy || undefined,
          status: params?.status || undefined,
          page: params?.page || 1,
          limit: params?.limit || 20,
        },
      }
    );
    return res.data.data ?? { researchOpportunities: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  },

  async getResearchOpportunityById(id: number | string): Promise<ResearchOpportunityItem> {
    const res = await apiClient.get<ApiResponse<ResearchOpportunityItem>>(`/research-opportunities/${id}`);
    if (!res.data?.data) throw new Error('Research opportunity not found');
    return res.data.data;
  },

  async createResearchOpportunity(data: CreateResearchOpportunityDTO): Promise<ResearchOpportunityItem> {
    const res = await apiClient.post<ApiResponse<ResearchOpportunityItem>>('/research-opportunities', data);
    if (!res.data?.data) throw new Error('Failed to create research opportunity');
    return res.data.data;
  },

  // ── Unified Opportunity Explorer ──────────────────────────────────────────
  async getUnifiedOpportunities(filters: OpportunityFilterParams = {}): Promise<{
    opportunities: UnifiedOpportunity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const kind = filters.kind || 'ALL';
    const workplace = filters.workplaceType && filters.workplaceType !== 'ALL' ? filters.workplaceType : undefined;
    const search = filters.search?.trim() || undefined;

    const list: UnifiedOpportunity[] = [];

    const fetchJobs = kind === 'ALL' || kind === 'JOB';
    const fetchInternships = kind === 'ALL' || kind === 'INTERNSHIP';
    const fetchProjects = (kind === 'ALL' || kind === 'PROJECT') && (!workplace || workplace === 'REMOTE');

    const [jobsRes, internshipsRes, projectsRes] = await Promise.all([
      fetchJobs
        ? this.getJobs({ search, workplaceType: workplace, limit: 30 })
        : Promise.resolve({ jobs: [], pagination: { total: 0 } }),
      fetchInternships
        ? this.getInternships({ search, workplaceType: workplace, limit: 30 })
        : Promise.resolve({ internships: [], pagination: { total: 0 } }),
      fetchProjects
        ? this.getProjects({ search, limit: 30 })
        : Promise.resolve({ projects: [], pagination: { total: 0 } }),
    ]);

    for (const j of jobsRes.jobs) {
      list.push({
        id: j.id,
        kind: 'JOB',
        title: j.title,
        description: j.description,
        requirements: j.requirements,
        companyName: j.industry?.companyName || 'Enterprise Partner',
        companyId: j.industryId,
        location: j.location || (j.city ? `${j.city}, ${j.state || 'India'}` : 'Multiple Locations'),
        workplaceType: j.workplaceType,
        compensation: j.salaryMin || j.salaryMax
          ? `₹${Number(j.salaryMin || 0).toLocaleString()} - ₹${Number(j.salaryMax || 0).toLocaleString()}/yr`
          : undefined,
        applicationDeadline: j.applicationDeadline || undefined,
        openings: j.openings,
        status: j.status,
        createdAt: j.createdAt,
      });
    }

    for (const i of internshipsRes.internships) {
      list.push({
        id: i.id,
        kind: 'INTERNSHIP',
        title: i.title,
        description: i.description,
        requirements: i.requirements,
        companyName: i.industry?.companyName || 'Enterprise Partner',
        companyId: i.industryId,
        location: i.location || 'Multiple Locations',
        workplaceType: i.workplaceType,
        compensation: i.stipend ? `₹${Number(i.stipend).toLocaleString()}/month` : 'Stipend Disclosed Upon Interview',
        duration: `${i.durationMonths} Months`,
        applicationDeadline: i.applicationDeadline || undefined,
        openings: i.openings,
        status: i.status,
        createdAt: i.createdAt,
      });
    }

    for (const p of projectsRes.projects) {
      list.push({
        id: p.id,
        kind: 'PROJECT',
        title: p.title,
        description: p.description,
        requirements: p.deliverables,
        companyName: p.industry?.companyName || 'Industry Sponsor',
        companyId: p.industryId,
        location: 'Remote Project',
        workplaceType: 'REMOTE' as WorkplaceType,
        compensation: p.budget ? `₹${Number(p.budget).toLocaleString()} Grant` : 'Academic Project',
        duration: p.durationWeeks ? `${p.durationWeeks} Weeks` : undefined,
        status: p.status,
        createdAt: p.createdAt,
      });
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      opportunities: list,
      total: list.length,
      page: filters.page || 1,
      limit: filters.limit || 20,
    };
  },

  // Legacy adapter to prevent breakage
  async getOpportunities(): Promise<any[]> {
    const res = await this.getUnifiedOpportunities();
    return res.opportunities.map((o) => ({
      ...o,
      companyId: String(o.companyId || ''),
      type: o.kind.toLowerCase(),
      isRemote: o.workplaceType === 'REMOTE',
      deadline: o.applicationDeadline,
      postedAt: o.createdAt,
      requiredSkills: [],
    }));
  },

  async addOpportunity(data: any): Promise<any> {
    // Default to create job
    return this.createJob({
      title: data.title,
      description: data.description || 'Opportunity details',
      location: data.location,
      workplaceType: data.workplaceType || 'HYBRID',
      salaryMin: data.salaryMin ? Number(data.salaryMin) : undefined,
      salaryMax: data.salaryMax ? Number(data.salaryMax) : undefined,
    });
  },
};
