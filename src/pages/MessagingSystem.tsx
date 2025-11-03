import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Users, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../components/ui/Button';

import { useAuth } from '../hooks/useAuth';
import { useWebSocket, ChatMessage, TypingIndicator } from '../hooks/useWebSocket';
import ChatWindow from '../components/chat/ChatWindow';
import ConversationList from '../components/chat/ConversationList';
import toast from 'react-hot-toast';

// Local interfaces
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

// Message interface matching ChatWindow expectations
interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  senderName: string;
  senderAvatar?: string;
}

const MessagingSystem: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // Handle incoming messages
  const handleNewMessage = useCallback((message: ChatMessage) => {
    console.log('Received new message:', message);
    
    if (selectedConversation && 
        (message.senderId === selectedConversation.otherUserId || 
         message.recipientId === selectedConversation.otherUserId)) {
      setMessages(prev => [...prev, message]);
    }

    setConversations(prev => prev.map(conv => {
      if (conv.otherUserId === message.senderId || conv.otherUserId === message.recipientId) {
        return {
          ...conv,
          lastMessage: {
            content: message.content,
            timestamp: message.timestamp,
            senderId: message.senderId
          },
          unreadCount: message.senderId !== user?.id ? conv.unreadCount + 1 : conv.unreadCount
        };
      }
      return conv;
    }));

    if (message.senderId !== user?.id && 
        (!selectedConversation || message.senderId !== selectedConversation.otherUserId)) {
      toast(`💬 New message from ${message.senderId}`, { duration: 4000 });
    }
  }, [selectedConversation, user?.id]);

  // Handle typing indicators
  const handleTypingIndicator = useCallback((typing: TypingIndicator) => {
    if (selectedConversation && typing.userId === selectedConversation.otherUserId) {
      setIsTyping(typing.isTyping);
    }
  }, [selectedConversation]);

  const {
    isConnected,
    sendMessage,
    sendTypingIndicator,
  } = useWebSocket({
    userId: user?.id,
    conversationId: selectedConversation?.id,
    autoConnect: true,
    onMessage: handleNewMessage,
    onTyping: handleTypingIndicator
  });

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoading(true);
        if (!user?.id) return;
        
        setConversations([
          {
            id: '1',
            otherUserId: '2',
            otherUserName: 'Sarah Johnson',
            otherUserAvatar: '',
            lastMessage: {
              content: 'How is your project going?',
              timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              senderId: '2'
            },
            unreadCount: 2,
            isOnline: true
          },
          {
            id: '2',
            otherUserId: '3',
            otherUserName: 'Mike Chen',
            otherUserAvatar: '',
            lastMessage: {
              content: 'Thanks for the guidance!',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
              senderId: '3'
            },
            unreadCount: 0,
            isOnline: false
          }
        ]);

      } catch (error) {
        console.error('Error loading conversations:', error);
        toast.error('Failed to load conversations.');
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      const loadMessages = async () => {
        try {
          const mockMessages: ChatMessage[] = [
            {
              id: '1',
              senderId: selectedConversation.otherUserId,
              recipientId: user?.id || '',
              content: 'Hey! How are you doing?',
              timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              isRead: true
            },
            {
              id: '2', 
              senderId: user?.id || '',
              recipientId: selectedConversation.otherUserId,
              content: 'I am doing well, thanks! How about you?',
              timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              isRead: true
            }
          ];
          setMessages(mockMessages);
        } catch (error) {
          console.error('Error loading messages:', error);
          toast.error('Failed to load messages.');
        }
      };

      loadMessages();
    }
  }, [selectedConversation, user]);

  const handleSendMessage = useCallback((content: string) => {
    if (!selectedConversation || !user) return;
    sendMessage({
      senderId: user.id,
      recipientId: selectedConversation.otherUserId,
      content: content.trim(),
      conversationId: selectedConversation.id,
    });
  }, [user, selectedConversation, sendMessage]);

  const handleTypingChange = useCallback((isTyping: boolean) => {
    if (!selectedConversation || !user) return;
    sendTypingIndicator({
      userId: user.id,
      conversationId: selectedConversation.id,
      isTyping,
    });
  }, [selectedConversation, sendTypingIndicator, user]);

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  const handleNewChat = () => {
    toast('This feature is not implemented yet.');
  };

  const chatWindowMessages: Message[] = messages.map(msg => ({
    ...msg,
    senderName: msg.senderId === user?.id 
      ? `${user?.firstName} ${user?.lastName}` || 'You'
      : conversations.find(c => c.otherUserId === msg.senderId)?.otherUserName || 'Unknown User'
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <Wifi className="w-4 h-4 mr-1" />
                    <span className="text-sm">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 dark:text-red-400">
                    <WifiOff className="w-4 h-4 mr-1" />
                    <span className="text-sm">Disconnected</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toast('New group feature coming soon!')}
              >
                <Users className="w-4 h-4 mr-2" />
                New Group
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-grow min-h-0">
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversation?.id}
              onSelectConversation={selectConversation}
              onNewChat={handleNewChat}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              currentUserId={user!.id}
            />
          </div>
          <div className="w-2/3 flex flex-col">
            {selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                messages={chatWindowMessages}
                onSendMessage={handleSendMessage}
                onTyping={handleTypingChange}
                onBack={() => setSelectedConversation(null)}
                currentUserId={user!.id}
                isTyping={isTyping}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                  <MessageSquare className="w-16 h-16 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-sm text-center">
                    Choose a conversation from the list on the left to start messaging.
                  </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingSystem;
