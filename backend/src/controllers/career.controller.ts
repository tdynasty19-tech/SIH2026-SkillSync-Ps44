import { Request, Response, NextFunction } from 'express';
import { careerService, CareerService } from '../services/career.service';
import { skillGapService, SkillGapService } from '../services/skill-gap.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import {
  careerQuerySchema,
  createCareerInterestSchema,
  updateCareerInterestSchema,
  skillGapQuerySchema,
} from '../validators/career.validator';

export class CareerController {
  constructor(
    private readonly service: CareerService = careerService,
    private readonly gapService: SkillGapService = skillGapService
  ) {}

  public getCareerRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, page, limit } = careerQuerySchema.parse(req.query);
      const result = await this.service.getCareerRoles(search, page, limit);
      sendSuccess(res, 'Career roles fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getCareerRoleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const careerRoleId = Number(req.params.careerRoleId);
      const result = await this.service.getCareerRoleById(careerRoleId);
      sendSuccess(res, 'Career role details fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getStudentCareerInterests = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.service.getStudentCareerInterests(req.user!.id);
      sendSuccess(res, 'Career interests fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public addCareerInterest = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = createCareerInterestSchema.parse(req.body);
      const result = await this.service.addCareerInterest(req.user!.id, validated);
      sendSuccess(res, 'Career interest added successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateCareerInterest = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const interestId = Number(req.params.interestId);
      const validated = updateCareerInterestSchema.parse(req.body);
      const result = await this.service.updateCareerInterest(req.user!.id, interestId, validated);
      sendSuccess(res, 'Career interest updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteCareerInterest = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const interestId = Number(req.params.interestId);
      const result = await this.service.deleteCareerInterest(req.user!.id, interestId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getStudentGaps = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { priority, status, page, limit } = skillGapQuerySchema.parse(req.query);
      const result = await this.gapService.getStudentGaps(req.user!.id, priority, status, page, limit);
      sendSuccess(res, 'Skill gaps fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public recalculateGaps = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.gapService.recalculateGaps(req.user!.id);
      sendSuccess(res, 'Skill gaps recalculated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const careerController = new CareerController();
