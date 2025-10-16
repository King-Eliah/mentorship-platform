import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, Target, TrendingUp, Mail } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { goalService } from '../../services/goalService';
import { eventService } from '../../services/eventService';
import { User, Event, Goal } from '../../types';
import { GoalStatus } from '../../types/goals';

interface MenteeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentee: User;
}

export const MenteeDetailsModal: React.FC<MenteeDetailsModalProps> = ({ isOpen, onClose, mentee }) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [joinedEvents, setJoinedEvents] = useState<Event[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    activeGoals: 0,
    completedGoals: 0,
    resourcesAccessed: 0
  });

  useEffect(() => {
    if (isOpen && mentee.id) {
      loadMenteeData();
    }
  }, [isOpen, mentee.id]);

  const loadMenteeData = async () => {
    try {
      setLoading(true);

      // Load joined events
      const joinedEventIds = JSON.parse(localStorage.getItem('mentorconnect_joined_events') || '[]');
      const allEvents = await eventService.getEvents({});
      const menteeEvents = allEvents.filter((event: Event) => joinedEventIds.includes(event.id));
      setJoinedEvents(menteeEvents);

      // Load goals
      const menteeGoals = await goalService.getGoals(mentee.id);
      setGoals(menteeGoals);

      // Load resources (mock data for now)
      const savedResources = JSON.parse(localStorage.getItem('resources') || '[]');
      const accessedResources = savedResources.slice(0, 3); // Simulate accessed resources
      setResources(accessedResources);

      // Calculate stats
      const now = new Date();
      const upcomingEventsCount = menteeEvents.filter((e: Event) => new Date(e.scheduledAt) > now).length;
      const activeGoalsCount = menteeGoals.filter(g => g.status !== GoalStatus.COMPLETED).length;
      const completedGoalsCount = menteeGoals.filter(g => g.status === GoalStatus.COMPLETED).length;

      setStats({
        totalEvents: menteeEvents.length,
        upcomingEvents: upcomingEventsCount,
        activeGoals: activeGoalsCount,
        completedGoals: completedGoalsCount,
        resourcesAccessed: accessedResources.length
      });
    } catch (error) {
      console.error('Failed to load mentee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className={`inline-block align-bottom ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full`}>
          {/* Header */}
          <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-blue-900/50' : 'bg-blue-100'
                }`}>
                  <span className="text-2xl font-bold text-blue-600">
                    {mentee.firstName[0]}{mentee.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {mentee.firstName} {mentee.lastName}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {mentee.email}
                  </p>
                  {mentee.bio && (
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {mentee.bio}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className={`p-4 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Events
                      </span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stats.totalEvents}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Upcoming
                      </span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stats.upcomingEvents}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Active Goals
                      </span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stats.activeGoals}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-emerald-600" />
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Completed
                      </span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stats.completedGoals}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-orange-600" />
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Resources
                      </span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stats.resourcesAccessed}
                    </p>
                  </div>
                </div>

                {/* Joined Events */}
                <div>
                  <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Joined Events ({joinedEvents.length})
                  </h4>
                  {joinedEvents.length > 0 ? (
                    <div className="space-y-2">
                      {joinedEvents.slice(0, 5).map(event => (
                        <div
                          key={event.id}
                          className={`p-3 rounded-lg border ${
                            isDark 
                              ? 'bg-gray-700/50 border-gray-600' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {event.title}
                              </h5>
                              {event.description && (
                                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {event.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className={`text-xs font-medium ${
                                new Date(event.scheduledAt) > new Date()
                                  ? 'text-green-600'
                                  : 'text-gray-500'
                              }`}>
                                {formatDate(event.scheduledAt)}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {event.duration} min
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {joinedEvents.length > 5 && (
                        <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          +{joinedEvents.length - 5} more events
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      No events joined yet
                    </p>
                  )}
                </div>

                {/* Goals */}
                <div>
                  <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Goals ({goals.length})
                  </h4>
                  {goals.length > 0 ? (
                    <div className="space-y-2">
                      {goals.slice(0, 5).map(goal => (
                        <div
                          key={goal.id}
                          className={`p-3 rounded-lg border ${
                            isDark 
                              ? 'bg-gray-700/50 border-gray-600' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {goal.title}
                              </h5>
                              {goal.description && (
                                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {goal.description}
                                </p>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              goal.status === GoalStatus.COMPLETED
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : goal.status === GoalStatus.IN_PROGRESS
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {goal.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                      {goals.length > 5 && (
                        <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          +{goals.length - 5} more goals
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      No goals created yet
                    </p>
                  )}
                </div>

                {/* Resources Accessed */}
                <div>
                  <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Resources Accessed ({resources.length})
                  </h4>
                  {resources.length > 0 ? (
                    <div className="space-y-2">
                      {resources.map((resource, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            isDark 
                              ? 'bg-gray-700/50 border-gray-600' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <FileText className={`w-5 h-5 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                              <div>
                                <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {resource.title}
                                </h5>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {resource.category}
                                </p>
                              </div>
                            </div>
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatDate(resource.uploadedAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      No resources accessed yet
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex justify-between items-center">
              <a
                href={`/messages?recipient=${mentee.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Send Message
              </a>
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
