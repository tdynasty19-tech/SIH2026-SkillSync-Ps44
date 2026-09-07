import { Op, Transaction } from 'sequelize';
import '../models';
import { OpportunityMatch, OpportunityMatchCreationAttributes } from '../models/opportunity-match.model';
import { StudentProfile } from '../models/student-profile.model';
import { StudentSkill } from '../models/student-skill.model';
import { StudentCareerInterest } from '../models/student-career-interest.model';
import { StudentExperience } from '../models/student-experience.model';
import { AssessmentAttempt } from '../models/assessment-attempt.model';
import { SkillAssessment } from '../models/skill-assessment.model';
import { Skill } from '../models/skill.model';
import { CareerRole } from '../models/career-role.model';
import { CareerRoleSkill } from '../models/career-role-skill.model';
import { Job } from '../models/job.model';
import { Internship } from '../models/internship.model';
import { Project } from '../models/project.model';
import { LearningProgram } from '../models/learning-program.model';
import { FacultyOpportunity } from '../models/faculty-opportunity.model';
import { User } from '../models/user.model';
import { OpportunityStatus, OpportunityType } from '../constants/enums';

export interface PolymorphicOpportunity {
  id: number;
  type: string;
  title: string;
  description: string;
  requirements?: string | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  workplaceType?: string | null;
  employmentType?: string | null;
  industryId?: number | null;
  institutionId?: number | null;
  status: OpportunityStatus;
  createdAt: Date;
}

export class MatchingRepository {
  /**
   * Find opportunity by polymorphic type and ID
   */
  public async findOpportunity(
    opportunityId: number,
    opportunityType: OpportunityType | string
  ): Promise<PolymorphicOpportunity | null> {
    const normType = String(opportunityType).toUpperCase();

    switch (normType) {
      case OpportunityType.JOB:
      case 'JOB': {
        const job = await Job.findByPk(opportunityId);
        if (!job) return null;
        return {
          id: job.id,
          type: OpportunityType.JOB,
          title: job.title,
          description: job.description,
          requirements: job.requirements,
          location: job.location,
          city: job.city,
          state: job.state,
          workplaceType: job.workplaceType,
          employmentType: job.employmentType,
          industryId: job.industryId,
          status: job.status,
          createdAt: job.createdAt,
        };
      }
      case OpportunityType.INTERNSHIP:
      case 'INTERNSHIP': {
        const internship = await Internship.findByPk(opportunityId);
        if (!internship) return null;
        return {
          id: internship.id,
          type: OpportunityType.INTERNSHIP,
          title: internship.title,
          description: internship.description,
          requirements: internship.requirements,
          location: internship.location,
          city: null,
          state: null,
          workplaceType: internship.workplaceType,
          employmentType: 'INTERNSHIP',
          industryId: internship.industryId,
          status: internship.status,
          createdAt: internship.createdAt,
        };
      }
      case OpportunityType.PROJECT:
      case 'PROJECT': {
        const project = await Project.findByPk(opportunityId);
        if (!project) return null;
        return {
          id: project.id,
          type: OpportunityType.PROJECT,
          title: project.title,
          description: project.description,
          requirements: project.deliverables,
          location: null,
          city: null,
          state: null,
          workplaceType: null,
          employmentType: null,
          industryId: project.industryId,
          status: project.status,
          createdAt: project.createdAt,
        };
      }
      case OpportunityType.LEARNING_PROGRAM:
      case 'LEARNING_PROGRAM': {
        const lp = await LearningProgram.findByPk(opportunityId);
        if (!lp) return null;
        return {
          id: lp.id,
          type: OpportunityType.LEARNING_PROGRAM,
          title: lp.title,
          description: lp.description,
          requirements: lp.curriculum,
          location: null,
          city: null,
          state: null,
          workplaceType: lp.mode,
          employmentType: null,
          industryId: lp.industryId,
          institutionId: lp.institutionId,
          status: lp.status,
          createdAt: lp.createdAt,
        };
      }
      case OpportunityType.FACULTY_OPPORTUNITY:
      case 'FACULTY_OPPORTUNITY': {
        const fo = await FacultyOpportunity.findByPk(opportunityId);
        if (!fo) return null;
        return {
          id: fo.id,
          type: OpportunityType.FACULTY_OPPORTUNITY,
          title: fo.title,
          description: fo.description,
          requirements: fo.eligibility,
          location: null,
          city: null,
          state: null,
          workplaceType: null,
          employmentType: null,
          industryId: fo.industryId,
          status: fo.status,
          createdAt: fo.createdAt,
        };
      }
      default:
        return null;
    }
  }

  /**
   * Find student profile with basic details
   */
  public async findStudentProfile(studentId: number): Promise<StudentProfile | null> {
    return StudentProfile.findByPk(studentId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });
  }

  /**
   * Find student profile by user ID
   */
  public async findStudentProfileByUserId(userId: number): Promise<StudentProfile | null> {
    return StudentProfile.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });
  }

  /**
   * Find all student skills for matching
   */
  public async findStudentSkills(studentId: number): Promise<StudentSkill[]> {
    return StudentSkill.findAll({
      where: { studentId },
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'name', 'slug', 'is_active'],
        },
      ],
    });
  }

  /**
   * Find student career interests
   */
  public async findStudentCareerInterests(studentId: number): Promise<StudentCareerInterest[]> {
    return StudentCareerInterest.findAll({
      where: { studentId },
      include: [
        {
          model: CareerRole,
          as: 'careerRole',
          include: [
            {
              model: CareerRoleSkill,
              as: 'roleSkills',
              include: [
                {
                  model: Skill,
                  as: 'skill',
                  attributes: ['id', 'name', 'slug'],
                },
              ],
            },
          ],
        },
      ],
      order: [['priorityOrder', 'ASC']],
    });
  }

  /**
   * Find student experience records
   */
  public async findStudentExperiences(studentId: number): Promise<StudentExperience[]> {
    return StudentExperience.findAll({
      where: { studentId },
      order: [['startDate', 'DESC']],
    });
  }

  /**
   * Find student completed assessment attempts
   */
  public async findStudentAssessments(studentId: number): Promise<AssessmentAttempt[]> {
    return AssessmentAttempt.findAll({
      where: { studentId },
      include: [
        {
          model: SkillAssessment,
          as: 'assessment',
          attributes: ['id', 'title', 'skillId'],
          include: [
            {
              model: Skill,
              as: 'skill',
              attributes: ['id', 'name', 'slug'],
            },
          ],
        },
      ],
      order: [['completedAt', 'DESC']],
    });
  }

  /**
   * Fetch all active platform skills for deterministic keyword extraction
   */
  public async findActiveSkills(): Promise<Skill[]> {
    return Skill.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'slug'],
    });
  }

  /**
   * Find all active career roles with their required skills
   */
  public async findActiveCareerRoles(): Promise<CareerRole[]> {
    return CareerRole.findAll({
      include: [
        {
          model: CareerRoleSkill,
          as: 'roleSkills',
          include: [
            {
              model: Skill,
              as: 'skill',
              attributes: ['id', 'name', 'slug'],
            },
          ],
        },
      ],
    });
  }

  /**
   * Upsert an OpportunityMatch record
   */
  public async upsertOpportunityMatch(
    data: OpportunityMatchCreationAttributes,
    transaction?: Transaction
  ): Promise<OpportunityMatch> {
    const existing = await OpportunityMatch.findOne({
      where: {
        studentId: data.studentId,
        opportunityId: data.opportunityId,
        opportunityType: data.opportunityType,
      },
      transaction,
    });

    if (existing) {
      existing.matchScore = data.matchScore;
      existing.breakdown = data.breakdown ?? null;
      await existing.save({ transaction });
      return existing;
    }

    return OpportunityMatch.create(data, { transaction });
  }

  /**
   * Find single opportunity match
   */
  public async findOpportunityMatch(
    studentId: number,
    opportunityId: number,
    opportunityType: string
  ): Promise<OpportunityMatch | null> {
    return OpportunityMatch.findOne({
      where: {
        studentId,
        opportunityId,
        opportunityType,
      },
    });
  }

  /**
   * Get paginated opportunity matches for a student
   */
  public async getOpportunityMatchesForStudent(
    studentId: number,
    options: {
      minScore?: number;
      opportunityType?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: any = { studentId };
    if (options.minScore !== undefined) {
      where.matchScore = { [Op.gte]: options.minScore };
    }
    if (options.opportunityType) {
      where.opportunityType = options.opportunityType;
    }

    return OpportunityMatch.findAndCountAll({
      where,
      limit: options.limit ?? 20,
      offset: options.offset ?? 0,
      order: [
        ['matchScore', 'DESC'],
        ['id', 'ASC'],
      ],
    });
  }

  /**
   * Get open opportunities across types for recommendation generation
   */
  public async getOpenOpportunities(
    type?: OpportunityType | string,
    limit = 50,
    offset = 0
  ): Promise<PolymorphicOpportunity[]> {
    const results: PolymorphicOpportunity[] = [];
    const normType = type ? String(type).toUpperCase() : null;

    if (!normType || normType === OpportunityType.JOB || normType === 'JOB') {
      const jobs = await Job.findAll({
        where: { status: OpportunityStatus.OPEN },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });
      for (const j of jobs) {
        results.push({
          id: j.id,
          type: OpportunityType.JOB,
          title: j.title,
          description: j.description,
          requirements: j.requirements,
          location: j.location,
          city: j.city,
          state: j.state,
          workplaceType: j.workplaceType,
          employmentType: j.employmentType,
          industryId: j.industryId,
          status: j.status,
          createdAt: j.createdAt,
        });
      }
    }

    if (!normType || normType === OpportunityType.INTERNSHIP || normType === 'INTERNSHIP') {
      const internships = await Internship.findAll({
        where: { status: OpportunityStatus.OPEN },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });
      for (const i of internships) {
        results.push({
          id: i.id,
          type: OpportunityType.INTERNSHIP,
          title: i.title,
          description: i.description,
          requirements: i.requirements,
          location: i.location,
          city: null,
          state: null,
          workplaceType: i.workplaceType,
          employmentType: 'INTERNSHIP',
          industryId: i.industryId,
          status: i.status,
          createdAt: i.createdAt,
        });
      }
    }

    if (!normType || normType === OpportunityType.PROJECT || normType === 'PROJECT') {
      const projects = await Project.findAll({
        where: { status: OpportunityStatus.OPEN },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });
      for (const p of projects) {
        results.push({
          id: p.id,
          type: OpportunityType.PROJECT,
          title: p.title,
          description: p.description,
          requirements: p.deliverables,
          location: null,
          city: null,
          state: null,
          workplaceType: null,
          employmentType: null,
          industryId: p.industryId,
          status: p.status,
          createdAt: p.createdAt,
        });
      }
    }

    if (!normType || normType === OpportunityType.LEARNING_PROGRAM || normType === 'LEARNING_PROGRAM') {
      const lps = await LearningProgram.findAll({
        where: { status: OpportunityStatus.OPEN },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });
      for (const lp of lps) {
        results.push({
          id: lp.id,
          type: OpportunityType.LEARNING_PROGRAM,
          title: lp.title,
          description: lp.description,
          requirements: lp.curriculum,
          location: null,
          city: null,
          state: null,
          workplaceType: lp.mode,
          employmentType: null,
          industryId: lp.industryId,
          institutionId: lp.institutionId,
          status: lp.status,
          createdAt: lp.createdAt,
        });
      }
    }

    return results;
  }

  /**
   * Get all active student profiles for candidate ranking (with selective attributes)
   */
  public async getCandidateStudentProfiles(limit = 100, offset = 0): Promise<StudentProfile[]> {
    return StudentProfile.findAll({
      attributes: [
        'id',
        'userId',
        'headline',
        'collegeName',
        'department',
        'graduationYear',
        'cgpa',
        'city',
        'state',
        'location',
        'availabilityStatus',
        'careerGoal',
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
      limit,
      offset,
      order: [['id', 'ASC']],
    });
  }
}

export const matchingRepository = new MatchingRepository();
