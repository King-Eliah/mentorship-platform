import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../../hooks/useNotifications';
import { Button } from '../ui/Button';
import { Dropdown, DropdownItem, DropdownSeparator } from '../ui/Dropdown';
import { timeAgo } from '../../utils/time-ago';
import { Notification } from '../../types';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { items: notifications, loading, refresh, hasMore, loadPage } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
    refresh();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    refresh();
  };

  return (
    <div className="relative">
      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position="bottom-right"
        className="mr-4"
        trigger={
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        }
      >
        <div className="w-80">
          <div className="flex justify-between items-center p-3 border-b dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>

          {loading && notifications.length === 0 && <div className="p-4 text-center">Loading...</div>}

          {!loading && notifications.length === 0 && (
            <div className="p-4 text-center text-gray-500">No notifications</div>
          )}

          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification: Notification) => (
              <DropdownItem key={notification.id} onClick={() => handleMarkAsRead(notification.id)}>
                <div className="flex items-start space-x-3">
                  <div className={`mt-1 w-2 h-2 rounded-full ${notification.isRead ? 'bg-transparent' : 'bg-blue-500'}`}></div>
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(notification.createdAt)}</p>
                  </div>
                </div>
              </DropdownItem>
            ))}
          </div>

          {hasMore && (
            <>
              <DropdownSeparator />
              <DropdownItem onClick={() => loadPage((notifications.length / 20) + 1)}>
                <div className="text-center w-full">Load More</div>
              </DropdownItem>
            </>
          )}
        </div>
      </Dropdown>
    </div>
  );
};
