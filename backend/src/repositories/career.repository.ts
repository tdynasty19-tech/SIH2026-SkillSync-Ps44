import { Op } from 'sequelize';
import '../models';
import { CareerRole } from '../models/career-role.model';
import { CareerRoleSkill } from '../models/career-role-skill.model';
import {
  StudentCareerInterest,
  StudentCareerInterestAttributes,
  StudentCareerInterestCreationAttributes,
} from '../models/student-career-interest.model';
import { Skill } from '../models/skill.model';

export class CareerRepository {
  public async getCareerRoles(search?: string, limit = 20, offset = 0) {
    const where: any = {};
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    return CareerRole.findAndCountAll({
      where,
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
      limit,
      offset,
      order: [['title', 'ASC']],
    });
  }

  public async getCareerRoleById(id: number) {
    return CareerRole.findByPk(id, {
      include: [
        {
          model: CareerRoleSkill,
          as: 'roleSkills',
          include: [
            {
              model: Skill,
              as: 'skill',
              attributes: ['id', 'name', 'slug', 'description'],
            },
          ],
        },
      ],
    });
  }

  public async getCareerRoleSkills(careerRoleId: number) {
    return CareerRoleSkill.findAll({
      where: { careerRoleId },
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'name', 'slug'],
        },
      ],
    });
  }

  public async getStudentCareerInterests(studentId: number) {
    return StudentCareerInterest.findAll({
      where: { studentId },
      include: [
        {
          model: CareerRole,
          as: 'careerRole',
          attributes: ['id', 'title', 'slug', 'description'],
        },
      ],
      order: [['priorityOrder', 'ASC']],
    });
  }

  public async findCareerInterest(studentId: number, careerRoleId: number) {
    return StudentCareerInterest.findOne({
      where: { studentId, careerRoleId },
    });
  }

  public async findCareerInterestById(id: number, studentId: number) {
    return StudentCareerInterest.findOne({
      where: { id, studentId },
      include: [
        {
          model: CareerRole,
          as: 'careerRole',
        },
      ],
    });
  }

  public async createCareerInterest(data: StudentCareerInterestCreationAttributes) {
    return StudentCareerInterest.create(data);
  }

  public async updateCareerInterest(
    id: number,
    studentId: number,
    data: Partial<StudentCareerInterestAttributes>
  ) {
    return StudentCareerInterest.update(data, {
      where: { id, studentId },
    });
  }

  public async deleteCareerInterest(id: number, studentId: number) {
    return StudentCareerInterest.destroy({
      where: { id, studentId },
    });
  }
}

export const careerRepository = new CareerRepository();
