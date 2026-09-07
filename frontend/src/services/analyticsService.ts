import { apiClient } from './apiClient';
import { ApiResponse } from '../types/auth.types';

export interface PlacementAnalyticsData {
  institutionId: number;
  institutionName: string;
  academicYear: string;
  totalStudents: number;
  placedStudents: number;
  higherStudiesStudents: number;
  entrepreneurshipStudents: number;
  overallAverageSalary: number;
  placementRate: number;
  totalRecords: number;
  recordAverageSalary: number;
  recordHighestSalary: number;
  topCompanies: Array<{
    companyName: string;
    offersCount: number;
    averagePackage: number;
  }>;
  departmentPlacements: Array<{
    department: string;
    offersCount: number;
  }>;
}

export interface InstitutionMetricsData {
  placementRate: number;
  activeMoUs: number;
  registeredStudents: number;
  avgPackage: number;
}

export interface InstitutionSkillAnalyticsData {
  institutionId: number;
  institutionName: string;
  studentStats: {
    totalStudents: number;
    verifiedAffiliations: number;
    pendingAffiliations: number;
  };
  skillDistribution: {
    totalStudentsWithSkills: number;
    totalSkillsRecorded: number;
    verifiedSkillsCount: number;
    skillLevelDistribution: Record<string, number>;
  };
  assessmentPerformance: {
    averageScore: number;
    totalAssessmentsCompleted: number;
  };
  skillGaps: {
    topGaps: Array<{
      skillId: number;
      skillName: string;
      gapCount: number;
      avgGapScore: number;
    }>;
  };
  departmentStats: {
    departmentBreakdown: Array<{
      department: string;
      studentCount: number;
    }>;
    skillAnalyticsRecords: Array<{
      skillId: number;
      skillName: string;
      department: string;
      averageScore: number;
      totalAssessedStudents: number;
      proficientCount: number;
      gapCount: number;
      academicYear: string;
    }>;
  };
}

export interface SkillDemandItem {
  skillId: number;
  skillName: string;
  demandCount: number;
  percentageOfJobs: number;
  topRoles: string[];
}

export const analyticsService = {
  /**
   * Fetch live institution skill analytics and department gap distributions
   */
  async getInstitutionSkillAnalytics(): Promise<InstitutionSkillAnalyticsData> {
    const res = await apiClient.get<ApiResponse<InstitutionSkillAnalyticsData>>(
      '/analytics/institution/skills'
    );
    if (!res.data?.data) {
      throw new Error('Failed to retrieve institution skill analytics');
    }
    return res.data.data;
  },

  /**
   * Fetch global skill demand analytics across industry opportunities
   */
  async getSkillDemandAnalytics(): Promise<SkillDemandItem[]> {
    const res = await apiClient.get<ApiResponse<any>>('/analytics/skill-demand');
    const items = res.data?.data?.skills || res.data?.data || [];
    return Array.isArray(items) ? items : [];
  },

  /**
   * Fetch live institution placement metrics and analytics
   */
  async getPlacementAnalytics(academicYear?: string): Promise<PlacementAnalyticsData> {
    const res = await apiClient.get<ApiResponse<PlacementAnalyticsData>>(
      '/analytics/institution/placements',
      {
        params: academicYear && academicYear !== 'ALL' ? { academicYear } : undefined,
      }
    );
    if (!res.data?.data) {
      throw new Error('Failed to retrieve placement analytics');
    }
    return res.data.data;
  },

  /**
   * Fetch aggregated summary metrics for institution
   */
  async getInstitutionMetrics(): Promise<InstitutionMetricsData> {
    const res = await apiClient.get<ApiResponse<any>>('/institution/dashboard');
    const d = res.data?.data;
    return {
      placementRate: d?.placementSummary?.placementRate || 0,
      activeMoUs: d?.mouCount || d?.stats?.activeCollaborations || 0,
      registeredStudents: d?.totalStudents || d?.stats?.totalStudents || 0,
      avgPackage: d?.placementSummary?.overallAverageSalary ? d.placementSummary.overallAverageSalary / 100000 : 0,
    };
  },
};
