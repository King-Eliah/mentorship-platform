import { useState, useEffect } from 'react';
import { Notification } from '../types';
import { frontendService } from '../services/frontendService';

// Hook for fetching user notifications
export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const userNotifications = await frontendService.getNotifications(userId);
      setNotifications(userNotifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      await frontendService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  return {
    notifications,
    loading,
    error,
    markAsRead,
    refresh: loadNotifications
  };
}