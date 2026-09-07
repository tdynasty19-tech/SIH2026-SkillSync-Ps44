import { Request, Response, NextFunction } from 'express';
import { opportunityService, OpportunityService } from '../services/opportunity.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import {
  createJobSchema,
  updateJobSchema,
  jobQuerySchema,
  createInternshipSchema,
  updateInternshipSchema,
  internshipQuerySchema,
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
  createLearningProgramSchema,
  updateLearningProgramSchema,
  learningProgramQuerySchema,
  createFacultyOpportunitySchema,
  updateFacultyOpportunitySchema,
  facultyOpportunityQuerySchema,
  createFDPSchema,
  updateFDPSchema,
  fdpQuerySchema,
  createResearchOpportunitySchema,
  updateResearchOpportunitySchema,
  researchOpportunityQuerySchema,
  createConsultancyOpportunitySchema,
  updateConsultancyOpportunitySchema,
  consultancyOpportunityQuerySchema,
} from '../validators/opportunity.validator';

export class OpportunityController {
  constructor(private readonly service: OpportunityService = opportunityService) {}

  // ----------------------------------------------------
  // 1. Job Handlers
  // ----------------------------------------------------
  public getJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = jobQuerySchema.parse(req.query);
      const result = await this.service.getJobs(query);
      sendSuccess(res, 'Jobs fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getJobById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobId = Number(req.params.jobId);
      const result = await this.service.getJobById(jobId);
      sendSuccess(res, 'Job details fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createJob = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createJobSchema.parse(req.body);
      const result = await this.service.createJob(req.user!.id, validated);
      sendSuccess(res, 'Job created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateJob = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobId = Number(req.params.jobId);
      const validated = updateJobSchema.parse(req.body);
      const result = await this.service.updateJob(req.user!.id, jobId, validated);
      sendSuccess(res, 'Job updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteJob = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobId = Number(req.params.jobId);
      const result = await this.service.deleteJob(req.user!.id, jobId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // 2. Internship Handlers
  // ----------------------------------------------------
  public getInternships = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = internshipQuerySchema.parse(req.query);
      const result = await this.service.getInternships(query);
      sendSuccess(res, 'Internships fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getInternshipById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const internshipId = Number(req.params.internshipId);
      const result = await this.service.getInternshipById(internshipId);
      sendSuccess(res, 'Internship details fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createInternship = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createInternshipSchema.parse(req.body);
      const result = await this.service.createInternship(req.user!.id, validated);
      sendSuccess(res, 'Internship created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateInternship = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const internshipId = Number(req.params.internshipId);
      const validated = updateInternshipSchema.parse(req.body);
      const result = await this.service.updateInternship(req.user!.id, internshipId, validated);
      sendSuccess(res, 'Internship updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteInternship = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const internshipId = Number(req.params.internshipId);
      const result = await this.service.deleteInternship(req.user!.id, internshipId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // 3. Project Handlers
  // ----------------------------------------------------
  public getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = projectQuerySchema.parse(req.query);
      const result = await this.service.getProjects(query);
      sendSuccess(res, 'Projects fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = Number(req.params.projectId);
      const result = await this.service.getProjectById(projectId);
      sendSuccess(res, 'Project details fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createProjectSchema.parse(req.body);
      const result = await this.service.createProject(req.user!.id, validated);
      sendSuccess(res, 'Project created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = Number(req.params.projectId);
      const validated = updateProjectSchema.parse(req.body);
      const result = await this.service.updateProject(req.user!.id, projectId, validated);
      sendSuccess(res, 'Project updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = Number(req.params.projectId);
      const result = await this.service.deleteProject(req.user!.id, projectId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // 4. Learning Program Handlers
  // ----------------------------------------------------
  public getLearningPrograms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = learningProgramQuerySchema.parse(req.query);
      const result = await this.service.getLearningPrograms(query);
      sendSuccess(res, 'Learning programs fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getLearningProgramById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const programId = Number(req.params.programId);
      const result = await this.service.getLearningProgramById(programId);
      sendSuccess(res, 'Learning program details fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createLearningProgram = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createLearningProgramSchema.parse(req.body);
      const result = await this.service.createLearningProgram(req.user!, validated);
      sendSuccess(res, 'Learning program created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateLearningProgram = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const programId = Number(req.params.programId);
      const validated = updateLearningProgramSchema.parse(req.body);
      const result = await this.service.updateLearningProgram(req.user!, programId, validated);
      sendSuccess(res, 'Learning program updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteLearningProgram = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const programId = Number(req.params.programId);
      const result = await this.service.deleteLearningProgram(req.user!, programId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // 5. Faculty Opportunity Handlers
  // ----------------------------------------------------
  public getFacultyOpportunities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = facultyOpportunityQuerySchema.parse(req.query);
      const result = await this.service.getFacultyOpportunities(query);
      sendSuccess(res, 'Faculty opportunities fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getFacultyOpportunityById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const opportunityId = Number(req.params.opportunityId);
      const result = await this.service.getFacultyOpportunityById(opportunityId);
      sendSuccess(res, 'Faculty opportunity details fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createFacultyOpportunity = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = createFacultyOpportunitySchema.parse(req.body);
      const result = await this.service.createFacultyOpportunity(req.user!, validated);
      sendSuccess(res, 'Faculty opportunity created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateFacultyOpportunity = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const opportunityId = Number(req.params.opportunityId);
      const validated = updateFacultyOpportunitySchema.parse(req.body);
      const result = await this.service.updateFacultyOpportunity(req.user!, opportunityId, validated);
      sendSuccess(res, 'Faculty opportunity updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteFacultyOpportunity = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const opportunityId = Number(req.params.opportunityId);
      const result = await this.service.deleteFacultyOpportunity(req.user!, opportunityId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // 6. FDP Handlers
  // ----------------------------------------------------
  public getFDPs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = fdpQuerySchema.parse(req.query);
      const result = await this.service.getFDPs(query);
      sendSuccess(res, 'FDPs fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getFDPById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fdpId = Number(req.params.fdpId);
      const result = await this.service.getFDPById(fdpId);
      sendSuccess(res, 'FDP details fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createFDP = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createFDPSchema.parse(req.body);
      const result = await this.service.createFDP(req.user!, validated);
      sendSuccess(res, 'FDP created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateFDP = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fdpId = Number(req.params.fdpId);
      const validated = updateFDPSchema.parse(req.body);
      const result = await this.service.updateFDP(req.user!, fdpId, validated);
      sendSuccess(res, 'FDP updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteFDP = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fdpId = Number(req.params.fdpId);
      const result = await this.service.deleteFDP(req.user!, fdpId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // 7. Research Opportunity Handlers
  // ----------------------------------------------------
  public getResearchOpportunities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = researchOpportunityQuerySchema.parse(req.query);
      const result = await this.service.getResearchOpportunities(query);
      sendSuccess(res, 'Research opportunities fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getResearchOpportunityById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const opportunityId = Number(req.params.opportunityId);
      const result = await this.service.getResearchOpportunityById(opportunityId);
      sendSuccess(res, 'Research opportunity details fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createResearchOpportunity = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = createResearchOpportunitySchema.parse(req.body);
      const result = await this.service.createResearchOpportunity(req.user!, validated);
      sendSuccess(res, 'Research opportunity created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateResearchOpportunity = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const opportunityId = Number(req.params.opportunityId);
      const validated = updateResearchOpportunitySchema.parse(req.body);
      const result = await this.service.updateResearchOpportunity(req.user!, opportunityId, validated);
      sendSuccess(res, 'Research opportunity updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteResearchOpportunity = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const opportunityId = Number(req.params.opportunityId);
      const result = await this.service.deleteResearchOpportunity(req.user!, opportunityId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // 8. Consultancy Opportunity Handlers
  // ----------------------------------------------------
  public getConsultancyOpportunities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = consultancyOpportunityQuerySchema.parse(req.query);
      const result = await this.service.getConsultancyOpportunities(query);
      sendSuccess(res, 'Consultancy opportunities fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getConsultancyOpportunityById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const opportunityId = Number(req.params.opportunityId);
      const result = await this.service.getConsultancyOpportunityById(opportunityId);
      sendSuccess(res, 'Consultancy opportunity details fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createConsultancyOpportunity = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = createConsultancyOpportunitySchema.parse(req.body);
      const result = await this.service.createConsultancyOpportunity(req.user!.id, validated);
      sendSuccess(res, 'Consultancy opportunity created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateConsultancyOpportunity = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const opportunityId = Number(req.params.opportunityId);
      const validated = updateConsultancyOpportunitySchema.parse(req.body);
      const result = await this.service.updateConsultancyOpportunity(req.user!.id, opportunityId, validated);
      sendSuccess(res, 'Consultancy opportunity updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteConsultancyOpportunity = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const opportunityId = Number(req.params.opportunityId);
      const result = await this.service.deleteConsultancyOpportunity(req.user!.id, opportunityId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const opportunityController = new OpportunityController();
