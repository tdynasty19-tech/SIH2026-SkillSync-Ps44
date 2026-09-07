import { Op } from 'sequelize';
import '../models';
import { Skill } from '../models/skill.model';
import { SkillCategory } from '../models/skill-category.model';

export class SkillRepository {
  public async getSkills(search?: string, categoryId?: number, limit = 20, offset = 0) {
    const where: any = { isActive: true };

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    return Skill.findAndCountAll({
      where,
      include: [
        {
          model: SkillCategory,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      limit,
      offset,
      order: [['name', 'ASC']],
    });
  }

  public async getSkillById(id: number) {
    return Skill.findOne({
      where: { id, isActive: true },
      include: [
        {
          model: SkillCategory,
          as: 'category',
          attributes: ['id', 'name', 'description'],
        },
      ],
    });
  }

  public async getCategories(limit = 50, offset = 0) {
    return SkillCategory.findAndCountAll({
      limit,
      offset,
      order: [['name', 'ASC']],
    });
  }

  public async getCategoryById(id: number) {
    return SkillCategory.findByPk(id, {
      include: [
        {
          model: Skill,
          as: 'skills',
          where: { isActive: true },
          required: false,
          attributes: ['id', 'name', 'slug', 'description'],
        },
      ],
    });
  }
}

export const skillRepository = new SkillRepository();
