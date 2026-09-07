import { apiClient } from './apiClient';
import { NotificationListResponse, UnreadCountResponse, NotificationItem } from '../types/notification.types';

export const notificationService = {
  async getMyNotifications(params?: { page?: number; limit?: number; isRead?: boolean }): Promise<NotificationListResponse> {
    const response = await apiClient.get<{ success: boolean; data: NotificationListResponse }>('/notifications', {
      params,
    });
    return response.data.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ success: boolean; data: UnreadCountResponse }>('/notifications/unread-count');
    return response.data.data.unreadCount;
  },

  async markAsRead(id: number): Promise<NotificationItem> {
    const response = await apiClient.patch<{ success: boolean; data: NotificationItem }>(`/notifications/${id}/read`);
    return response.data.data;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  },

  async deleteNotification(id: number): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },
};
