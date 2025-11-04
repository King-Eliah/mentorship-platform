import { useEffect, useMemo } from 'react';
import { MessageSquare } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useMessaging } from '../../hooks/useMessaging';

interface ReceivedMessage {
  id: string;
  content: string;
  createdAt: string;
  senderName: string;
  conversationId: string;
}

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
  const { conversations, getConversations, isLoading } = useMessaging();

  useEffect(() => {
    if (user) {
      getConversations();
    }
  }, [user, getConversations]);

  // Build a list of recent received messages from conversations' lastMessage
  const recent = useMemo<ReceivedMessage[]>(() => {
    if (!conversations || !user) {
      return [];
    }

    const received: ReceivedMessage[]= [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    conversations.forEach((conv: any) => {
      const last = conv.lastMessage || conv.last_message || conv.last;
      if (!last) {
        return;
      }

      // Only include messages not sent by current user
      if (last.senderId && last.senderId === user.id) {
        return;
      }

      // Get sender name from otherUser or sender object
      const otherUser = conv.otherUser || (conv.participant1Id === user.id ? conv.participant2 : conv.participant1);
      const senderName = (last.sender && `${last.sender.firstName || ''} ${last.sender.lastName || ''}`.trim())
        || (otherUser && `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim())
        || 'Unknown';

      received.push({
        id: last.id || `${conv.id}-${last.createdAt}`,
        content: last.content || '[No preview]',
        createdAt: last.createdAt || last.updatedAt || conv.updatedAt || conv.lastMessageAt || new Date().toISOString(),
        senderName,
        conversationId: conv.id,
      });
    });

    return received.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);
  }, [conversations, user]);

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

  const getMessagePreview = (content: string) => {
    return content?.length > 60 ? content.substring(0, 60) + '...' : content;
  };

  const loading = isLoading;

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
      ) : recent.length > 0 ? (
        <div className="space-y-2">
          {recent.map((message) => (
            <div
              key={message.id}
              className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                isDark
                  ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => navigate(`/messages/${message.conversationId}`)}
            >
              <div className="flex items-center justify-between mb-1">
                <p className={`font-medium text-sm truncate flex-1 mr-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {message.senderName}
                </p>
                <span className={`text-xs flex-shrink-0 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {formatTimeAgo(message.createdAt)}
                </span>
              </div>
              
              <p className={`text-xs truncate ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {getMessagePreview(message.content)}
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
