import { Search, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
  isOnline: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  onNewChat: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  currentUserId: string;
}

export default function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewChat,
  searchTerm,
  onSearchChange,
  currentUserId
}: ConversationListProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than 24 hours - show time
    if (diff < 86400000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Less than a week - show day
    if (diff < 604800000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Older - show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUserName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
          <Button
            onClick={onNewChat}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No conversations yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Start a new conversation to connect with mentors and mentees
            </p>
            <Button
              onClick={onNewChat}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Start New Chat
            </Button>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selectedConversationId === conversation.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600'
                    : ''
                }`}
              >
                <div className="relative mr-3">
                  <img
                    src={conversation.otherUserAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.otherUserName)}&background=random`}
                    alt={conversation.otherUserName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                  )}
                  {conversation.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-medium truncate ${
                      conversation.unreadCount > 0 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {conversation.otherUserName}
                    </h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                        {formatTime(conversation.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  
                  {conversation.lastMessage && (
                    <div className="flex items-center">
                      <p className={`text-sm truncate ${
                        conversation.unreadCount > 0
                          ? 'text-gray-900 dark:text-white font-medium'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {conversation.lastMessage.senderId === currentUserId && (
                          <span className="text-gray-400">You: </span>
                        )}
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}