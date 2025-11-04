import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Calendar, MessageCircle, Clock, MapPin } from 'lucide-react';
import { Role } from '../../types';

// Mock data interfaces
interface SearchUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

interface SearchEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  type: string;
}

interface SearchMessage {
  id: string;
  content: string;
  sender: string;
  conversationId: string;
  timestamp: string;
}

interface SearchResults {
  users: SearchUser[];
  events: SearchEvent[];
  messages: SearchMessage[];
}

// Mock data
const mockUsers: SearchUser[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.j@email.com', role: Role.MENTOR },
  { id: '2', name: 'Michael Chen', email: 'm.chen@email.com', role: Role.MENTEE },
  { id: '3', name: 'Emily Davis', email: 'emily.davis@email.com', role: Role.ADMIN },
  { id: '4', name: 'David Wilson', email: 'd.wilson@email.com', role: Role.MENTOR },
  { id: '5', name: 'Lisa Thompson', email: 'lisa.t@email.com', role: Role.MENTEE },
];

const mockEvents: SearchEvent[] = [
  { id: '1', title: 'Career Development Workshop', date: '2025-09-20', location: 'Conference Room A', type: 'workshop' },
  { id: '2', title: 'Monthly Mentor Meetup', date: '2025-09-25', location: 'Virtual', type: 'meetup' },
  { id: '3', title: 'Code Review Session', date: '2025-09-18', location: 'Dev Lab', type: 'session' },
  { id: '4', title: 'Leadership Training', date: '2025-10-01', location: 'Main Hall', type: 'training' },
  { id: '5', title: 'Q&A with Senior Devs', date: '2025-09-22', location: 'Virtual', type: 'qa' },
];

const mockMessages: SearchMessage[] = [
  { id: '1', content: 'Great job on the project presentation!', sender: 'Sarah Johnson', conversationId: '1', timestamp: '2025-09-15T10:30:00Z' },
  { id: '2', content: 'Can we schedule a meeting to discuss the code review?', sender: 'Michael Chen', conversationId: '2', timestamp: '2025-09-15T14:20:00Z' },
  { id: '3', content: 'The workshop materials are now available in the shared folder', sender: 'Emily Davis', conversationId: '3', timestamp: '2025-09-15T09:15:00Z' },
  { id: '4', content: 'Thanks for the feedback on my proposal', sender: 'David Wilson', conversationId: '4', timestamp: '2025-09-14T16:45:00Z' },
  { id: '5', content: 'Looking forward to our mentoring session tomorrow', sender: 'Lisa Thompson', conversationId: '5', timestamp: '2025-09-14T18:30:00Z' },
];

export const GlobalSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResults>({ users: [], events: [], messages: [] });
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Mock search function
  const performSearch = (query: string): SearchResults => {
    if (!query.trim()) {
      return { users: [], events: [], messages: [] };
    }

    const searchLower = query.toLowerCase();

    const filteredUsers = mockUsers.filter(user =>
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    ).slice(0, 3);

    const filteredEvents = mockEvents.filter(event =>
      event.title.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower) ||
      event.type.toLowerCase().includes(searchLower)
    ).slice(0, 3);

    const filteredMessages = mockMessages.filter(message =>
      message.content.toLowerCase().includes(searchLower) ||
      message.sender.toLowerCase().includes(searchLower)
    ).slice(0, 3);

    return {
      users: filteredUsers,
      events: filteredEvents,
      messages: filteredMessages
    };
  };

  // Handle search with debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults({ users: [], events: [], messages: [] });
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(() => {
      const searchResults = performSearch(searchTerm);
      setResults(searchResults);
      setIsOpen(true);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTotalResults = () => {
    return results.users.length + results.events.length + results.messages.length;
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
      case Role.MENTOR:
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
      case Role.MENTEE:
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search users, events, messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.trim() && setIsOpen(true)}
          className="
            w-full pl-10 pr-4 py-2 text-sm
            bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600
            rounded-lg shadow-sm
            focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            dark:focus:ring-primary-400 dark:focus:border-primary-400
            placeholder-gray-500 dark:placeholder-gray-400
            text-gray-900 dark:text-white
            transition-colors duration-200
          "
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchTerm.trim() && (
        <div className="
          absolute top-full left-0 right-0 mt-2
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-lg shadow-lg
          z-50 max-h-96 overflow-y-auto
        ">
          {getTotalResults() === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results found for "{searchTerm}"</p>
            </div>
          ) : (
            <div className="py-2">
              {/* Users Section */}
              {results.users.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                    Users ({results.users.length})
                  </div>
                  {results.users.map((user) => (
                    <button
                      key={user.id}
                      className="w-full flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => {
                        navigate(`/users/${user.id}`);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Events Section */}
              {results.events.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                    Events ({results.events.length})
                  </div>
                  {results.events.map((event) => (
                    <button
                      key={event.id}
                      className="w-full flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => {
                        navigate('/events', { state: { eventId: event.id, fromSearch: true } });
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {event.title}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Messages Section */}
              {results.messages.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                    Messages ({results.messages.length})
                  </div>
                  {results.messages.map((message) => (
                    <button
                      key={message.id}
                      className="w-full flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => {
                        navigate('/messages', { state: { conversationId: message.conversationId, fromSearch: true } });
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm text-gray-900 dark:text-white line-clamp-1">
                            {message.content}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>from {message.sender}</span>
                            <span>•</span>
                            <span>{formatTime(message.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};