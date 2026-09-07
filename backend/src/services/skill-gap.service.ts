import { Transaction } from 'sequelize';
import { skillGapRepository, SkillGapRepository } from '../repositories/skill-gap.repository';
import { studentRepository, StudentRepository } from '../repositories/student.repository';
import { careerRepository, CareerRepository } from '../repositories/career.repository';
import { StudentSkill } from '../models/student-skill.model';
import { CareerRoleSkill } from '../models/career-role-skill.model';
import { StudentSkillLevel, SkillGapPriority, SkillGapStatus } from '../constants/enums';
import { NotFoundError } from '../errors/app.error';

const LEVEL_SCORES: Record<StudentSkillLevel, number> = {
  [StudentSkillLevel.BEGINNER]: 25,
  [StudentSkillLevel.INTERMEDIATE]: 50,
  [StudentSkillLevel.ADVANCED]: 75,
  [StudentSkillLevel.EXPERT]: 100,
};

export class SkillGapService {
  constructor(
    private readonly repository: SkillGapRepository = skillGapRepository,
    private readonly studentRepo: StudentRepository = studentRepository,
    private readonly careerRepo: CareerRepository = careerRepository
  ) {}

  /**
   * Deterministic Skill Gap calculation engine
   * Compares student skills vs career role required skills
   */
  public async calculateGapsForStudent(studentId: number, transaction?: Transaction) {
    const careerInterests = await this.careerRepo.getStudentCareerInterests(studentId);

    if (!careerInterests || careerInterests.length === 0) {
      // No active career interests, delete existing gaps
      await this.repository.deleteGapsForStudent(studentId, transaction);
      return [];
    }

    // Fetch all current skills for the student
    const studentSkills = await StudentSkill.findAll({
      where: { studentId },
      transaction,
    });

    const skillMap = new Map<number, StudentSkill>();
    for (const s of studentSkills) {
      skillMap.set(s.skillId, s);
    }

    const calculatedGaps = [];

    // Process each targeted career role
    for (const interest of careerInterests) {
      const roleSkills = await this.careerRepo.getCareerRoleSkills(interest.careerRoleId);

      for (const roleSkill of roleSkills) {
        const studentSkill = skillMap.get(roleSkill.skillId);

        const currentLevel = studentSkill ? studentSkill.level : null;
        const currentScore = studentSkill
          ? (studentSkill.score !== null && studentSkill.score !== undefined
              ? Number(studentSkill.score)
              : LEVEL_SCORES[studentSkill.level])
          : 0;

        const requiredLevel = roleSkill.requiredLevel;
        const requiredScore = LEVEL_SCORES[requiredLevel];

        const gapScore = Math.max(0, requiredScore - currentScore);

        // Priority calculation
        let priority: SkillGapPriority;
        if (gapScore === 0) {
          priority = SkillGapPriority.LOW;
        } else if (gapScore >= 50) {
          const isHighWeight =
            roleSkill.importanceWeight !== null &&
            roleSkill.importanceWeight !== undefined &&
            Number(roleSkill.importanceWeight) >= 1.5;
          priority = isHighWeight ? SkillGapPriority.CRITICAL : SkillGapPriority.HIGH;
        } else if (gapScore >= 25) {
          priority = SkillGapPriority.MEDIUM;
        } else {
          priority = SkillGapPriority.LOW;
        }

        const status = gapScore > 0 ? SkillGapStatus.OPEN : SkillGapStatus.RESOLVED;

        const gap = await this.repository.upsertGap(
          {
            studentId,
            skillId: roleSkill.skillId,
            targetRoleId: interest.careerRoleId,
            currentLevel,
            requiredLevel,
            currentScore,
            requiredScore,
            gapScore,
            priority,
            status,
          },
          transaction
        );

        calculatedGaps.push(gap);
      }
    }

    return calculatedGaps;
  }

  public async getStudentGaps(
    userId: number,
    priority?: SkillGapPriority,
    status?: SkillGapStatus,
    page = 1,
    limit = 50
  ) {
    const student = await this.studentRepo.findProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found');
    }

    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.getStudentGaps(
      student.id,
      priority,
      status,
      limit,
      offset
    );

    return {
      skillGaps: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  public async recalculateGaps(userId: number) {
    const student = await this.studentRepo.findProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found');
    }

    await this.calculateGapsForStudent(student.id);
    return this.getStudentGaps(userId);
  }
}

export const skillGapService = new SkillGapService();
