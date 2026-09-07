import { Request, Response, NextFunction } from 'express';
import { assessmentService, AssessmentService } from '../services/assessment.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import {
  assessmentQuerySchema,
  submitAssessmentSchema,
  attemptQuerySchema,
} from '../validators/assessment.validator';

export class AssessmentController {
  constructor(private readonly service: AssessmentService = assessmentService) {}

  public getAssessments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { skillId, difficulty, page, limit } = assessmentQuerySchema.parse(req.query);
      const result = await this.service.getAssessments(skillId, difficulty, page, limit);
      sendSuccess(res, 'Skill assessments fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getAssessmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const assessmentId = Number(req.params.assessmentId);
      const result = await this.service.getAssessmentById(assessmentId);
      sendSuccess(res, 'Assessment details fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public startAttempt = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const assessmentId = Number(req.params.assessmentId);
      const result = await this.service.startAttempt(req.user!.id, assessmentId);
      sendSuccess(res, result.message, result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public getAttempt = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const attemptId = Number(req.params.attemptId);
      const result = await this.service.getAttempt(req.user!.id, attemptId);
      sendSuccess(res, 'Assessment attempt fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public submitAttempt = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const attemptId = Number(req.params.attemptId);
      const validated = submitAssessmentSchema.parse(req.body);
      const result = await this.service.submitAttempt(req.user!.id, attemptId, validated);
      sendSuccess(res, 'Assessment submitted and scored successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getStudentAttempts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, page, limit } = attemptQuerySchema.parse(req.query);
      const result = await this.service.getStudentAttempts(req.user!.id, status, page, limit);
      sendSuccess(res, 'Your assessment attempts fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const assessmentController = new AssessmentController();
