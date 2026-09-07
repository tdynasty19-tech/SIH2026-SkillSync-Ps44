import { careerRepository, CareerRepository } from '../repositories/career.repository';
import { studentRepository, StudentRepository } from '../repositories/student.repository';
import { skillGapService, SkillGapService } from './skill-gap.service';
import { CreateCareerInterestInput, UpdateCareerInterestInput } from '../validators/career.validator';
import { NotFoundError, ConflictError } from '../errors/app.error';

export class CareerService {
  constructor(
    private readonly repository: CareerRepository = careerRepository,
    private readonly studentRepo: StudentRepository = studentRepository,
    private readonly gapService: SkillGapService = skillGapService
  ) {}

  public async getCareerRoles(search?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.getCareerRoles(search, limit, offset);

    return {
      careerRoles: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  public async getCareerRoleById(id: number) {
    const role = await this.repository.getCareerRoleById(id);
    if (!role) {
      throw new NotFoundError('Career role not found');
    }
    return role.toJSON();
  }

  public async getStudentCareerInterests(userId: number) {
    const student = await this.studentRepo.findProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found');
    }

    const interests = await this.repository.getStudentCareerInterests(student.id);
    return interests;
  }

  public async addCareerInterest(userId: number, input: CreateCareerInterestInput) {
    const student = await this.studentRepo.findProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found');
    }

    // Verify career role exists
    const role = await this.repository.getCareerRoleById(input.careerRoleId);
    if (!role) {
      throw new NotFoundError('Career role not found');
    }

    // Check duplicate
    const existing = await this.repository.findCareerInterest(student.id, input.careerRoleId);
    if (existing) {
      throw new ConflictError('Career interest already added for this role');
    }

    const created = await this.repository.createCareerInterest({
      studentId: student.id,
      careerRoleId: input.careerRoleId,
      priorityOrder: input.priorityOrder || 1,
    });

    // Automatically recalculate skill gaps for the newly added career interest
    await this.gapService.calculateGapsForStudent(student.id);

    return created.toJSON();
  }

  public async updateCareerInterest(
    userId: number,
    interestId: number,
    input: UpdateCareerInterestInput
  ) {
    const student = await this.studentRepo.findProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found');
    }

    const interest = await this.repository.findCareerInterestById(interestId, student.id);
    if (!interest) {
      throw new NotFoundError('Career interest not found or does not belong to you');
    }

    await this.repository.updateCareerInterest(interestId, student.id, input);
    const updated = await this.repository.findCareerInterestById(interestId, student.id);
    return updated!.toJSON();
  }

  public async deleteCareerInterest(userId: number, interestId: number) {
    const student = await this.studentRepo.findProfileByUserId(userId);
    if (!student) {
      throw new NotFoundError('Student profile not found');
    }

    const interest = await this.repository.findCareerInterestById(interestId, student.id);
    if (!interest) {
      throw new NotFoundError('Career interest not found or does not belong to you');
    }

    await this.repository.deleteCareerInterest(interestId, student.id);

    // Automatically recalculate skill gaps to remove/update target role gaps
    await this.gapService.calculateGapsForStudent(student.id);

    return { message: 'Career interest removed successfully' };
  }
}

export const careerService = new CareerService();
