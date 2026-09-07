import { Transaction, Op } from 'sequelize';
import '../models';
import { Application, ApplicationCreationAttributes } from '../models/application.model';
import { ApplicationStatusHistory, ApplicationStatusHistoryCreationAttributes } from '../models/application-status-history.model';
import { StudentProfile } from '../models/student-profile.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { User } from '../models/user.model';
import { Job } from '../models/job.model';
import { Internship } from '../models/internship.model';
import { Project } from '../models/project.model';
import { LearningProgram } from '../models/learning-program.model';
import { FacultyOpportunity } from '../models/faculty-opportunity.model';
import { FDP } from '../models/fdp.model';
import { ResearchOpportunity } from '../models/research-opportunity.model';
import { ConsultancyOpportunity } from '../models/consultancy-opportunity.model';
import { ApplicationStatus, OpportunityType } from '../constants/enums';
import { ApplicationQueryInput } from '../validators/application.validator';

export class ApplicationRepository {
  // ----------------------------------------------------
  // Profile Lookups
  // ----------------------------------------------------
  public async findStudentProfileByUserId(userId: number) {
    return StudentProfile.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'uuid', 'firstName', 'lastName', 'email'],
        },
      ],
    });
  }

  public async findIndustryProfileByUserId(userId: number) {
    return IndustryProfile.findOne({ where: { userId } });
  }

  public async findInstitutionProfileByUserId(userId: number) {
    return InstitutionProfile.findOne({ where: { userId } });
  }

  // ----------------------------------------------------
  // Opportunity Lookup
  // ----------------------------------------------------
  public async findOpportunity(opportunityType: OpportunityType, opportunityId: number) {
    switch (opportunityType) {
      case OpportunityType.JOB:
        return Job.findByPk(opportunityId, {
          include: [{ model: IndustryProfile, as: 'industry', attributes: ['id', 'companyName', 'verified'] }],
        });
      case OpportunityType.INTERNSHIP:
        return Internship.findByPk(opportunityId, {
          include: [{ model: IndustryProfile, as: 'industry', attributes: ['id', 'companyName', 'verified'] }],
        });
      case OpportunityType.PROJECT:
        return Project.findByPk(opportunityId, {
          include: [{ model: IndustryProfile, as: 'industry', attributes: ['id', 'companyName', 'verified'] }],
        });
      case OpportunityType.LEARNING_PROGRAM:
        return LearningProgram.findByPk(opportunityId, {
          include: [
            { model: IndustryProfile, as: 'industry', attributes: ['id', 'companyName', 'verified'] },
            { model: InstitutionProfile, as: 'institution', attributes: ['id', 'institutionName', 'verified'] },
          ],
        });
      case OpportunityType.FACULTY_OPPORTUNITY:
        return FacultyOpportunity.findByPk(opportunityId, {
          include: [
            { model: InstitutionProfile, as: 'institution', attributes: ['id', 'institutionName', 'verified'] },
            { model: IndustryProfile, as: 'industry', attributes: ['id', 'companyName', 'verified'] },
          ],
        });
      case OpportunityType.FDP:
        return FDP.findByPk(opportunityId, {
          include: [
            { model: InstitutionProfile, as: 'institution', attributes: ['id', 'institutionName', 'verified'] },
            { model: IndustryProfile, as: 'industry', attributes: ['id', 'companyName', 'verified'] },
          ],
        });
      case OpportunityType.RESEARCH_OPPORTUNITY:
        return ResearchOpportunity.findByPk(opportunityId, {
          include: [
            { model: InstitutionProfile, as: 'institution', attributes: ['id', 'institutionName', 'verified'] },
            { model: IndustryProfile, as: 'industry', attributes: ['id', 'companyName', 'verified'] },
          ],
        });
      case OpportunityType.CONSULTANCY_OPPORTUNITY:
        return ConsultancyOpportunity.findByPk(opportunityId, {
          include: [{ model: IndustryProfile, as: 'industry', attributes: ['id', 'companyName', 'verified'] }],
        });
      default:
        return null;
    }
  }

  // ----------------------------------------------------
  // Application Data Access
  // ----------------------------------------------------
  public async createApplication(data: ApplicationCreationAttributes, transaction?: Transaction) {
    return Application.create(data, { transaction });
  }

  public async createStatusHistory(
    data: ApplicationStatusHistoryCreationAttributes,
    transaction?: Transaction
  ) {
    return ApplicationStatusHistory.create(data, { transaction });
  }

  public async findApplicationById(id: number, transaction?: Transaction) {
    return Application.findByPk(id, {
      transaction,
      include: [
        {
          model: StudentProfile,
          as: 'student',
          attributes: ['id', 'userId', 'collegeName', 'course', 'profileCompletion'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          ],
        },
        {
          model: ApplicationStatusHistory,
          as: 'statusHistory',
          attributes: ['id', 'fromStatus', 'toStatus', 'reason', 'createdAt'],
          include: [
            {
              model: User,
              as: 'changedByUser',
              attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
            },
          ],
        },
      ],
      order: [[{ model: ApplicationStatusHistory, as: 'statusHistory' }, 'createdAt', 'ASC']],
    });
  }

  public async findApplicationByStudentAndOpportunity(
    studentId: number,
    opportunityId: number,
    opportunityType: OpportunityType
  ) {
    return Application.findOne({
      where: {
        studentId,
        opportunityId,
        opportunityType,
      },
    });
  }

  public async findStudentApplications(
    studentId: number,
    query: ApplicationQueryInput,
    limit = 20,
    offset = 0
  ) {
    const where: any = { studentId };
    if (query.status) where.status = query.status;
    if (query.opportunityType) where.opportunityType = query.opportunityType;

    return Application.findAndCountAll({
      where,
      limit,
      offset,
      order: [['appliedAt', 'DESC']],
      include: [
        {
          model: ApplicationStatusHistory,
          as: 'statusHistory',
          attributes: ['id', 'fromStatus', 'toStatus', 'createdAt'],
        },
      ],
    });
  }

  public async findOpportunityApplications(
    opportunityId: number,
    opportunityType: OpportunityType,
    query: ApplicationQueryInput,
    limit = 20,
    offset = 0
  ) {
    const where: any = { opportunityId, opportunityType };
    if (query.status) where.status = query.status;

    return Application.findAndCountAll({
      where,
      limit,
      offset,
      order: [['appliedAt', 'DESC']],
      include: [
        {
          model: StudentProfile,
          as: 'student',
          attributes: ['id', 'userId', 'collegeName', 'course', 'profileCompletion'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          ],
        },
      ],
    });
  }

  public async updateApplicationStatus(
    id: number,
    status: ApplicationStatus,
    transaction?: Transaction
  ) {
    return Application.update({ status }, { where: { id }, transaction });
  }
}

export const applicationRepository = new ApplicationRepository();
