import { Response, NextFunction } from 'express';
import { matchingService, MatchingService } from '../services/matching.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import {
  matchingOpportunityParamsSchema,
  matchingOpportunityQuerySchema,
  matchingStudentParamsSchema,
  matchingStudentQuerySchema,
} from '../validators/matching.validator';

export class MatchingController {
  constructor(private readonly service: MatchingService = matchingService) {}

  public getOpportunityMatch = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const params = matchingOpportunityParamsSchema.parse(req.params);
      const query = matchingOpportunityQuerySchema.parse(req.query);

      const result = await this.service.getOpportunityMatchById(
        req.user!.id,
        params.opportunityId,
        query.opportunityType,
        query.studentId
      );

      sendSuccess(res, 'Opportunity match computed successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getStudentMatch = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const params = matchingStudentParamsSchema.parse(req.params);
      const query = matchingStudentQuerySchema.parse(req.query);

      const result = await this.service.getStudentMatches(
        req.user!.id,
        params.studentId,
        query.opportunityId,
        query.opportunityType
      );

      sendSuccess(res, 'Student match computed successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const matchingController = new MatchingController();
