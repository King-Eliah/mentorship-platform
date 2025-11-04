import { useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useJoinedEvents } from '../../hooks/useEvents';
import { EventStatus } from '../../types';
import { useNavigate } from 'react-router-dom';

const LoadingSkeleton = () => {
  const { isDark } = useTheme();
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className={`h-4 rounded mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className={`h-3 rounded w-3/4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </div>
      ))}
    </div>
  );
};

export const JoinedEvents = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { data: joinedEvents, loading, execute } = useJoinedEvents();

  useEffect(() => {
    execute();
    
    // Listen for storage changes (when events are joined/left from Events page)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mentorconnect_joined_events') {
        execute();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event we'll dispatch
    const handleJoinedEventsUpdate = () => {
      execute();
    };
    
    window.addEventListener('joinedEventsUpdated', handleJoinedEventsUpdate);
    
    // Refresh joined events every 30 seconds
    const interval = setInterval(() => {
      execute();
    }, 30000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('joinedEventsUpdated', handleJoinedEventsUpdate);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upcomingEvents = (joinedEvents || [])
    .filter(event => event.status === EventStatus.SCHEDULED)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 3);

  // Debug logging
  useEffect(() => {
    console.log('JoinedEvents - Raw data:', joinedEvents);
    console.log('JoinedEvents - Upcoming events:', upcomingEvents);
  }, [joinedEvents, upcomingEvents]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } rounded-lg shadow-sm border p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        } flex items-center`}>
          <Calendar className="w-5 h-5 mr-2" />
          My Joined Events
        </h3>
        <button
          onClick={() => navigate('/events')}
          className={`text-sm flex items-center gap-1 hover:underline ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : upcomingEvents.length > 0 ? (
        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                isDark
                  ? 'bg-gray-700 border-gray-600 hover:border-blue-500'
                  : 'bg-gray-50 border-gray-200 hover:border-blue-400'
              }`}
              onClick={() => navigate('/events')}
            >
              <h4 className={`font-medium mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {event.title}
              </h4>
              
              <div className={`space-y-1 text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(event.scheduledAt)}</span>
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>
                      {event.currentAttendees || 0}
                      {event.maxAttendees && `/${event.maxAttendees}`}
                    </span>
                  </div>
                  
                  {event.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{event.duration}min</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-8 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm mb-2">No upcoming events joined yet</p>
          <button
            onClick={() => navigate('/events')}
            className={`text-sm hover:underline ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}
          >
            Browse available events
          </button>
        </div>
      )}
    </div>
  );
};
