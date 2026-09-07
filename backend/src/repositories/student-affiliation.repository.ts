import { Op } from 'sequelize';
import '../models';
import { StudentInstitutionAffiliation } from '../models/student-institution-affiliation.model';
import { StudentProfile } from '../models/student-profile.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { InstitutionDepartment } from '../models/institution-department.model';
import { User } from '../models/user.model';
import { StudentAffiliationStatus } from '../constants/enums';
import {
  StudentInstitutionAffiliationCreationAttributes,
  StudentInstitutionAffiliationAttributes,
} from '../models/student-institution-affiliation.model';

const affiliationIncludes = [
  {
    model: InstitutionProfile,
    as: 'institution',
    attributes: ['id', 'institutionName', 'institutionType', 'city', 'state'],
  },
  {
    model: InstitutionDepartment,
    as: 'department',
    attributes: ['id', 'institutionId', 'departmentName', 'departmentCode'],
  },
  {
    model: User,
    as: 'reviewedBy',
    attributes: ['id', 'firstName', 'lastName', 'email'],
  },
];

export class StudentAffiliationRepository {
  public async findAvailableInstitutions() {
    return InstitutionProfile.findAll({
      where: { verified: true },
      attributes: ['id', 'institutionName', 'institutionType', 'city', 'state', 'country'],
      order: [['institutionName', 'ASC']],
    });
  }

  public async findDepartmentsByInstitution(institutionId: number) {
    return InstitutionDepartment.findAll({
      where: { institutionId },
      attributes: ['id', 'institutionId', 'departmentName', 'departmentCode'],
      order: [['departmentName', 'ASC']],
    });
  }

  public async findInstitutionById(institutionId: number) {
    return InstitutionProfile.findByPk(institutionId);
  }

  public async findDepartmentByIdAndInstitution(departmentId: number, institutionId: number) {
    return InstitutionDepartment.findOne({ where: { id: departmentId, institutionId } });
  }

  public async findByStudentId(studentId: number, status?: StudentAffiliationStatus) {
    const where: any = { studentId };
    if (status) where.status = status;

    return StudentInstitutionAffiliation.findAll({
      where,
      include: affiliationIncludes,
      order: [['requestedAt', 'DESC']],
    });
  }

  public async findCurrentByStudentId(studentId: number) {
    return StudentInstitutionAffiliation.findOne({
      where: {
        studentId,
        status: { [Op.in]: [StudentAffiliationStatus.VERIFIED, StudentAffiliationStatus.PENDING] },
      },
      include: affiliationIncludes,
      order: [['status', 'ASC'], ['requestedAt', 'DESC']],
    });
  }

  public async findByInstitutionAndEnrollment(institutionId: number, enrollmentNumber: string) {
    return StudentInstitutionAffiliation.findOne({
      where: { institutionId, enrollmentNumber },
    });
  }

  public async findActiveByStudent(studentId: number, excludeId?: number) {
    const where: any = {
      studentId,
      status: { [Op.in]: [StudentAffiliationStatus.PENDING, StudentAffiliationStatus.VERIFIED] },
    };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    return StudentInstitutionAffiliation.findOne({ where });
  }

  public async findById(id: number, institutionId?: number) {
    const where: any = { id };
    if (institutionId !== undefined) where.institutionId = institutionId;

    return StudentInstitutionAffiliation.findOne({
      where,
      include: [
        ...affiliationIncludes,
        {
          model: StudentProfile,
          as: 'student',
          attributes: ['id', 'userId', 'studentId', 'collegeName', 'department', 'course', 'specialization'],
          include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }],
        },
      ],
    });
  }

  public async findForInstitution(
    institutionId: number,
    status: StudentAffiliationStatus | undefined,
    limit: number,
    offset: number
  ) {
    const where: any = { institutionId };
    if (status) where.status = status;

    return StudentInstitutionAffiliation.findAndCountAll({
      where,
      include: [
        ...affiliationIncludes,
        {
          model: StudentProfile,
          as: 'student',
          attributes: ['id', 'userId', 'studentId', 'collegeName', 'department', 'course', 'specialization'],
          include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }],
        },
      ],
      limit,
      offset,
      order: [['requestedAt', 'ASC']],
    });
  }

  public async findVerifiedStudentIds(institutionId: number): Promise<number[]> {
    const rows = await StudentInstitutionAffiliation.findAll({
      where: { institutionId, status: StudentAffiliationStatus.VERIFIED },
      attributes: ['studentId'],
      raw: true,
    });
    return rows.map((row) => Number((row as any).studentId));
  }

  public async create(data: StudentInstitutionAffiliationCreationAttributes) {
    return StudentInstitutionAffiliation.create(data);
  }

  public async update(id: number, data: Partial<StudentInstitutionAffiliationAttributes>) {
    await StudentInstitutionAffiliation.update(data, { where: { id } });
    return this.findById(id);
  }
}

export const studentAffiliationRepository = new StudentAffiliationRepository();
