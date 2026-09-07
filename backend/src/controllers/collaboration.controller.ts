import { Response, NextFunction } from 'express';
import { collaborationService, CollaborationService } from '../services/collaboration.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import {
  createCollaborationSchema,
  updateCollaborationSchema,
  createWorkshopSchema,
  updateWorkshopSchema,
  createGuestLectureSchema,
  updateGuestLectureSchema,
  createIndustrialTrainingSchema,
  updateIndustrialTrainingSchema,
  createLiveProjectSchema,
  updateLiveProjectSchema,
  collaborationQuerySchema,
} from '../validators/collaboration.validator';

export class CollaborationController {
  constructor(private readonly service: CollaborationService = collaborationService) {}

  // ----------------------------------------------------
  // 1. Collaboration Handlers
  // ----------------------------------------------------
  public getCollaborations = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = collaborationQuerySchema.parse(req.query);
      const result = await this.service.getCollaborations(req.user!, query);
      sendSuccess(res, 'Collaborations fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getCollaborationById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const collaborationId = Number(req.params.collaborationId);
      const result = await this.service.getCollaborationById(req.user!, collaborationId);
      sendSuccess(res, 'Collaboration fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createCollaboration = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = createCollaborationSchema.parse(req.body);
      const result = await this.service.createCollaboration(req.user!, validated);
      sendSuccess(res, 'Collaboration created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateCollaboration = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const collaborationId = Number(req.params.collaborationId);
      const validated = updateCollaborationSchema.parse(req.body);
      const result = await this.service.updateCollaboration(req.user!, collaborationId, validated);
      sendSuccess(res, 'Collaboration updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteCollaboration = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const collaborationId = Number(req.params.collaborationId);
      const result = await this.service.deleteCollaboration(req.user!, collaborationId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // 2. Workshop Handlers
  // ----------------------------------------------------
  public createWorkshop = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const collaborationId = Number(req.params.collaborationId);
      const validated = createWorkshopSchema.parse(req.body);
      const result = await this.service.createWorkshop(req.user!, collaborationId, validated);
      sendSuccess(res, 'Workshop created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateWorkshop = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const workshopId = Number(req.params.workshopId);
      const validated = updateWorkshopSchema.parse(req.body);
      const result = await this.service.updateWorkshop(req.user!, workshopId, validated);
      sendSuccess(res, 'Workshop updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteWorkshop = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const workshopId = Number(req.params.workshopId);
      const result = await this.service.deleteWorkshop(req.user!, workshopId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // 3. Guest Lecture Handlers
  // ----------------------------------------------------
  public createGuestLecture = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const collaborationId = Number(req.params.collaborationId);
      const validated = createGuestLectureSchema.parse(req.body);
      const result = await this.service.createGuestLecture(req.user!, collaborationId, validated);
      sendSuccess(res, 'Guest lecture created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateGuestLecture = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const lectureId = Number(req.params.lectureId);
      const validated = updateGuestLectureSchema.parse(req.body);
      const result = await this.service.updateGuestLecture(req.user!, lectureId, validated);
      sendSuccess(res, 'Guest lecture updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteGuestLecture = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const lectureId = Number(req.params.lectureId);
      const result = await this.service.deleteGuestLecture(req.user!, lectureId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // 4. Industrial Training Handlers
  // ----------------------------------------------------
  public createIndustrialTraining = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const collaborationId = Number(req.params.collaborationId);
      const validated = createIndustrialTrainingSchema.parse(req.body);
      const result = await this.service.createIndustrialTraining(req.user!, collaborationId, validated);
      sendSuccess(res, 'Industrial training created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateIndustrialTraining = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const trainingId = Number(req.params.trainingId);
      const validated = updateIndustrialTrainingSchema.parse(req.body);
      const result = await this.service.updateIndustrialTraining(req.user!, trainingId, validated);
      sendSuccess(res, 'Industrial training updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteIndustrialTraining = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const trainingId = Number(req.params.trainingId);
      const result = await this.service.deleteIndustrialTraining(req.user!, trainingId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // 5. Live Project Handlers
  // ----------------------------------------------------
  public createLiveProject = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const collaborationId = Number(req.params.collaborationId);
      const validated = createLiveProjectSchema.parse(req.body);
      const result = await this.service.createLiveProject(req.user!, collaborationId, validated);
      sendSuccess(res, 'Live project created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateLiveProject = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const projectId = Number(req.params.projectId);
      const validated = updateLiveProjectSchema.parse(req.body);
      const result = await this.service.updateLiveProject(req.user!, projectId, validated);
      sendSuccess(res, 'Live project updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteLiveProject = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const projectId = Number(req.params.projectId);
      const result = await this.service.deleteLiveProject(req.user!, projectId);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const collaborationController = new CollaborationController();
