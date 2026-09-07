import { notificationRepository, NotificationRepository } from '../repositories/notification.repository';
import { CreateNotificationInput, NotificationQueryInput } from '../validators/notification.validator';
import { NotFoundError } from '../errors/app.error';

export class NotificationService {
  constructor(private readonly repository: NotificationRepository = notificationRepository) {}

  public async createNotification(input: CreateNotificationInput) {
    const notification = await this.repository.createNotification({
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type,
      data: input.data || null,
      isRead: false,
    });
    return notification.toJSON();
  }

  public async getMyNotifications(userId: number, query: NotificationQueryInput) {
    const offset = (query.page - 1) * query.limit;
    const { rows, count } = await this.repository.findNotificationsByUser(
      userId,
      query.limit,
      offset,
      query.isRead
    );

    return {
      notifications: rows,
      pagination: {
        total: count,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  }

  public async getNotificationById(userId: number, id: number) {
    const notification = await this.repository.findNotificationById(id, userId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
    return notification.toJSON();
  }

  public async markAsRead(userId: number, id: number) {
    const notification = await this.repository.findNotificationById(id, userId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    await this.repository.markAsRead(id, userId);
    const updated = await this.repository.findNotificationById(id, userId);
    return updated!.toJSON();
  }

  public async markAllAsRead(userId: number) {
    await this.repository.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }

  public async getUnreadCount(userId: number) {
    const unreadCount = await this.repository.countUnread(userId);
    return { unreadCount };
  }

  public async deleteNotification(userId: number, id: number) {
    const notification = await this.repository.findNotificationById(id, userId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    await this.repository.deleteNotification(id, userId);
    return { message: 'Notification deleted successfully' };
  }
}

export const notificationService = new NotificationService();
