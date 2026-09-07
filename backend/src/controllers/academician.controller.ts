import { Response, NextFunction } from 'express';
import { academicianService, AcademicianService } from '../services/academician.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import {
  createAcademicianProfileSchema,
  updateAcademicianProfileSchema,
  createInstitutionAssociationSchema,
  updateInstitutionAssociationSchema,
  associationQuerySchema,
} from '../validators/academician.validator';

export class AcademicianController {
  constructor(private readonly service: AcademicianService = academicianService) {}

  // ----------------------------------------------------
  // Profile Handlers
  // ----------------------------------------------------
  public getMyProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.service.getMyProfile(req.user!.id);
      sendSuccess(res, 'Academician profile fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createMyProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = createAcademicianProfileSchema.parse(req.body);
      const result = await this.service.createMyProfile(req.user!.id, validated);
      sendSuccess(res, 'Academician profile created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateMyProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = updateAcademicianProfileSchema.parse(req.body);
      const result = await this.service.updateMyProfile(req.user!.id, validated);
      sendSuccess(res, 'Academician profile updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // Association Handlers
  // ----------------------------------------------------
  public getAssociations = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = associationQuerySchema.parse(req.query);
      const result = await this.service.getAssociations(req.user!.id, query);
      sendSuccess(res, 'Academic institution associations fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getAssociationById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const associationId = Number(req.params.associationId);
      const result = await this.service.getAssociationById(req.user!.id, associationId);
      sendSuccess(res, 'Academic institution association fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createAssociation = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = createInstitutionAssociationSchema.parse(req.body);
      const result = await this.service.createAssociation(req.user!.id, validated);
      sendSuccess(res, 'Academic institution association created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateAssociation = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const associationId = Number(req.params.associationId);
      const validated = updateInstitutionAssociationSchema.parse(req.body);
      const result = await this.service.updateAssociation(req.user!.id, associationId, validated);
      sendSuccess(res, 'Academic institution association updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteAssociation = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const associationId = Number(req.params.associationId);
      const result = await this.service.deleteAssociation(req.user!.id, associationId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const academicianController = new AcademicianController();
