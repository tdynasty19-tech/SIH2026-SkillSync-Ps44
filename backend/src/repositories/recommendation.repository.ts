import { Op, Transaction } from 'sequelize';
import '../models';
import {
  CareerRecommendation,
  CareerRecommendationCreationAttributes,
} from '../models/career-recommendation.model';
import {
  LearningRecommendation,
  LearningRecommendationCreationAttributes,
} from '../models/learning-recommendation.model';
import { CareerRole } from '../models/career-role.model';
import { CareerRoleSkill } from '../models/career-role-skill.model';
import { Skill } from '../models/skill.model';
import { LearningProgram } from '../models/learning-program.model';
import { Mentor } from '../models/mentor.model';
import { User } from '../models/user.model';
import { OpportunityStatus, SkillGapPriority } from '../constants/enums';

export class RecommendationRepository {
  /**
   * Upsert a career recommendation record
   */
  public async upsertCareerRecommendation(
    data: CareerRecommendationCreationAttributes,
    transaction?: Transaction
  ): Promise<CareerRecommendation> {
    const existing = await CareerRecommendation.findOne({
      where: {
        studentId: data.studentId,
        careerRoleId: data.careerRoleId,
      },
      transaction,
    });

    if (existing) {
      existing.matchScore = data.matchScore;
      existing.reasoning = data.reasoning ?? null;
      await existing.save({ transaction });
      return existing;
    }

    return CareerRecommendation.create(data, { transaction });
  }

  /**
   * Get career recommendations for a student with pagination
   */
  public async getCareerRecommendations(
    studentId: number,
    options: {
      limit?: number;
      offset?: number;
    }
  ) {
    const where: any = { studentId };

    return CareerRecommendation.findAndCountAll({
      where,
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
      limit: options.limit ?? 20,
      offset: options.offset ?? 0,
      order: [
        ['matchScore', 'DESC'],
        ['id', 'ASC'],
      ],
    });
  }

  /**
   * Upsert a learning recommendation record
   */
  public async upsertLearningRecommendation(
    data: LearningRecommendationCreationAttributes,
    transaction?: Transaction
  ): Promise<LearningRecommendation> {
    const existing = await LearningRecommendation.findOne({
      where: {
        studentId: data.studentId,
        skillId: data.skillId,
        title: data.title,
      },
      transaction,
    });

    if (existing) {
      existing.resourceUrl = data.resourceUrl;
      existing.provider = data.provider;
      existing.duration = data.duration ?? null;
      existing.cost = data.cost ?? 0.0;
      existing.priority = data.priority ?? SkillGapPriority.MEDIUM;
      await existing.save({ transaction });
      return existing;
    }

    return LearningRecommendation.create(data, { transaction });
  }

  /**
   * Get learning recommendations for a student with pagination
   */
  public async getLearningRecommendations(
    studentId: number,
    options: {
      limit?: number;
      offset?: number;
    }
  ) {
    return LearningRecommendation.findAndCountAll({
      where: { studentId },
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'name', 'slug', 'categoryId'],
        },
      ],
      limit: options.limit ?? 20,
      offset: options.offset ?? 0,
      order: [['id', 'DESC']],
    });
  }

  /**
   * Find open learning programs that target specified skills
   */
  public async findLearningProgramsForSkills(
    skillNames: string[],
    limit = 20
  ): Promise<LearningProgram[]> {
    if (skillNames.length === 0) return [];

    const conditions = skillNames.map((name) => ({
      [Op.or]: [
        { title: { [Op.like]: `%${name}%` } },
        { description: { [Op.like]: `%${name}%` } },
        { curriculum: { [Op.like]: `%${name}%` } },
      ],
    }));

    return LearningProgram.findAll({
      where: {
        status: OpportunityStatus.OPEN,
        [Op.or]: conditions,
      },
      limit,
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Find available mentors for recommendations
   */
  public async findEligibleMentors(limit = 50): Promise<Mentor[]> {
    return Mentor.findAll({
      where: {
        isAvailable: true,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatarUrl'],
        },
      ],
      limit,
      order: [['id', 'ASC']],
    });
  }
}

export const recommendationRepository = new RecommendationRepository();
