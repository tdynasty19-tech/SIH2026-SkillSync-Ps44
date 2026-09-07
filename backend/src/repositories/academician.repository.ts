import { Transaction } from 'sequelize';
import '../models';
import {
  AcademicianProfile,
  AcademicianProfileAttributes,
  AcademicianProfileCreationAttributes,
} from '../models/academician-profile.model';
import {
  AcademicInstitutionAssociation,
  AcademicInstitutionAssociationAttributes,
  AcademicInstitutionAssociationCreationAttributes,
} from '../models/academic-institution-association.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { InstitutionDepartment } from '../models/institution-department.model';
import { User } from '../models/user.model';

export class AcademicianRepository {
  // ----------------------------------------------------
  // Profile Data Access
  // ----------------------------------------------------
  public async findProfileByUserId(
    userId: number,
    options: {
      includeUser?: boolean;
      includeInstitution?: boolean;
      includeAssociations?: boolean;
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
    if (options.includeInstitution) {
      include.push({
        model: InstitutionProfile,
        as: 'institution',
        attributes: ['id', 'institutionName', 'institutionType', 'city', 'state', 'verified'],
      });
    }
    if (options.includeAssociations) {
      include.push({
        model: AcademicInstitutionAssociation,
        as: 'associations',
        include: [
          {
            model: InstitutionProfile,
            as: 'institution',
            attributes: ['id', 'institutionName', 'institutionType', 'city', 'state'],
          },
        ],
      });
    }

    return AcademicianProfile.findOne({
      where: { userId },
      include: include.length > 0 ? include : undefined,
    });
  }

  public async findProfileById(id: number) {
    return AcademicianProfile.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'uuid', 'firstName', 'lastName', 'email', 'role', 'isVerified'],
        },
        {
          model: InstitutionProfile,
          as: 'institution',
          attributes: ['id', 'institutionName', 'institutionType', 'city', 'state', 'verified'],
        },
        {
          model: InstitutionDepartment,
          as: 'departmentRecord',
          attributes: ['id', 'institutionId', 'departmentName', 'departmentCode'],
        },
        {
          model: AcademicInstitutionAssociation,
          as: 'associations',
          include: [
            {
              model: InstitutionProfile,
              as: 'institution',
              attributes: ['id', 'institutionName', 'institutionType', 'city', 'state'],
            },
          ],
        },
      ],
    });
  }

  public async createProfile(
    data: AcademicianProfileCreationAttributes,
    transaction?: Transaction
  ) {
    return AcademicianProfile.create(data, { transaction });
  }

  public async updateProfile(
    id: number,
    data: Partial<AcademicianProfileAttributes>,
    transaction?: Transaction
  ) {
    return AcademicianProfile.update(data, { where: { id }, transaction });
  }

  // ----------------------------------------------------
  // Association Data Access
  // ----------------------------------------------------
  public async findAssociationsByAcademicianId(
    academicianId: number,
    limit = 20,
    offset = 0
  ) {
    return AcademicInstitutionAssociation.findAndCountAll({
      where: { academicianId },
      limit,
      offset,
      order: [
        ['isCurrent', 'DESC'],
        ['startDate', 'DESC'],
      ],
      include: [
        {
          model: InstitutionProfile,
          as: 'institution',
          attributes: ['id', 'institutionName', 'institutionType', 'city', 'state'],
        },
      ],
    });
  }

  public async findAssociationById(id: number) {
    return AcademicInstitutionAssociation.findByPk(id, {
      include: [
        {
          model: InstitutionProfile,
          as: 'institution',
          attributes: ['id', 'institutionName', 'institutionType', 'city', 'state'],
        },
      ],
    });
  }

  public async createAssociation(
    data: AcademicInstitutionAssociationCreationAttributes,
    transaction?: Transaction
  ) {
    return AcademicInstitutionAssociation.create(data, { transaction });
  }

  public async updateAssociation(
    id: number,
    data: Partial<AcademicInstitutionAssociationAttributes>,
    transaction?: Transaction
  ) {
    return AcademicInstitutionAssociation.update(data, { where: { id }, transaction });
  }

  public async deleteAssociation(id: number, transaction?: Transaction) {
    return AcademicInstitutionAssociation.destroy({ where: { id }, transaction });
  }

  // ----------------------------------------------------
  // Institution Data Access
  // ----------------------------------------------------
  public async findInstitutionById(id: number) {
    return InstitutionProfile.findByPk(id);
  }

  public async findDepartmentByIdAndInstitution(departmentId: number, institutionId: number) {
    return InstitutionDepartment.findOne({ where: { id: departmentId, institutionId } });
  }
}

export const academicianRepository = new AcademicianRepository();
