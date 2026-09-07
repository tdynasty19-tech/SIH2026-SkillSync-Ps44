import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { HttpStatus } from '../constants/http-status';
import { sendSuccess } from '../utils/api-response';
import { studentAffiliationService, StudentAffiliationService } from '../services/student-affiliation.service';
import {
  affiliationStatusQuerySchema,
  createStudentAffiliationSchema,
  rejectStudentAffiliationSchema,
} from '../validators/student-affiliation.validator';

export class StudentAffiliationController {
  constructor(private readonly service: StudentAffiliationService = studentAffiliationService) {}

  public getAvailableInstitutions = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getAvailableInstitutions();
      sendSuccess(res, 'Available institutions fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getInstitutionDepartments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const institutionId = Number(req.params.institutionId);
      const result = await this.service.getInstitutionDepartments(institutionId);
      sendSuccess(res, 'Institution departments fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = createStudentAffiliationSchema.parse(req.body);
      const result = await this.service.createRequest(req.user!.id, input);
      sendSuccess(res, 'Institution affiliation request submitted successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public getMine = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = affiliationStatusQuerySchema.parse(req.query);
      const result = await this.service.getMyAffiliations(req.user!.id, query);
      sendSuccess(res, 'Student affiliations fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getCurrent = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getCurrentAffiliation(req.user!.id);
      sendSuccess(res, 'Current student affiliation fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getInstitutionRequests = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = affiliationStatusQuerySchema.parse(req.query);
      const result = await this.service.getInstitutionRequests(req.user!.id, query);
      sendSuccess(res, 'Institution student affiliations fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getInstitutionRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getInstitutionRequest(req.user!.id, Number(req.params.affiliationId));
      sendSuccess(res, 'Student affiliation fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public verify = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.verify(req.user!.id, Number(req.params.affiliationId));
      sendSuccess(res, 'Student affiliation verified successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public reject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = rejectStudentAffiliationSchema.parse(req.body);
      const result = await this.service.reject(req.user!.id, Number(req.params.affiliationId), input);
      sendSuccess(res, 'Student affiliation rejected successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const studentAffiliationController = new StudentAffiliationController();
