import { Op, Transaction } from 'sequelize';
import '../models';
import { Job, JobCreationAttributes, JobAttributes } from '../models/job.model';
import { Internship, InternshipCreationAttributes, InternshipAttributes } from '../models/internship.model';
import { Project, ProjectCreationAttributes, ProjectAttributes } from '../models/project.model';
import { LearningProgram, LearningProgramCreationAttributes, LearningProgramAttributes } from '../models/learning-program.model';
import { FacultyOpportunity, FacultyOpportunityCreationAttributes, FacultyOpportunityAttributes } from '../models/faculty-opportunity.model';
import { FDP, FDPCreationAttributes, FDPAttributes } from '../models/fdp.model';
import { ResearchOpportunity, ResearchOpportunityCreationAttributes, ResearchOpportunityAttributes } from '../models/research-opportunity.model';
import { ConsultancyOpportunity, ConsultancyOpportunityCreationAttributes, ConsultancyOpportunityAttributes } from '../models/consultancy-opportunity.model';
import { IndustryProfile } from '../models/industry-profile.model';
import { InstitutionProfile } from '../models/institution-profile.model';
import { AcademicianProfile } from '../models/academician-profile.model';
import {
  JobQueryInput,
  InternshipQueryInput,
  ProjectQueryInput,
  LearningProgramQueryInput,
  FacultyOpportunityQueryInput,
  FDPQueryInput,
  ResearchOpportunityQueryInput,
  ConsultancyOpportunityQueryInput,
} from '../validators/opportunity.validator';
import { OpportunityStatus } from '../constants/enums';

export class OpportunityRepository {
  // ----------------------------------------------------
  // Profile Lookups
  // ----------------------------------------------------
  public async findIndustryProfileByUserId(userId: number) {
    return IndustryProfile.findOne({ where: { userId } });
  }

  public async findInstitutionProfileByUserId(userId: number) {
    return InstitutionProfile.findOne({ where: { userId } });
  }

  public async findAcademicianProfileByUserId(userId: number) {
    return AcademicianProfile.findOne({ where: { userId } });
  }

  // ----------------------------------------------------
  // 1. Job
  // ----------------------------------------------------
  public async getJobs(query: JobQueryInput, limit = 20, offset = 0) {
    const where: any = {};
    if (query.status) where.status = query.status;
    else where.status = { [Op.in]: [OpportunityStatus.OPEN] };

    if (query.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${query.search}%` } },
        { description: { [Op.like]: `%${query.search}%` } },
      ];
    }
    if (query.workplaceType) where.workplaceType = query.workplaceType;
    if (query.employmentType) where.employmentType = query.employmentType;
    if (query.location) where.location = { [Op.like]: `%${query.location}%` };
    if (query.city) where.city = { [Op.like]: `%${query.city}%` };
    if (query.state) where.state = { [Op.like]: `%${query.state}%` };

    return Job.findAndCountAll({
      where,
      include: [
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'location', 'city', 'state', 'verified'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  public async getJobById(id: number) {
    return Job.findByPk(id, {
      include: [
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'websiteUrl', 'location', 'city', 'state', 'verified'],
        },
      ],
    });
  }

  public async createJob(data: JobCreationAttributes, transaction?: Transaction) {
    return Job.create(data, { transaction });
  }

  public async updateJob(id: number, data: Partial<JobAttributes>, transaction?: Transaction) {
    return Job.update(data, { where: { id }, transaction });
  }

  public async deleteJob(id: number, transaction?: Transaction) {
    return Job.destroy({ where: { id }, transaction });
  }

  // ----------------------------------------------------
  // 2. Internship
  // ----------------------------------------------------
  public async getInternships(query: InternshipQueryInput, limit = 20, offset = 0) {
    const where: any = {};
    if (query.status) where.status = query.status;
    else where.status = { [Op.in]: [OpportunityStatus.OPEN] };

    if (query.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${query.search}%` } },
        { description: { [Op.like]: `%${query.search}%` } },
      ];
    }
    if (query.workplaceType) where.workplaceType = query.workplaceType;
    if (query.location) where.location = { [Op.like]: `%${query.location}%` };

    return Internship.findAndCountAll({
      where,
      include: [
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'location', 'verified'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  public async getInternshipById(id: number) {
    return Internship.findByPk(id, {
      include: [
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'websiteUrl', 'location', 'verified'],
        },
      ],
    });
  }

  public async createInternship(data: InternshipCreationAttributes, transaction?: Transaction) {
    return Internship.create(data, { transaction });
  }

  public async updateInternship(id: number, data: Partial<InternshipAttributes>, transaction?: Transaction) {
    return Internship.update(data, { where: { id }, transaction });
  }

  public async deleteInternship(id: number, transaction?: Transaction) {
    return Internship.destroy({ where: { id }, transaction });
  }

  // ----------------------------------------------------
  // 3. Project
  // ----------------------------------------------------
  public async getProjects(query: ProjectQueryInput, limit = 20, offset = 0) {
    const where: any = {};
    if (query.status) where.status = query.status;
    else where.status = { [Op.in]: [OpportunityStatus.OPEN] };

    if (query.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${query.search}%` } },
        { description: { [Op.like]: `%${query.search}%` } },
      ];
    }

    return Project.findAndCountAll({
      where,
      include: [
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'location', 'verified'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  public async getProjectById(id: number) {
    return Project.findByPk(id, {
      include: [
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'websiteUrl', 'location', 'verified'],
        },
      ],
    });
  }

  public async createProject(data: ProjectCreationAttributes, transaction?: Transaction) {
    return Project.create(data, { transaction });
  }

  public async updateProject(id: number, data: Partial<ProjectAttributes>, transaction?: Transaction) {
    return Project.update(data, { where: { id }, transaction });
  }

  public async deleteProject(id: number, transaction?: Transaction) {
    return Project.destroy({ where: { id }, transaction });
  }

  // ----------------------------------------------------
  // 4. Learning Program
  // ----------------------------------------------------
  public async getLearningPrograms(query: LearningProgramQueryInput, limit = 20, offset = 0) {
    const where: any = {};
    if (query.status) where.status = query.status;
    else where.status = { [Op.in]: [OpportunityStatus.OPEN] };

    if (query.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${query.search}%` } },
        { description: { [Op.like]: `%${query.search}%` } },
      ];
    }
    if (query.mode) where.mode = query.mode;

    return LearningProgram.findAndCountAll({
      where,
      include: [
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'verified'],
        },
        {
          model: InstitutionProfile,
          as: 'institution',
          attributes: ['id', 'institutionName', 'verified'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  public async getLearningProgramById(id: number) {
    return LearningProgram.findByPk(id, {
      include: [
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'verified'],
        },
        {
          model: InstitutionProfile,
          as: 'institution',
          attributes: ['id', 'institutionName', 'verified'],
        },
      ],
    });
  }

  public async createLearningProgram(data: LearningProgramCreationAttributes, transaction?: Transaction) {
    return LearningProgram.create(data, { transaction });
  }

  public async updateLearningProgram(
    id: number,
    data: Partial<LearningProgramAttributes>,
    transaction?: Transaction
  ) {
    return LearningProgram.update(data, { where: { id }, transaction });
  }

  public async deleteLearningProgram(id: number, transaction?: Transaction) {
    return LearningProgram.destroy({ where: { id }, transaction });
  }

  // ----------------------------------------------------
  // 5. Faculty Opportunity
  // ----------------------------------------------------
  public async getFacultyOpportunities(query: FacultyOpportunityQueryInput, limit = 20, offset = 0) {
    const where: any = {};
    if (query.status) where.status = query.status;
    else where.status = { [Op.in]: [OpportunityStatus.OPEN] };

    if (query.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${query.search}%` } },
        { description: { [Op.like]: `%${query.search}%` } },
      ];
    }
    if (query.department) where.department = { [Op.like]: `%${query.department}%` };

    return FacultyOpportunity.findAndCountAll({
      where,
      include: [
        {
          model: InstitutionProfile,
          as: 'institution',
          attributes: ['id', 'institutionName', 'verified'],
        },
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'verified'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  public async getFacultyOpportunityById(id: number) {
    return FacultyOpportunity.findByPk(id, {
      include: [
        {
          model: InstitutionProfile,
          as: 'institution',
          attributes: ['id', 'institutionName', 'verified'],
        },
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'verified'],
        },
      ],
    });
  }

  public async createFacultyOpportunity(
    data: FacultyOpportunityCreationAttributes,
    transaction?: Transaction
  ) {
    return FacultyOpportunity.create(data, { transaction });
  }

  public async updateFacultyOpportunity(
    id: number,
    data: Partial<FacultyOpportunityAttributes>,
    transaction?: Transaction
  ) {
    return FacultyOpportunity.update(data, { where: { id }, transaction });
  }

  public async deleteFacultyOpportunity(id: number, transaction?: Transaction) {
    return FacultyOpportunity.destroy({ where: { id }, transaction });
  }

  // ----------------------------------------------------
  // 6. FDP
  // ----------------------------------------------------
  public async getFDPs(query: FDPQueryInput, limit = 20, offset = 0) {
    const where: any = {};
    if (query.status) where.status = query.status;
    else where.status = { [Op.in]: [OpportunityStatus.OPEN] };

    if (query.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${query.search}%` } },
        { description: { [Op.like]: `%${query.search}%` } },
      ];
    }
    if (query.mode) where.mode = query.mode;

    return FDP.findAndCountAll({
      where,
      include: [
        {
          model: InstitutionProfile,
          as: 'institution',
          attributes: ['id', 'institutionName', 'verified'],
        },
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'verified'],
        },
      ],
      limit,
      offset,
      order: [['startDate', 'ASC']],
    });
  }

  public async getFDPById(id: number) {
    return FDP.findByPk(id, {
      include: [
        {
          model: InstitutionProfile,
          as: 'institution',
          attributes: ['id', 'institutionName', 'verified'],
        },
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'verified'],
        },
      ],
    });
  }

  public async createFDP(data: FDPCreationAttributes, transaction?: Transaction) {
    return FDP.create(data, { transaction });
  }

  public async updateFDP(id: number, data: Partial<FDPAttributes>, transaction?: Transaction) {
    return FDP.update(data, { where: { id }, transaction });
  }

  public async deleteFDP(id: number, transaction?: Transaction) {
    return FDP.destroy({ where: { id }, transaction });
  }

  // ----------------------------------------------------
  // 7. Research Opportunity
  // ----------------------------------------------------
  public async getResearchOpportunities(query: ResearchOpportunityQueryInput, limit = 20, offset = 0) {
    const where: any = {};
    if (query.status) where.status = query.status;
    else where.status = { [Op.in]: [OpportunityStatus.OPEN] };

    if (query.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${query.search}%` } },
        { description: { [Op.like]: `%${query.search}%` } },
      ];
    }
    if (query.fieldOfStudy) where.fieldOfStudy = { [Op.like]: `%${query.fieldOfStudy}%` };

    return ResearchOpportunity.findAndCountAll({
      where,
      include: [
        {
          model: InstitutionProfile,
          as: 'institution',
          attributes: ['id', 'institutionName', 'verified'],
        },
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'verified'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  public async getResearchOpportunityById(id: number) {
    return ResearchOpportunity.findByPk(id, {
      include: [
        {
          model: InstitutionProfile,
          as: 'institution',
          attributes: ['id', 'institutionName', 'verified'],
        },
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'verified'],
        },
      ],
    });
  }

  public async createResearchOpportunity(
    data: ResearchOpportunityCreationAttributes,
    transaction?: Transaction
  ) {
    return ResearchOpportunity.create(data, { transaction });
  }

  public async updateResearchOpportunity(
    id: number,
    data: Partial<ResearchOpportunityAttributes>,
    transaction?: Transaction
  ) {
    return ResearchOpportunity.update(data, { where: { id }, transaction });
  }

  public async deleteResearchOpportunity(id: number, transaction?: Transaction) {
    return ResearchOpportunity.destroy({ where: { id }, transaction });
  }

  // ----------------------------------------------------
  // 8. Consultancy Opportunity
  // ----------------------------------------------------
  public async getConsultancyOpportunities(
    query: ConsultancyOpportunityQueryInput,
    limit = 20,
    offset = 0
  ) {
    const where: any = {};
    if (query.status) where.status = query.status;
    else where.status = { [Op.in]: [OpportunityStatus.OPEN] };

    if (query.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${query.search}%` } },
        { problemStatement: { [Op.like]: `%${query.search}%` } },
      ];
    }
    if (query.domain) where.domain = { [Op.like]: `%${query.domain}%` };

    return ConsultancyOpportunity.findAndCountAll({
      where,
      include: [
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'location', 'verified'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  public async getConsultancyOpportunityById(id: number) {
    return ConsultancyOpportunity.findByPk(id, {
      include: [
        {
          model: IndustryProfile,
          as: 'industry',
          attributes: ['id', 'companyName', 'websiteUrl', 'location', 'verified'],
        },
      ],
    });
  }

  public async createConsultancyOpportunity(
    data: ConsultancyOpportunityCreationAttributes,
    transaction?: Transaction
  ) {
    return ConsultancyOpportunity.create(data, { transaction });
  }

  public async updateConsultancyOpportunity(
    id: number,
    data: Partial<ConsultancyOpportunityAttributes>,
    transaction?: Transaction
  ) {
    return ConsultancyOpportunity.update(data, { where: { id }, transaction });
  }

  public async deleteConsultancyOpportunity(id: number, transaction?: Transaction) {
    return ConsultancyOpportunity.destroy({ where: { id }, transaction });
  }
}

export const opportunityRepository = new OpportunityRepository();
