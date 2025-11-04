import { useEffect, useCallback, useState } from 'react';
import webSocketServiceInstance from '../services/webSocketService'; // Import the singleton instance

export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  messageType?: 'text' | 'file' | 'image';
  conversationId?: string;
}

export interface TypingIndicator {
  userId: string;
  conversationId: string;
  isTyping: boolean;
  timestamp: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  lastError?: string;
  connectionId?: string;
}

export interface BookingNotification {
  bookingId: number;
  mentorId: number;
  mentorName?: string;
  menteeId: number;
  menteeName?: string;
  eventType: 'CREATED' | 'UPDATED' | 'CANCELLED' | 'CONFIRMED' | 'COMPLETED' | 'TEST';
  sessionTitle: string;
  sessionDateTime: string;
  durationMinutes: number;
  sessionType: 'ONLINE' | 'IN_PERSON' | 'PHONE_CALL';
  meetingLink?: string;
  location?: string;
  message: string;
  timestamp: string;
  notificationType: 'BOOKING';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

export interface ReminderNotification {
  bookingId: number;
  userId: number;
  userName: string;
  userRole: 'MENTOR' | 'MENTEE';
  sessionTitle: string;
  sessionDateTime: string;
  durationMinutes: number;
  meetingLink?: string;
  location?: string;
  minutesUntilSession: number;
  message: string;
  timestamp: string;
  notificationType: 'REMINDER';
  priority: 'HIGH' | 'URGENT';
}

interface UseWebSocketOptions {
  userId?: string;
  conversationId?: string;
  autoConnect?: boolean;
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (typing: TypingIndicator) => void;
  onBookingNotification?: (notification: BookingNotification) => void;
  onReminderNotification?: (notification: ReminderNotification) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    userId,
    conversationId,
    autoConnect = true,
    onMessage,
    onTyping,
    onBookingNotification,
    onReminderNotification
  } = options;

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    webSocketServiceInstance.getConnectionStatus()
  );

  useEffect(() => {
    const onStatusChange = (status: ConnectionStatus) => {
      setConnectionStatus(status);
    };

    const unsubscribe = webSocketServiceInstance.subscribeToConnectionStatus(onStatusChange);

    if (autoConnect && !connectionStatus.isConnected && !connectionStatus.isConnecting) {
      webSocketServiceInstance.connect();
    }

    return () => {
      unsubscribe();
    };
  }, [autoConnect, connectionStatus.isConnected, connectionStatus.isConnecting]);

  useEffect(() => {
    let unsubscribes: (() => void)[] = [];

    if (connectionStatus.isConnected) {
      if (onBookingNotification) {
        unsubscribes.push(webSocketServiceInstance.subscribeToBookings(onBookingNotification));
      }
      if (onReminderNotification) {
        unsubscribes.push(webSocketServiceInstance.subscribeToReminders(onReminderNotification));
      }
      if (onMessage) {
        unsubscribes.push(webSocketServiceInstance.subscribeToMessages(onMessage));
      }
      if (onTyping) {
        unsubscribes.push(webSocketServiceInstance.subscribeToTyping(onTyping));
      }
      if (userId) {
        webSocketServiceInstance.subscribeToUserSpecific(userId);
      }
      if (conversationId) {
        webSocketServiceInstance.subscribeToConversation(conversationId);
      }
    }

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [
    connectionStatus.isConnected,
    userId,
    conversationId,
    onMessage,
    onTyping,
    onBookingNotification,
    onReminderNotification
  ]);

  const connect = useCallback(() => {
    webSocketServiceInstance.connect();
  }, []);

  const disconnect = useCallback(() => {
    webSocketServiceInstance.disconnect();
  }, []);

  const sendMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>) => {
    webSocketServiceInstance.sendMessage(message);
  }, []);

  const sendTypingIndicator = useCallback((typing: Omit<TypingIndicator, 'timestamp'>) => {
    webSocketServiceInstance.sendTypingIndicator(typing);
  }, []);

  return {
    ...connectionStatus,
    connect,
    disconnect,
    sendMessage,
    sendTypingIndicator,
  };
};