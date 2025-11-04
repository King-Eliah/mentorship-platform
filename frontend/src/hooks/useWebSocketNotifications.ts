import { useWebSocket, BookingNotification, ReminderNotification } from '../hooks/useWebSocket';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

interface UseWebSocketNotificationsOptions {
  userId?: string;
  showToasts?: boolean;
  onBookingNotification?: (notification: BookingNotification) => void;
  onReminderNotification?: (notification: ReminderNotification) => void;
}

export const useWebSocketNotifications = (options: UseWebSocketNotificationsOptions = {}) => {
  const { user } = useAuth();
  const {
    userId = user?.id,
    showToasts = true,
    onBookingNotification,
    onReminderNotification,
  } = options;

  const handleBookingNotification = (notification: BookingNotification) => {
    console.log('📅 Booking notification:', notification);

    if (showToasts) {
      switch (notification.eventType) {
        case 'CREATED':
          toast.success(`📅 New booking: ${notification.sessionTitle}`, {
            duration: 5000,
            icon: '📅',
          });
          break;
        case 'UPDATED':
          toast(`📝 Booking updated: ${notification.sessionTitle}`, {
            duration: 4000,
            icon: '📝',
          });
          break;
        case 'CANCELLED':
          toast.error(`❌ Booking cancelled: ${notification.sessionTitle}`, {
            duration: 5000,
            icon: '❌',
          });
          break;
        case 'CONFIRMED':
          toast.success(`✅ Booking confirmed: ${notification.sessionTitle}`, {
            duration: 4000,
            icon: '✅',
          });
          break;
        case 'COMPLETED':
          toast.success(`🎉 Session completed: ${notification.sessionTitle}`, {
            duration: 4000,
            icon: '🎉',
          });
          break;
        default:
          toast(`📅 ${notification.sessionTitle}`, {
            duration: 4000,
          });
      }
    }
    onBookingNotification?.(notification);
  };

  const handleReminderNotification = (notification: ReminderNotification) => {
    console.log('⏰ Reminder notification:', notification);

    if (showToasts) {
      if (notification.minutesUntilSession <= 15) {
        toast(`⏰ Starting in ${notification.minutesUntilSession} minutes: ${notification.sessionTitle}`, {
          duration: 8000,
          icon: '⏰',
          style: {
            background: '#f59e0b',
            color: 'white',
          },
        });
      } else {
        toast(`⏰ Reminder: ${notification.sessionTitle} in ${notification.minutesUntilSession} minutes`, {
          duration: 6000,
        });
      }
    }
    onReminderNotification?.(notification);
  };

  const { isConnected, isConnecting, reconnectAttempts, lastError } = useWebSocket({
    userId,
    autoConnect: true,
    onBookingNotification: handleBookingNotification,
    onReminderNotification: handleReminderNotification,
  });

  return { isConnected, isConnecting, reconnectAttempts, lastError };
};