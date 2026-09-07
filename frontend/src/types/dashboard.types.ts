export interface SkillLevelDistribution {
  BEGINNER: number;
  INTERMEDIATE: number;
  ADVANCED: number;
  EXPERT: number;
  [key: string]: number;
}

export interface StudentDashboardData {
  profileCompletion: number;
  headline?: string | null;
  department?: string | null;
  collegeName?: string | null;
  graduationYear?: number | null;
  skillSummary: {
    totalSkills: number;
    verifiedSkills: number;
    skillLevels: SkillLevelDistribution;
    averageScore: number;
  };
  topSkills: Array<{
    id: number;
    skillId: number;
    skillName: string;
    level: string;
    score: number | null;
    verified: boolean;
  }>;
  assessmentOverview: {
    totalAttempts: number;
    completedAttempts: number;
    averageScore: number;
    recentAttempts: Array<{
      id: number;
      title: string;
      skillName: string;
      score: number | null;
      percentage: number | null;
      status: string;
      date: string;
    }>;
  };
  skillGaps: Array<{
    id: number;
    skillId: number;
    skillName: string;
    priority: string;
    gapScore: number;
    requiredLevel?: string;
    currentLevel?: string;
  }>;
  recommendedCareers: Array<{
    careerRoleId?: number;
    roleTitle?: string;
    title?: string;
    readiness?: number;
    readinessScore?: number;
    matchScore?: number;
    fitScore?: number;
    whyItFits?: string;
  }>;
  recommendedInternships: Array<any>;
  recommendedJobs: Array<any>;
  recentApplications: Array<{
    id: number;
    opportunityType: string;
    status: string;
    appliedAt: string;
    opportunity?: {
      id: number;
      title: string;
      companyName?: string;
    };
  }>;
  applicationStats: Record<string, number>;
  learningProgress: Array<any>;
  upcomingMentorship: {
    upcomingMentorshipRequests: number;
  };
  notifications: {
    unreadCount: number;
  };
  portfolioStats?: {
    hasPortfolio: boolean;
    projectsCount: number;
    certificationsCount: number;
    achievementsCount: number;
    experiencesCount: number;
  };
}

export interface IndustryDashboardData {
  companyName?: string;
  activeOpportunities: number;
  totalOpportunities: number;
  opportunityBreakdown: {
    jobs: { active: number; total: number };
    internships: { active: number; total: number };
    projects: { active: number; total: number };
  };
  applications: number;
  totalApplications: number;
  applicationsByStatus?: Record<string, number>;
  shortlisted: number;
  interviewCount: number;
  selected: number;
  candidateStats: {
    uniqueApplicants: number;
  };
  applicationTrends: Array<{
    date: string;
    count: number;
  }>;
  hiringFunnel: {
    totalApplied: number;
    underReview: number;
    shortlisted: number;
    interviewScheduled: number;
    offeredOrAccepted: number;
    rejected: number;
    [key: string]: number;
  };
  topCandidateSkills: Array<{
    skillId: number;
    skillName: string;
    candidateCount: number;
  }>;
}

export interface AcademicianDashboardData {
  academician: {
    department: string;
    designation: string;
    institution: string;
    specialization?: string | null;
  };
  mentorship: {
    isMentor: boolean;
    activeMentees: number;
    maxMentees: number;
    isAvailable: boolean;
    pendingRequestsCount: number;
    acceptedRequestsCount: number;
    totalSessionsCompleted: number;
    recentRequests: Array<{
      id: number;
      goals: string;
      message?: string;
      status: string;
      requestedAt: string;
      student?: {
        id: number;
        user?: {
          firstName: string;
          lastName: string;
          email: string;
        };
      };
    }>;
  };
  departmentStats: {
    departmentName: string;
    totalStudents: number;
    assessedStudentsCount: number;
    averageAssessmentScore: number;
    skillDistribution: SkillLevelDistribution;
    topSkills: Array<{
      skillId: number;
      skillName: string;
      studentCount: number;
    }>;
    commonSkillGaps: Array<{
      skillId: number;
      skillName: string;
      affectedStudents: number;
    }>;
    students: Array<{
      id: number;
      name: string;
      email: string;
      profileCompletion: number;
    }>;
  };
  workshops: Array<{
    id: number;
    topic: string;
    speakerName: string;
    date: string;
    durationHours: number;
    attendeesCount: number;
    venue?: string;
  }>;
  notifications: {
    unreadCount: number;
  };
}

export interface InstitutionDashboardData {
  studentStats: {
    totalStudents: number;
    averageProfileCompletion: number;
  };
  skillStats: {
    totalStudentsWithSkills: number;
    totalSkillsRecorded: number;
    verifiedSkillsCount: number;
    skillLevelDistribution: SkillLevelDistribution;
    topGaps: Array<{
      skillId: number;
      skillName: string;
      unresolvedGapsCount: number;
    }>;
  };
  assessmentStats: {
    averageScore: number;
    totalAssessmentsCompleted: number;
  };
  internshipStats: {
    totalApplications: number;
    statusCounts: Record<string, number>;
  };
  placementStats: {
    totalStudents: number;
    placedStudents: number;
    placementRate: number;
    averageSalary: number;
    highestSalary: number;
  };
  industryStats: {
    industryConnectionsCount: number;
  };
  collaborationStats: {
    collaborationsCount: number;
  };
  skillDemand: Array<{
    skillId: number;
    skillName: string;
    count: number;
  }>;
  placementTrends?: Array<{
    year: string;
    placedCount: number;
    averagePackage: number;
  }>;
}
