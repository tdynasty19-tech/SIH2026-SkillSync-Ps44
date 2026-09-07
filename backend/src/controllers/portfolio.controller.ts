import { Response, NextFunction } from 'express';
import { portfolioService, PortfolioService } from '../services/portfolio.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import {
  createPortfolioSchema,
  updatePortfolioSchema,
  createPortfolioProjectSchema,
  updatePortfolioProjectSchema,
  createPortfolioCertificationSchema,
  updatePortfolioCertificationSchema,
  createPortfolioAchievementSchema,
  updatePortfolioAchievementSchema,
  createPortfolioExperienceSchema,
  updatePortfolioExperienceSchema,
  createPortfolioDocumentSchema,
  updatePortfolioDocumentSchema,
  portfolioQuerySchema,
} from '../validators/portfolio.validator';

export class PortfolioController {
  constructor(private readonly service: PortfolioService = portfolioService) {}

  // ----------------------------------------------------
  // Root Portfolio
  // ----------------------------------------------------
  public getPortfolio = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getPortfolio(req.user!.id);
      sendSuccess(res, 'Portfolio fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getPortfolioByStudentId = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = Number(req.params.studentId);
      const result = await this.service.getPortfolioByStudentId(studentId, req.user?.id);
      sendSuccess(res, 'Portfolio fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createPortfolio = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createPortfolioSchema.parse(req.body);
      const result = await this.service.createPortfolio(req.user!.id, validated);
      sendSuccess(res, 'Portfolio created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updatePortfolio = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = updatePortfolioSchema.parse(req.body);
      const result = await this.service.updatePortfolio(req.user!.id, validated);
      sendSuccess(res, 'Portfolio updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // 1. Projects
  // ----------------------------------------------------
  public getProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = portfolioQuerySchema.parse(req.query);
      const result = await this.service.getProjects(req.user!.id, page, limit);
      sendSuccess(res, 'Portfolio projects fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getProjectById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = Number(req.params.projectId);
      const result = await this.service.getProjectById(req.user!.id, projectId);
      sendSuccess(res, 'Portfolio project fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public addProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createPortfolioProjectSchema.parse(req.body);
      const result = await this.service.addProject(req.user!.id, validated);
      sendSuccess(res, 'Portfolio project added successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = Number(req.params.projectId);
      const validated = updatePortfolioProjectSchema.parse(req.body);
      const result = await this.service.updateProject(req.user!.id, projectId, validated);
      sendSuccess(res, 'Portfolio project updated successfully', result, HttpStatus.OK);
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
  // 2. Certifications
  // ----------------------------------------------------
  public getCertifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = portfolioQuerySchema.parse(req.query);
      const result = await this.service.getCertifications(req.user!.id, page, limit);
      sendSuccess(res, 'Portfolio certifications fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getCertificationById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const certId = Number(req.params.certId);
      const result = await this.service.getCertificationById(req.user!.id, certId);
      sendSuccess(res, 'Portfolio certification fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public addCertification = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createPortfolioCertificationSchema.parse(req.body);
      const result = await this.service.addCertification(req.user!.id, validated);
      sendSuccess(res, 'Portfolio certification added successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateCertification = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const certId = Number(req.params.certId);
      const validated = updatePortfolioCertificationSchema.parse(req.body);
      const result = await this.service.updateCertification(req.user!.id, certId, validated);
      sendSuccess(res, 'Portfolio certification updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteCertification = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const certId = Number(req.params.certId);
      const result = await this.service.deleteCertification(req.user!.id, certId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // 3. Achievements
  // ----------------------------------------------------
  public getAchievements = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = portfolioQuerySchema.parse(req.query);
      const result = await this.service.getAchievements(req.user!.id, page, limit);
      sendSuccess(res, 'Portfolio achievements fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getAchievementById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const achievementId = Number(req.params.achievementId);
      const result = await this.service.getAchievementById(req.user!.id, achievementId);
      sendSuccess(res, 'Portfolio achievement fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public addAchievement = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createPortfolioAchievementSchema.parse(req.body);
      const result = await this.service.addAchievement(req.user!.id, validated);
      sendSuccess(res, 'Portfolio achievement added successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateAchievement = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const achievementId = Number(req.params.achievementId);
      const validated = updatePortfolioAchievementSchema.parse(req.body);
      const result = await this.service.updateAchievement(req.user!.id, achievementId, validated);
      sendSuccess(res, 'Portfolio achievement updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteAchievement = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const achievementId = Number(req.params.achievementId);
      const result = await this.service.deleteAchievement(req.user!.id, achievementId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // 4. Experiences
  // ----------------------------------------------------
  public getExperiences = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = portfolioQuerySchema.parse(req.query);
      const result = await this.service.getExperiences(req.user!.id, page, limit);
      sendSuccess(res, 'Portfolio experiences fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getExperienceById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const expId = Number(req.params.expId);
      const result = await this.service.getExperienceById(req.user!.id, expId);
      sendSuccess(res, 'Portfolio experience fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public addExperience = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createPortfolioExperienceSchema.parse(req.body);
      const result = await this.service.addExperience(req.user!.id, validated);
      sendSuccess(res, 'Portfolio experience added successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateExperience = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const expId = Number(req.params.expId);
      const validated = updatePortfolioExperienceSchema.parse(req.body);
      const result = await this.service.updateExperience(req.user!.id, expId, validated);
      sendSuccess(res, 'Portfolio experience updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteExperience = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const expId = Number(req.params.expId);
      const result = await this.service.deleteExperience(req.user!.id, expId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // 5. Documents
  // ----------------------------------------------------
  public getDocuments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = portfolioQuerySchema.parse(req.query);
      const result = await this.service.getDocuments(req.user!.id, page, limit);
      sendSuccess(res, 'Portfolio documents fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getDocumentById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const docId = Number(req.params.docId);
      const result = await this.service.getDocumentById(req.user!.id, docId);
      sendSuccess(res, 'Portfolio document fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public addDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createPortfolioDocumentSchema.parse(req.body);
      const result = await this.service.addDocument(req.user!.id, validated);
      sendSuccess(res, 'Portfolio document added successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const docId = Number(req.params.docId);
      const validated = updatePortfolioDocumentSchema.parse(req.body);
      const result = await this.service.updateDocument(req.user!.id, docId, validated);
      sendSuccess(res, 'Portfolio document updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const docId = Number(req.params.docId);
      const result = await this.service.deleteDocument(req.user!.id, docId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const portfolioController = new PortfolioController();
