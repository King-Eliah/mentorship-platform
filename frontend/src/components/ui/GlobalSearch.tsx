import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Calendar, MessageCircle, Clock, MapPin } from 'lucide-react';
import { performSearch, SearchResults } from '../../services/searchService';

export const GlobalSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResults>({ users: [], events: [], resources: [], messages: [] });
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Handle search with debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults({ users: [], events: [], resources: [], messages: [] });
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const searchResults = await performSearch(searchTerm);
        setResults(searchResults);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults({ users: [], events: [], resources: [], messages: [] });
      } finally {
        setLoading(false);
      }
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
    return results.users.length + results.events.length + results.resources.length + results.messages.length;
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
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.firstName} className="w-8 h-8 rounded-full" />
                          ) : (
                            <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </p>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20">
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
                              <span>{formatDate(event.startTime)}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{event.location}</span>
                              </div>
                            )}
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
                        navigate('/messages', { state: { userId: message.sender.id, fromSearch: true } });
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
                            <span>from {message.sender.firstName} {message.sender.lastName}</span>
                            <span>•</span>
                            <span>{formatTime(message.createdAt)}</span>
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