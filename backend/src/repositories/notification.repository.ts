import { Transaction } from 'sequelize';
import '../models';
import {
  Notification,
  NotificationAttributes,
  NotificationCreationAttributes,
} from '../models/notification.model';

export class NotificationRepository {
  public async createNotification(
    data: NotificationCreationAttributes,
    transaction?: Transaction
  ): Promise<Notification> {
    return Notification.create(data, { transaction });
  }

  public async findNotificationsByUser(
    userId: number,
    limit = 20,
    offset = 0,
    isRead?: boolean
  ) {
    const where: any = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    return Notification.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  public async findNotificationById(id: number, userId: number): Promise<Notification | null> {
    return Notification.findOne({
      where: { id, userId },
    });
  }

  public async markAsRead(id: number, userId: number, transaction?: Transaction): Promise<[number]> {
    return Notification.update(
      {
        isRead: true,
        readAt: new Date(),
      },
      {
        where: { id, userId },
        transaction,
      }
    );
  }

  public async markAllAsRead(userId: number, transaction?: Transaction): Promise<[number]> {
    return Notification.update(
      {
        isRead: true,
        readAt: new Date(),
      },
      {
        where: { userId, isRead: false },
        transaction,
      }
    );
  }

  public async countUnread(userId: number): Promise<number> {
    return Notification.count({
      where: { userId, isRead: false },
    });
  }

  public async deleteNotification(id: number, userId: number, transaction?: Transaction): Promise<number> {
    return Notification.destroy({
      where: { id, userId },
      transaction,
    });
  }
}

export const notificationRepository = new NotificationRepository();
