import React from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Notification } from '../types';

export const NotificationsPage: React.FC = () => {
  const { items: notifications, loading } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const unreadCount = (notifications as Notification[]).filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        {unreadCount > 0 && (
          <Button onClick={() => markAllAsRead()} size="sm" variant="primary">
            Mark All Read ({unreadCount})
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Recent Notifications
          </h3>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {(notifications as Notification[]).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.type}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                You're all caught up! Check back later for new updates.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};