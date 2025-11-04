import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

export const NotificationBell = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={() => navigate('/activities')}
      className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title="View notifications"
    >
      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};
