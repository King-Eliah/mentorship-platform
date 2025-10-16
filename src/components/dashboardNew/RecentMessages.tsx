import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { frontendService } from '../../services/frontendService';

const LoadingSkeleton = () => {
  const { isDark } = useTheme();
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse flex gap-3">
          <div className={`h-10 w-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className="flex-1">
            <div className={`h-4 rounded mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            <div className={`h-3 rounded w-3/4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const RecentMessages = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const allMessages = await frontendService.getMessages(user.id);
        
        // Get the most recent 3 messages
        const recentMessages = allMessages
          .sort((a: any, b: any) => new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime())
          .slice(0, 3);
        
        setMessages(recentMessages);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getSenderName = (message: any) => {
    return message.senderName || message.sender?.name || 'Unknown';
  };

  const getMessagePreview = (content: string) => {
    return content.length > 60 ? content.substring(0, 60) + '...' : content;
  };

  return (
    <div className={`${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } rounded-lg shadow-sm border p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        } flex items-center`}>
          <MessageSquare className="w-5 h-5 mr-2" />
          Recent Messages
        </h3>
        <button
          onClick={() => navigate('/messages')}
          className={`text-sm hover:underline ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}
        >
          View All
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : messages.length > 0 ? (
        <div className="space-y-2">
          {messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                isDark
                  ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => navigate('/messages')}
            >
              <div className="flex items-center justify-between mb-1">
                <p className={`font-medium text-sm truncate flex-1 mr-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {getSenderName(message)}
                </p>
                <span className={`text-xs flex-shrink-0 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {formatTimeAgo(message.timestamp || message.createdAt)}
                </span>
              </div>
              
              <p className={`text-xs truncate ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {getMessagePreview(message.content || message.message || '')}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-8 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm mb-2">No messages yet</p>
          <button
            onClick={() => navigate('/messages')}
            className={`text-sm hover:underline ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}
          >
            Start a conversation
          </button>
        </div>
      )}
    </div>
  );
};
