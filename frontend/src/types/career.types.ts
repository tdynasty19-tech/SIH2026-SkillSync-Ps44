export interface CareerRoleItem {
  id: number;
  code: string;
  title: string;
  description: string;
  category?: string;
  level?: string;
  minExperienceMonths?: number;
  industryDemandScore?: number;
  averageSalary?: string | number;
  status: string;
  roleSkills?: Array<{
    id: number;
    skillId: number;
    requiredLevel: string;
    isMandatory: boolean;
    skill?: {
      id: number;
      name: string;
      category?: string;
    };
  }>;
}

export interface CareerRecommendationItem {
  id: number;
  studentId: number;
  careerRoleId: number;
  matchScore: number;
  readiness: number;
  whyItFits: string;
  strongSkills: string[];
  skillGaps: string[];
  recommendedNextSteps: string[];
  careerRole?: CareerRoleItem;
  createdAt?: string;
}

export interface CareerRecommendationsResponse {
  careerRecommendations: CareerRecommendationItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CareerRolesResponse {
  careerRoles: CareerRoleItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
