import { Transaction } from 'sequelize';
import '../models';
import {
  SkillGap,
  SkillGapAttributes,
  SkillGapCreationAttributes,
} from '../models/skill-gap.model';
import { Skill } from '../models/skill.model';
import { CareerRole } from '../models/career-role.model';
import { SkillGapPriority, SkillGapStatus } from '../constants/enums';

export class SkillGapRepository {
  public async getStudentGaps(
    studentId: number,
    priority?: SkillGapPriority,
    status?: SkillGapStatus,
    limit = 50,
    offset = 0
  ) {
    const where: any = { studentId };
    if (priority) where.priority = priority;
    if (status) where.status = status;

    return SkillGap.findAndCountAll({
      where,
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: CareerRole,
          as: 'targetRole',
          attributes: ['id', 'title', 'slug'],
        },
      ],
      limit,
      offset,
      order: [
        ['priority', 'ASC'], // ENUM order: CRITICAL, HIGH, MEDIUM, LOW
        ['gapScore', 'DESC'],
      ],
    });
  }

  public async findGap(studentId: number, skillId: number, targetRoleId: number) {
    return SkillGap.findOne({
      where: { studentId, skillId, targetRoleId },
    });
  }

  public async upsertGap(data: SkillGapCreationAttributes, transaction?: Transaction) {
    const existing = await SkillGap.findOne({
      where: {
        studentId: data.studentId,
        skillId: data.skillId,
        targetRoleId: data.targetRoleId,
      },
      transaction,
    });

    if (existing) {
      await existing.update(data, { transaction });
      return existing;
    }

    return SkillGap.create(data, { transaction });
  }

  public async deleteGapsForStudent(studentId: number, transaction?: Transaction) {
    return SkillGap.destroy({
      where: { studentId },
      transaction,
    });
  }
}

export const skillGapRepository = new SkillGapRepository();
