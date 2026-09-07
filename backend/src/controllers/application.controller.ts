import { Response, NextFunction } from 'express';
import { applicationService, ApplicationService } from '../services/application.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import {
  submitApplicationSchema,
  updateApplicationStatusSchema,
  applicationQuerySchema,
  opportunityApplicationParamsSchema,
} from '../validators/application.validator';

export class ApplicationController {
  constructor(private readonly service: ApplicationService = applicationService) {}

  // ----------------------------------------------------
  // 1. Student Handlers
  // ----------------------------------------------------
  public submitApplication = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = submitApplicationSchema.parse(req.body);
      const result = await this.service.submitApplication(req.user!.id, validated);
      sendSuccess(res, 'Application submitted successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public getMyApplications = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = applicationQuerySchema.parse(req.query);
      const result = await this.service.getMyApplications(req.user!.id, query);
      sendSuccess(res, 'My applications fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getMyApplicationById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const applicationId = Number(req.params.applicationId);
      const result = await this.service.getMyApplicationById(req.user!.id, applicationId);
      sendSuccess(res, 'Application details fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // 2. Opportunity Owner Handlers
  // ----------------------------------------------------
  public getOpportunityApplications = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const params = opportunityApplicationParamsSchema.parse(req.params);
      const query = applicationQuerySchema.parse(req.query);
      const result = await this.service.getOpportunityApplications(
        req.user!,
        params.opportunityType,
        params.opportunityId,
        query
      );
      sendSuccess(res, 'Opportunity applications fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getOpportunityApplicationById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const applicationId = Number(req.params.applicationId);
      const result = await this.service.getOpportunityApplicationById(req.user!, applicationId);
      sendSuccess(res, 'Application details fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public updateApplicationStatus = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const applicationId = Number(req.params.applicationId);
      const validated = updateApplicationStatusSchema.parse(req.body);
      const result = await this.service.updateApplicationStatus(req.user!, applicationId, validated);
      sendSuccess(res, 'Application status updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const applicationController = new ApplicationController();
