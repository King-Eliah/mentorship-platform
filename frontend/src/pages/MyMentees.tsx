import React, { useState, useEffect } from 'react';
import { Users, Target, MessageSquare, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ListSkeleton } from '../components/ui/Skeleton';
import { Role, GoalStatus } from '../types';
import { Goal } from '../types/goals';
import { Event } from '../services/eventService';
import { userService } from '../services/userService';
import { goalService } from '../services/goalService';
import { eventService } from '../services/eventService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface MenteeStats {
  activeGoals: number;
  completedGoals: number;
  totalGoals: number;
  eventsJoined: number;
}

interface MenteeWithStats {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  stats: MenteeStats;
  goals: Goal[];
  goalsNeedingHelp: Goal[];
  events: Event[];
}

export const MyMentees: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mentees, setMentees] = useState<MenteeWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMenteesData = async () => {
    if (user?.role !== Role.MENTOR || !user?.id) return;

    try {
      setLoading(true);
      
      // Fetch all mentees' goals using the same method as dashboard
      const allGoals = await goalService.getMentorAssignedGoals(user.id);
      
      // Group goals by mentee userId
      const menteeGoalsMap = new Map<string, Goal[]>();
      
      allGoals.forEach(goal => {
        const menteeId = goal.userId;
        if (!menteeGoalsMap.has(menteeId)) {
          menteeGoalsMap.set(menteeId, []);
        }
        menteeGoalsMap.get(menteeId)!.push(goal);
      });

      // Calculate stats for each mentee
      const menteesData: MenteeWithStats[] = [];

      // Fetch mentee details and calculate stats
      for (const [menteeId, goals] of menteeGoalsMap.entries()) {
        try {
          // Fetch mentee user profile
          const menteeUser = await userService.getUserProfile(menteeId);
          
          // Fetch mentee's events
          const events = await eventService.getUserEvents(menteeId);
          
          // Filter goals needing help
          const goalsNeedingHelp = goals.filter(g => g.needsHelp === true);
          
          // Calculate stats
          const activeGoals = goals.filter(g => 
            g.status === GoalStatus.IN_PROGRESS || 
            g.status === GoalStatus.NOT_STARTED ||
            g.status === GoalStatus.OVERDUE
          ).length;
          
          const completedGoals = goals.filter(g => 
            g.status === GoalStatus.COMPLETED
          ).length;
          
          menteesData.push({
            id: menteeUser.id,
            firstName: menteeUser.firstName,
            lastName: menteeUser.lastName,
            email: menteeUser.email,
            avatar: (menteeUser as { avatar?: string }).avatar,
            stats: {
              activeGoals,
              completedGoals,
              totalGoals: goals.length,
              eventsJoined: events.length
            },
            goals,
            goalsNeedingHelp,
            events
          });
        } catch (error) {
          console.error(`Error fetching data for mentee ${menteeId}:`, error);
        }
      }

      // Sort mentees - those with help requests first
      menteesData.sort((a, b) => {
        if (a.goalsNeedingHelp.length > 0 && b.goalsNeedingHelp.length === 0) return -1;
        if (a.goalsNeedingHelp.length === 0 && b.goalsNeedingHelp.length > 0) return 1;
        return 0;
      });

      setMentees(menteesData);
    } catch (error) {
      console.error('Failed to fetch mentees:', error);
      toast.error('Failed to load mentees data');
      setMentees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenteesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSendMessage = (menteeId: string) => {
    navigate(`/messages?userId=${menteeId}`);
  };

  const handleRefresh = () => {
    toast.promise(fetchMenteesData(), {
      loading: 'Refreshing data...',
      success: 'Data refreshed!',
      error: 'Failed to refresh'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Mentees</h1>
          <p className="text-gray-600 dark:text-gray-400">Loading mentee data...</p>
        </div>
        <ListSkeleton items={3} />
      </div>
    );
  }

  if (mentees.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Mentees Assigned
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            You don't have any mentees assigned to you yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Mentoring Group</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Mentorship group led by {user?.firstName} {user?.lastName}
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            Refresh Data
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Mentees</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{mentees.length}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Goals</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {mentees.reduce((sum, m) => sum + m.stats.activeGoals, 0)}
                  </p>
                </div>
                <Target className="w-10 h-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Events</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {mentees.reduce((sum, m) => sum + m.stats.eventsJoined, 0)}
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Need Help</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {mentees.filter(m => m.goalsNeedingHelp.length > 0).length}
                  </p>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mentees List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            My Mentees ({mentees.length})
          </h2>

          {mentees.map((mentee) => {
            const hasHelpRequests = mentee.goalsNeedingHelp.length > 0;
            
            return (
              <Card
                key={mentee.id}
                className={`${
                  hasHelpRequests
                    ? 'border-2 border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'bg-white dark:bg-gray-800'
                }`}
              >
                <CardContent className="p-6">
                  {/* Help Request Alert */}
                  {hasHelpRequests && (
                    <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/40 border-l-4 border-red-500 rounded">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">
                            🚨 Help Requested - {mentee.goalsNeedingHelp.length} Goal{mentee.goalsNeedingHelp.length !== 1 ? 's' : ''}
                          </h4>
                          <div className="space-y-3">
                            {mentee.goalsNeedingHelp.map((goal) => (
                              <div key={goal.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <Target className="w-4 h-4 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="font-medium text-red-900 dark:text-red-200">
                                      {goal.title}
                                    </p>
                                    {goal.description && (
                                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                        {goal.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-4 mt-2 text-xs text-red-600 dark:text-red-400">
                                      <span>Status: {goal.status}</span>
                                      {goal.helpRequestedAt && (
                                        <span>
                                          Requested: {new Date(goal.helpRequestedAt).toLocaleDateString()} at {new Date(goal.helpRequestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mentee Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {mentee.firstName[0]}{mentee.lastName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {mentee.firstName} {mentee.lastName}
                          </h3>
                          {hasHelpRequests && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                              {mentee.goalsNeedingHelp.length} HELP
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">{mentee.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/my-mentees/${mentee.id}`)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSendMessage(mentee.id)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Active Goals</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {mentee.stats.activeGoals}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {mentee.stats.completedGoals}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Goals</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {mentee.stats.totalGoals}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Events</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {mentee.stats.eventsJoined}
                      </p>
                    </div>
                  </div>

                  {/* All Goals Summary */}
                  {mentee.goals.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <details className="cursor-pointer">
                        <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                          View All Goals ({mentee.goals.length})
                        </summary>
                        <div className="mt-3 space-y-2">
                          {mentee.goals.map((goal) => (
                            <div
                              key={goal.id}
                              className={`p-3 rounded-lg ${
                                goal.needsHelp
                                  ? 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700'
                                  : 'bg-gray-100 dark:bg-gray-700/50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {goal.title}
                                  </p>
                                  <div className="flex gap-3 mt-1 text-xs text-gray-600 dark:text-gray-400">
                                    <span>Status: {goal.status}</span>
                                    <span>Priority: {goal.priority}</span>
                                    {goal.dueDate && (
                                      <span>Due: {new Date(goal.dueDate).toLocaleDateString()}</span>
                                    )}
                                  </div>
                                </div>
                                {goal.needsHelp && (
                                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                                    HELP
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}

                  {/* Events Summary */}
                  {mentee.events && mentee.events.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <details className="cursor-pointer">
                        <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                          View Events Joined ({mentee.events.length})
                        </summary>
                        <div className="mt-3 space-y-2">
                          {mentee.events.map((event) => (
                            <div
                              key={event.id}
                              className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                            >
                              <div className="flex items-start gap-3">
                                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {event.title}
                                  </p>
                                  <div className="flex gap-3 mt-1 text-xs text-gray-600 dark:text-gray-400">
                                    <span>Type: {event.type}</span>
                                    <span>Status: {event.status}</span>
                                    {event.startTime && (
                                      <span>
                                        Date: {new Date(event.startTime).toLocaleDateString()} at{' '}
                                        {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    )}
                                  </div>
                                  {event.location && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      📍 {event.location}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyMentees;
