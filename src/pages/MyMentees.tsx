import React, { useState, useEffect } from 'react';
import { Users, Calendar, Target, Award, MessageSquare, TrendingUp, BookOpen, Clock, CheckCircle, Circle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ListSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { Role, EventStatus, GoalStatus, Event as EventType } from '../types';
import { Goal } from '../types/goals';
import { frontendService } from '../services/frontendService';
import { eventService } from '../services/eventService';
import { goalService } from '../services/goalService';
import { GroupManagement } from '../components/admin/GroupManagement';
import { useNavigate } from 'react-router-dom';

interface MenteeStats {
  activeGoals: number;
  completedGoals: number;
  eventsJoined: number;
  upcomingEvents: number;
  resourcesAccessed: number;
}

interface MenteeWithStats {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  stats: MenteeStats;
  goals?: Goal[];
  events?: EventType[];
}

export const MyMentees: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mentees, setMentees] = useState<MenteeWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentee, setSelectedMentee] = useState<MenteeWithStats | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchMenteesWithStats = async () => {
    if (user?.role !== Role.MENTOR) return;

    try {
      setLoading(true);
      const groups = await frontendService.getGroups();
      const mentorGroup = groups.find((g) => g.mentorId === user.id);

      if (mentorGroup) {
        const allUsers = await frontendService.getUsers();
        const groupMentees = allUsers.filter(u => 
          u.role === 'MENTEE' && u.isActive
        );

        // Fetch stats for each mentee
        const menteesWithStats = await Promise.all(
          groupMentees.map(async (mentee) => {
            const stats = await fetchMenteeStats(mentee.id);
            return {
              ...mentee,
              stats
            };
          })
        );

        setMentees(menteesWithStats);
      }
    } catch (error) {
      console.error('Failed to fetch mentees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenteeStats = async (menteeId: string): Promise<MenteeStats> => {
    try {
      // Get events
      const joinedEvents = await eventService.getJoinedEvents();
      const eventsJoined = joinedEvents.length;
      
      const now = new Date();
      const upcomingEvents = joinedEvents.filter(event => {
        const eventDate = new Date(event.scheduledAt);
        return event.status === EventStatus.SCHEDULED && eventDate >= now;
      }).length;

      // Get goals
      const goals = await goalService.getGoals(menteeId);
      const activeGoals = goals.filter((g) => g.status !== GoalStatus.COMPLETED).length;
      const completedGoals = goals.filter((g) => g.status === GoalStatus.COMPLETED).length;

      // Get resources accessed (from localStorage)
      const sharedResources = JSON.parse(
        localStorage.getItem(`shared_resources_${menteeId}`) || '[]'
      );

      return {
        activeGoals,
        completedGoals,
        eventsJoined,
        upcomingEvents,
        resourcesAccessed: sharedResources.length,
      };
    } catch (error) {
      console.error('Failed to fetch mentee stats:', error);
      return {
        activeGoals: 0,
        completedGoals: 0,
        eventsJoined: 0,
        upcomingEvents: 0,
        resourcesAccessed: 0,
      };
    }
  };

  useEffect(() => {
    fetchMenteesWithStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  
  // If user is admin, show GroupManagement component
  if (user?.role === Role.ADMIN) {
    return <GroupManagement />;
  }

  const handleSendMessage = (menteeId: string) => {
    navigate('/messages', { state: { recipientId: menteeId } });
  };

  const handleViewDetails = async (mentee: MenteeWithStats) => {
    setSelectedMentee(mentee);
    setShowDetailsModal(true);
    setLoadingDetails(true);

    try {
      // Fetch detailed goals and events
      const [goals, joinedEvents] = await Promise.all([
        goalService.getGoals(mentee.id),
        eventService.getJoinedEvents()
      ]);

      setSelectedMentee(prev => {
        if (!prev) return null;
        return {
          ...prev,
          goals: (goals || []) as Goal[],
          events: (joinedEvents || []) as EventType[]
        };
      });
    } catch (error) {
      console.error('Failed to fetch mentee details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Mentees</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Overview of all your assigned mentees and their progress
            </p>
          </div>
        </div>
        <ListSkeleton items={3} itemComponent={CardSkeleton} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Mentees</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Overview of all your assigned mentees and their progress
          </p>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <Users className="w-4 h-4 inline mr-1" />
          {mentees.length} Total Mentees
        </div>
      </div>

      {mentees.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Mentees Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have any assigned mentees at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {mentees.map((mentee) => (
            <div 
              key={mentee.id} 
              className="cursor-pointer"
              onClick={() => handleViewDetails(mentee)}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Mentee Avatar & Info - Compact */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {mentee.firstName?.[0]}{mentee.lastName?.[0]}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {mentee.firstName} {mentee.lastName}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {mentee.email}
                        </p>
                      </div>
                    </div>

                    {/* Stats - Compact Grid */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Active Goals */}
                    <div className="text-center px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg min-w-[60px]">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Target className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Goals</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {mentee.stats.activeGoals}
                      </p>
                    </div>

                    {/* Completed Goals */}
                    <div className="text-center px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg min-w-[60px]">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Award className="w-3 h-3 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Done</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {mentee.stats.completedGoals}
                      </p>
                    </div>

                    {/* Events */}
                    <div className="text-center px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg min-w-[60px]">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Calendar className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Events</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {mentee.stats.eventsJoined}
                      </p>
                    </div>

                    {/* Progress Badge */}
                    <div className="text-center px-3 py-2 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg min-w-[60px]">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <TrendingUp className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Progress</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {mentee.stats.completedGoals > 0 
                          ? Math.round((mentee.stats.completedGoals / (mentee.stats.activeGoals + mentee.stats.completedGoals)) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendMessage(mentee.id)}
                        className="px-3 py-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedMentee && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={`${selectedMentee.firstName} ${selectedMentee.lastName} - Details`}
        >
          <div className="space-y-6">
            {/* Mentee Info Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                {selectedMentee.firstName?.[0]}{selectedMentee.lastName?.[0]}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedMentee.firstName} {selectedMentee.lastName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedMentee.email}</p>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedMentee.stats.activeGoals}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Active Goals</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                <Award className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedMentee.stats.completedGoals}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedMentee.stats.eventsJoined}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Events</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedMentee.stats.resourcesAccessed}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Resources</p>
              </div>
            </div>

            {/* Goals Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Goals ({selectedMentee.goals?.length || 0})
              </h4>
              {loadingDetails ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : selectedMentee.goals && selectedMentee.goals.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedMentee.goals.map((goal) => (
                    <div key={goal.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {goal.status === GoalStatus.COMPLETED ? (
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                            <h5 className="text-sm font-medium text-gray-900 dark:text-white">{goal.title}</h5>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 ml-6 line-clamp-2">{goal.description}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                          goal.status === GoalStatus.COMPLETED 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : goal.status === GoalStatus.IN_PROGRESS
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {goal.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-2 ml-6">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">{goal.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No goals yet</p>
              )}
            </div>

            {/* Events Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Events Attended ({selectedMentee.events?.length || 0})
              </h4>
              {loadingDetails ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : selectedMentee.events && selectedMentee.events.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedMentee.events.slice(0, 5).map((event) => (
                    <div key={event.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</h5>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(event.scheduledAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                          event.status === EventStatus.COMPLETED
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : event.status === EventStatus.SCHEDULED
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No events attended yet</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => {
                  handleSendMessage(selectedMentee.id);
                  setShowDetailsModal(false);
                }}
                className="flex-1"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
