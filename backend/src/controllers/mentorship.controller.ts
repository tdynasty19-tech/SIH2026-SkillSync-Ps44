import { Response, NextFunction } from 'express';
import { mentorshipService, MentorshipService } from '../services/mentorship.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import { UserRole } from '../constants/roles';
import {
  createMentorProfileSchema,
  updateMentorProfileSchema,
  mentorQuerySchema,
  createMentorshipRequestSchema,
  respondMentorshipRequestSchema,
  mentorshipRequestQuerySchema,
  createMentorshipSessionSchema,
  updateMentorshipSessionSchema,
  mentorshipSessionQuerySchema,
} from '../validators/mentorship.validator';

export class MentorshipController {
  constructor(private readonly service: MentorshipService = mentorshipService) {}

  // ----------------------------------------------------
  // 1. Mentors
  // ----------------------------------------------------
  public getMentors = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = mentorQuerySchema.parse(req.query);
      const result = await this.service.getMentors(query);
      sendSuccess(res, 'Mentors fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getMentorById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const mentorId = Number(req.params.mentorId);
      const result = await this.service.getMentorById(mentorId);
      sendSuccess(res, 'Mentor fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getMyMentorProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getMyProfile(req.user!.id);
      sendSuccess(res, 'Mentor profile fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public createMentorProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createMentorProfileSchema.parse(req.body);
      const result = await this.service.createProfile(req.user!.id, validated);
      sendSuccess(res, 'Mentor profile created successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public updateMentorProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = updateMentorProfileSchema.parse(req.body);
      const result = await this.service.updateMyProfile(req.user!.id, validated);
      sendSuccess(res, 'Mentor profile updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // 2. Mentorship Requests
  // ----------------------------------------------------
  public createRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createMentorshipRequestSchema.parse(req.body);
      const result = await this.service.createRequest(req.user!.id, validated);
      sendSuccess(res, 'Mentorship request submitted successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public getMyRequests = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = mentorshipRequestQuerySchema.parse(req.query);
      const isMentor = req.user!.role === UserRole.ACADEMICIAN || req.user!.role === UserRole.INDUSTRY;
      const result = await this.service.getMyRequests(req.user!.id, isMentor, query);
      sendSuccess(res, 'Mentorship requests fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getRequestById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requestId = Number(req.params.requestId);
      const result = await this.service.getRequestById(req.user!.id, requestId);
      sendSuccess(res, 'Mentorship request fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public respondToRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requestId = Number(req.params.requestId);
      const validated = respondMentorshipRequestSchema.parse(req.body);
      const result = await this.service.respondToRequest(req.user!.id, requestId, validated);
      sendSuccess(res, 'Mentorship request status updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  // ----------------------------------------------------
  // 3. Mentorship Sessions
  // ----------------------------------------------------
  public createSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createMentorshipSessionSchema.parse(req.body);
      const result = await this.service.createSession(req.user!.id, validated);
      sendSuccess(res, 'Mentorship session scheduled successfully', result, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  };

  public getSessionById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sessionId = Number(req.params.sessionId);
      const result = await this.service.getSessionById(req.user!.id, sessionId);
      sendSuccess(res, 'Mentorship session fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getSessions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requestId = Number(req.params.requestId);
      const query = mentorshipSessionQuerySchema.parse(req.query);
      const result = await this.service.getSessions(req.user!.id, requestId, query);
      sendSuccess(res, 'Mentorship sessions fetched successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public updateSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sessionId = Number(req.params.sessionId);
      const validated = updateMentorshipSessionSchema.parse(req.body);
      const result = await this.service.updateSession(req.user!.id, sessionId, validated);
      sendSuccess(res, 'Mentorship session updated successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const mentorshipController = new MentorshipController();
