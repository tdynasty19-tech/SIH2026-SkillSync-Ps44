import { Op, fn, col, literal } from 'sequelize';
import '../models';
import { StudentProfile } from '../models/student-profile.model';
import { StudentSkill } from '../models/student-skill.model';
import { Skill } from '../models/skill.model';
import { SkillCategory } from '../models/skill-category.model';
import { AssessmentAttempt } from '../models/assessment-attempt.model';
import { SkillAssessment } from '../models/skill-assessment.model';
import { SkillGap } from '../models/skill-gap.model';
import { StudentCareerInterest } from '../models/student-career-interest.model';
import { CareerRole } from '../models/career-role.model';
import { CareerRoleSkill } from '../models/career-role-skill.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { InstitutionDepartment } from '../models/institution-department.model';
import { StudentInstitutionAffiliation } from '../models/student-institution-affiliation.model';
import { Placement } from '../models/placement.model';
import { PlacementRecord } from '../models/placement-record.model';
import { SkillAnalytics } from '../models/skill-analytics.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { Job } from '../models/job.model';
import { Internship } from '../models/internship.model';
import { Project } from '../models/project.model';
import { Application } from '../models/application.model';
import { Collaboration } from '../models/collaboration.model';
import { IndustryConnection } from '../models/industry-connection.model';
import { Mentor } from '../models/mentor.model';
import { MentorshipRequest } from '../models/mentorship-request.model';
import { MentorshipSession } from '../models/mentorship-session.model';
import { Workshop } from '../models/workshop.model';
import { AcademicianProfile } from '../models/academician-profile.model';
import { User } from '../models/user.model';
import { Portfolio } from '../models/portfolio.model';
import { PortfolioProject } from '../models/portfolio-project.model';
import { PortfolioCertification } from '../models/portfolio-certification.model';
import { PortfolioAchievement } from '../models/portfolio-achievement.model';
import { PortfolioExperience } from '../models/portfolio-experience.model';
import { Notification } from '../models/notification.model';
import {
  StudentSkillLevel,
  AssessmentAttemptStatus,
  SkillGapStatus,
  SkillGapPriority,
  ApplicationStatus,
  OpportunityStatus,
  OpportunityType,
} from '../constants/enums';

export class AnalyticsRepository {
  // ====================================================
  // 1. STUDENT SKILL & ACADEMIC ANALYTICS
  // ====================================================

  public async getStudentSkillSummary(studentId: number) {
    const totalSkills = await StudentSkill.count({ where: { studentId } });
    const verifiedSkills = await StudentSkill.count({ where: { studentId, verified: true } });

    // Level breakdown
    const levelRows = await StudentSkill.findAll({
      where: { studentId },
      attributes: ['level', [fn('COUNT', col('id')), 'count']],
      group: ['level'],
      raw: true,
    });

    const skillLevels: Record<string, number> = {
      [StudentSkillLevel.BEGINNER]: 0,
      [StudentSkillLevel.INTERMEDIATE]: 0,
      [StudentSkillLevel.ADVANCED]: 0,
      [StudentSkillLevel.EXPERT]: 0,
    };
    for (const r of levelRows as any[]) {
      if (r.level && skillLevels[r.level] !== undefined) {
        skillLevels[r.level] = Number(r.count) || 0;
      }
    }

    // Average assessed score
    const avgScoreResult = await StudentSkill.findOne({
      where: { studentId, score: { [Op.ne]: null } },
      attributes: [[fn('AVG', col('score')), 'avgScore']],
      raw: true,
    });
    const avgSkillScore = avgScoreResult && (avgScoreResult as any).avgScore
      ? Number(Number((avgScoreResult as any).avgScore).toFixed(2))
      : 0;

    return {
      totalSkills,
      verifiedSkills,
      skillLevels,
      avgSkillScore,
    };
  }

  public async getStudentTopSkills(studentId: number, limit = 5) {
    return StudentSkill.findAll({
      where: { studentId },
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order: [
        ['score', 'DESC'],
        ['level', 'DESC'],
        ['id', 'ASC'],
      ],
      limit,
    });
  }

  public async getStudentSkillCategories(studentId: number) {
    const skills = await StudentSkill.findAll({
      where: { studentId },
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'name', 'categoryId'],
          include: [
            {
              model: SkillCategory,
              as: 'category',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });

    const categoryMap: Record<string, { categoryId: number | null; categoryName: string; count: number }> = {};
    for (const s of skills) {
      const cat = (s as any).skill?.category;
      const catId = cat ? cat.id : null;
      const catName = cat ? cat.name : 'Uncategorized';
      if (!categoryMap[catName]) {
        categoryMap[catName] = { categoryId: catId, categoryName: catName, count: 0 };
      }
      categoryMap[catName].count++;
    }

    return Object.values(categoryMap).sort((a, b) => b.count - a.count);
  }

  public async getStudentAssessmentStats(studentId: number) {
    const totalAttempts = await AssessmentAttempt.count({ where: { studentId } });
    const completedAttempts = await AssessmentAttempt.count({
      where: { studentId, status: AssessmentAttemptStatus.COMPLETED },
    });

    const avgScoreResult = await AssessmentAttempt.findOne({
      where: { studentId, status: AssessmentAttemptStatus.COMPLETED },
      attributes: [[fn('AVG', col('percentage')), 'avgScore']],
      raw: true,
    });
    const averageScore = avgScoreResult && (avgScoreResult as any).avgScore
      ? Number(Number((avgScoreResult as any).avgScore).toFixed(2))
      : 0;

    return {
      totalAttempts,
      completedAttempts,
      averageScore,
    };
  }

  public async getStudentGapStats(studentId: number) {
    const activeGapsCount = await SkillGap.count({
      where: { studentId, status: { [Op.ne]: SkillGapStatus.RESOLVED } },
    });

    const priorityRows = await SkillGap.findAll({
      where: { studentId, status: { [Op.ne]: SkillGapStatus.RESOLVED } },
      attributes: ['priority', [fn('COUNT', col('id')), 'count']],
      group: ['priority'],
      raw: true,
    });

    const gapPriorities: Record<string, number> = {
      [SkillGapPriority.HIGH]: 0,
      [SkillGapPriority.MEDIUM]: 0,
      [SkillGapPriority.LOW]: 0,
    };
    for (const r of priorityRows as any[]) {
      if (r.priority && gapPriorities[r.priority] !== undefined) {
        gapPriorities[r.priority] = Number(r.count) || 0;
      }
    }

    const topGaps = await SkillGap.findAll({
      where: { studentId, status: { [Op.ne]: SkillGapStatus.RESOLVED } },
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order: [
        ['gapScore', 'DESC'],
        ['id', 'ASC'],
      ],
      limit: 5,
    });

    return {
      totalActiveGaps: activeGapsCount,
      gapPriorities,
      topGaps,
    };
  }

  public async getStudentCareerAlignment(studentId: number) {
    const topInterest = await StudentCareerInterest.findOne({
      where: { studentId },
      include: [
        {
          model: CareerRole,
          as: 'careerRole',
          include: [
            {
              model: CareerRoleSkill,
              as: 'roleSkills',
              include: [{ model: Skill, as: 'skill', attributes: ['id', 'name'] }],
            },
          ],
        },
      ],
      order: [['priorityOrder', 'ASC']],
    });

    if (!topInterest || !(topInterest as any).careerRole) {
      return {
        targetRole: null,
        requiredSkillsCount: 0,
        matchedSkillsCount: 0,
        alignmentPercentage: 0,
      };
    }

    const role = (topInterest as any).careerRole;
    const requiredSkills: any[] = role.roleSkills || [];
    const requiredSkillIds = requiredSkills.map((rs: any) => rs.skillId);

    let matchedSkillsCount = 0;
    if (requiredSkillIds.length > 0) {
      matchedSkillsCount = await StudentSkill.count({
        where: {
          studentId,
          skillId: requiredSkillIds,
        },
      });
    }

    const alignmentPercentage =
      requiredSkillIds.length > 0
        ? Number(((matchedSkillsCount / requiredSkillIds.length) * 100).toFixed(2))
        : 0;

    return {
      targetRole: {
        id: role.id,
        title: role.title,
      },
      requiredSkillsCount: requiredSkillIds.length,
      matchedSkillsCount,
      alignmentPercentage,
    };
  }

  // ====================================================
  // 2. INSTITUTION ANALYTICS
  // ====================================================

  private async getVerifiedStudentIds(institutionId: number): Promise<number[]> {
    const affiliations = await StudentInstitutionAffiliation.findAll({
      where: { institutionId, status: 'VERIFIED' },
      attributes: ['studentId'],
      raw: true,
    });
    return affiliations.map((affiliation: any) => Number(affiliation.studentId));
  }

  public async hasVerifiedInstitutionAffiliation(studentId: number, institutionId: number): Promise<boolean> {
    const affiliation = await StudentInstitutionAffiliation.findOne({
      where: { studentId, institutionId, status: 'VERIFIED' },
      attributes: ['id'],
    });
    return !!affiliation;
  }

  public async getInstitutionStudentOverview(institutionId: number) {
    const studentIds = await this.getVerifiedStudentIds(institutionId);
    if (studentIds.length === 0) {
      return { totalStudents: 0, averageProfileCompletion: 0 };
    }

    const totalStudents = await StudentProfile.count({ where: { id: studentIds } });

    const avgCompletionResult = await StudentProfile.findOne({
      where: { id: studentIds },
      attributes: [[fn('AVG', col('profile_completion')), 'avgCompletion']],
      raw: true,
    });

    const averageProfileCompletion = avgCompletionResult && (avgCompletionResult as any).avgCompletion
      ? Number(Number((avgCompletionResult as any).avgCompletion).toFixed(2))
      : 0;

    return {
      totalStudents,
      averageProfileCompletion,
    };
  }

  public async getInstitutionSkillSummary(institutionId: number) {
    const studentIds = await this.getVerifiedStudentIds(institutionId);
    if (studentIds.length === 0) {
      return {
        totalStudentsWithSkills: 0,
        totalSkillsRecorded: 0,
        verifiedSkillsCount: 0,
        skillLevelDistribution: {
          [StudentSkillLevel.BEGINNER]: 0,
          [StudentSkillLevel.INTERMEDIATE]: 0,
          [StudentSkillLevel.ADVANCED]: 0,
          [StudentSkillLevel.EXPERT]: 0,
        },
        assessmentAverage: 0,
        totalAssessmentsCompleted: 0,
        topGaps: [],
      };
    }

    const students = await StudentProfile.findAll({
      where: { id: studentIds },
      attributes: ['id'],
      raw: true,
    });

    if (students.length === 0) {
      return {
        totalStudentsWithSkills: 0,
        totalSkillsRecorded: 0,
        verifiedSkillsCount: 0,
        skillLevelDistribution: {
          [StudentSkillLevel.BEGINNER]: 0,
          [StudentSkillLevel.INTERMEDIATE]: 0,
          [StudentSkillLevel.ADVANCED]: 0,
          [StudentSkillLevel.EXPERT]: 0,
        },
        assessmentAverage: 0,
        totalAssessmentsCompleted: 0,
        topGaps: [],
      };
    }

    // Unique students with skills
    const studentsWithSkillsResult = await StudentSkill.findOne({
      where: { studentId: studentIds },
      attributes: [[fn('COUNT', fn('DISTINCT', col('student_id'))), 'studentCount']],
      raw: true,
    });
    const totalStudentsWithSkills = studentsWithSkillsResult
      ? Number((studentsWithSkillsResult as any).studentCount) || 0
      : 0;

    const totalSkillsRecorded = await StudentSkill.count({
      where: { studentId: studentIds },
    });

    const verifiedSkillsCount = await StudentSkill.count({
      where: { studentId: studentIds, verified: true },
    });

    // Level breakdown
    const levelRows = await StudentSkill.findAll({
      where: { studentId: studentIds },
      attributes: ['level', [fn('COUNT', col('id')), 'count']],
      group: ['level'],
      raw: true,
    });

    const skillLevelDistribution: Record<string, number> = {
      [StudentSkillLevel.BEGINNER]: 0,
      [StudentSkillLevel.INTERMEDIATE]: 0,
      [StudentSkillLevel.ADVANCED]: 0,
      [StudentSkillLevel.EXPERT]: 0,
    };
    for (const r of levelRows as any[]) {
      if (r.level && skillLevelDistribution[r.level] !== undefined) {
        skillLevelDistribution[r.level] = Number(r.count) || 0;
      }
    }

    // Assessments
    const totalAssessmentsCompleted = await AssessmentAttempt.count({
      where: { studentId: studentIds, status: AssessmentAttemptStatus.COMPLETED },
    });

    const avgAssessmentResult = await AssessmentAttempt.findOne({
      where: { studentId: studentIds, status: AssessmentAttemptStatus.COMPLETED },
      attributes: [[fn('AVG', col('percentage')), 'avgScore']],
      raw: true,
    });
    const assessmentAverage = avgAssessmentResult && (avgAssessmentResult as any).avgScore
      ? Number(Number((avgAssessmentResult as any).avgScore).toFixed(2))
      : 0;

    // Top Gaps across institution students
    const topGapRows = await SkillGap.findAll({
      where: { studentId: studentIds, status: { [Op.ne]: SkillGapStatus.RESOLVED } },
      attributes: [
        'skillId',
        [fn('COUNT', col('SkillGap.id')), 'gapCount'],
        [fn('AVG', col('gap_score')), 'avgGapScore'],
      ],
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      group: ['skillId', 'skill.id'],
      order: [[literal('gapCount'), 'DESC']],
      limit: 10,
    });

    const topGaps = topGapRows.map((r: any) => ({
      skillId: r.skillId,
      skillName: r.skill?.name || 'Unknown',
      gapCount: Number(r.getDataValue('gapCount')) || 0,
      avgGapScore: Number(Number(r.getDataValue('avgGapScore') || 0).toFixed(2)),
    }));

    return {
      totalStudentsWithSkills,
      totalSkillsRecorded,
      verifiedSkillsCount,
      skillLevelDistribution,
      assessmentAverage,
      totalAssessmentsCompleted,
      topGaps,
    };
  }

  public async getInstitutionDepartmentStats(institutionId: number, _institutionName: string) {
    // 1. Check SkillAnalytics table first (authoritative pre-calculated metrics if populated)
    const analyticsRecords = await SkillAnalytics.findAll({
      where: { institutionId },
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'name'],
        },
      ],
      limit: 50,
    });

    // 2. Aggregate department student counts from StudentProfile
    const affiliations = await StudentInstitutionAffiliation.findAll({
      where: { institutionId, status: 'VERIFIED' },
      attributes: ['departmentId'],
      include: [{
        model: InstitutionDepartment,
        as: 'department',
        attributes: ['departmentName'],
      }],
    });

    const departmentCounts = new Map<string, number>();
    for (const affiliation of affiliations as any[]) {
      const departmentName = affiliation.department?.departmentName;
      if (departmentName) {
        departmentCounts.set(departmentName, (departmentCounts.get(departmentName) || 0) + 1);
      }
    }

    const departmentSummary = Array.from(departmentCounts.entries()).map(([department, studentCount]) => ({
      department,
      studentCount,
    }));

    return {
      departmentBreakdown: departmentSummary,
      skillAnalyticsRecords: analyticsRecords.map((rec) => ({
        skillId: rec.skillId,
        skillName: (rec as any).skill?.name,
        department: rec.department,
        averageScore: Number(rec.averageScore),
        totalAssessedStudents: rec.totalAssessedStudents,
        proficientCount: rec.proficientCount,
        gapCount: rec.gapCount,
        academicYear: rec.academicYear,
      })),
    };
  }

  // ====================================================
  // 3. PLACEMENT ANALYTICS
  // ====================================================

  public async getPlacementSummary(institutionId: number, academicYear?: string) {
    const where: any = { institutionId };
    if (academicYear) {
      where.academicYear = academicYear;
    }

    const placements = await Placement.findAll({
      where,
      order: [['academicYear', 'DESC']],
    });

    let totalStudents = 0;
    let placedStudents = 0;
    let higherStudiesStudents = 0;
    let entrepreneurshipStudents = 0;
    let salarySum = 0;
    let salaryCount = 0;
    let highestSalary = 0;

    for (const p of placements) {
      totalStudents += p.totalStudents || 0;
      placedStudents += p.placedStudents || 0;
      higherStudiesStudents += p.higherStudiesStudents || 0;
      entrepreneurshipStudents += p.entrepreneurshipStudents || 0;
      if (p.averageSalary) {
        salarySum += Number(p.averageSalary);
        salaryCount++;
      }
      if (p.highestSalary && Number(p.highestSalary) > highestSalary) {
        highestSalary = Number(p.highestSalary);
      }
    }

    const overallAverageSalary = salaryCount > 0 ? Number((salarySum / salaryCount).toFixed(2)) : 0;
    const placementRate =
      totalStudents > 0 ? Number(((placedStudents / totalStudents) * 100).toFixed(2)) : 0;

    // Detailed records stats
    const placementIds = placements.map((p) => p.id);
    let recordStats = {
      totalRecords: 0,
      recordAverageSalary: 0,
      recordHighestSalary: 0,
      topCompanies: [] as any[],
      departmentPlacements: [] as any[],
    };

    if (placementIds.length > 0) {
      const totalRecords = await PlacementRecord.count({
        where: { placementId: placementIds },
      });

      const avgRecSalary = await PlacementRecord.findOne({
        where: { placementId: placementIds },
        attributes: [
          [fn('AVG', col('package_offered')), 'avgPkg'],
          [fn('MAX', col('package_offered')), 'maxPkg'],
        ],
        raw: true,
      });

      const topCompanyRows = await PlacementRecord.findAll({
        where: { placementId: placementIds },
        attributes: [
          'companyName',
          [fn('COUNT', col('id')), 'offersCount'],
          [fn('AVG', col('package_offered')), 'avgPackage'],
        ],
        group: ['companyName'],
        order: [[literal('offersCount'), 'DESC']],
        limit: 10,
        raw: true,
      });

      const topCompanies = (topCompanyRows as any[]).map((r) => ({
        companyName: r.companyName,
        offersCount: Number(r.offersCount) || 0,
        averagePackage: Number(Number(r.avgPackage || 0).toFixed(2)),
      }));

      // Department breakdown via student association
      const deptPlacements = await PlacementRecord.findAll({
        where: { placementId: placementIds },
        include: [
          {
            model: StudentProfile,
            as: 'student',
            attributes: ['department'],
          },
        ],
        attributes: [[fn('COUNT', col('PlacementRecord.id')), 'count']],
        group: ['student.department'],
        raw: true,
      });

      const departmentBreakdown = (deptPlacements as any[]).map((r) => ({
        department: r['student.department'] || 'Unspecified',
        offersCount: Number(r.count) || 0,
      }));

      recordStats = {
        totalRecords,
        recordAverageSalary: avgRecSalary && (avgRecSalary as any).avgPkg
          ? Number(Number((avgRecSalary as any).avgPkg).toFixed(2))
          : 0,
        recordHighestSalary: avgRecSalary && (avgRecSalary as any).maxPkg
          ? Number(Number((avgRecSalary as any).maxPkg).toFixed(2))
          : 0,
        topCompanies,
        departmentPlacements: departmentBreakdown,
      };
    }

    // Trends across academic years
    const placementTrends = placements.map((p) => ({
      academicYear: p.academicYear,
      totalStudents: p.totalStudents,
      placedStudents: p.placedStudents,
      placementRate:
        p.totalStudents > 0
          ? Number(((p.placedStudents / p.totalStudents) * 100).toFixed(2))
          : 0,
      higherStudies: p.higherStudiesStudents,
      entrepreneurship: p.entrepreneurshipStudents,
      averageSalary: p.averageSalary ? Number(p.averageSalary) : null,
      highestSalary: p.highestSalary ? Number(p.highestSalary) : null,
    }));

    return {
      totalPlacementRecords: recordStats.totalRecords,
      totalStudents,
      placedStudents,
      higherStudiesStudents,
      entrepreneurshipStudents,
      placementRate,
      averageSalary: overallAverageSalary || recordStats.recordAverageSalary,
      highestSalary: highestSalary || recordStats.recordHighestSalary,
      topCompanies: recordStats.topCompanies,
      departmentBreakdown: recordStats.departmentPlacements,
      placementTrends,
    };
  }

  // ====================================================
  // 4. INDUSTRY HIRING & CANDIDATE ANALYTICS
  // ====================================================

  public async getIndustryOpportunityCounts(industryId: number) {
    const activeJobs = await Job.count({
      where: { industryId, status: OpportunityStatus.OPEN },
    });
    const totalJobs = await Job.count({ where: { industryId } });

    const activeInternships = await Internship.count({
      where: { industryId, status: OpportunityStatus.OPEN },
    });
    const totalInternships = await Internship.count({ where: { industryId } });

    const activeProjects = await Project.count({
      where: { industryId, status: OpportunityStatus.OPEN },
    });
    const totalProjects = await Project.count({ where: { industryId } });

    return {
      activeOpportunities: activeJobs + activeInternships + activeProjects,
      totalOpportunities: totalJobs + totalInternships + totalProjects,
      activeJobs,
      totalJobs,
      activeInternships,
      totalInternships,
      activeProjects,
      totalProjects,
    };
  }

  public async getIndustryApplicationAnalytics(
    industryId: number,
    dateFilter?: { from?: string; to?: string }
  ) {
    const [jobs, internships, projects] = await Promise.all([
      Job.findAll({ where: { industryId }, attributes: ['id'], raw: true }),
      Internship.findAll({ where: { industryId }, attributes: ['id'], raw: true }),
      Project.findAll({ where: { industryId }, attributes: ['id'], raw: true }),
    ]);

    const jobIds = jobs.map((j) => j.id);
    const internshipIds = internships.map((i) => i.id);
    const projectIds = projects.map((p) => p.id);

    const orClauses: any[] = [];
    if (jobIds.length > 0) {
      orClauses.push({ opportunityType: OpportunityType.JOB, opportunityId: jobIds });
    }
    if (internshipIds.length > 0) {
      orClauses.push({ opportunityType: OpportunityType.INTERNSHIP, opportunityId: internshipIds });
    }
    if (projectIds.length > 0) {
      orClauses.push({ opportunityType: OpportunityType.PROJECT, opportunityId: projectIds });
    }

    if (orClauses.length === 0) {
      return {
        totalApplications: 0,
        applicationsByStatus: {},
        shortlisted: 0,
        interviewCount: 0,
        selected: 0,
        hiringFunnel: {
          totalApplied: 0,
          underReview: 0,
          shortlisted: 0,
          interviewScheduled: 0,
          offeredOrAccepted: 0,
          rejected: 0,
          withdrawn: 0,
        },
        uniqueCandidates: 0,
        topCandidateSkills: [],
        applicationTrends: [],
      };
    }

    const where: any = { [Op.or]: orClauses };
    if (dateFilter?.from || dateFilter?.to) {
      where.appliedAt = {};
      if (dateFilter.from) where.appliedAt[Op.gte] = new Date(dateFilter.from);
      if (dateFilter.to) where.appliedAt[Op.lte] = new Date(dateFilter.to);
    }

    const totalApplications = await Application.count({ where });

    // Status breakdown
    const statusRows = await Application.findAll({
      where,
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    const applicationsByStatus: Record<string, number> = {};
    for (const r of statusRows as any[]) {
      applicationsByStatus[r.status] = Number(r.count) || 0;
    }

    // Funnel calculations
    const applied = totalApplications;
    const underReview = applicationsByStatus[ApplicationStatus.UNDER_REVIEW] || 0;
    const shortlisted = applicationsByStatus[ApplicationStatus.SHORTLISTED] || 0;
    const interview = applicationsByStatus[ApplicationStatus.INTERVIEW] || 0;
    const selected = applicationsByStatus[ApplicationStatus.SELECTED] || 0;
    const rejected = applicationsByStatus[ApplicationStatus.REJECTED] || 0;

    const hiringFunnel = {
      totalApplied: applied,
      underReview,
      shortlisted,
      interviewScheduled: interview,
      offeredOrAccepted: selected,
      rejected,
    };

    // Unique candidate applicants
    const candidateResult = await Application.findOne({
      where,
      attributes: [[fn('COUNT', fn('DISTINCT', col('student_id'))), 'candidateCount']],
      raw: true,
    });
    const uniqueCandidates = candidateResult ? Number((candidateResult as any).candidateCount) || 0 : 0;

    // Top candidate skills
    const candidateApps = await Application.findAll({
      where,
      attributes: [[fn('DISTINCT', col('student_id')), 'studentId']],
      raw: true,
    });
    const candidateStudentIds = candidateApps.map((ca: any) => ca.studentId).filter(Boolean);

    let topCandidateSkills: any[] = [];
    if (candidateStudentIds.length > 0) {
      const skillRows = await StudentSkill.findAll({
        where: { studentId: candidateStudentIds },
        attributes: ['skillId', [fn('COUNT', col('StudentSkill.id')), 'applicantCount']],
        include: [
          {
            model: Skill,
            as: 'skill',
            attributes: ['id', 'name', 'slug'],
          },
        ],
        group: ['skillId', 'skill.id'],
        order: [[literal('applicantCount'), 'DESC']],
        limit: 10,
      });

      topCandidateSkills = skillRows.map((sr: any) => ({
        skillId: sr.skillId,
        skillName: sr.skill?.name || 'Unknown',
        applicantCount: Number(sr.getDataValue('applicantCount')) || 0,
      }));
    }

    // Application trends: monthly aggregation
    const apps = await Application.findAll({
      where,
      attributes: ['appliedAt', 'createdAt'],
      order: [['appliedAt', 'ASC']],
    });

    const trendMap: Record<string, number> = {};
    for (const a of apps) {
      const date = a.appliedAt || a.createdAt;
      if (date) {
        const key = new Date(date).toISOString().slice(0, 7); // YYYY-MM
        trendMap[key] = (trendMap[key] || 0) + 1;
      }
    }
    const applicationTrends = Object.entries(trendMap).map(([period, count]) => ({
      period,
      count,
    }));

    return {
      totalApplications,
      applicationsByStatus,
      shortlisted,
      interviewCount: interview,
      selected,
      hiringFunnel,
      uniqueCandidates,
      topCandidateSkills,
      applicationTrends,
    };
  }

  // ====================================================
  // 5. GENERIC APPLICATION ANALYTICS
  // ====================================================

  public async getApplicationMetrics(options: {
    studentId?: number;
    opportunityType?: OpportunityType;
    opportunityId?: number;
    status?: ApplicationStatus;
    from?: string;
    to?: string;
    institutionId?: number;
  }) {
    const where: any = {};
    if (options.studentId) where.studentId = options.studentId;
    if (options.opportunityType) where.opportunityType = options.opportunityType;
    if (options.opportunityId) where.opportunityId = options.opportunityId;
    if (options.status) where.status = options.status;

    if (options.from || options.to) {
      where.appliedAt = {};
      if (options.from) where.appliedAt[Op.gte] = new Date(options.from);
      if (options.to) where.appliedAt[Op.lte] = new Date(options.to);
    }

    // If scoped by institution, require a verified affiliation.
    let includeClause: any[] = [];
    if (options.institutionId) {
      includeClause.push({
        model: StudentProfile,
        as: 'student',
        required: true,
        attributes: [],
        include: [{
          model: StudentInstitutionAffiliation,
          as: 'institutionAffiliations',
          where: { institutionId: options.institutionId, status: 'VERIFIED' },
          required: true,
          attributes: [],
        }],
      });
    }

    const total = await Application.count({ where, include: includeClause.length > 0 ? includeClause : undefined });

    const statusRows = await Application.findAll({
      where,
      include: includeClause.length > 0 ? includeClause : undefined,
      attributes: ['status', [fn('COUNT', col('Application.id')), 'count']],
      group: ['status'],
      raw: true,
    });

    const statusCounts: Record<string, number> = {};
    for (const r of statusRows as any[]) {
      statusCounts[r.status] = Number(r.count) || 0;
    }

    const typeRows = await Application.findAll({
      where,
      include: includeClause.length > 0 ? includeClause : undefined,
      attributes: ['opportunityType', [fn('COUNT', col('Application.id')), 'count']],
      group: ['opportunityType'],
      raw: true,
    });

    const opportunityTypeCounts: Record<string, number> = {};
    for (const r of typeRows as any[]) {
      opportunityTypeCounts[r.opportunityType] = Number(r.count) || 0;
    }

    return {
      totalApplications: total,
      statusCounts,
      opportunityTypeCounts,
    };
  }

  // ====================================================
  // 6. SKILL DEMAND ANALYTICS
  // ====================================================

  public async getSkillDemandAnalytics(options: {
    opportunityType?: OpportunityType;
    industryId?: number;
    limit?: number;
    from?: string;
    to?: string;
  }) {
    const limit = options.limit || 20;

    // Fetch active opportunities based on filter
    const jobWhere: any = { status: OpportunityStatus.OPEN };
    const internshipWhere: any = { status: OpportunityStatus.OPEN };
    const projectWhere: any = { status: OpportunityStatus.OPEN };

    if (options.industryId) {
      jobWhere.industryId = options.industryId;
      internshipWhere.industryId = options.industryId;
      projectWhere.industryId = options.industryId;
    }
    if (options.from || options.to) {
      const dateClause: any = {};
      if (options.from) dateClause[Op.gte] = new Date(options.from);
      if (options.to) dateClause[Op.lte] = new Date(options.to);
      jobWhere.createdAt = dateClause;
      internshipWhere.createdAt = dateClause;
      projectWhere.createdAt = dateClause;
    }

    const fetchJobs = !options.opportunityType || options.opportunityType === OpportunityType.JOB;
    const fetchInternships =
      !options.opportunityType || options.opportunityType === OpportunityType.INTERNSHIP;
    const fetchProjects = !options.opportunityType || options.opportunityType === OpportunityType.PROJECT;

    const [activeJobs, activeInternships, activeProjects, allSkills] = await Promise.all([
      fetchJobs ? Job.findAll({ where: jobWhere, attributes: ['id', 'title', 'requirements', 'description', 'industryId'] }) : [],
      fetchInternships ? Internship.findAll({ where: internshipWhere, attributes: ['id', 'title', 'requirements', 'description', 'industryId'] }) : [],
      fetchProjects ? Project.findAll({ where: projectWhere, attributes: ['id', 'title', 'description', 'industryId'] }) : [],
      Skill.findAll({ where: { isActive: true }, attributes: ['id', 'name', 'slug'] }),
    ]);

    // Deterministic skill demand frequency counting
    const demandCountMap: Record<number, { skillId: number; skillName: string; count: number; jobCount: number; internshipCount: number; projectCount: number }> = {};

    for (const skill of allSkills) {
      const regex = new RegExp(`\\b${skill.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      let jobHits = 0;
      let internshipHits = 0;
      let projectHits = 0;

      for (const j of activeJobs) {
        const text = `${j.title} ${j.requirements || ''} ${j.description || ''}`;
        if (regex.test(text)) jobHits++;
      }
      for (const i of activeInternships) {
        const text = `${i.title} ${i.requirements || ''} ${i.description || ''}`;
        if (regex.test(text)) internshipHits++;
      }
      for (const p of activeProjects) {
        const text = `${p.title} ${p.description || ''}`;
        if (regex.test(text)) projectHits++;
      }

      const totalHits = jobHits + internshipHits + projectHits;
      if (totalHits > 0) {
        demandCountMap[skill.id] = {
          skillId: skill.id,
          skillName: skill.name,
          count: totalHits,
          jobCount: jobHits,
          internshipCount: internshipHits,
          projectCount: projectHits,
        };
      }
    }

    const sortedSkills = Object.values(demandCountMap)
      .sort((a, b) => b.count - a.count || a.skillName.localeCompare(b.skillName))
      .slice(0, limit);

    return {
      totalAnalyzedOpportunities: activeJobs.length + activeInternships.length + activeProjects.length,
      topDemandedSkills: sortedSkills,
      opportunityBreakdown: {
        jobsCount: activeJobs.length,
        internshipsCount: activeInternships.length,
        projectsCount: activeProjects.length,
      },
    };
  }

  // ====================================================
  // 7. DASHBOARD AUXILIARY QUERIES
  // ====================================================

  public async getStudentMentorshipStats(studentId: number) {
    const upcomingCount = await MentorshipRequest.count({
      where: {
        studentId,
        status: { [Op.in]: ['PENDING', 'ACCEPTED'] },
      },
    });
    return { upcomingMentorshipRequests: upcomingCount };
  }

  public async getStudentPortfolioStats(studentId: number) {
    const portfolio = await Portfolio.findOne({ where: { studentId } });
    if (!portfolio) {
      return {
        hasPortfolio: false,
        projectsCount: 0,
        certificationsCount: 0,
        achievementsCount: 0,
        experiencesCount: 0,
      };
    }

    const [projectsCount, certificationsCount, achievementsCount, experiencesCount] =
      await Promise.all([
        PortfolioProject.count({ where: { portfolioId: portfolio.id } }),
        PortfolioCertification.count({ where: { portfolioId: portfolio.id } }),
        PortfolioAchievement.count({ where: { portfolioId: portfolio.id } }),
        PortfolioExperience.count({ where: { portfolioId: portfolio.id } }),
      ]);

    return {
      hasPortfolio: true,
      projectsCount,
      certificationsCount,
      achievementsCount,
      experiencesCount,
    };
  }

  public async getUnreadNotificationCount(userId: number) {
    return Notification.count({
      where: { userId, isRead: false },
    });
  }

  public async getInstitutionCollaborationCounts(institutionId: number) {
    const collaborationsCount = await Collaboration.count({ where: { institutionId } });
    const industryConnectionsCount = await IndustryConnection.count({ where: { institutionId } });
    return {
      collaborationsCount,
      industryConnectionsCount,
    };
  }

  public async getStudentRecentAssessmentAttempts(studentId: number, limit = 5) {
    return AssessmentAttempt.findAll({
      where: { studentId },
      include: [
        {
          model: SkillAssessment,
          as: 'assessment',
          attributes: ['id', 'title', 'difficulty', 'passingScore'],
          include: [
            {
              model: Skill,
              as: 'skill',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
    });
  }

  public async getAcademicianDashboardData(userId: number) {
    const profile = await AcademicianProfile.findOne({
      where: { userId },
      include: [
        {
          model: InstitutionProfile,
          as: 'institution',
          attributes: ['id', 'institutionName', 'city', 'state'],
        },
        {
          model: InstitutionDepartment,
          as: 'departmentRecord',
          attributes: ['id', 'institutionId', 'departmentName'],
        },
      ],
    });

    const department = profile?.institutionId && profile.departmentId
      ? await InstitutionDepartment.findOne({
          where: { id: profile.departmentId, institutionId: profile.institutionId },
          attributes: ['id'],
        })
      : null;

    const verifiedStudents = profile?.institutionId && department
      ? await StudentInstitutionAffiliation.findAll({
          where: {
            institutionId: profile.institutionId,
            departmentId: department.id,
            status: 'VERIFIED',
          },
          attributes: ['studentId'],
          raw: true,
        })
      : [];
    const verifiedStudentIds = verifiedStudents.map((affiliation: any) => Number(affiliation.studentId));

    // Student scope is intentionally impossible until relational scope and verified affiliation are valid.
    const studentScope = verifiedStudentIds.length > 0
      ? { id: verifiedStudentIds }
      : { id: { [Op.eq]: 0 } };

    // 1. Mentorship metrics
    const mentor = await Mentor.findOne({ where: { userId } });
    let mentorshipStats = {
      isMentor: !!mentor,
      activeMentees: mentor ? mentor.currentMentees : 0,
      maxMentees: mentor ? mentor.maxMentees : 0,
      isAvailable: mentor ? mentor.isAvailable : false,
      pendingRequestsCount: 0,
      acceptedRequestsCount: 0,
      totalSessionsCompleted: 0,
      recentRequests: [] as any[],
    };

    if (mentor) {
      const [pendingCount, acceptedCount, recentRequests] = await Promise.all([
        MentorshipRequest.count({
          where: { mentorId: mentor.id, status: 'REQUESTED' as any },
        }),
        MentorshipRequest.count({
          where: { mentorId: mentor.id, status: 'ACCEPTED' as any },
        }),
        MentorshipRequest.findAll({
          where: { mentorId: mentor.id },
          include: [
            {
              model: StudentProfile,
              as: 'student',
                where: studentScope,
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'firstName', 'lastName', 'email', 'avatarUrl'],
                },
              ],
            },
          ],
          order: [['requestedAt', 'DESC']],
          limit: 5,
        }),
      ]);

      mentorshipStats.pendingRequestsCount = pendingCount;
      mentorshipStats.acceptedRequestsCount = acceptedCount;
      mentorshipStats.recentRequests = recentRequests;
    }

    const deptStudents = await StudentProfile.findAll({
      where: studentScope,
      attributes: ['id', 'userId', 'collegeName', 'department', 'profileCompletion'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatarUrl'],
        },
      ],
      limit: 100,
    });

    const studentIds = deptStudents.map((s) => s.id);

    // Skill distribution for department students
    const skillLevels: Record<string, number> = {
      [StudentSkillLevel.BEGINNER]: 0,
      [StudentSkillLevel.INTERMEDIATE]: 0,
      [StudentSkillLevel.ADVANCED]: 0,
      [StudentSkillLevel.EXPERT]: 0,
    };

    let departmentTopSkills: any[] = [];
    let commonGaps: any[] = [];
    let averageAssessmentScore = 0;
    let assessedStudentsCount = 0;

    if (studentIds.length > 0) {
      // Skill level counts
      const levelRows = await StudentSkill.findAll({
        where: { studentId: studentIds },
        attributes: ['level', [fn('COUNT', col('id')), 'count']],
        group: ['level'],
        raw: true,
      });
      for (const r of levelRows as any[]) {
        if (r.level && skillLevels[r.level] !== undefined) {
          skillLevels[r.level] = Number(r.count) || 0;
        }
      }

      // Top skills in department
      const topSkillsRows = await StudentSkill.findAll({
        where: { studentId: studentIds },
        attributes: ['skillId', [fn('COUNT', col('StudentSkill.id')), 'count']],
        include: [
          {
            model: Skill,
            as: 'skill',
            attributes: ['id', 'name'],
          },
        ],
        group: ['skillId', 'skill.id', 'skill.name'],
        order: [[literal('count'), 'DESC']],
        limit: 6,
        raw: false,
      });

      departmentTopSkills = topSkillsRows.map((r: any) => ({
        skillId: r.skillId,
        skillName: r.skill?.name || 'Unknown',
        studentCount: Number(r.get('count')) || 0,
      }));

      // Common Skill Gaps in department
      const gapRows = await SkillGap.findAll({
        where: {
          studentId: studentIds,
          status: { [Op.ne]: SkillGapStatus.RESOLVED },
        },
        attributes: ['skillId', [fn('COUNT', col('SkillGap.id')), 'count']],
        include: [
          {
            model: Skill,
            as: 'skill',
            attributes: ['id', 'name'],
          },
        ],
        group: ['skillId', 'skill.id', 'skill.name'],
        order: [[literal('count'), 'DESC']],
        limit: 6,
        raw: false,
      });

      commonGaps = gapRows.map((r: any) => ({
        skillId: r.skillId,
        skillName: r.skill?.name || 'Unknown',
        affectedStudents: Number(r.get('count')) || 0,
      }));

      // Department average assessment score
      const avgAttempt = await AssessmentAttempt.findOne({
        where: {
          studentId: studentIds,
          status: AssessmentAttemptStatus.COMPLETED,
        },
        attributes: [
          [fn('AVG', col('percentage')), 'avgScore'],
          [fn('COUNT', fn('DISTINCT', col('student_id'))), 'assessedCount'],
        ],
        raw: true,
      });

      if (avgAttempt) {
        averageAssessmentScore = Number((avgAttempt as any).avgScore) || 0;
        assessedStudentsCount = Number((avgAttempt as any).assessedCount) || 0;
      }
    }

    // 3. Workshops & Faculty Programs
    const recentWorkshops = await Workshop.findAll({
      order: [['date', 'DESC']],
      limit: 5,
    });

    // 4. Notifications
    const unreadNotifications = await Notification.count({
      where: { userId, isRead: false },
    });

    return {
      academician: {
        department: (profile as any)?.departmentRecord?.departmentName ?? profile?.department ?? 'General Academic',
        designation: profile?.designation || 'Faculty',
        institution: (profile as any)?.institution?.institutionName || 'Affiliated Institution',
        specialization: profile?.specialization || null,
      },
      mentorship: mentorshipStats,
      departmentStats: {
        departmentName: (profile as any)?.departmentRecord?.departmentName ?? profile?.department ?? 'Department',
        totalStudents: deptStudents.length,
        assessedStudentsCount,
        averageAssessmentScore: Number(averageAssessmentScore.toFixed(1)),
        skillDistribution: skillLevels,
        topSkills: departmentTopSkills,
        commonSkillGaps: commonGaps,
        students: deptStudents.slice(0, 10).map((s: any) => ({
          id: s.id,
          name: s.user ? `${s.user.firstName} ${s.user.lastName}` : 'Student',
          email: s.user?.email || '',
          profileCompletion: s.profileCompletion,
        })),
      },
      workshops: recentWorkshops.map((w) => ({
        id: w.id,
        topic: w.topic,
        speakerName: w.speakerName,
        date: w.date,
        durationHours: w.durationHours,
        attendeesCount: w.attendeesCount,
        venue: w.venue,
      })),
      notifications: {
        unreadCount: unreadNotifications,
      },
    };
  }
}

export const analyticsRepository = new AnalyticsRepository();
