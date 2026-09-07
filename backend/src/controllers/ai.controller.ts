import { Response, NextFunction } from 'express';
import { aiService, AIService } from '../services/ai.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import {
  analyzeResumeSchema,
  analyzeOpportunitySchema,
  skillGapParamsSchema,
  careerCopilotSchema,
  learningRoadmapSchema,
  opportunityExplanationParamsSchema,
  opportunityExplanationQuerySchema,
} from '../validators/ai-input.validator';

export class AIController {
  constructor(private readonly service: AIService = aiService) {}

  public analyzeResume = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const input = analyzeResumeSchema.parse(req.body);
      const result = await this.service.analyzeResume(req.user!.id, input);
      sendSuccess(res, 'Resume analyzed successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public analyzeOpportunity = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const input = analyzeOpportunitySchema.parse(req.body);
      const result = await this.service.analyzeOpportunity(req.user!.id, input, req.user!.role);
      sendSuccess(res, 'Opportunity analyzed successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getSkillGapAssistance = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const params = skillGapParamsSchema.parse(req.params);
      const studentId = params.studentId === 'me' ? undefined : params.studentId;
      const result = await this.service.getSkillGapAssistance(studentId, {
        id: req.user!.id,
        role: req.user!.role,
      });
      sendSuccess(res, 'Skill gap assistance retrieved successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getCareerCopilot = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const input = careerCopilotSchema.parse(req.body);
      const result = await this.service.getCareerCopilot(req.user!.id, input);
      sendSuccess(res, 'Career copilot response generated', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public generateLearningRoadmap = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const payload = req.method === 'GET' ? req.query : req.body;
      const input = learningRoadmapSchema.parse(payload);
      const result = await this.service.generateLearningRoadmap(req.user!.id, input);
      sendSuccess(res, 'Learning roadmap generated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public explainOpportunityMatch = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const params = opportunityExplanationParamsSchema.parse(req.params);
      const query = opportunityExplanationQuerySchema.parse(req.query);
      const result = await this.service.explainOpportunityMatch(
        req.user!.id,
        params.opportunityId,
        query.opportunityType
      );
      sendSuccess(res, 'Opportunity match explanation generated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const aiController = new AIController();
