import { recommendationRepository, RecommendationRepository } from '../repositories/recommendation.repository';
import { matchingRepository, MatchingRepository } from '../repositories/matching.repository';
import { matchingService, MatchingService, LEVEL_SCORES, MatchingContext } from './matching.service';
import { skillGapService, SkillGapService } from './skill-gap.service';
import { industryRepository, IndustryRepository } from '../repositories/industry.repository';
import {
  OpportunityRecommendationQuery,
  CareerRecommendationQuery,
  LearningRecommendationQuery,
  MentorRecommendationQuery,
  CandidateRecommendationQuery,
} from '../validators/recommendation.validator';
import { NotFoundError, AuthorizationError } from '../errors/app.error';
import { StudentSkillLevel, SkillGapPriority } from '../constants/enums';

export class RecommendationService {
  constructor(
    private readonly repository: RecommendationRepository = recommendationRepository,
    private readonly matchingRepo: MatchingRepository = matchingRepository,
    private readonly matchingServ: MatchingService = matchingService,
    private readonly skillGapServ: SkillGapService = skillGapService,
    private readonly industryRepo: IndustryRepository = industryRepository
  ) {}

  private async resolveStudent(userId: number) {
    const student = await this.matchingRepo.findStudentProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found. Please complete your student profile first.');
    }
    return student;
  }

  /**
   * 1. Recommend opportunities for student
   */
  public async recommendOpportunitiesForStudent(
    userId: number,
    query: OpportunityRecommendationQuery
  ) {
    const student = await this.resolveStudent(userId);

    // Pre-load student & platform data once to eliminate N+1 queries in the loop
    const [openOpportunities, studentSkills, careerInterests, experiences, assessments, activeSkills, careerRoles] =
      await Promise.all([
        this.matchingRepo.getOpenOpportunities(query.type, 100, 0),
        this.matchingRepo.findStudentSkills(student.id),
        this.matchingRepo.findStudentCareerInterests(student.id),
        this.matchingRepo.findStudentExperiences(student.id),
        this.matchingRepo.findStudentAssessments(student.id),
        this.matchingRepo.findActiveSkills(),
        this.matchingRepo.findActiveCareerRoles(),
      ]);

    const context: MatchingContext = {
      student,
      studentSkills,
      careerInterests,
      experiences,
      assessments,
      activeSkills,
      careerRoles,
    };

    const scoredOpportunities = [];

    for (const opp of openOpportunities) {
      const match = await this.matchingServ.calculateMatch(
        student.id,
        opp.id,
        opp.type,
        false,
        { ...context, opportunity: opp }
      );
      if (query.minScore === undefined || match.matchScore >= query.minScore) {
        scoredOpportunities.push({
          opportunity: {
            id: opp.id,
            type: opp.type,
            title: opp.title,
            description: opp.description,
            location: opp.location,
            city: opp.city,
            workplaceType: opp.workplaceType,
            status: opp.status,
            createdAt: opp.createdAt,
          },
          matchScore: match.matchScore,
          breakdown: match.breakdown,
        });
      }
    }

    // Deterministic sort: matchScore DESC, then id ASC
    scoredOpportunities.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return a.opportunity.id - b.opportunity.id;
    });

    const total = scoredOpportunities.length;
    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;
    const paginated = scoredOpportunities.slice(offset, offset + limit);

    return {
      recommendations: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 2. Recommend careers for student
   */
  public async recommendCareersForStudent(
    userId: number,
    query: CareerRecommendationQuery
  ) {
    const student = await this.resolveStudent(userId);

    // Retrieve paginated records
    const offset = (query.page - 1) * query.limit;
    let { rows, count } = await this.repository.getCareerRecommendations(student.id, {
      limit: query.limit,
      offset,
    });

    // If no recommendations exist yet, compute and persist them in parallel
    if (count === 0) {
      const [activeRoles, studentSkills, careerInterests, assessments] = await Promise.all([
        this.matchingRepo.findActiveCareerRoles(),
        this.matchingRepo.findStudentSkills(student.id),
        this.matchingRepo.findStudentCareerInterests(student.id),
        this.matchingRepo.findStudentAssessments(student.id),
      ]);

      const studentSkillMap = new Map<number, (typeof studentSkills)[0]>();
      for (const s of studentSkills) {
        studentSkillMap.set(s.skillId, s);
      }

      const interestMap = new Map<number, number>();
      for (const ci of careerInterests) {
        interestMap.set(ci.careerRoleId, ci.priorityOrder);
      }

      const upsertPromises = activeRoles.map((role) => {
        const roleSkills = (role as any).roleSkills ?? [];
        let skillScore = 0;
        const matchedSkills: string[] = [];
        const missingSkills: string[] = [];

        if (roleSkills.length === 0) {
          skillScore = 100.0;
        } else {
          let totalContribution = 0;
          for (const rs of roleSkills) {
            const sSkill = studentSkillMap.get(rs.skillId);
            const skillName = rs.skill?.name ?? `Skill ${rs.skillId}`;
            if (sSkill) {
              matchedSkills.push(skillName);
              const studentScore =
                sSkill.score !== null && Number(sSkill.score) > 0
                  ? Number(sSkill.score)
                  : LEVEL_SCORES[sSkill.level];
              const reqLevel = (rs.requiredLevel as StudentSkillLevel) ?? StudentSkillLevel.INTERMEDIATE;
              const reqScore = LEVEL_SCORES[reqLevel];
              totalContribution += Math.min(1.0, studentScore / reqScore);
            } else {
              missingSkills.push(skillName);
            }
          }
          skillScore = Number(((totalContribution / roleSkills.length) * 100.0).toFixed(2));
        }

        // Interest component
        let interestScore = 20.0; // Base score for unlisted role
        const priority = interestMap.get(role.id);
        if (priority === 1) interestScore = 100.0;
        else if (priority === 2) interestScore = 80.0;
        else if (priority !== undefined) interestScore = 60.0;

        // Assessment component
        const completedAttempts = assessments.filter((a) => a.completedAt && a.percentage !== null);
        let assessmentScore = 0;
        if (completedAttempts.length > 0) {
          const sum = completedAttempts.reduce((s, a) => s + Number(a.percentage), 0);
          assessmentScore = Number((sum / completedAttempts.length).toFixed(2));
        }

        // Suitability score = 50% skill + 30% interest + 20% assessment
        const suitabilityScore = Number(
          (skillScore * 0.50 + interestScore * 0.30 + assessmentScore * 0.20).toFixed(2)
        );

        const reasoning = {
          skillScore,
          interestScore,
          assessmentScore,
          matchedSkills,
          missingSkills,
          isTargetInterest: priority !== undefined,
          priorityOrder: priority ?? null,
        };

        return this.repository.upsertCareerRecommendation({
          studentId: student.id,
          careerRoleId: role.id,
          matchScore: Math.min(100.0, Math.max(0.0, suitabilityScore)),
          reasoning,
        });
      });

      await Promise.all(upsertPromises);

      const refreshed = await this.repository.getCareerRecommendations(student.id, {
        limit: query.limit,
        offset,
      });
      rows = refreshed.rows;
      count = refreshed.count;
    }

    const enrichedRecommendations = rows.map((rec: any) => {
      const data = rec.toJSON ? rec.toJSON() : rec;
      const reasoning: any = data.reasoning || {};
      const matched = reasoning.matchedSkills || [];
      const missing = reasoning.missingSkills || [];
      const score = Math.round(Number(data.matchScore));

      const whyItFits =
        matched.length > 0
          ? `Strong alignment with your profile: verified skills in ${matched.slice(0, 3).join(', ')} with an overall readiness of ${score}%.`
          : `Aligned with your target interests in ${data.careerRole?.title || 'technical specialization'} with foundational transferable abilities.`;

      const nextSteps: string[] = [];
      if (missing.length > 0) {
        nextSteps.push(`Learn ${missing[0]}`);
        if (missing[1]) nextSteps.push(`Build a practical project applying ${missing[1]}`);
      } else {
        nextSteps.push(`Build a production-level project for ${data.careerRole?.title || 'this role'}`);
      }
      nextSteps.push('Complete platform skill assessment to verify competence');
      nextSteps.push('Apply for matching internship opportunities');

      return {
        ...data,
        readiness: score,
        whyItFits,
        strongSkills: matched,
        skillGaps: missing,
        recommendedNextSteps: nextSteps,
      };
    });

    return {
      careerRecommendations: enrichedRecommendations,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  /**
   * 3. Recommend learning programs for student based on skill gaps
   */
  public async recommendLearningForStudent(
    userId: number,
    query: LearningRecommendationQuery
  ) {
    const student = await this.resolveStudent(userId);

    // Retrieve paginated records
    const offset = (query.page - 1) * query.limit;
    let { rows, count } = await this.repository.getLearningRecommendations(student.id, {
      limit: query.limit,
      offset,
    });

    if (count === 0) {
      // Fetch existing skill gaps or calculate them
      const { skillGaps } = await this.skillGapServ.getStudentGaps(userId, undefined, undefined, 1, 10);
      const gaps = skillGaps.length > 0
        ? skillGaps
        : await this.skillGapServ.calculateGapsForStudent(student.id);

      const upsertPromises: Promise<any>[] = [];
      const activeSkills = await this.matchingRepo.findActiveSkills();

      for (const gap of gaps) {
        if (gap.gapScore <= 0) continue;

        const skill = (gap as any).skill ?? activeSkills.find((s) => s.id === gap.skillId);
        const skillName = skill?.name ?? `Skill ${gap.skillId}`;
        const skillSlug = skill?.slug ?? `skill-${gap.skillId}`;

        upsertPromises.push(
          this.repository.upsertLearningRecommendation({
            studentId: student.id,
            skillId: gap.skillId,
            title: `Comprehensive ${skillName} Mastery Track`,
            resourceUrl: `https://skills.gov.in/courses/${skillSlug}`,
            provider: 'National Skill Qualification Platform',
            duration: '25 hours',
            cost: 0.0,
            priority: gap.priority ?? SkillGapPriority.MEDIUM,
          })
        );
      }

      await Promise.all(upsertPromises);

      const refreshed = await this.repository.getLearningRecommendations(student.id, {
        limit: query.limit,
        offset,
      });
      rows = refreshed.rows;
      count = refreshed.count;
    }

    return {
      learningRecommendations: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  /**
   * 4. Recommend mentors for student
   */
  public async recommendMentorsForStudent(
    userId: number,
    query: MentorRecommendationQuery
  ) {
    const student = await this.resolveStudent(userId);

    const [mentors, studentSkills, careerInterests, { skillGaps }] = await Promise.all([
      this.repository.findEligibleMentors(100),
      this.matchingRepo.findStudentSkills(student.id),
      this.matchingRepo.findStudentCareerInterests(student.id),
      this.skillGapServ.getStudentGaps(userId, undefined, undefined, 1, 50),
    ]);

    const skillNames = studentSkills.map((s: any) => s.skill?.name?.toLowerCase()).filter(Boolean) as string[];
    const gapSkillNames = skillGaps.map((g: any) => g.skill?.name?.toLowerCase()).filter(Boolean) as string[];
    const careerRoleTitles = careerInterests.map((c: any) => c.careerRole?.title?.toLowerCase()).filter(Boolean) as string[];

    const scoredMentors = [];

    for (const m of mentors) {
      const areas = (m.expertiseAreas ?? '').toLowerCase();
      const areaTokens = areas.split(/[,;\s]+/).filter((t) => t.length > 2);
      let relevanceScore = 0;
      const matchedAreas: string[] = [];

      // 1. Overlap with student skill gaps (highest priority: +40 points per match)
      for (const gap of gapSkillNames) {
        if (areas.includes(gap) || areaTokens.some((t) => gap.includes(t))) {
          relevanceScore += 40;
          matchedAreas.push(`Skill Gap: ${gap}`);
        }
      }

      // 2. Overlap with career target roles (+30 points per match)
      for (const role of careerRoleTitles) {
        if (areas.includes(role) || areaTokens.some((t) => role.includes(t))) {
          relevanceScore += 30;
          matchedAreas.push(`Career Role: ${role}`);
        }
      }

      // 3. Overlap with existing skills (+15 points per match)
      for (const sk of skillNames) {
        if ((areas.includes(sk) || areaTokens.some((t) => sk.includes(t))) && !matchedAreas.some((a) => a.includes(sk))) {
          relevanceScore += 15;
          matchedAreas.push(`Skill: ${sk}`);
        }
      }

      // If available and general mentor: minimum baseline score of 20
      if (relevanceScore === 0) {
        relevanceScore = 20;
      }

      const finalRelevance = Math.min(100.0, relevanceScore);

      scoredMentors.push({
        mentor: {
          id: m.id,
          userId: m.userId,
          name: (m as any).user ? `${(m as any).user.firstName} ${(m as any).user.lastName}` : 'Platform Mentor',
          expertiseAreas: m.expertiseAreas,
          maxMentees: m.maxMentees,
          currentMentees: m.currentMentees,
          isAvailable: m.isAvailable,
        },
        relevanceScore: finalRelevance,
        matchedAreas,
      });
    }

    // Deterministic sort: relevanceScore DESC, then mentor id ASC
    scoredMentors.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return a.mentor.id - b.mentor.id;
    });

    const total = scoredMentors.length;
    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;
    const paginated = scoredMentors.slice(offset, offset + limit);

    return {
      mentors: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 5. Recommend industry candidates for an owned opportunity (Industry-facing)
   */
  public async recommendCandidatesForIndustry(
    industryUserId: number,
    query: CandidateRecommendationQuery
  ) {
    const normType = String(query.opportunityType).toUpperCase();
    const opportunity = await this.matchingRepo.findOpportunity(query.opportunityId, normType);
    if (!opportunity) {
      throw new NotFoundError(`Opportunity (${normType} #${query.opportunityId}) not found`);
    }

    const industryProfile = await this.industryRepo.findProfileByUserId(industryUserId);
    if (!industryProfile) {
      throw new NotFoundError('Industry profile not found');
    }

    // Strict IDOR ownership protection: Industry user can only view candidates for their owned opportunity
    if (opportunity.industryId !== industryProfile.id) {
      throw new AuthorizationError('You are not authorized to view candidates for this opportunity');
    }

    const [candidateProfiles, activeSkills, careerRoles] = await Promise.all([
      this.matchingRepo.getCandidateStudentProfiles(100, 0),
      this.matchingRepo.findActiveSkills(),
      this.matchingRepo.findActiveCareerRoles(),
    ]);

    const context: MatchingContext = {
      opportunity,
      activeSkills,
      careerRoles,
    };

    const scoredCandidates = [];

    for (const student of candidateProfiles) {
      const match = await this.matchingServ.calculateMatch(
        student.id,
        query.opportunityId,
        normType,
        false,
        { ...context, student }
      );

      if (query.minScore === undefined || match.matchScore >= query.minScore) {
        scoredCandidates.push({
          candidate: {
            id: student.id,
            name: (student as any).user ? `${(student as any).user.firstName} ${(student as any).user.lastName}` : 'Candidate',
            headline: student.headline,
            collegeName: student.collegeName,
            department: student.department,
            graduationYear: student.graduationYear,
            cgpa: student.cgpa,
            city: student.city,
            state: student.state,
            availabilityStatus: student.availabilityStatus,
          },
          matchScore: match.matchScore,
          breakdown: match.breakdown,
        });
      }
    }

    // Deterministic sort: matchScore DESC, then candidate id ASC
    scoredCandidates.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return a.candidate.id - b.candidate.id;
    });

    const total = scoredCandidates.length;
    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;
    const paginated = scoredCandidates.slice(offset, offset + limit);

    return {
      candidates: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const recommendationService = new RecommendationService();
