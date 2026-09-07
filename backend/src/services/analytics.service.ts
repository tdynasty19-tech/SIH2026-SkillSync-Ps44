import { analyticsRepository, AnalyticsRepository } from '../repositories/analytics.repository';
import { studentRepository, StudentRepository } from '../repositories/student.repository';
import { industryRepository, IndustryRepository } from '../repositories/industry.repository';
import { institutionRepository, InstitutionRepository } from '../repositories/institution.repository';
import { applicationRepository, ApplicationRepository } from '../repositories/application.repository';
import { skillGapService, SkillGapService } from './skill-gap.service';
import { recommendationService, RecommendationService } from './recommendation.service';
import {
  StudentSkillAnalyticsQuery,
  InstitutionAnalyticsQuery,
  IndustryHiringAnalyticsQuery,
  ApplicationAnalyticsQuery,
  SkillDemandAnalyticsQuery,
} from '../validators/analytics.validator';
import { NotFoundError, AuthorizationError, ValidationError } from '../errors/app.error';
import { UserRole } from '../constants/roles';
import { OpportunityType } from '../constants/enums';

export class AnalyticsService {
  constructor(
    private readonly analyticsRepo: AnalyticsRepository = analyticsRepository,
    private readonly studentRepo: StudentRepository = studentRepository,
    private readonly industryRepo: IndustryRepository = industryRepository,
    private readonly institutionRepo: InstitutionRepository = institutionRepository,
    private readonly appRepo: ApplicationRepository = applicationRepository,
    private readonly skillGapServ: SkillGapService = skillGapService,
    private readonly recServ: RecommendationService = recommendationService
  ) {}

  // ====================================================
  // 1. STUDENT SKILL ANALYTICS
  // ====================================================

  public async getStudentSkillAnalytics(
    studentId: number,
    requestingUser?: { id: number; role: string }
  ) {
    const student = await this.studentRepo.findProfileById(studentId);
    if (!student) {
      throw new NotFoundError(`Student profile not found for ID: ${studentId}`);
    }

    // Role-based Access Control & IDOR Prevention
    if (requestingUser) {
      if (requestingUser.role === UserRole.STUDENT) {
        const authStudent = await this.studentRepo.findProfileByUserId(requestingUser.id);
        if (!authStudent || authStudent.id !== studentId) {
          throw new AuthorizationError('You can only access your own skill analytics');
        }
      } else if (requestingUser.role === UserRole.INSTITUTION) {
        const institution = await this.institutionRepo.findProfileByUserId(requestingUser.id);
        if (!institution || !(await this.analyticsRepo.hasVerifiedInstitutionAffiliation(studentId, institution.id))) {
          throw new AuthorizationError(
            'You can only access analytics for students enrolled in your institution'
          );
        }
      } else {
        throw new AuthorizationError('Unauthorized to view student skill analytics');
      }
    }

    const [summary, topSkills, categories, assessments, gaps, careerAlignment] =
      await Promise.all([
        this.analyticsRepo.getStudentSkillSummary(studentId),
        this.analyticsRepo.getStudentTopSkills(studentId, 10),
        this.analyticsRepo.getStudentSkillCategories(studentId),
        this.analyticsRepo.getStudentAssessmentStats(studentId),
        this.analyticsRepo.getStudentGapStats(studentId),
        this.analyticsRepo.getStudentCareerAlignment(studentId),
      ]);

    return {
      studentId,
      totalSkills: summary.totalSkills,
      verifiedSkills: summary.verifiedSkills,
      skillLevels: summary.skillLevels,
      averageSkillScore: summary.avgSkillScore,
      strongestSkills: topSkills.map((s: any) => ({
        id: s.id,
        skillId: s.skillId,
        skillName: s.skill?.name || 'Unknown',
        slug: s.skill?.slug || '',
        level: s.level,
        score: s.score,
        verified: s.verified,
        yearsOfExperience: s.yearsOfExperience,
      })),
      skillDistribution: categories,
      assessmentPerformance: assessments,
      skillGaps: gaps,
      careerAlignment,
    };
  }

  // ====================================================
  // 2. INSTITUTION SKILL ANALYTICS
  // ====================================================

  public async getInstitutionSkillAnalytics(
    institutionId: number,
    requestingUser?: { id: number; role: string }
  ) {
    const institution = await this.institutionRepo.findProfileById(institutionId);
    if (!institution) {
      throw new NotFoundError(`Institution profile not found for ID: ${institutionId}`);
    }

    // RBAC & IDOR Prevention
    if (requestingUser) {
      if (requestingUser.role === UserRole.INSTITUTION) {
        const authInstitution = await this.institutionRepo.findProfileByUserId(requestingUser.id);
        if (!authInstitution || authInstitution.id !== institutionId) {
          throw new AuthorizationError('You can only access your own institution analytics');
        }
      } else {
        throw new AuthorizationError('Unauthorized to view institution analytics');
      }
    }

    const [studentOverview, skillSummary, departmentStats] = await Promise.all([
      this.analyticsRepo.getInstitutionStudentOverview(institutionId),
      this.analyticsRepo.getInstitutionSkillSummary(institutionId),
      this.analyticsRepo.getInstitutionDepartmentStats(institutionId, institution.institutionName),
    ]);

    return {
      institutionId,
      institutionName: institution.institutionName,
      studentStats: studentOverview,
      skillDistribution: {
        totalStudentsWithSkills: skillSummary.totalStudentsWithSkills,
        totalSkillsRecorded: skillSummary.totalSkillsRecorded,
        verifiedSkillsCount: skillSummary.verifiedSkillsCount,
        skillLevelDistribution: skillSummary.skillLevelDistribution,
      },
      assessmentPerformance: {
        averageScore: skillSummary.assessmentAverage,
        totalAssessmentsCompleted: skillSummary.totalAssessmentsCompleted,
      },
      skillGaps: {
        topGaps: skillSummary.topGaps,
      },
      departmentStats,
    };
  }

  // ====================================================
  // 3. PLACEMENT ANALYTICS
  // ====================================================

  public async getPlacementAnalytics(
    institutionId: number,
    requestingUser?: { id: number; role: string },
    academicYear?: string
  ) {
    const institution = await this.institutionRepo.findProfileById(institutionId);
    if (!institution) {
      throw new NotFoundError(`Institution profile not found for ID: ${institutionId}`);
    }

    // RBAC & IDOR Prevention
    if (requestingUser) {
      if (requestingUser.role === UserRole.INSTITUTION) {
        const authInstitution = await this.institutionRepo.findProfileByUserId(requestingUser.id);
        if (!authInstitution || authInstitution.id !== institutionId) {
          throw new AuthorizationError('You can only access your own institution placement analytics');
        }
      } else {
        throw new AuthorizationError('Unauthorized to view institution placement analytics');
      }
    }

    const placementData = await this.analyticsRepo.getPlacementSummary(institutionId, academicYear);

    return {
      institutionId,
      institutionName: institution.institutionName,
      academicYear: academicYear || 'ALL',
      ...placementData,
    };
  }

  // ====================================================
  // 4. INDUSTRY HIRING ANALYTICS
  // ====================================================

  public async getIndustryHiringAnalytics(
    industryId: number,
    requestingUser?: { id: number; role: string },
    query?: IndustryHiringAnalyticsQuery
  ) {
    const industry = await this.industryRepo.findProfileById(industryId);
    if (!industry) {
      throw new NotFoundError(`Industry profile not found for ID: ${industryId}`);
    }

    // RBAC & IDOR Prevention
    if (requestingUser) {
      if (requestingUser.role === UserRole.INDUSTRY) {
        const authIndustry = await this.industryRepo.findProfileByUserId(requestingUser.id);
        if (!authIndustry || authIndustry.id !== industryId) {
          throw new AuthorizationError('You can only access your own industry hiring analytics');
        }
      } else {
        throw new AuthorizationError('Unauthorized to view industry hiring analytics');
      }
    }

    const dateFilter = query?.from || query?.to ? { from: query.from, to: query.to } : undefined;

    const [oppCounts, appAnalytics] = await Promise.all([
      this.analyticsRepo.getIndustryOpportunityCounts(industryId),
      this.analyticsRepo.getIndustryApplicationAnalytics(industryId, dateFilter),
    ]);

    return {
      industryId,
      companyName: industry.companyName,
      activeOpportunities: oppCounts.activeOpportunities,
      totalOpportunities: oppCounts.totalOpportunities,
      opportunityBreakdown: {
        jobs: { active: oppCounts.activeJobs, total: oppCounts.totalJobs },
        internships: { active: oppCounts.activeInternships, total: oppCounts.totalInternships },
        projects: { active: oppCounts.activeProjects, total: oppCounts.totalProjects },
      },
      totalApplications: appAnalytics.totalApplications,
      applicationsByStatus: appAnalytics.applicationsByStatus,
      shortlisted: appAnalytics.shortlisted,
      interviewCount: appAnalytics.interviewCount,
      selected: appAnalytics.selected,
      hiringFunnel: appAnalytics.hiringFunnel,
      candidateStats: {
        uniqueApplicants: appAnalytics.uniqueCandidates,
      },
      topCandidateSkills: appAnalytics.topCandidateSkills,
      applicationTrends: appAnalytics.applicationTrends,
    };
  }

  // ====================================================
  // 5. APPLICATION ANALYTICS
  // ====================================================

  public async getApplicationAnalytics(
    query: ApplicationAnalyticsQuery,
    requestingUser: { id: number; role: string }
  ) {
    const filterOptions: any = {
      opportunityType: query.opportunityType,
      status: query.status,
      opportunityId: query.opportunityId,
      from: query.from,
      to: query.to,
    };

    if (requestingUser.role === UserRole.STUDENT) {
      const student = await this.studentRepo.findProfileByUserId(requestingUser.id);
      if (!student) {
        throw new NotFoundError('Student profile not found');
      }
      filterOptions.studentId = student.id;
      return this.analyticsRepo.getApplicationMetrics(filterOptions);
    }

    if (requestingUser.role === UserRole.INDUSTRY) {
      const industry = await this.industryRepo.findProfileByUserId(requestingUser.id);
      if (!industry) {
        throw new NotFoundError('Industry profile not found');
      }
      return this.getIndustryHiringAnalytics(industry.id, requestingUser, query);
    }

    if (requestingUser.role === UserRole.INSTITUTION) {
      const institution = await this.institutionRepo.findProfileByUserId(requestingUser.id);
      if (!institution) {
        throw new NotFoundError('Institution profile not found');
      }
      filterOptions.institutionId = institution.id;
      return this.analyticsRepo.getApplicationMetrics(filterOptions);
    }

    throw new AuthorizationError('Unauthorized to view application analytics');
  }

  // ====================================================
  // 6. SKILL DEMAND ANALYTICS
  // ====================================================

  public async getSkillDemandAnalytics(query: SkillDemandAnalyticsQuery) {
    return this.analyticsRepo.getSkillDemandAnalytics({
      opportunityType: query.opportunityType,
      industryId: query.industryId,
      limit: query.limit,
      from: query.from,
      to: query.to,
    });
  }

  // ====================================================
  // 7. MAJOR ROLE DASHBOARDS
  // ====================================================

  /**
   * Student Dashboard: GET /api/v1/students/me/dashboard
   */
  public async getStudentDashboard(userId: number) {
    const student = await this.studentRepo.findProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found. Please complete your profile first.');
    }

    const studentId = student.id;

    // Parallel retrieval of authoritative dashboard fields
    const [
      skillSummary,
      topSkills,
      assessmentStats,
      recentAttempts,
      skillGapsData,
      recommendedCareersData,
      recommendedInternshipsData,
      recommendedJobsData,
      recentAppsData,
      appStats,
      learningProgressData,
      mentorshipStats,
      notificationsCount,
      portfolioStats,
    ] = await Promise.all([
      this.analyticsRepo.getStudentSkillSummary(studentId),
      this.analyticsRepo.getStudentTopSkills(studentId, 5),
      this.analyticsRepo.getStudentAssessmentStats(studentId),
      this.analyticsRepo.getStudentRecentAssessmentAttempts(studentId, 5),
      this.skillGapServ.getStudentGaps(userId, undefined, undefined, 1, 5).catch(() => ({ skillGaps: [] })),
      this.recServ.recommendCareersForStudent(userId, { page: 1, limit: 3 }).catch(() => ({ recommendations: [] })),
      this.recServ.recommendOpportunitiesForStudent(userId, { type: OpportunityType.INTERNSHIP, page: 1, limit: 3 }).catch(() => ({ recommendations: [] })),
      this.recServ.recommendOpportunitiesForStudent(userId, { type: OpportunityType.JOB, page: 1, limit: 3 }).catch(() => ({ recommendations: [] })),
      this.appRepo.findStudentApplications(studentId, { page: 1, limit: 5 }, 5, 0).catch(() => ({ rows: [] })),
      this.analyticsRepo.getApplicationMetrics({ studentId }),
      this.recServ.recommendLearningForStudent(userId, { page: 1, limit: 3 }).catch(() => ({ recommendations: [] })),
      this.analyticsRepo.getStudentMentorshipStats(studentId),
      this.analyticsRepo.getUnreadNotificationCount(userId),
      this.analyticsRepo.getStudentPortfolioStats(studentId),
    ]);

    return {
      profileCompletion: student.profileCompletion,
      headline: student.headline,
      department: student.department,
      collegeName: student.collegeName,
      graduationYear: student.graduationYear,
      skillSummary: {
        totalSkills: skillSummary.totalSkills,
        verifiedSkills: skillSummary.verifiedSkills,
        skillLevels: skillSummary.skillLevels,
        averageScore: skillSummary.avgSkillScore,
      },
      topSkills: topSkills.map((s: any) => ({
        id: s.id,
        skillId: s.skillId,
        skillName: s.skill?.name || 'Unknown',
        level: s.level,
        score: s.score,
        verified: s.verified,
      })),
      assessmentOverview: {
        totalAttempts: assessmentStats.totalAttempts,
        completedAttempts: assessmentStats.completedAttempts,
        averageScore: assessmentStats.averageScore,
        recentAttempts: (recentAttempts || []).map((a: any) => ({
          id: a.id,
          title: a.assessment?.title || 'Assessment',
          skillName: a.assessment?.skill?.name || 'Skill',
          score: a.score,
          percentage: a.percentage,
          status: a.status,
          date: a.createdAt,
        })),
      },
      skillGaps: (skillGapsData as any).skillGaps || [],
      recommendedCareers: (recommendedCareersData as any).careerRecommendations || (recommendedCareersData as any).recommendations || [],
      recommendedInternships: (recommendedInternshipsData as any).recommendations || [],
      recommendedJobs: (recommendedJobsData as any).recommendations || [],
      recentApplications: (recentAppsData as any).rows || [],
      applicationStats: appStats.statusCounts,
      learningProgress: (learningProgressData as any).learningRecommendations || (learningProgressData as any).recommendations || [],
      upcomingMentorship: mentorshipStats,
      notifications: {
        unreadCount: notificationsCount,
      },
      portfolioStats,
    };
  }

  /**
   * Industry Dashboard: GET /api/v1/industry/dashboard
   */
  public async getIndustryDashboard(userId: number) {
    const industry = await this.industryRepo.findProfileByUserId(userId);
    if (!industry) {
      throw new NotFoundError('Industry profile not found. Please complete your profile first.');
    }

    const hiringData = await this.getIndustryHiringAnalytics(industry.id, {
      id: userId,
      role: UserRole.INDUSTRY,
    });

    return {
      companyName: hiringData.companyName,
      activeOpportunities: hiringData.activeOpportunities,
      totalOpportunities: hiringData.totalOpportunities,
      opportunityBreakdown: hiringData.opportunityBreakdown,
      applications: hiringData.totalApplications,
      totalApplications: hiringData.totalApplications,
      applicationsByStatus: hiringData.applicationsByStatus,
      shortlisted: hiringData.shortlisted,
      interviewCount: hiringData.interviewCount,
      selected: hiringData.selected,
      candidateStats: hiringData.candidateStats,
      applicationTrends: hiringData.applicationTrends,
      hiringFunnel: hiringData.hiringFunnel,
      topCandidateSkills: hiringData.topCandidateSkills,
    };
  }

  /**
   * Academician Dashboard: GET /api/v1/academician/dashboard
   */
  public async getAcademicianDashboard(userId: number) {
    return this.analyticsRepo.getAcademicianDashboardData(userId);
  }

  /**
   * Institution Dashboard: GET /api/v1/institution/dashboard
   */
  public async getInstitutionDashboard(userId: number) {
    const institution = await this.institutionRepo.findProfileByUserId(userId);
    if (!institution) {
      throw new NotFoundError('Institution profile not found. Please complete your profile first.');
    }

    const institutionId = institution.id;

    const [
      studentOverview,
      skillSummary,
      internshipApps,
      placementData,
      collaborationData,
      skillDemandData,
    ] = await Promise.all([
      this.analyticsRepo.getInstitutionStudentOverview(institutionId),
      this.analyticsRepo.getInstitutionSkillSummary(institutionId),
      this.analyticsRepo.getApplicationMetrics({
        institutionId,
        opportunityType: OpportunityType.INTERNSHIP,
      }),
      this.analyticsRepo.getPlacementSummary(institutionId),
      this.analyticsRepo.getInstitutionCollaborationCounts(institutionId),
      this.analyticsRepo.getSkillDemandAnalytics({ limit: 5 }),
    ]);

    return {
      studentStats: studentOverview,
      skillStats: {
        totalStudentsWithSkills: skillSummary.totalStudentsWithSkills,
        totalSkillsRecorded: skillSummary.totalSkillsRecorded,
        verifiedSkillsCount: skillSummary.verifiedSkillsCount,
        skillLevelDistribution: skillSummary.skillLevelDistribution,
        topGaps: skillSummary.topGaps,
      },
      assessmentStats: {
        averageScore: skillSummary.assessmentAverage,
        totalAssessmentsCompleted: skillSummary.totalAssessmentsCompleted,
      },
      internshipStats: {
        totalApplications: internshipApps.totalApplications,
        statusCounts: internshipApps.statusCounts,
      },
      placementStats: {
        totalStudents: placementData.totalStudents,
        placedStudents: placementData.placedStudents,
        placementRate: placementData.placementRate,
        averageSalary: placementData.averageSalary,
        highestSalary: placementData.highestSalary,
      },
      industryStats: {
        industryConnectionsCount: collaborationData.industryConnectionsCount,
      },
      collaborationStats: {
        collaborationsCount: collaborationData.collaborationsCount,
      },
      skillDemand: skillDemandData.topDemandedSkills,
      placementTrends: placementData.placementTrends,
    };
  }
}

export const analyticsService = new AnalyticsService();
