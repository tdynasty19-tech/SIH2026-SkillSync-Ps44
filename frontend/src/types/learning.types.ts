export interface LearningProgramItem {
  id: number;
  industryId?: number | null;
  institutionId?: number | null;
  title: string;
  description: string;
  curriculum?: string | null;
  durationHours?: number | null;
  mode: string;
  cost: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningRecommendationItem {
  id: number;
  studentId: number;
  skillId: number;
  title: string;
  resourceUrl?: string;
  provider: string;
  duration: string;
  cost: number;
  priority: string;
  skill?: {
    id: number;
    name: string;
    category?: string;
  };
}

export interface LearningRecommendationsResponse {
  learningRecommendations: LearningRecommendationItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LearningProgramsResponse {
  programs: LearningProgramItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
