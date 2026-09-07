import { matchingRepository, MatchingRepository, PolymorphicOpportunity } from '../repositories/matching.repository';
import { industryRepository, IndustryRepository } from '../repositories/industry.repository';
import { StudentSkillLevel, OpportunityType, WorkplaceType } from '../constants/enums';
import { NotFoundError, AuthorizationError } from '../errors/app.error';
import { Skill } from '../models/skill.model';
import { CareerRole } from '../models/career-role.model';
import { StudentSkill } from '../models/student-skill.model';
import { StudentProfile } from '../models/student-profile.model';
import { StudentCareerInterest } from '../models/student-career-interest.model';
import { StudentExperience } from '../models/student-experience.model';
import { AssessmentAttempt } from '../models/assessment-attempt.model';

export const MATCH_WEIGHTS = {
  SKILL_MATCH: 0.50,
  CAREER_ALIGNMENT: 0.20,
  EXPERIENCE: 0.10,
  ASSESSMENT: 0.10,
  PREFERENCE: 0.10,
} as const;

export const LEVEL_SCORES: Record<StudentSkillLevel, number> = {
  [StudentSkillLevel.BEGINNER]: 25,
  [StudentSkillLevel.INTERMEDIATE]: 50,
  [StudentSkillLevel.ADVANCED]: 75,
  [StudentSkillLevel.EXPERT]: 100,
};

export interface RequiredSkillInfo {
  skillId: number;
  skillName: string;
  requiredLevel?: StudentSkillLevel;
}

export interface MatchingContext {
  student?: StudentProfile;
  opportunity?: PolymorphicOpportunity;
  studentSkills?: StudentSkill[];
  careerInterests?: StudentCareerInterest[];
  experiences?: StudentExperience[];
  assessments?: AssessmentAttempt[];
  activeSkills?: Skill[];
  careerRoles?: CareerRole[];
}

export interface MatchBreakdown {
  weights: typeof MATCH_WEIGHTS;
  skillMatch: {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    totalRequired: number;
    weight: number;
  };
  careerAlignment: {
    score: number;
    matchedRole: string | null;
    weight: number;
  };
  experience: {
    score: number;
    totalMonths: number;
    hasRelevantExperience: boolean;
    weight: number;
  };
  assessment: {
    score: number;
    assessedSkillsCount: number;
    weight: number;
  };
  preference: {
    score: number;
    locationMatch: boolean;
    workplaceType: string | null;
    weight: number;
  };
  finalScore: number;
}

export interface MatchResult {
  studentId: number;
  opportunityId: number;
  opportunityType: string;
  matchScore: number;
  breakdown: MatchBreakdown;
}

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class MatchingService {
  constructor(
    private readonly repository: MatchingRepository = matchingRepository,
    private readonly industryRepo: IndustryRepository = industryRepository
  ) {}

  /**
   * Deterministically extract required skills for an opportunity
   */
  public extractRequiredSkills(
    opportunity: PolymorphicOpportunity,
    activeSkills: Skill[],
    careerRoles: CareerRole[]
  ): RequiredSkillInfo[] {
    const requiredSkillsMap = new Map<number, RequiredSkillInfo>();
    const textToSearch = `${opportunity.title} ${opportunity.description} ${opportunity.requirements ?? ''}`.toLowerCase();

    // 1. Direct keyword scanning against active platform skills (longest name first to avoid false substring subsumption)
    const sortedSkills = [...activeSkills].sort((a, b) => b.name.length - a.name.length);
    const matchedSkillNames: string[] = [];

    for (const skill of sortedSkills) {
      const skillNameLower = skill.name.toLowerCase();
      const slugLower = skill.slug.toLowerCase().replace(/-/g, ' ');
      const regexName = new RegExp(`\\b${escapeRegex(skillNameLower)}\\b`, 'i');
      const regexSlug = new RegExp(`\\b${escapeRegex(slugLower)}\\b`, 'i');

      if (regexName.test(textToSearch) || regexSlug.test(textToSearch)) {
        const isSubsumed = matchedSkillNames.some((m) => m.includes(skillNameLower));
        if (!isSubsumed) {
          matchedSkillNames.push(skillNameLower);
          requiredSkillsMap.set(skill.id, {
            skillId: skill.id,
            skillName: skill.name,
            requiredLevel: StudentSkillLevel.INTERMEDIATE,
          });
        }
      }
    }

    // 2. Check if opportunity title/description matches a standard Career Role
    for (const role of careerRoles) {
      const roleTitleLower = role.title.toLowerCase();
      const regexRole = new RegExp(`\\b${escapeRegex(roleTitleLower)}\\b`, 'i');
      if (regexRole.test(opportunity.title) || regexRole.test(opportunity.description)) {
        if ((role as any).roleSkills) {
          for (const rs of (role as any).roleSkills) {
            const skillName = rs.skill?.name ?? `Skill ${rs.skillId}`;
            requiredSkillsMap.set(rs.skillId, {
              skillId: rs.skillId,
              skillName,
              requiredLevel: rs.requiredLevel,
            });
          }
        }
      }
    }

    return Array.from(requiredSkillsMap.values());
  }

  /**
   * Core deterministic match score computation
   */
  public async calculateMatch(
    studentId: number,
    opportunityId: number,
    opportunityType: OpportunityType | string,
    persist = true,
    context?: MatchingContext
  ): Promise<MatchResult> {
    const normType = String(opportunityType).toUpperCase();
    const opportunity = (context?.opportunity && context.opportunity.id === opportunityId)
      ? context.opportunity
      : await this.repository.findOpportunity(opportunityId, normType);
    if (!opportunity) {
      throw new NotFoundError(`Opportunity (${normType} #${opportunityId}) not found`);
    }

    const student = (context?.student && context.student.id === studentId)
      ? context.student
      : await this.repository.findStudentProfile(studentId);
    if (!student) {
      throw new NotFoundError(`Student profile #${studentId} not found`);
    }

    // Gather student and platform data (reuse pre-loaded context when available to eliminate N+1 loops)
    const [studentSkills, careerInterests, experiences, assessments, activeSkills, careerRoles] =
      await Promise.all([
        (context?.studentSkills && context?.student?.id === studentId)
          ? context.studentSkills
          : this.repository.findStudentSkills(studentId),
        (context?.careerInterests && context?.student?.id === studentId)
          ? context.careerInterests
          : this.repository.findStudentCareerInterests(studentId),
        (context?.experiences && context?.student?.id === studentId)
          ? context.experiences
          : this.repository.findStudentExperiences(studentId),
        (context?.assessments && context?.student?.id === studentId)
          ? context.assessments
          : this.repository.findStudentAssessments(studentId),
        context?.activeSkills ?? this.repository.findActiveSkills(),
        context?.careerRoles ?? this.repository.findActiveCareerRoles(),
      ]);

    // ----------------------------------------------------
    // 1. Skill Match (50% Weight)
    // ----------------------------------------------------
    const requiredSkills = this.extractRequiredSkills(opportunity, activeSkills, careerRoles);
    const studentSkillMap = new Map<number, StudentSkill>();
    for (const s of studentSkills) {
      studentSkillMap.set(s.skillId, s);
    }

    let skillScore = 0;
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    if (requiredSkills.length === 0) {
      // Deterministic fallback: No required skills specified means zero skill barriers
      skillScore = 100.0;
    } else {
      let totalContribution = 0;
      for (const req of requiredSkills) {
        const sSkill = studentSkillMap.get(req.skillId);
        if (sSkill) {
          matchedSkills.push(req.skillName);
          const studentScore =
            sSkill.score !== null && sSkill.score !== undefined && Number(sSkill.score) > 0
              ? Number(sSkill.score)
              : LEVEL_SCORES[sSkill.level];

          const reqLevel = req.requiredLevel ?? StudentSkillLevel.INTERMEDIATE;
          const reqScore = LEVEL_SCORES[reqLevel];
          const contribution = Math.min(1.0, studentScore / reqScore);
          totalContribution += contribution;
        } else {
          missingSkills.push(req.skillName);
        }
      }
      skillScore = Number(((totalContribution / requiredSkills.length) * 100.0).toFixed(2));
    }
    skillScore = Math.max(0.0, Math.min(100.0, skillScore));

    // ----------------------------------------------------
    // 2. Career Alignment (20% Weight)
    // ----------------------------------------------------
    let careerScore = 0;
    let matchedRole: string | null = null;
    const oppText = `${opportunity.title} ${opportunity.description}`.toLowerCase();

    for (const interest of careerInterests) {
      const roleTitle = (interest as any).careerRole?.title ?? '';
      const roleTitleLower = roleTitle.toLowerCase();
      if (roleTitleLower && oppText.includes(roleTitleLower)) {
        if (interest.priorityOrder === 1) {
          careerScore = 100.0;
        } else if (interest.priorityOrder === 2) {
          careerScore = 80.0;
        } else {
          careerScore = 60.0;
        }
        matchedRole = roleTitle;
        break;
      }
    }

    // If direct title match not found, evaluate skill overlap with targeted career role
    if (careerScore === 0 && careerInterests.length > 0) {
      const primaryRole = (careerInterests[0] as any).careerRole;
      if (primaryRole && primaryRole.roleSkills && primaryRole.roleSkills.length > 0) {
        const roleSkillIds = new Set(primaryRole.roleSkills.map((rs: any) => rs.skillId));
        const matchedSkillCount = requiredSkills.filter((r) => roleSkillIds.has(r.skillId)).length;
        if (matchedSkillCount > 0) {
          const overlapRatio = matchedSkillCount / primaryRole.roleSkills.length;
          careerScore = overlapRatio >= 0.5 ? 60.0 : 40.0;
          matchedRole = `${primaryRole.title} (Skill Overlap)`;
        }
      }
    }

    // Check student profile careerGoal if still 0
    if (careerScore === 0 && student.careerGoal) {
      const goalLower = student.careerGoal.toLowerCase();
      if (oppText.includes(goalLower) || goalLower.includes(opportunity.title.toLowerCase())) {
        careerScore = 50.0;
        matchedRole = student.careerGoal;
      }
    }
    careerScore = Math.max(0.0, Math.min(100.0, careerScore));

    // ----------------------------------------------------
    // 3. Experience Alignment (10% Weight)
    // ----------------------------------------------------
    let totalMonths = 0;
    let hasRelevantExperience = false;
    const titleWords = opportunity.title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);

    for (const exp of experiences) {
      const start = new Date(exp.startDate).getTime();
      const end = exp.endDate ? new Date(exp.endDate).getTime() : Date.now();
      const months = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24 * 30.4375)));
      totalMonths += months;

      const expText = `${exp.title} ${exp.description ?? ''}`.toLowerCase();
      if (titleWords.some((word) => expText.includes(word))) {
        hasRelevantExperience = true;
      }
    }

    let experienceScore = 0;
    if (hasRelevantExperience) {
      experienceScore = totalMonths >= 12 ? 100.0 : 80.0;
    } else if (totalMonths >= 12) {
      experienceScore = 70.0;
    } else if (totalMonths > 0) {
      experienceScore = 50.0;
    } else {
      experienceScore = 0.0;
    }
    experienceScore = Math.max(0.0, Math.min(100.0, experienceScore));

    // ----------------------------------------------------
    // 4. Assessment Performance (10% Weight)
    // ----------------------------------------------------
    let assessmentScore = 0;
    let assessedSkillsCount = 0;

    const completedAttempts = assessments.filter((a) => a.completedAt && a.percentage !== null);
    const reqSkillIds = new Set(requiredSkills.map((r) => r.skillId));

    // Check attempts matching required skills
    const relevantAttempts = completedAttempts.filter((a) =>
      (a as any).assessment?.skillId ? reqSkillIds.has((a as any).assessment.skillId) : false
    );

    if (relevantAttempts.length > 0) {
      const sumPercentage = relevantAttempts.reduce(
        (sum, a) => sum + (a.percentage !== null ? Number(a.percentage) : 0),
        0
      );
      assessmentScore = Number((sumPercentage / relevantAttempts.length).toFixed(2));
      assessedSkillsCount = relevantAttempts.length;
    } else if (completedAttempts.length > 0) {
      // General assessments completed
      const sumPercentage = completedAttempts.reduce(
        (sum, a) => sum + (a.percentage !== null ? Number(a.percentage) : 0),
        0
      );
      assessmentScore = Number(((sumPercentage / completedAttempts.length) * 0.70).toFixed(2));
      assessedSkillsCount = completedAttempts.length;
    } else {
      // Check verified student skill scores
      const verifiedWithScore = studentSkills.filter(
        (s) => s.verified && s.score !== null && Number(s.score) > 0
      );
      if (verifiedWithScore.length > 0) {
        const sumScores = verifiedWithScore.reduce((sum, s) => sum + Number(s.score), 0);
        assessmentScore = Number((sumScores / verifiedWithScore.length).toFixed(2));
        assessedSkillsCount = verifiedWithScore.length;
      } else {
        assessmentScore = 0.0;
      }
    }
    assessmentScore = Math.max(0.0, Math.min(100.0, assessmentScore));

    // ----------------------------------------------------
    // 5. Preference Alignment (10% Weight)
    // ----------------------------------------------------
    let locationPoints = 0;
    let locationMatch = false;

    if (
      opportunity.workplaceType === WorkplaceType.REMOTE ||
      String(opportunity.workplaceType).toUpperCase() === 'REMOTE'
    ) {
      locationPoints = 50.0;
      locationMatch = true;
    } else if (
      opportunity.city &&
      student.city &&
      opportunity.city.trim().toLowerCase() === student.city.trim().toLowerCase()
    ) {
      locationPoints = 50.0;
      locationMatch = true;
    } else if (
      opportunity.state &&
      student.state &&
      opportunity.state.trim().toLowerCase() === student.state.trim().toLowerCase()
    ) {
      locationPoints = 35.0;
      locationMatch = true;
    } else if (!opportunity.location && !opportunity.city) {
      locationPoints = 25.0; // Open/unspecified location
    } else {
      locationPoints = 0.0;
    }

    let availabilityPoints = 0;
    const availStatus = (student.availabilityStatus ?? '').toUpperCase();
    if (
      availStatus === 'AVAILABLE' ||
      availStatus === 'OPEN_TO_WORK' ||
      availStatus === 'IMMEDIATE' ||
      availStatus === 'LOOKING'
    ) {
      availabilityPoints = 50.0;
    } else if (availStatus === 'NOT_AVAILABLE' || availStatus === 'UNAVAILABLE') {
      availabilityPoints = 0.0;
    } else {
      availabilityPoints = 30.0; // Neutral default
    }

    const preferenceScore = Math.max(0.0, Math.min(100.0, locationPoints + availabilityPoints));

    // ----------------------------------------------------
    // Final Match Score = 50% Skill + 20% Career + 10% Exp + 10% Assessment + 10% Pref
    // ----------------------------------------------------
    const finalScore = Number(
      (
        skillScore * MATCH_WEIGHTS.SKILL_MATCH +
        careerScore * MATCH_WEIGHTS.CAREER_ALIGNMENT +
        experienceScore * MATCH_WEIGHTS.EXPERIENCE +
        assessmentScore * MATCH_WEIGHTS.ASSESSMENT +
        preferenceScore * MATCH_WEIGHTS.PREFERENCE
      ).toFixed(2)
    );

    const breakdown: MatchBreakdown = {
      weights: MATCH_WEIGHTS,
      skillMatch: {
        score: skillScore,
        matchedSkills,
        missingSkills,
        totalRequired: requiredSkills.length,
        weight: MATCH_WEIGHTS.SKILL_MATCH,
      },
      careerAlignment: {
        score: careerScore,
        matchedRole,
        weight: MATCH_WEIGHTS.CAREER_ALIGNMENT,
      },
      experience: {
        score: experienceScore,
        totalMonths,
        hasRelevantExperience,
        weight: MATCH_WEIGHTS.EXPERIENCE,
      },
      assessment: {
        score: assessmentScore,
        assessedSkillsCount,
        weight: MATCH_WEIGHTS.ASSESSMENT,
      },
      preference: {
        score: preferenceScore,
        locationMatch,
        workplaceType: opportunity.workplaceType ?? null,
        weight: MATCH_WEIGHTS.PREFERENCE,
      },
      finalScore,
    };

    if (persist) {
      await this.repository.upsertOpportunityMatch({
        studentId,
        opportunityId,
        opportunityType: normType,
        matchScore: finalScore,
        breakdown,
      });
    }

    return {
      studentId,
      opportunityId,
      opportunityType: normType,
      matchScore: finalScore,
      breakdown,
    };
  }

  /**
   * Match an opportunity for authenticated student
   */
  public async matchOpportunityForStudent(
    userId: number,
    opportunityId: number,
    opportunityType: OpportunityType | string
  ) {
    const student = await this.repository.findStudentProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found');
    }
    return this.calculateMatch(student.id, opportunityId, opportunityType, true);
  }

  /**
   * Match candidate for opportunity owner (Industry user)
   */
  public async matchCandidateForIndustry(
    industryUserId: number,
    opportunityId: number,
    opportunityType: OpportunityType | string,
    studentId: number
  ) {
    const normType = String(opportunityType).toUpperCase();
    const opportunity = await this.repository.findOpportunity(opportunityId, normType);
    if (!opportunity) {
      throw new NotFoundError(`Opportunity (${normType} #${opportunityId}) not found`);
    }

    const industryProfile = await this.industryRepo.findProfileByUserId(industryUserId);
    if (!industryProfile) {
      throw new NotFoundError('Industry profile not found');
    }

    if (opportunity.industryId !== industryProfile.id) {
      throw new AuthorizationError('You are not authorized to view matching data for this opportunity');
    }

    return this.calculateMatch(studentId, opportunityId, normType, false);
  }

  /**
   * Match opportunity by ID with access control checks
   */
  public async getOpportunityMatchById(
    userId: number,
    opportunityId: number,
    opportunityType: string,
    targetStudentId?: number
  ) {
    const student = await this.repository.findStudentProfileByUserId(userId);

    if (student) {
      // Caller is student, only compute for themselves
      return this.calculateMatch(student.id, opportunityId, opportunityType, true);
    }

    // Caller is not student (e.g. Industry)
    if (!targetStudentId) {
      throw new NotFoundError('studentId parameter is required to view candidate matching');
    }

    return this.matchCandidateForIndustry(userId, opportunityId, opportunityType, targetStudentId);
  }

  /**
   * Get student matches by student ID (IDOR protected)
   */
  public async getStudentMatches(
    userId: number,
    studentId: number,
    opportunityId: number,
    opportunityType: string
  ) {
    const student = await this.repository.findStudentProfileByUserId(userId);
    if (student) {
      // Ensure student can only view their own match
      if (student.id !== studentId) {
        throw new AuthorizationError('You are not authorized to view matches for another student');
      }
      return this.calculateMatch(student.id, opportunityId, opportunityType, true);
    }

    // Industry user checking candidate match
    return this.matchCandidateForIndustry(userId, opportunityId, opportunityType, studentId);
  }
}

export const matchingService = new MatchingService();
