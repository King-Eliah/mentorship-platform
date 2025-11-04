import React from 'react';
import { Wifi, WifiOff, TestTube } from 'lucide-react';
import { useWebSocketNotifications } from '../../hooks/useWebSocketNotifications';

interface WebSocketStatusProps {
  userId?: string;
  showTestButtons?: boolean;
  className?: string;
}

const WebSocketStatus: React.FC<WebSocketStatusProps> = ({
  userId = '1', // Default user ID for testing
  showTestButtons = false,
  className = ''
}) => {
  const {
    isConnected,
    sendTestMessage,
    sendPersonalTestMessage
  } = useWebSocketNotifications({ userId, showToasts: true });

  const handleTestMessage = () => {
    sendTestMessage();
  };

  const handlePersonalTestMessage = () => {
    sendPersonalTestMessage('This is a personal test message');
  };

  const handleTestBookingAPI = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/websocket/test/booking', {
        method: 'POST',
      });
      const message = await response.text();
      console.log('Test booking API response:', message);
    } catch (error) {
      console.error('Error calling test booking API:', error);
    }
  };

  const handleTestUserAPI = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/websocket/test/user/${userId}`, {
        method: 'POST',
      });
      const message = await response.text();
      console.log('Test user API response:', message);
    } catch (error) {
      console.error('Error calling test user API:', error);
    }
  };

  return (
    <div className={`inline-flex items-center gap-4 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <Wifi className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-600 font-medium">Disconnected</span>
          </>
        )}
      </div>

      {/* Test Buttons */}
      {showTestButtons && (
        <div className="flex items-center gap-2">
          <TestTube className="h-4 w-4 text-blue-500" />
          <div className="flex gap-2">
            <button
              onClick={handleTestMessage}
              disabled={!isConnected}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test WebSocket
            </button>
            
            <button
              onClick={handlePersonalTestMessage}
              disabled={!isConnected}
              className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Personal
            </button>
            
            <button
              onClick={handleTestBookingAPI}
              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Test Booking API
            </button>
            
            <button
              onClick={handleTestUserAPI}
              className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
            >
              Test User API
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebSocketStatus;