import { Response, NextFunction } from 'express';
import { industryService, IndustryService } from '../services/industry.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import {
  createIndustryProfileSchema,
  updateIndustryProfileSchema,
  createIndustryContactSchema,
  updateIndustryContactSchema,
  industryContactQuerySchema,
} from '../validators/industry.validator';

export class IndustryController {
  constructor(private readonly service: IndustryService = industryService) {}

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
      sendSuccess(res, 'Industry profile fetched successfully', result, HttpStatus.OK);
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
      const validated = createIndustryProfileSchema.parse(req.body);
      const result = await this.service.createMyProfile(req.user!.id, validated);
      sendSuccess(res, 'Industry profile created successfully', result, HttpStatus.CREATED);
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
      const validated = updateIndustryProfileSchema.parse(req.body);
      const result = await this.service.updateMyProfile(req.user!.id, validated);
      sendSuccess(res, 'Industry profile updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // Contact Handlers
  // ----------------------------------------------------
  public getContacts = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = industryContactQuerySchema.parse(req.query);
      const result = await this.service.getContacts(req.user!.id, query);
      sendSuccess(res, 'Industry contacts fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getContactById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const contactId = Number(req.params.contactId);
      const result = await this.service.getContactById(req.user!.id, contactId);
      sendSuccess(res, 'Industry contact fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createContact = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = createIndustryContactSchema.parse(req.body);
      const result = await this.service.createContact(req.user!.id, validated);
      sendSuccess(res, 'Industry contact created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateContact = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const contactId = Number(req.params.contactId);
      const validated = updateIndustryContactSchema.parse(req.body);
      const result = await this.service.updateContact(req.user!.id, contactId, validated);
      sendSuccess(res, 'Industry contact updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteContact = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const contactId = Number(req.params.contactId);
      const result = await this.service.deleteContact(req.user!.id, contactId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const industryController = new IndustryController();
