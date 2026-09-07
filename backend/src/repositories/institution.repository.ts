import { Op, Transaction } from 'sequelize';
import '../models';
import {
  InstitutionProfile,
  InstitutionProfileAttributes,
  InstitutionProfileCreationAttributes,
} from '../models/institution-profile.model';
import {
  InstitutionDepartment,
  InstitutionDepartmentAttributes,
  InstitutionDepartmentCreationAttributes,
} from '../models/institution-department.model';
import {
  AcademicProgram,
  AcademicProgramAttributes,
  AcademicProgramCreationAttributes,
} from '../models/academic-program.model';
import {
  AcademicBatch,
  AcademicBatchAttributes,
  AcademicBatchCreationAttributes,
} from '../models/academic-batch.model';
import {
  StudentAcademicEnrollment,
  StudentAcademicEnrollmentAttributes,
  StudentAcademicEnrollmentCreationAttributes,
} from '../models/student-academic-enrollment.model';
import {
  Placement,
  PlacementAttributes,
  PlacementCreationAttributes,
} from '../models/placement.model';
import {
  PlacementRecord,
  PlacementRecordAttributes,
  PlacementRecordCreationAttributes,
} from '../models/placement-record.model';
import { StudentProfile } from '../models/student-profile.model';
import { User } from '../models/user.model';

export class InstitutionRepository {
  // ----------------------------------------------------
  // 1. Institution Profile Operations
  // ----------------------------------------------------
  public async findProfileByUserId(
    userId: number,
    options: {
      includeUser?: boolean;
      includeDepartments?: boolean;
      includePlacements?: boolean;
    } = {}
  ) {
    const include: any[] = [];
    if (options.includeUser) {
      include.push({
        model: User,
        as: 'user',
        attributes: ['id', 'uuid', 'firstName', 'lastName', 'email', 'role', 'isVerified'],
      });
    }
    if (options.includeDepartments) {
      include.push({
        model: InstitutionDepartment,
        as: 'departments',
      });
    }
    if (options.includePlacements) {
      include.push({
        model: Placement,
        as: 'placements',
      });
    }

    return InstitutionProfile.findOne({
      where: { userId },
      include: include.length > 0 ? include : undefined,
    });
  }

  public async findProfileById(id: number) {
    return InstitutionProfile.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'uuid', 'firstName', 'lastName', 'email', 'role', 'isVerified'],
        },
        {
          model: InstitutionDepartment,
          as: 'departments',
        },
        {
          model: Placement,
          as: 'placements',
        },
      ],
    });
  }

  public async createProfile(
    data: InstitutionProfileCreationAttributes,
    transaction?: Transaction
  ) {
    return InstitutionProfile.create(data, { transaction });
  }

  public async updateProfile(
    id: number,
    data: Partial<InstitutionProfileAttributes>,
    transaction?: Transaction
  ) {
    return InstitutionProfile.update(data, { where: { id }, transaction });
  }

  // ----------------------------------------------------
  // 2. Department Operations
  // ----------------------------------------------------
  public async findDepartments(
    institutionId: number,
    limit = 20,
    offset = 0,
    search?: string
  ) {
    const where: any = { institutionId };
    if (search) {
      where[Op.or] = [
        { departmentName: { [Op.like]: `%${search}%` } },
        { departmentCode: { [Op.like]: `%${search}%` } },
        { hodName: { [Op.like]: `%${search}%` } },
      ];
    }

    return InstitutionDepartment.findAndCountAll({
      where,
      limit,
      offset,
      order: [['departmentName', 'ASC']],
    });
  }

  public async findDepartmentById(id: number) {
    return InstitutionDepartment.findByPk(id);
  }

  public async findDepartmentByName(institutionId: number, departmentName: string) {
    return InstitutionDepartment.findOne({
      where: { institutionId, departmentName },
    });
  }

  public async createDepartment(
    data: InstitutionDepartmentCreationAttributes,
    transaction?: Transaction
  ) {
    return InstitutionDepartment.create(data, { transaction });
  }

  public async updateDepartment(
    id: number,
    data: Partial<InstitutionDepartmentAttributes>,
    transaction?: Transaction
  ) {
    return InstitutionDepartment.update(data, { where: { id }, transaction });
  }

  public async deleteDepartment(id: number, transaction?: Transaction) {
    return InstitutionDepartment.destroy({ where: { id }, transaction });
  }

  // ----------------------------------------------------
  // 2.5 Academic Program Operations
  // ----------------------------------------------------
  public async findPrograms(
    institutionId: number,
    options: {
      limit?: number;
      offset?: number;
      departmentId?: number;
      degreeLevel?: string;
      isActive?: boolean;
      search?: string;
    } = {}
  ) {
    const { limit = 20, offset = 0, departmentId, degreeLevel, isActive, search } = options;
    const where: any = { institutionId };

    if (departmentId) {
      where.departmentId = departmentId;
    }
    if (degreeLevel) {
      where.degreeLevel = degreeLevel;
    }
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }
    if (search) {
      where[Op.or] = [
        { programName: { [Op.like]: `%${search}%` } },
        { programCode: { [Op.like]: `%${search}%` } },
      ];
    }

    return AcademicProgram.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: InstitutionDepartment,
          as: 'department',
          attributes: ['id', 'departmentName', 'departmentCode'],
        },
      ],
    });
  }

  public async findProgramById(id: number) {
    return AcademicProgram.findByPk(id, {
      include: [
        {
          model: InstitutionDepartment,
          as: 'department',
          attributes: ['id', 'departmentName', 'departmentCode', 'institutionId'],
        },
        {
          model: InstitutionProfile,
          as: 'institution',
          attributes: ['id', 'institutionName'],
        },
      ],
    });
  }

  public async findProgramByName(departmentId: number, programName: string) {
    return AcademicProgram.findOne({
      where: { departmentId, programName },
    });
  }

  public async createProgram(
    data: AcademicProgramCreationAttributes,
    transaction?: Transaction
  ) {
    return AcademicProgram.create(data, { transaction });
  }

  public async updateProgram(
    id: number,
    data: Partial<AcademicProgramAttributes>,
    transaction?: Transaction
  ) {
    return AcademicProgram.update(data, { where: { id }, transaction });
  }

  public async deleteProgram(id: number, transaction?: Transaction) {
    return AcademicProgram.destroy({ where: { id }, transaction });
  }

  // ----------------------------------------------------
  // 2.6 Academic Batch Operations
  // ----------------------------------------------------
  public async findBatches(
    institutionId: number,
    options: {
      limit?: number;
      offset?: number;
      departmentId?: number;
      programId?: number;
      startYear?: number;
      endYear?: number;
      isActive?: boolean;
      search?: string;
    } = {}
  ) {
    const { limit = 20, offset = 0, departmentId, programId, startYear, endYear, isActive, search } = options;
    const where: any = { institutionId };

    if (departmentId) where.departmentId = departmentId;
    if (programId) where.programId = programId;
    if (startYear) where.startYear = startYear;
    if (endYear) where.endYear = endYear;
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (search) {
      where.batchName = { [Op.like]: `%${search}%` };
    }

    return AcademicBatch.findAndCountAll({
      where,
      limit,
      offset,
      order: [['startYear', 'DESC'], ['createdAt', 'DESC']],
      include: [
        {
          model: AcademicProgram,
          as: 'program',
          attributes: ['id', 'programName', 'programCode', 'degreeLevel'],
        },
        {
          model: InstitutionDepartment,
          as: 'department',
          attributes: ['id', 'departmentName', 'departmentCode'],
        },
      ],
    });
  }

  public async findBatchById(id: number) {
    return AcademicBatch.findByPk(id, {
      include: [
        {
          model: AcademicProgram,
          as: 'program',
          attributes: ['id', 'programName', 'programCode', 'degreeLevel', 'durationYears', 'totalSemesters'],
        },
        {
          model: InstitutionDepartment,
          as: 'department',
          attributes: ['id', 'departmentName', 'departmentCode', 'institutionId'],
        },
        {
          model: InstitutionProfile,
          as: 'institution',
          attributes: ['id', 'institutionName'],
        },
      ],
    });
  }

  public async findBatchByName(programId: number, batchName: string) {
    return AcademicBatch.findOne({
      where: { programId, batchName },
    });
  }

  public async createBatch(
    data: AcademicBatchCreationAttributes,
    transaction?: Transaction
  ) {
    return AcademicBatch.create(data, { transaction });
  }

  public async updateBatch(
    id: number,
    data: Partial<AcademicBatchAttributes>,
    transaction?: Transaction
  ) {
    return AcademicBatch.update(data, { where: { id }, transaction });
  }

  public async deleteBatch(id: number, transaction?: Transaction) {
    return AcademicBatch.destroy({ where: { id }, transaction });
  }

  // ----------------------------------------------------
  // 2.7 Student Academic Enrollment Operations
  // ----------------------------------------------------
  public async findEnrollments(
    institutionId: number,
    options: {
      limit?: number;
      offset?: number;
      studentId?: number;
      batchId?: number;
      programId?: number;
      departmentId?: number;
      status?: string;
      isCurrent?: boolean;
      search?: string;
    } = {}
  ) {
    const { limit = 20, offset = 0, studentId, batchId, programId, departmentId, status, isCurrent, search } = options;
    const where: any = { institutionId };

    if (studentId) where.studentId = studentId;
    if (batchId) where.batchId = batchId;
    if (programId) where.programId = programId;
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;
    if (typeof isCurrent === 'boolean') where.isCurrent = isCurrent;
    if (search) {
      where[Op.or] = [
        { enrollmentNumber: { [Op.like]: `%${search}%` } },
        { rollNumber: { [Op.like]: `%${search}%` } },
      ];
    }

    return StudentAcademicEnrollment.findAndCountAll({
      where,
      limit,
      offset,
      order: [['enrolledAt', 'DESC']],
      include: [
        {
          model: StudentProfile,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'avatarUrl'],
            },
          ],
        },
        {
          model: AcademicBatch,
          as: 'batch',
          attributes: ['id', 'batchName', 'startYear', 'endYear', 'currentSemester'],
        },
        {
          model: AcademicProgram,
          as: 'program',
          attributes: ['id', 'programName', 'programCode', 'degreeLevel'],
        },
        {
          model: InstitutionDepartment,
          as: 'department',
          attributes: ['id', 'departmentName', 'departmentCode'],
        },
      ],
    });
  }

  public async findEnrollmentById(id: number) {
    return StudentAcademicEnrollment.findByPk(id, {
      include: [
        {
          model: StudentProfile,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'avatarUrl'],
            },
          ],
        },
        {
          model: AcademicBatch,
          as: 'batch',
        },
        {
          model: AcademicProgram,
          as: 'program',
        },
        {
          model: InstitutionDepartment,
          as: 'department',
        },
        {
          model: InstitutionProfile,
          as: 'institution',
          attributes: ['id', 'institutionName'],
        },
      ],
    });
  }

  public async findStudentActiveEnrollment(studentId: number) {
    return StudentAcademicEnrollment.findOne({
      where: { studentId, isCurrent: true },
      include: [
        {
          model: AcademicBatch,
          as: 'batch',
        },
        {
          model: AcademicProgram,
          as: 'program',
        },
        {
          model: InstitutionDepartment,
          as: 'department',
        },
        {
          model: InstitutionProfile,
          as: 'institution',
          attributes: ['id', 'institutionName'],
        },
      ],
    });
  }

  public async findEnrollmentByBatchAndStudent(batchId: number, studentId: number) {
    return StudentAcademicEnrollment.findOne({
      where: { batchId, studentId },
    });
  }

  public async createEnrollment(
    data: StudentAcademicEnrollmentCreationAttributes,
    transaction?: Transaction
  ) {
    return StudentAcademicEnrollment.create(data, { transaction });
  }

  public async updateEnrollment(
    id: number,
    data: Partial<StudentAcademicEnrollmentAttributes>,
    transaction?: Transaction
  ) {
    return StudentAcademicEnrollment.update(data, { where: { id }, transaction });
  }

  public async deleteEnrollment(id: number, transaction?: Transaction) {
    return StudentAcademicEnrollment.destroy({ where: { id }, transaction });
  }

  // ----------------------------------------------------
  // 3. Placement Operations
  // ----------------------------------------------------
  public async findPlacements(institutionId: number, limit = 20, offset = 0) {
    return Placement.findAndCountAll({
      where: { institutionId },
      limit,
      offset,
      order: [['academicYear', 'DESC']],
      include: [
        {
          model: PlacementRecord,
          as: 'records',
        },
      ],
    });
  }

  public async findPlacementById(id: number) {
    return Placement.findByPk(id, {
      include: [
        {
          model: PlacementRecord,
          as: 'records',
          include: [
            {
              model: StudentProfile,
              as: 'student',
              attributes: ['id', 'collegeName', 'course', 'department', 'graduationYear'],
            },
          ],
        },
      ],
    });
  }

  public async findPlacementByYear(institutionId: number, academicYear: string) {
    return Placement.findOne({
      where: { institutionId, academicYear },
    });
  }

  public async createPlacement(
    data: PlacementCreationAttributes,
    transaction?: Transaction
  ) {
    return Placement.create(data, { transaction });
  }

  public async updatePlacement(
    id: number,
    data: Partial<PlacementAttributes>,
    transaction?: Transaction
  ) {
    return Placement.update(data, { where: { id }, transaction });
  }

  public async deletePlacement(id: number, transaction?: Transaction) {
    return Placement.destroy({ where: { id }, transaction });
  }

  // ----------------------------------------------------
  // 4. Placement Record Operations
  // ----------------------------------------------------
  public async findPlacementRecords(placementId: number, limit = 20, offset = 0) {
    return PlacementRecord.findAndCountAll({
      where: { placementId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: StudentProfile,
          as: 'student',
          attributes: ['id', 'collegeName', 'course', 'department', 'graduationYear'],
        },
      ],
    });
  }

  public async findPlacementRecordById(id: number) {
    return PlacementRecord.findByPk(id, {
      include: [
        {
          model: StudentProfile,
          as: 'student',
          attributes: ['id', 'collegeName', 'course', 'department', 'graduationYear'],
        },
        {
          model: Placement,
          as: 'placement',
        },
      ],
    });
  }

  public async createPlacementRecord(
    data: PlacementRecordCreationAttributes,
    transaction?: Transaction
  ) {
    return PlacementRecord.create(data, { transaction });
  }

  public async updatePlacementRecord(
    id: number,
    data: Partial<PlacementRecordAttributes>,
    transaction?: Transaction
  ) {
    return PlacementRecord.update(data, { where: { id }, transaction });
  }

  public async deletePlacementRecord(id: number, transaction?: Transaction) {
    return PlacementRecord.destroy({ where: { id }, transaction });
  }

  // ----------------------------------------------------
  // 5. Student Verification
  // ----------------------------------------------------
  public async findStudentProfileById(studentId: number) {
    return StudentProfile.findByPk(studentId);
  }
}

export const institutionRepository = new InstitutionRepository();
