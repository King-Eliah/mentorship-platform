import { api } from './api';

export interface Notification {
  id: string;
  userId: string;
  type: 'EVENT' | 'MESSAGE' | 'GOAL' | 'ACTIVITY' | 'GROUP' | 'SYSTEM' | 'FEEDBACK';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface GetNotificationsParams {
  isRead?: boolean;
}

export interface GetNotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const notificationService = {
  /**
   * Get notifications for current user
   * @param params - Optional filters (isRead)
   */
  async getNotifications(params?: GetNotificationsParams): Promise<GetNotificationsResponse> {
    const queryParams: Record<string, string> = {};
    if (params?.isRead !== undefined) {
      queryParams.isRead = String(params.isRead);
    }
    
    const response = await api.get<GetNotificationsResponse>('/notifications', queryParams);
    return response;
  },
  
  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    const response = await api.patch<{ notification: Notification }>(`/notifications/${id}/read`);
    return response.notification;
  },
  
  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await api.patch<{ message: string }>('/notifications/all/read');
  },
  
  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    await api.delete<{ message: string }>(`/notifications/${id}`);
  },

  /**
   * Get notification count
   */
  async getNotificationCount(): Promise<{ unreadCount: number }> {
    const response = await api.get<{ unreadCount: number }>('/notifications');
    return { unreadCount: response.unreadCount || 0 };
  }
};