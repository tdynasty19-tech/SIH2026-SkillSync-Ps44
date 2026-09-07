import { Response, NextFunction } from 'express';
import { notificationService, NotificationService } from '../services/notification.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { sendSuccess } from '../utils/api-response';
import { HttpStatus } from '../constants/http-status';
import { notificationQuerySchema } from '../validators/notification.validator';

export class NotificationController {
  constructor(private readonly service: NotificationService = notificationService) {}

  public getMyNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = notificationQuerySchema.parse(req.query);
      const result = await this.service.getMyNotifications(req.user!.id, query);
      sendSuccess(res, 'Notifications retrieved successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getUnreadCount = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getUnreadCount(req.user!.id);
      sendSuccess(res, 'Unread notification count retrieved successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public getNotificationById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const result = await this.service.getNotificationById(req.user!.id, id);
      sendSuccess(res, 'Notification retrieved successfully', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public markAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const result = await this.service.markAsRead(req.user!.id, id);
      sendSuccess(res, 'Notification marked as read', result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public markAllAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.markAllAsRead(req.user!.id);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };

  public deleteNotification = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const result = await this.service.deleteNotification(req.user!.id, id);
      sendSuccess(res, result.message, result, HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  };
}

export const notificationController = new NotificationController();
