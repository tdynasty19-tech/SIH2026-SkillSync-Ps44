import { Response, NextFunction } from 'express';
import { recommendationService, RecommendationService } from '../services/recommendation.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import {
  opportunityRecommendationQuerySchema,
  careerRecommendationQuerySchema,
  learningRecommendationQuerySchema,
  mentorRecommendationQuerySchema,
  candidateRecommendationQuerySchema,
} from '../validators/recommendation.validator';

export class RecommendationController {
  constructor(private readonly service: RecommendationService = recommendationService) {}

  public getOpportunityRecommendations = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = opportunityRecommendationQuerySchema.parse(req.query);
      const result = await this.service.recommendOpportunitiesForStudent(req.user!.id, query);
      sendSuccess(res, 'Opportunity recommendations fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getCareerRecommendations = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = careerRecommendationQuerySchema.parse(req.query);
      const result = await this.service.recommendCareersForStudent(req.user!.id, query);
      sendSuccess(res, 'Career recommendations fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getLearningRecommendations = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = learningRecommendationQuerySchema.parse(req.query);
      const result = await this.service.recommendLearningForStudent(req.user!.id, query);
      sendSuccess(res, 'Learning recommendations fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getMentorRecommendations = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = mentorRecommendationQuerySchema.parse(req.query);
      const result = await this.service.recommendMentorsForStudent(req.user!.id, query);
      sendSuccess(res, 'Mentor recommendations fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getCandidateRecommendations = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = candidateRecommendationQuerySchema.parse(req.query);
      const result = await this.service.recommendCandidatesForIndustry(req.user!.id, query);
      sendSuccess(res, 'Candidate recommendations fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const recommendationController = new RecommendationController();
