import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  MoreVertical,
  User,
  Loader,
  Share2,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/notifications';
import { tokenManager } from '../services/api';
import { API_CONFIG } from '../config/api.config';

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
  isOnline?: boolean;
}

interface ContactData {
  id: string;
  userId: string;
  contactUserId: string;
  user?: UserInfo;
  contactUser: UserInfo;
  contactType: string;
  addedAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: string;
  isRead: boolean;
  sender?: UserInfo;
  replyToId?: string;
  replyTo?: {
    id: string;
    content: string;
    sender: {
      firstName: string;
      lastName: string;
    };
  };
}

interface ConversationData {
  id: string;
  userId1?: string;
  userId2?: string;
  user1?: UserInfo;
  user2?: UserInfo;
  otherUser?: UserInfo;
  otherUserId?: string;
  directMessages?: Message[];
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

const API_URL = API_CONFIG.BASE_URL;

interface ContactRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message?: string;
  createdAt: string;
  respondedAt?: string;
  sender?: UserInfo;
  receiver?: UserInfo;
}

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'messages' | 'contacts' | 'requests'>('messages');
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [contextMenuMessageId, setContextMenuMessageId] = useState<string | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  
  // Contact request states
  const [pendingRequests, setPendingRequests] = useState<ContactRequest[]>([]);
  const [requestStatusMap, setRequestStatusMap] = useState<Record<string, 'PENDING' | 'ACCEPTED' | 'REJECTED'>>({});
  const [userIdSearchResult, setUserIdSearchResult] = useState<UserInfo | null>(null);
  const [showUserIdSearch, setShowUserIdSearch] = useState(false);
  const [userIdInput, setUserIdInput] = useState('');
  // v2.0.1 - Fix for Railway API cache bust

  const getAuthHeaders = useCallback(() => {
    const token = tokenManager.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, []);

  const loadBrowsableUsers = React.useCallback(async () => {
    try {
      if (!user?.id) return;
      setIsLoading(true);
      
      // Load both browsable users and actual contacts
      const [browseRes, contactsRes] = await Promise.all([
        fetch(`${API_URL}/contacts/browse`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/contacts`, { headers: getAuthHeaders() }),
      ]);

      if (!browseRes.ok || !contactsRes.ok) {
        throw new Error('Failed to load users or contacts');
      }

      const browseData = await browseRes.json();
      const contactsData = await contactsRes.json();
      
      // Get actual contact IDs (people we have established contact with)
      const actualContactIds = new Set((contactsData.contacts || []).map((c: ContactData) => c.contactUserId));
      
      // Convert users to contact format
      const users = browseData.users || [];
      const contactsFormatted = users.map((u: UserInfo) => ({
        id: u.id,
        userId: user.id,
        contactUserId: u.id,
        contactUser: u,
        contactType: actualContactIds.has(u.id) ? 'CONTACT' : 'USER',
        addedAt: new Date().toISOString(),
      }));
      
      setContacts(contactsFormatted);
    } catch (error) {
      console.error('Error loading users:', error);
      // Don't show error toast - users list might just be empty
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getAuthHeaders]);

  const loadConversations = React.useCallback(async () => {
    try {
      if (!user?.id) return;
      setIsLoading(true);
      const response = await fetch(`${API_URL}/conversations`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Handle both array and object responses
      const conversationsList = Array.isArray(data) ? data : (data.conversations || []);
      setConversations(conversationsList);
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Don't show error toast - conversations might just be empty
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getAuthHeaders]);

  const loadPendingRequests = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/contacts/request/pending`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPendingRequests(data.requests || []);
      
      // Build status map for received requests
      const statusMap: Record<string, 'PENDING' | 'ACCEPTED' | 'REJECTED'> = {};
      (data.requests || []).forEach((req: ContactRequest) => {
        statusMap[req.senderId] = req.status;
      });
      setRequestStatusMap(statusMap);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  }, [getAuthHeaders]);

  const loadSentRequests = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/contacts/request/sent`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Build status map for sent requests
      const statusMap: Record<string, 'PENDING' | 'ACCEPTED' | 'REJECTED'> = {};
      (data.requests || []).forEach((req: ContactRequest) => {
        statusMap[req.receiverId] = req.status;
      });
      setRequestStatusMap(prev => ({ ...prev, ...statusMap }));
    } catch (error) {
      console.error('Error loading sent requests:', error);
    }
  }, [getAuthHeaders]);

  const sendContactRequest = async (receiverId: string, message?: string) => {
    try {
      const response = await fetch(`${API_URL}/contacts/request/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          receiverId,
          message: message || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send request');
      }

      await response.json();
      
      // Update status map
      setRequestStatusMap(prev => ({ ...prev, [receiverId]: 'PENDING' }));
      
      notify.success('Contact request sent!');
    } catch (error) {
      console.error('Error sending contact request:', error);
      notify.error(error instanceof Error ? error.message : 'Failed to send contact request');
    }
  };

  const acceptContactRequest = async (requestId: string, senderId: string) => {
    try {
      const response = await fetch(`${API_URL}/contacts/request/${requestId}/accept`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to accept request');
      }

      // Remove from pending and reload
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      setRequestStatusMap(prev => {
        const updated = { ...prev };
        delete updated[senderId];
        return updated;
      });
      
      // Reload contacts and conversations
      await loadBrowsableUsers();
      await loadConversations();
      
      // Find or create conversation with the sender
      setTimeout(() => {
        const senderContact = contacts.find(c => c.contactUserId === senderId);
        if (senderContact) {
          handleStartConversation(senderContact);
          setActiveTab('messages');
        }
      }, 500);
      
      notify.success('Contact added! Opening chat...');
    } catch (error) {
      console.error('Error accepting request:', error);
      notify.error('Failed to accept request');
    }
  };

  const rejectContactRequest = async (requestId: string, senderId: string) => {
    try {
      const response = await fetch(`${API_URL}/contacts/request/${requestId}/reject`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to reject request');
      }

      // Remove from pending
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      setRequestStatusMap(prev => {
        const updated = { ...prev };
        delete updated[senderId];
        return updated;
      });
      
      notify.success('Request declined');
    } catch (error) {
      console.error('Error rejecting request:', error);
      notify.error('Failed to reject request');
    }
  };

  const searchUserById = async (userId: string) => {
    if (!userId.trim()) {
      setUserIdSearchResult(null);
      return;
    }

    try {
      const url = `${API_URL}/contacts/search/${userId}`;
      const headers = getAuthHeaders();
      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'User not found' }));
        throw new Error(errorData.message || 'User not found');
      }

      const data = await response.json();
      setUserIdSearchResult(data.user || null);
      
      if (!data.user) {
        notify.error('User not found');
      }
    } catch (error) {
      console.error('Error searching user:', error);
      setUserIdSearchResult(null);
      notify.error(error instanceof Error ? error.message : 'User not found');
    }
  };

  // Load contacts and conversations
  useEffect(() => {
    if (user?.id) {
      loadBrowsableUsers();
      loadConversations();
      loadPendingRequests();
      loadSentRequests();
    }
  }, [user?.id, loadBrowsableUsers, loadConversations, loadPendingRequests, loadSentRequests]);

  // Poll for new messages only when a conversation is selected (every 5 seconds to avoid rate limiting)
  useEffect(() => {
    if (!user?.id || !selectedConversation?.id) return;

    const pollInterval = setInterval(() => {
      loadConversations();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [user?.id, selectedConversation?.id, loadConversations]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation?.id) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${API_URL}/direct-messages/${selectedConversation.id}`,
          { headers: getAuthHeaders() }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        setSelectedConversation((prev) => {
          if (!prev || prev.id !== selectedConversation.id) return prev;
          return {
            ...prev,
            directMessages: data.messages || [],
          };
        });

        // Mark unread messages as read
        const unreadMessages = (data.messages || []).filter(
          (m: Message) => !m.isRead && m.senderId !== user?.id
        );

        if (unreadMessages.length > 0) {
          // Mark messages as read on the backend
          for (const msg of unreadMessages) {
            try {
              await fetch(`${API_URL}/direct-messages/${msg.id}/read`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
              });
            } catch (error) {
              console.error('Error marking message as read:', error);
            }
          }
          // Reload conversations to update unread counts
          await loadConversations();
        }
      } catch {
        // Silently ignore errors for unread marker
      }
    };

    fetchMessages();
  }, [selectedConversation?.id, getAuthHeaders, user?.id, loadConversations]);

  const handleStartConversation = async (contact: ContactData) => {
    try {
      setIsCreatingConversation(true);
      const otherUserId = contact.contactUserId;
      
      // Check if conversation already exists
      const existing = conversations.find(
        (c) =>
          (c.userId1 === user?.id && c.userId2 === otherUserId) ||
          (c.userId1 === otherUserId && c.userId2 === user?.id)
      );

      if (existing) {
        setSelectedConversation(existing);
        setActiveTab('messages');
      } else {
        // Create new conversation
        const response = await fetch(`${API_URL}/conversations`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ otherUserId }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSelectedConversation(data.conversation || data);
        await loadConversations();
        setActiveTab('messages');
      }
      
      notify.success('Conversation opened');
    } catch (error) {
      console.error('Error creating conversation:', error);
      notify.error('Failed to open conversation');
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user?.id) return;

    try {
      const body: { content: string; replyToId?: string } = {
        content: newMessage.trim(),
      };

      // Include reply information if replying to a message
      if (replyingTo) {
        body.replyToId = replyingTo.id;
      }

      const response = await fetch(
        `${API_URL}/direct-messages/${selectedConversation.id}`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();

      // Clear input and reply state
      setNewMessage('');
      setReplyingTo(null);

      // Fetch all messages to ensure persistence
      const messagesResponse = await fetch(
        `${API_URL}/direct-messages/${selectedConversation.id}`,
        { headers: getAuthHeaders() }
      );

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        
        setSelectedConversation({
          ...selectedConversation,
          directMessages: messagesData.messages || [],
        });

        // Reload conversations to update the list
        await loadConversations();
      }

      notify.success('Message sent!');
    } catch {
      notify.error('Failed to send message');
    }
  };

  const getOtherUser = (conversation: ConversationData): UserInfo | undefined => {
    // Handle transformed API response format
    if (conversation.otherUser) {
      return conversation.otherUser;
    }
    // Handle original format
    return conversation.userId1 === user?.id ? conversation.user2 : conversation.user1;
  };

  const handleDeleteMessage = async (messageId: string, deleteForEveryone: boolean = false) => {
    if (!selectedConversation) return;

    try {
      const endpoint = deleteForEveryone 
        ? `${API_URL}/direct-messages/${messageId}/delete-everyone`
        : `${API_URL}/direct-messages/${messageId}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove message from state
      setSelectedConversation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          directMessages: (prev.directMessages || []).filter((m) => m.id !== messageId),
        };
      });

      notify.success(deleteForEveryone ? 'Message deleted for everyone' : 'Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      notify.error('Failed to delete message');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const otherUser = contact.contactUser;
    if (!otherUser) return false;
    const fullName = `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || otherUser.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredConversations = (Array.isArray(conversations) ? conversations : []).filter((conv) => {
    const other = getOtherUser(conv);
    if (!other) return false;
    const fullName = `${other.firstName} ${other.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  if (isLoading && !user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 overflow-hidden">
      {/* Sidebar - Premium Snap Style - Mobile responsive */}
      <div className={`w-full md:w-80 bg-white dark:bg-gray-900 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex flex-col ${
        selectedConversation ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-white to-blue-50 dark:from-gray-900 dark:to-gray-900">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-300 tracking-tight">Messages</h1>
            {filteredConversations.length > 0 && (
              <div className="px-3 py-1 rounded-full bg-red-500 text-white text-sm font-bold min-w-[2rem] text-center">
                {filteredConversations.reduce((sum: number, conv: ConversationData) => sum + (conv.unreadCount || 0), 0)}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-5 bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 py-2.5 px-3 rounded-full font-bold transition-all text-sm ${
                activeTab === 'messages'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 py-2.5 px-3 rounded-full font-bold transition-all text-sm ${
                activeTab === 'contacts'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              People
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-2.5 px-3 rounded-full font-bold transition-all text-sm relative ${
                activeTab === 'requests'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              Requests
              {pendingRequests.length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {pendingRequests.length > 9 ? '9+' : pendingRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={
                activeTab === 'messages' ? 'Search chats...' : 
                activeTab === 'contacts' ? 'Search people...' :
                'No search needed'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-full bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 font-medium"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'messages' ? (
            // Conversations List
            <>
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">No conversations yet</p>
                  <p className="text-sm mt-1">Switch to People tab to start messaging</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const other = getOtherUser(conversation);
                  if (!other) return null;

                  return (
                    <div
                      key={conversation.id}
                      onClick={() => {
                        setSelectedConversation(conversation);
                        setActiveTab('messages');
                      }}
                      className={`px-4 py-3 cursor-pointer transition-all border-b border-gray-100 dark:border-gray-800 ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-blue-500/10 dark:bg-blue-500/10 border-l-4 border-l-blue-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                            {other.firstName[0]}
                            {other.lastName[0]}
                          </div>
                          {other.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-3 border-white dark:border-gray-900 animate-pulse"></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className={`truncate text-sm ${
                            conversation.unreadCount && conversation.unreadCount > 0
                              ? 'font-bold text-gray-900 dark:text-white'
                              : 'font-medium text-gray-700 dark:text-gray-300'
                          }`}>
                            {other.firstName} {other.lastName}
                          </h3>
                          <p className={`text-xs truncate ${
                            conversation.unreadCount && conversation.unreadCount > 0
                              ? 'font-semibold text-gray-800 dark:text-gray-200'
                              : 'font-normal text-gray-500 dark:text-gray-400'
                          }`}>
                            {conversation.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                        
                        {/* Unread badge */}
                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center ml-2">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </>
          ) : activeTab === 'contacts' ? (
            // Contacts List
            <>
              {/* Search by User ID Header */}
              <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                <button
                  onClick={() => setShowUserIdSearch(!showUserIdSearch)}
                  className="w-full text-left text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center justify-between"
                >
                  <span>🔍 Search user by ID</span>
                  <span className="text-xs">Click to expand</span>
                </button>
                
                {showUserIdSearch && (
                  <div className="mt-3 flex gap-2">
                    <Input
                      value={userIdInput}
                      onChange={(e) => setUserIdInput(e.target.value)}
                      placeholder="Paste user ID here..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          searchUserById(userIdInput);
                        }
                      }}
                      className="text-sm"
                    />
                    <Button
                      onClick={() => searchUserById(userIdInput)}
                      size="sm"
                      className="rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Find
                    </Button>
                  </div>
                )}

                {/* Search Result */}
                {userIdSearchResult && (
                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {userIdSearchResult.firstName[0]}{userIdSearchResult.lastName[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                            {userIdSearchResult.firstName} {userIdSearchResult.lastName}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {userIdSearchResult.role}
                          </p>
                        </div>
                      </div>
                      {requestStatusMap[userIdSearchResult.id] === 'PENDING' ? (
                        <div className="px-3 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-bold">
                          Pending
                        </div>
                      ) : (
                        <Button
                          onClick={() => {
                            sendContactRequest(userIdSearchResult.id);
                            setShowUserIdSearch(false);
                            setUserIdSearchResult(null);
                          }}
                          size="sm"
                          className="rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {filteredContacts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">No contacts available</p>
                  <p className="text-sm mt-1">Join groups or connect with mentees to see contacts</p>
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const otherUser = contact.contactUser;
                  if (!otherUser) return null;

                  return (
                    <div
                      key={contact.id}
                      className="px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                            {otherUser.firstName[0]}
                            {otherUser.lastName[0]}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                              {otherUser.firstName} {otherUser.lastName}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-500 capitalize font-medium">
                              {otherUser.role}
                            </p>
                          </div>
                        </div>

                        {requestStatusMap[otherUser.id] === 'PENDING' ? (
                          <div className="ml-2 px-3 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-bold">
                            Pending
                          </div>
                        ) : contact.contactType === 'CONTACT' ? (
                          <Button
                            onClick={() => handleStartConversation(contact)}
                            disabled={isCreatingConversation}
                            size="sm"
                            className="ml-2 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
                          >
                            Added
                          </Button>
                        ) : (
                          <Button
                            onClick={() => sendContactRequest(otherUser.id)}
                            disabled={isCreatingConversation}
                            size="sm"
                            className="ml-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
                          >
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </>
          ) : activeTab === 'requests' ? (
            // Contact Requests
            <>
              {/* Received Requests */}
              {pendingRequests.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">No contact requests</p>
                  <p className="text-sm mt-1">When people add you, requests will appear here</p>
                </div>
              ) : (
                <div>
                  <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Contact Requests ({pendingRequests.length})</h3>
                  </div>
                  {pendingRequests.map((request) => {
                    const sender = request.sender;
                    if (!sender) return null;

                    return (
                      <div
                        key={request.id}
                        className="px-4 py-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                              {sender.firstName[0]}
                              {sender.lastName[0]}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                                {sender.firstName} {sender.lastName}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">
                                {sender.role} - wants to add you
                              </p>
                            </div>
                          </div>
                        </div>

                        {request.message && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 italic px-3">
                            "{request.message}"
                          </p>
                        )}

                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => rejectContactRequest(request.id, request.senderId)}
                            size="sm"
                            className="rounded-full bg-gray-300 hover:bg-gray-400 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                            variant="outline"
                          >
                            Decline
                          </Button>
                          <Button
                            onClick={() => acceptContactRequest(request.id, request.senderId)}
                            size="sm"
                            className="rounded-full bg-green-500 hover:bg-green-600 text-white"
                            variant="outline"
                          >
                            Accept
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex flex-1 flex-col bg-white dark:bg-gray-900">
          {/* Chat Header - Premium Snap Style */}
          <div className="bg-gradient-to-r from-white via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              {/* Back button for mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg">
                  {getOtherUser(selectedConversation)?.firstName[0]}
                  {getOtherUser(selectedConversation)?.lastName[0]}
                </div>
                {getOtherUser(selectedConversation)?.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 sm:w-4 h-3 sm:h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 sm:border-3 border-white dark:border-gray-900 shadow-md animate-pulse"></div>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <h2 className="font-bold text-gray-900 dark:text-white text-base sm:text-xl tracking-tight truncate">
                  {getOtherUser(selectedConversation)?.firstName} {getOtherUser(selectedConversation)?.lastName}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">
                  {getOtherUser(selectedConversation)?.isOnline ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span>Active now</span>
                    </span>
                  ) : (
                    'Away'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                onClick={() => setShowActionsMenu(!showActionsMenu)}
              >
                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Button>

              {/* Actions Dropdown Menu */}
              {showActionsMenu && (
                <div className="absolute right-0 top-10 z-50 w-56 rounded-lg bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <button
                    onClick={() => {
                      setShowActionsMenu(false);
                      // Navigate to resources page
                      window.location.href = '/resources';
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <Share2 className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Share Resources</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowActionsMenu(false);
                      // Navigate to incidents page
                      window.location.href = '/incidents';
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">Report Incident</span>
                  </button>
                  
                  <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                  
                  <button
                    onClick={() => {
                      setShowActionsMenu(false);
                      notify.confirm(
                        'Are you sure you want to delete this conversation? This cannot be undone.',
                        () => {
                          notify.info('Delete conversation feature coming soon!');
                        }
                      );
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Delete Conversation</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Messages - Premium Snap Style */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-white via-blue-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
            {!selectedConversation.directMessages || selectedConversation.directMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">No messages yet</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-2 max-w-xs">Send a message to start the conversation</p>
                </div>
              </div>
            ) : (
              selectedConversation.directMessages.map((message, index) => {
                const isCurrentUser = message.senderId === user?.id;
                const messages = selectedConversation.directMessages || [];
                const showDate =
                  index === 0 ||
                  formatMessageDate(message.createdAt) !==
                    formatMessageDate(messages[index - 1]?.createdAt);

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="text-center text-xs text-gray-500 dark:text-gray-500 my-4 font-medium tracking-wide">
                        {formatMessageDate(message.createdAt)}
                      </div>
                    )}

                    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} w-full`}>
                      <div
                        className={`flex gap-2 items-center ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                        onTouchStart={(e) => {
                          const touch = e.touches[0];
                          const currentDiv = e.currentTarget as HTMLDivElement & { touchStart?: number };
                          currentDiv.touchStart = touch.clientX;
                        }}
                        onTouchEnd={(e) => {
                          const touch = e.changedTouches[0];
                          const currentDiv = e.currentTarget as HTMLDivElement & { touchStart?: number };
                          const touchStart = currentDiv.touchStart || 0;
                          const diff = touch.clientX - touchStart;

                          // Swipe right shows reply, swipe left shows delete
                          if (isCurrentUser && diff < -30) {
                            // Swipe left on sent message - show delete
                            setContextMenuMessageId(contextMenuMessageId === message.id ? null : message.id);
                          } else if (!isCurrentUser && diff > 30) {
                            // Swipe right on received message - show reply/options
                            setContextMenuMessageId(contextMenuMessageId === message.id ? null : message.id);
                          }
                        }}
                      >
                        {/* WhatsApp-style Quick Actions */}
                        {contextMenuMessageId === message.id && !isCurrentUser && (
                          <button
                            onClick={() => {
                              setReplyingTo(message);
                              setContextMenuMessageId(null);
                            }}
                            className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                            title="Reply"
                          >
                            ↩
                          </button>
                        )}

                        {contextMenuMessageId === message.id && isCurrentUser && (
                          <>
                            <button
                              onClick={() => {
                                handleDeleteMessage(message.id, false);
                                setContextMenuMessageId(null);
                              }}
                              className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                              title="Delete for me"
                            >
                              ⊙
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteMessage(message.id, true);
                                setContextMenuMessageId(null);
                              }}
                              className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-all"
                              title="Delete for everyone"
                            >
                              ✕
                            </button>
                          </>
                        )}

                        <div
                          onClick={() => {
                            setContextMenuMessageId(contextMenuMessageId === message.id ? null : message.id);
                          }}
                          className={`max-w-xs sm:max-w-sm lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-2xl sm:rounded-3xl relative shadow-sm transition-all cursor-pointer ${
                            isCurrentUser
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm hover:shadow-md'
                          }`}
                        >
                          {/* Reply indicator */}
                          {message.replyTo && (
                            <div className={`text-xs mb-2 pl-2 sm:pl-3 py-1.5 sm:py-2 border-l-3 rounded ${
                              isCurrentUser ? 'border-blue-300 bg-blue-600/40 text-blue-100' : 'border-gray-300 dark:border-gray-600 bg-gray-200/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300'
                            }`}>
                              <p className="font-bold text-xs">{message.replyTo.sender.firstName} {message.replyTo.sender.lastName}</p>
                              <p className="truncate opacity-90 text-xs">{message.replyTo.content}</p>
                            </div>
                          )}
                          
                          <p className="text-sm sm:text-base leading-relaxed font-medium break-words">{message.content}</p>
                          <p
                            className={`text-xs mt-1 sm:mt-2 font-medium ${
                              isCurrentUser ? 'text-blue-100/80' : 'text-gray-600 dark:text-gray-500'
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>


                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* Message Input */}
          <div className="w-full flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {/* Reply indicator */}
            {replyingTo && (
              <div className="px-3 sm:px-4 pt-2 sm:pt-3 pb-1.5 sm:pb-2 flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-b border-blue-200 dark:border-blue-700 gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-blue-600 dark:text-blue-400 flex-shrink-0 text-sm">↩</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">Replying to {replyingTo.sender?.firstName}</p>
                      <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-200 truncate font-medium">{replyingTo.content}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="p-1 sm:p-1.5 hover:bg-blue-200 dark:hover:bg-blue-900/40 rounded-full transition-all text-blue-600 dark:text-blue-400 hover:scale-110 flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            )}
            
            {/* Message Input - Premium Snap Style - Mobile optimized */}
            <div className="w-full p-3 sm:p-4 flex items-end gap-2 sm:gap-3 bg-gradient-to-r from-white to-blue-50 dark:from-gray-900 dark:to-gray-900 border-t border-gray-100 dark:border-gray-800">
              <Input
                placeholder="Say something..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                className="flex-1 rounded-full px-3 sm:px-5 py-2 sm:py-3 bg-gray-100 dark:bg-gray-800 border-2 border-transparent dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-0 resize-none font-medium text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all"
                style={{ maxHeight: '100px', minHeight: '40px' }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-full p-2.5 sm:p-3.5 flex-shrink-0 transition-all hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none font-bold flex items-center justify-center min-w-[40px] min-h-[40px]"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-white via-blue-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-blue-500 dark:text-blue-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold">Select a conversation</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2 max-w-xs">
              Choose a contact to start messaging or browse the People tab
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;