export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CareerCopilotResponse {
  reply: string;
  suggestedActions: string[];
  contextSummary?: {
    verifiedSkillsCount: number;
    activeGapsCount: number;
    topCareerRole: string;
  };
  fallbackUsed?: boolean;
}

export interface SkillGapAssistanceResponse {
  identifiedGaps: any[];
  aiExplanations: Array<{
    skillId: number;
    skillName: string;
    gapScore: number;
    importance: string;
    learningFocus: string;
    estimatedWeeksToClose: number;
  }>;
  recommendedOrder: string[];
  targetRole?: string;
  fallbackUsed?: boolean;
}

export interface LearningRoadmapMilestone {
  weekNumber: number;
  topic: string;
  learningObjectives: string[];
  recommendedResources: string[];
  projectIdea: string;
  assessmentTopic: string;
}

export interface LearningRoadmapResponse {
  roadmap: {
    targetRole: string;
    totalDurationWeeks: number;
    weeklyCommitmentHours: number;
    milestones: LearningRoadmapMilestone[];
    recommendedCourses: Array<{
      title: string;
      platform: string;
      skillsCovered: string[];
      isFree: boolean;
    }>;
  };
  fallbackUsed?: boolean;
}

export interface OpportunityExplanationResponse {
  explanation: {
    matchScore: number;
    suitabilitySummary: string;
    strengths: string[];
    areasToImprove: string[];
    recommendation: string;
    matchedSkills?: string[];
    missingSkills?: string[];
  };
  fallbackUsed?: boolean;
}

export interface ResumeAnalysisResponse {
  extractedSkills: string[];
  strengths: string[];
  skillGaps: string[];
  careerReadinessScore: number;
  advisoryRecommendations: string[];
  fallbackUsed?: boolean;
}
