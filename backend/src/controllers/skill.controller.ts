import { Request, Response, NextFunction } from 'express';
import { skillService, SkillService } from '../services/skill.service';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import { skillQuerySchema, categoryQuerySchema } from '../validators/skill.validator';

export class SkillController {
  constructor(private readonly service: SkillService = skillService) {}

  public getSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, categoryId, page, limit } = skillQuerySchema.parse(req.query);
      const result = await this.service.getSkills(search, categoryId, page, limit);
      sendSuccess(res, 'Skills fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getSkillById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const skillId = Number(req.params.skillId);
      const result = await this.service.getSkillById(skillId);
      sendSuccess(res, 'Skill details fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = categoryQuerySchema.parse(req.query);
      const result = await this.service.getCategories(page, limit);
      sendSuccess(res, 'Skill categories fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryId = Number(req.params.categoryId);
      const result = await this.service.getCategoryById(categoryId);
      sendSuccess(res, 'Skill category fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const skillController = new SkillController();
