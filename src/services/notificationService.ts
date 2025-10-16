import { frontendService } from './frontendService';

export const notificationService = {
  async getNotifications(_params: any) {
    return frontendService.getNotifications('1'); // Mock user ID
  },
  
  async markAsRead(id: string) {
    return frontendService.markNotificationAsRead(id);
  }
};