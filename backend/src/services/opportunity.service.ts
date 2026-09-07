import { opportunityRepository, OpportunityRepository } from '../repositories/opportunity.repository';
import {
  CreateJobInput,
  UpdateJobInput,
  JobQueryInput,
  CreateInternshipInput,
  UpdateInternshipInput,
  InternshipQueryInput,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryInput,
  CreateLearningProgramInput,
  UpdateLearningProgramInput,
  LearningProgramQueryInput,
  CreateFacultyOpportunityInput,
  UpdateFacultyOpportunityInput,
  FacultyOpportunityQueryInput,
  CreateFDPInput,
  UpdateFDPInput,
  FDPQueryInput,
  CreateResearchOpportunityInput,
  UpdateResearchOpportunityInput,
  ResearchOpportunityQueryInput,
  CreateConsultancyOpportunityInput,
  UpdateConsultancyOpportunityInput,
  ConsultancyOpportunityQueryInput,
} from '../validators/opportunity.validator';
import { NotFoundError, AuthorizationError, ValidationError } from '../errors/app.error';
import { UserRole } from '../constants/roles';
import { AuthenticatedUser } from '../types/auth.types';
import { appEvents, AppEventType } from '../events';

export class OpportunityService {
  constructor(private readonly repository: OpportunityRepository = opportunityRepository) {}

  // ----------------------------------------------------
  // Helpers
  // ----------------------------------------------------
  private async resolveIndustryProfile(userId: number) {
    const profile = await this.repository.findIndustryProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Industry profile not found. Please complete your industry profile first.');
    }
    return profile;
  }

  private async resolveInstitutionProfile(userId: number) {
    const profile = await this.repository.findInstitutionProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Institution profile not found. Please complete your institution profile first.');
    }
    return profile;
  }

  private async resolveAcademicianProfile(userId: number) {
    const profile = await this.repository.findAcademicianProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Academician profile not found. Please complete your academician profile first.');
    }
    return profile;
  }

  private validateDeadline(deadline?: string) {
    if (deadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(deadline);
      if (target < today) {
        throw new ValidationError('Application deadline cannot be in the past');
      }
    }
  }

  // ----------------------------------------------------
  // 1. Job
  // ----------------------------------------------------
  public async getJobs(query: JobQueryInput) {
    const offset = (query.page - 1) * query.limit;
    const { rows, count } = await this.repository.getJobs(query, query.limit, offset);

    return {
      jobs: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getJobById(id: number) {
    const job = await this.repository.getJobById(id);
    if (!job) throw new NotFoundError('Job not found');
    return job.toJSON();
  }

  public async createJob(userId: number, input: CreateJobInput) {
    const industry = await this.resolveIndustryProfile(userId);
    this.validateDeadline(input.applicationDeadline);

    const job = await this.repository.createJob({
      ...input,
      industryId: industry.id,
      applicationDeadline: input.applicationDeadline ? new Date(input.applicationDeadline) : undefined,
    });

    appEvents.emitSafe(AppEventType.OPPORTUNITY_CREATED, {
      opportunityId: job.id,
      creatorUserId: userId,
      opportunityTitle: job.title,
      opportunityType: 'Job',
    });

    return job.toJSON();
  }

  public async updateJob(userId: number, jobId: number, input: UpdateJobInput) {
    const industry = await this.resolveIndustryProfile(userId);
    const job = await this.repository.getJobById(jobId);
    if (!job) throw new NotFoundError('Job not found');

    if (job.industryId !== industry.id) {
      throw new AuthorizationError('You are not authorized to modify this job');
    }

    if (input.applicationDeadline) {
      this.validateDeadline(input.applicationDeadline);
    }

    await this.repository.updateJob(jobId, {
      ...input,
      applicationDeadline: input.applicationDeadline ? new Date(input.applicationDeadline) : undefined,
    });

    const updated = await this.repository.getJobById(jobId);
    return updated!.toJSON();
  }

  public async deleteJob(userId: number, jobId: number) {
    const industry = await this.resolveIndustryProfile(userId);
    const job = await this.repository.getJobById(jobId);
    if (!job) throw new NotFoundError('Job not found');

    if (job.industryId !== industry.id) {
      throw new AuthorizationError('You are not authorized to delete this job');
    }

    await this.repository.deleteJob(jobId);
    return { message: 'Job deleted successfully' };
  }

  // ----------------------------------------------------
  // 2. Internship
  // ----------------------------------------------------
  public async getInternships(query: InternshipQueryInput) {
    const offset = (query.page - 1) * query.limit;
    const { rows, count } = await this.repository.getInternships(query, query.limit, offset);

    return {
      internships: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getInternshipById(id: number) {
    const internship = await this.repository.getInternshipById(id);
    if (!internship) throw new NotFoundError('Internship not found');
    return internship.toJSON();
  }

  public async createInternship(userId: number, input: CreateInternshipInput) {
    const industry = await this.resolveIndustryProfile(userId);
    this.validateDeadline(input.applicationDeadline);

    const internship = await this.repository.createInternship({
      ...input,
      industryId: industry.id,
      applicationDeadline: input.applicationDeadline ? new Date(input.applicationDeadline) : undefined,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
    });

    appEvents.emitSafe(AppEventType.OPPORTUNITY_CREATED, {
      opportunityId: internship.id,
      creatorUserId: userId,
      opportunityTitle: internship.title,
      opportunityType: 'Internship',
    });

    return internship.toJSON();
  }

  public async updateInternship(userId: number, internshipId: number, input: UpdateInternshipInput) {
    const industry = await this.resolveIndustryProfile(userId);
    const internship = await this.repository.getInternshipById(internshipId);
    if (!internship) throw new NotFoundError('Internship not found');

    if (internship.industryId !== industry.id) {
      throw new AuthorizationError('You are not authorized to modify this internship');
    }

    if (input.applicationDeadline) {
      this.validateDeadline(input.applicationDeadline);
    }

    await this.repository.updateInternship(internshipId, {
      ...input,
      applicationDeadline: input.applicationDeadline ? new Date(input.applicationDeadline) : undefined,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
    });

    const updated = await this.repository.getInternshipById(internshipId);
    return updated!.toJSON();
  }

  public async deleteInternship(userId: number, internshipId: number) {
    const industry = await this.resolveIndustryProfile(userId);
    const internship = await this.repository.getInternshipById(internshipId);
    if (!internship) throw new NotFoundError('Internship not found');

    if (internship.industryId !== industry.id) {
      throw new AuthorizationError('You are not authorized to delete this internship');
    }

    await this.repository.deleteInternship(internshipId);
    return { message: 'Internship deleted successfully' };
  }

  // ----------------------------------------------------
  // 3. Project
  // ----------------------------------------------------
  public async getProjects(query: ProjectQueryInput) {
    const offset = (query.page - 1) * query.limit;
    const { rows, count } = await this.repository.getProjects(query, query.limit, offset);

    return {
      projects: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getProjectById(id: number) {
    const project = await this.repository.getProjectById(id);
    if (!project) throw new NotFoundError('Project not found');
    return project.toJSON();
  }

  public async createProject(userId: number, input: CreateProjectInput) {
    const industry = await this.resolveIndustryProfile(userId);

    const project = await this.repository.createProject({
      ...input,
      industryId: industry.id,
    });

    return project.toJSON();
  }

  public async updateProject(userId: number, projectId: number, input: UpdateProjectInput) {
    const industry = await this.resolveIndustryProfile(userId);
    const project = await this.repository.getProjectById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    if (project.industryId !== industry.id) {
      throw new AuthorizationError('You are not authorized to modify this project');
    }

    await this.repository.updateProject(projectId, input);
    const updated = await this.repository.getProjectById(projectId);
    return updated!.toJSON();
  }

  public async deleteProject(userId: number, projectId: number) {
    const industry = await this.resolveIndustryProfile(userId);
    const project = await this.repository.getProjectById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    if (project.industryId !== industry.id) {
      throw new AuthorizationError('You are not authorized to delete this project');
    }

    await this.repository.deleteProject(projectId);
    return { message: 'Project deleted successfully' };
  }

  // ----------------------------------------------------
  // 4. Learning Program
  // ----------------------------------------------------
  public async getLearningPrograms(query: LearningProgramQueryInput) {
    const offset = (query.page - 1) * query.limit;
    const { rows, count } = await this.repository.getLearningPrograms(query, query.limit, offset);

    return {
      learningPrograms: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getLearningProgramById(id: number) {
    const program = await this.repository.getLearningProgramById(id);
    if (!program) throw new NotFoundError('Learning program not found');
    return program.toJSON();
  }

  public async createLearningProgram(user: AuthenticatedUser, input: CreateLearningProgramInput) {
    let industryId: number | undefined;
    let institutionId: number | undefined;

    if (user.role === UserRole.INDUSTRY) {
      const industry = await this.resolveIndustryProfile(user.id);
      industryId = industry.id;
    } else if (user.role === UserRole.INSTITUTION) {
      const institution = await this.resolveInstitutionProfile(user.id);
      institutionId = institution.id;
    } else {
      throw new AuthorizationError('Only Industry or Institution organizations can create learning programs');
    }

    const program = await this.repository.createLearningProgram({
      ...input,
      industryId,
      institutionId,
    });

    return program.toJSON();
  }

  public async updateLearningProgram(
    user: AuthenticatedUser,
    programId: number,
    input: UpdateLearningProgramInput
  ) {
    const program = await this.repository.getLearningProgramById(programId);
    if (!program) throw new NotFoundError('Learning program not found');

    let isOwner = false;
    if (user.role === UserRole.INDUSTRY && program.industryId) {
      const industry = await this.resolveIndustryProfile(user.id);
      isOwner = program.industryId === industry.id;
    } else if (user.role === UserRole.INSTITUTION && program.institutionId) {
      const institution = await this.resolveInstitutionProfile(user.id);
      isOwner = program.institutionId === institution.id;
    }

    if (!isOwner) {
      throw new AuthorizationError('You are not authorized to modify this learning program');
    }

    await this.repository.updateLearningProgram(programId, input);
    const updated = await this.repository.getLearningProgramById(programId);
    return updated!.toJSON();
  }

  public async deleteLearningProgram(user: AuthenticatedUser, programId: number) {
    const program = await this.repository.getLearningProgramById(programId);
    if (!program) throw new NotFoundError('Learning program not found');

    let isOwner = false;
    if (user.role === UserRole.INDUSTRY && program.industryId) {
      const industry = await this.resolveIndustryProfile(user.id);
      isOwner = program.industryId === industry.id;
    } else if (user.role === UserRole.INSTITUTION && program.institutionId) {
      const institution = await this.resolveInstitutionProfile(user.id);
      isOwner = program.institutionId === institution.id;
    }

    if (!isOwner) {
      throw new AuthorizationError('You are not authorized to delete this learning program');
    }

    await this.repository.deleteLearningProgram(programId);
    return { message: 'Learning program deleted successfully' };
  }

  // ----------------------------------------------------
  // 5. Faculty Opportunity
  // ----------------------------------------------------
  public async getFacultyOpportunities(query: FacultyOpportunityQueryInput) {
    const offset = (query.page - 1) * query.limit;
    const { rows, count } = await this.repository.getFacultyOpportunities(query, query.limit, offset);

    return {
      facultyOpportunities: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getFacultyOpportunityById(id: number) {
    const opp = await this.repository.getFacultyOpportunityById(id);
    if (!opp) throw new NotFoundError('Faculty opportunity not found');
    return opp.toJSON();
  }

  public async createFacultyOpportunity(user: AuthenticatedUser, input: CreateFacultyOpportunityInput) {
    let institutionId: number | undefined;
    let industryId: number | undefined;

    if (user.role === UserRole.INSTITUTION) {
      const inst = await this.resolveInstitutionProfile(user.id);
      institutionId = inst.id;
    } else if (user.role === UserRole.INDUSTRY) {
      const ind = await this.resolveIndustryProfile(user.id);
      industryId = ind.id;
    } else if (user.role === UserRole.ACADEMICIAN) {
      const acad = await this.resolveAcademicianProfile(user.id);
      if (!acad.institutionId) {
        throw new ValidationError('Academician must be affiliated with an institution to create faculty opportunities');
      }
      institutionId = acad.institutionId;
    } else {
      throw new AuthorizationError('Only Institutions, Industry, or affiliated Academicians can create faculty opportunities');
    }

    this.validateDeadline(input.applicationDeadline);

    const opp = await this.repository.createFacultyOpportunity({
      ...input,
      institutionId,
      industryId,
      applicationDeadline: input.applicationDeadline ? new Date(input.applicationDeadline) : undefined,
    });

    return opp.toJSON();
  }

  public async updateFacultyOpportunity(
    user: AuthenticatedUser,
    opportunityId: number,
    input: UpdateFacultyOpportunityInput
  ) {
    const opp = await this.repository.getFacultyOpportunityById(opportunityId);
    if (!opp) throw new NotFoundError('Faculty opportunity not found');

    let isOwner = false;
    if (user.role === UserRole.INSTITUTION && opp.institutionId) {
      const inst = await this.resolveInstitutionProfile(user.id);
      isOwner = opp.institutionId === inst.id;
    } else if (user.role === UserRole.INDUSTRY && opp.industryId) {
      const ind = await this.resolveIndustryProfile(user.id);
      isOwner = opp.industryId === ind.id;
    } else if (user.role === UserRole.ACADEMICIAN && opp.institutionId) {
      const acad = await this.resolveAcademicianProfile(user.id);
      isOwner = opp.institutionId === acad.institutionId;
    }

    if (!isOwner) {
      throw new AuthorizationError('You are not authorized to modify this faculty opportunity');
    }

    if (input.applicationDeadline) {
      this.validateDeadline(input.applicationDeadline);
    }

    await this.repository.updateFacultyOpportunity(opportunityId, {
      ...input,
      applicationDeadline: input.applicationDeadline ? new Date(input.applicationDeadline) : undefined,
    });

    const updated = await this.repository.getFacultyOpportunityById(opportunityId);
    return updated!.toJSON();
  }

  public async deleteFacultyOpportunity(user: AuthenticatedUser, opportunityId: number) {
    const opp = await this.repository.getFacultyOpportunityById(opportunityId);
    if (!opp) throw new NotFoundError('Faculty opportunity not found');

    let isOwner = false;
    if (user.role === UserRole.INSTITUTION && opp.institutionId) {
      const inst = await this.resolveInstitutionProfile(user.id);
      isOwner = opp.institutionId === inst.id;
    } else if (user.role === UserRole.INDUSTRY && opp.industryId) {
      const ind = await this.resolveIndustryProfile(user.id);
      isOwner = opp.industryId === ind.id;
    } else if (user.role === UserRole.ACADEMICIAN && opp.institutionId) {
      const acad = await this.resolveAcademicianProfile(user.id);
      isOwner = opp.institutionId === acad.institutionId;
    }

    if (!isOwner) {
      throw new AuthorizationError('You are not authorized to delete this faculty opportunity');
    }

    await this.repository.deleteFacultyOpportunity(opportunityId);
    return { message: 'Faculty opportunity deleted successfully' };
  }

  // ----------------------------------------------------
  // 6. FDP
  // ----------------------------------------------------
  public async getFDPs(query: FDPQueryInput) {
    const offset = (query.page - 1) * query.limit;
    const { rows, count } = await this.repository.getFDPs(query, query.limit, offset);

    return {
      fdps: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getFDPById(id: number) {
    const fdp = await this.repository.getFDPById(id);
    if (!fdp) throw new NotFoundError('FDP not found');
    return fdp.toJSON();
  }

  public async createFDP(user: AuthenticatedUser, input: CreateFDPInput) {
    let institutionId: number | undefined;
    let industryId: number | undefined;

    if (user.role === UserRole.INSTITUTION) {
      const inst = await this.resolveInstitutionProfile(user.id);
      institutionId = inst.id;
    } else if (user.role === UserRole.INDUSTRY) {
      const ind = await this.resolveIndustryProfile(user.id);
      industryId = ind.id;
    } else {
      throw new AuthorizationError('Only Institutions or Industry can create FDPs');
    }

    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    if (endDate < startDate) {
      throw new ValidationError('End date cannot be before start date');
    }

    const fdp = await this.repository.createFDP({
      ...input,
      institutionId,
      industryId,
      startDate,
      endDate,
    });

    return fdp.toJSON();
  }

  public async updateFDP(user: AuthenticatedUser, fdpId: number, input: UpdateFDPInput) {
    const fdp = await this.repository.getFDPById(fdpId);
    if (!fdp) throw new NotFoundError('FDP not found');

    let isOwner = false;
    if (user.role === UserRole.INSTITUTION && fdp.institutionId) {
      const inst = await this.resolveInstitutionProfile(user.id);
      isOwner = fdp.institutionId === inst.id;
    } else if (user.role === UserRole.INDUSTRY && fdp.industryId) {
      const ind = await this.resolveIndustryProfile(user.id);
      isOwner = fdp.industryId === ind.id;
    }

    if (!isOwner) {
      throw new AuthorizationError('You are not authorized to modify this FDP');
    }

    if (input.startDate && input.endDate) {
      if (new Date(input.endDate) < new Date(input.startDate)) {
        throw new ValidationError('End date cannot be before start date');
      }
    }

    await this.repository.updateFDP(fdpId, {
      ...input,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
    });

    const updated = await this.repository.getFDPById(fdpId);
    return updated!.toJSON();
  }

  public async deleteFDP(user: AuthenticatedUser, fdpId: number) {
    const fdp = await this.repository.getFDPById(fdpId);
    if (!fdp) throw new NotFoundError('FDP not found');

    let isOwner = false;
    if (user.role === UserRole.INSTITUTION && fdp.institutionId) {
      const inst = await this.resolveInstitutionProfile(user.id);
      isOwner = fdp.institutionId === inst.id;
    } else if (user.role === UserRole.INDUSTRY && fdp.industryId) {
      const ind = await this.resolveIndustryProfile(user.id);
      isOwner = fdp.industryId === ind.id;
    }

    if (!isOwner) {
      throw new AuthorizationError('You are not authorized to delete this FDP');
    }

    await this.repository.deleteFDP(fdpId);
    return { message: 'FDP deleted successfully' };
  }

  // ----------------------------------------------------
  // 7. Research Opportunity
  // ----------------------------------------------------
  public async getResearchOpportunities(query: ResearchOpportunityQueryInput) {
    const offset = (query.page - 1) * query.limit;
    const { rows, count } = await this.repository.getResearchOpportunities(query, query.limit, offset);

    return {
      researchOpportunities: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getResearchOpportunityById(id: number) {
    const opp = await this.repository.getResearchOpportunityById(id);
    if (!opp) throw new NotFoundError('Research opportunity not found');
    return opp.toJSON();
  }

  public async createResearchOpportunity(user: AuthenticatedUser, input: CreateResearchOpportunityInput) {
    let institutionId: number | undefined;
    let industryId: number | undefined;

    if (user.role === UserRole.INSTITUTION) {
      const inst = await this.resolveInstitutionProfile(user.id);
      institutionId = inst.id;
    } else if (user.role === UserRole.INDUSTRY) {
      const ind = await this.resolveIndustryProfile(user.id);
      industryId = ind.id;
    } else {
      throw new AuthorizationError('Only Institutions or Industry can create research opportunities');
    }

    const opp = await this.repository.createResearchOpportunity({
      ...input,
      institutionId,
      industryId,
    });

    return opp.toJSON();
  }

  public async updateResearchOpportunity(
    user: AuthenticatedUser,
    opportunityId: number,
    input: UpdateResearchOpportunityInput
  ) {
    const opp = await this.repository.getResearchOpportunityById(opportunityId);
    if (!opp) throw new NotFoundError('Research opportunity not found');

    let isOwner = false;
    if (user.role === UserRole.INSTITUTION && opp.institutionId) {
      const inst = await this.resolveInstitutionProfile(user.id);
      isOwner = opp.institutionId === inst.id;
    } else if (user.role === UserRole.INDUSTRY && opp.industryId) {
      const ind = await this.resolveIndustryProfile(user.id);
      isOwner = opp.industryId === ind.id;
    }

    if (!isOwner) {
      throw new AuthorizationError('You are not authorized to modify this research opportunity');
    }

    await this.repository.updateResearchOpportunity(opportunityId, input);
    const updated = await this.repository.getResearchOpportunityById(opportunityId);
    return updated!.toJSON();
  }

  public async deleteResearchOpportunity(user: AuthenticatedUser, opportunityId: number) {
    const opp = await this.repository.getResearchOpportunityById(opportunityId);
    if (!opp) throw new NotFoundError('Research opportunity not found');

    let isOwner = false;
    if (user.role === UserRole.INSTITUTION && opp.institutionId) {
      const inst = await this.resolveInstitutionProfile(user.id);
      isOwner = opp.institutionId === inst.id;
    } else if (user.role === UserRole.INDUSTRY && opp.industryId) {
      const ind = await this.resolveIndustryProfile(user.id);
      isOwner = opp.industryId === ind.id;
    }

    if (!isOwner) {
      throw new AuthorizationError('You are not authorized to delete this research opportunity');
    }

    await this.repository.deleteResearchOpportunity(opportunityId);
    return { message: 'Research opportunity deleted successfully' };
  }

  // ----------------------------------------------------
  // 8. Consultancy Opportunity
  // ----------------------------------------------------
  public async getConsultancyOpportunities(query: ConsultancyOpportunityQueryInput) {
    const offset = (query.page - 1) * query.limit;
    const { rows, count } = await this.repository.getConsultancyOpportunities(query, query.limit, offset);

    return {
      consultancyOpportunities: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getConsultancyOpportunityById(id: number) {
    const opp = await this.repository.getConsultancyOpportunityById(id);
    if (!opp) throw new NotFoundError('Consultancy opportunity not found');
    return opp.toJSON();
  }

  public async createConsultancyOpportunity(userId: number, input: CreateConsultancyOpportunityInput) {
    const industry = await this.resolveIndustryProfile(userId);

    const opp = await this.repository.createConsultancyOpportunity({
      ...input,
      industryId: industry.id,
    });

    return opp.toJSON();
  }

  public async updateConsultancyOpportunity(
    userId: number,
    opportunityId: number,
    input: UpdateConsultancyOpportunityInput
  ) {
    const industry = await this.resolveIndustryProfile(userId);
    const opp = await this.repository.getConsultancyOpportunityById(opportunityId);
    if (!opp) throw new NotFoundError('Consultancy opportunity not found');

    if (opp.industryId !== industry.id) {
      throw new AuthorizationError('You are not authorized to modify this consultancy opportunity');
    }

    await this.repository.updateConsultancyOpportunity(opportunityId, input);
    const updated = await this.repository.getConsultancyOpportunityById(opportunityId);
    return updated!.toJSON();
  }

  public async deleteConsultancyOpportunity(userId: number, opportunityId: number) {
    const industry = await this.resolveIndustryProfile(userId);
    const opp = await this.repository.getConsultancyOpportunityById(opportunityId);
    if (!opp) throw new NotFoundError('Consultancy opportunity not found');

    if (opp.industryId !== industry.id) {
      throw new AuthorizationError('You are not authorized to delete this consultancy opportunity');
    }

    await this.repository.deleteConsultancyOpportunity(opportunityId);
    return { message: 'Consultancy opportunity deleted successfully' };
  }
}

export const opportunityService = new OpportunityService();
