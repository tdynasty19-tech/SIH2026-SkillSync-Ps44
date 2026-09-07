import { z } from 'zod';
import { NotificationType } from '../constants/enums';

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  isRead: z.preprocess((val) => {
    if (val === 'true' || val === true) return true;
    if (val === 'false' || val === false) return false;
    return undefined;
  }, z.boolean().optional()),
});

export const createNotificationSchema = z.object({
  userId: z.coerce.number().int().positive(),
  title: z.string().trim().min(1, 'Title is required').max(255),
  message: z.string().trim().min(1, 'Message is required'),
  type: z.nativeEnum(NotificationType),
  data: z.record(z.string(), z.any()).optional().nullable(),
});

export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
