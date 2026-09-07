import { Response, NextFunction } from 'express';
import { analyticsService, AnalyticsService } from '../services/analytics.service';
import { studentRepository } from '../repositories/student.repository';
import { industryRepository } from '../repositories/industry.repository';
import { institutionRepository } from '../repositories/institution.repository';
import { AuthenticatedRequest } from '../types/auth.types';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import {
  studentSkillAnalyticsQuerySchema,
  institutionAnalyticsQuerySchema,
  industryHiringAnalyticsQuerySchema,
  applicationAnalyticsQuerySchema,
  skillDemandAnalyticsQuerySchema,
} from '../validators/analytics.validator';
import { NotFoundError } from '../errors/app.error';

export class AnalyticsController {
  constructor(private readonly service: AnalyticsService = analyticsService) {}

  // ====================================================
  // 1. STUDENT SKILL ANALYTICS
  // ====================================================

  public getStudentSkillAnalytics = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = studentSkillAnalyticsQuerySchema.parse(req.query);

      let studentId = query.studentId || (req.params.studentId ? Number(req.params.studentId) : undefined);
      if (!studentId) {
        const student = await studentRepository.findProfileByUserId(req.user!.id);
        if (!student) {
          throw new NotFoundError('Student profile not found');
        }
        studentId = student.id;
      }

      const result = await this.service.getStudentSkillAnalytics(studentId, {
        id: req.user!.id,
        role: req.user!.role,
      });

      sendSuccess(res, 'Student skill analytics retrieved successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ====================================================
  // 2. INSTITUTION SKILL ANALYTICS
  // ====================================================

  public getInstitutionSkillAnalytics = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = institutionAnalyticsQuerySchema.parse(req.query);

      let institutionId = query.institutionId || (req.params.institutionId ? Number(req.params.institutionId) : undefined);
      if (!institutionId) {
        const institution = await institutionRepository.findProfileByUserId(req.user!.id);
        if (!institution) {
          throw new NotFoundError('Institution profile not found');
        }
        institutionId = institution.id;
      }

      const result = await this.service.getInstitutionSkillAnalytics(institutionId, {
        id: req.user!.id,
        role: req.user!.role,
      });

      sendSuccess(res, 'Institution skill analytics retrieved successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ====================================================
  // 3. PLACEMENT ANALYTICS
  // ====================================================

  public getPlacementAnalytics = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = institutionAnalyticsQuerySchema.parse(req.query);

      let institutionId = query.institutionId || (req.params.institutionId ? Number(req.params.institutionId) : undefined);
      if (!institutionId) {
        const institution = await institutionRepository.findProfileByUserId(req.user!.id);
        if (!institution) {
          throw new NotFoundError('Institution profile not found');
        }
        institutionId = institution.id;
      }

      const result = await this.service.getPlacementAnalytics(
        institutionId,
        { id: req.user!.id, role: req.user!.role },
        query.academicYear
      );

      sendSuccess(res, 'Placement analytics retrieved successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ====================================================
  // 4. INDUSTRY HIRING ANALYTICS
  // ====================================================

  public getIndustryHiringAnalytics = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = industryHiringAnalyticsQuerySchema.parse(req.query);

      let industryId = query.industryId || (req.params.industryId ? Number(req.params.industryId) : undefined);
      if (!industryId) {
        const industry = await industryRepository.findProfileByUserId(req.user!.id);
        if (!industry) {
          throw new NotFoundError('Industry profile not found');
        }
        industryId = industry.id;
      }

      const result = await this.service.getIndustryHiringAnalytics(
        industryId,
        { id: req.user!.id, role: req.user!.role },
        query
      );

      sendSuccess(res, 'Industry hiring analytics retrieved successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getIndustryApplicationAnalytics = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    return this.getIndustryHiringAnalytics(req, res, next);
  };

  // ====================================================
  // 5. APPLICATION ANALYTICS
  // ====================================================

  public getApplicationAnalytics = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = applicationAnalyticsQuerySchema.parse(req.query);

      const result = await this.service.getApplicationAnalytics(query, {
        id: req.user!.id,
        role: req.user!.role,
      });

      sendSuccess(res, 'Application analytics retrieved successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ====================================================
  // 6. SKILL DEMAND ANALYTICS
  // ====================================================

  public getSkillDemandAnalytics = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = skillDemandAnalyticsQuerySchema.parse(req.query);
      const result = await this.service.getSkillDemandAnalytics(query);

      sendSuccess(res, 'Skill demand analytics retrieved successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ====================================================
  // 7. DASHBOARDS
  // ====================================================

  public getStudentDashboard = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.service.getStudentDashboard(req.user!.id);
      sendSuccess(res, 'Student dashboard retrieved successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getIndustryDashboard = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.service.getIndustryDashboard(req.user!.id);
      sendSuccess(res, 'Industry dashboard retrieved successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getInstitutionDashboard = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.service.getInstitutionDashboard(req.user!.id);
      sendSuccess(res, 'Institution dashboard retrieved successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getAcademicianDashboard = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.service.getAcademicianDashboard(req.user!.id);
      sendSuccess(res, 'Academician dashboard retrieved successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const analyticsController = new AnalyticsController();
