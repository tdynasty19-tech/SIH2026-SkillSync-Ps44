import { skillRepository, SkillRepository } from '../repositories/skill.repository';
import { NotFoundError } from '../errors/app.error';

export class SkillService {
  constructor(private readonly repository: SkillRepository = skillRepository) {}

  public async getSkills(search?: string, categoryId?: number, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.getSkills(search, categoryId, limit, offset);

    return {
      skills: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  public async getSkillById(id: number) {
    const skill = await this.repository.getSkillById(id);
    if (!skill) {
      throw new NotFoundError('Skill not found or is inactive');
    }
    return skill.toJSON();
  }

  public async getCategories(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.getCategories(limit, offset);

    return {
      categories: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  public async getCategoryById(id: number) {
    const category = await this.repository.getCategoryById(id);
    if (!category) {
      throw new NotFoundError('Skill category not found');
    }
    return category.toJSON();
  }
}

export const skillService = new SkillService();
