import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { DropdownSelect } from '../ui/DropdownSelect';
import { Goal, GoalStatus } from '../../types/goals';
import { goalService } from '../../services/goalService';
import toast from 'react-hot-toast';

interface GoalsOverviewProps {
  loading?: boolean;
  goals?: Goal[];
}

const GoalsOverview: React.FC<GoalsOverviewProps> = ({ 
  loading: externalLoading = false, 
  goals: externalGoals = [] 
}) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [internalGoals, setInternalGoals] = useState<Goal[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [updatingGoalId, setUpdatingGoalId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadGoals = async () => {
    if (!user?.id) return;
    
    try {
      setInternalLoading(true);
      // Fetch recent goals (limit 3) sorted by most recently updated
      const fetchedGoals = await goalService.getGoals(user.id, {
        userId: user.id,
        status: [GoalStatus.IN_PROGRESS, GoalStatus.NOT_STARTED, GoalStatus.OVERDUE]
      });
      
      // Sort by updatedAt and take top 3
      const sortedGoals = fetchedGoals
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3);
      
      setInternalGoals(sortedGoals);
    } catch (error) {
      console.error('Failed to load goals:', error);
      setInternalGoals([]);
    } finally {
      setInternalLoading(false);
    }
  };

  useEffect(() => {
    if (externalGoals.length === 0) {
      loadGoals();
    }
  }, [user?.id, externalGoals.length, refreshKey]);

  // Refresh goals when component becomes visible (user navigates back to dashboard)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && externalGoals.length === 0) {
        setRefreshKey(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [externalGoals.length]);

  const displayGoals = externalGoals.length > 0 ? externalGoals : internalGoals;
  const loading = externalLoading || internalLoading;

  const handleStatusChange = async (goalId: string, newStatus: GoalStatus) => {
    try {
      setUpdatingGoalId(goalId);
      await goalService.updateGoal(goalId, { status: newStatus });
      
      // Update local state
      setInternalGoals(prev => 
        prev.map(goal => 
          goal.id === goalId 
            ? { ...goal, status: newStatus, updatedAt: new Date().toISOString() }
            : goal
        )
      );
      
      toast.success('Goal status updated successfully');
    } catch (error) {
      console.error('Failed to update goal status:', error);
      toast.error('Failed to update goal status');
    } finally {
      setUpdatingGoalId(null);
    }
  };

  const getStatusIcon = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.COMPLETED:
        return CheckCircle;
      case GoalStatus.IN_PROGRESS:
        return Clock;
      case GoalStatus.OVERDUE:
        return AlertCircle;
      default:
        return Target;
    }
  };

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.COMPLETED:
        return 'text-green-500';
      case GoalStatus.IN_PROGRESS:
        return 'text-blue-500';
      case GoalStatus.OVERDUE:
        return 'text-red-500';
      case GoalStatus.PAUSED:
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`animate-pulse border p-4 rounded-lg ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className={`h-4 rounded w-3/4 mb-2 ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}></div>
              <div className={`h-3 rounded w-1/2 ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}></div>
            </div>
          </div>
          <div className={`h-2 rounded w-full ${
            isDark ? 'bg-gray-700' : 'bg-gray-200'
          }`}></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`rounded-lg shadow-sm border p-6 ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Target className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Recent Goals
          </h3>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/goals')}
            className={`text-sm font-medium transition-colors ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            View All
          </button>
          <button
            onClick={() => navigate('/goals?action=create')}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Goal
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : displayGoals.length > 0 ? (
        <div className="space-y-4">
          {displayGoals.map((goal) => {
            const StatusIcon = getStatusIcon(goal.status);
            const statusColor = getStatusColor(goal.status);
            const progressColor = getProgressColor(goal.progress);

            return (
              <div
                key={goal.id}
                className={`border rounded-lg p-4 transition-all ${
                  isDark 
                    ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <StatusIcon className={`w-4 h-4 ${statusColor} flex-shrink-0`} />
                      <h4 
                        className={`text-sm font-medium truncate cursor-pointer ${
                          isDark ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'
                        }`}
                        onClick={() => navigate(`/goals?id=${goal.id}`)}
                      >
                        {goal.title}
                      </h4>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} line-clamp-2`}>
                      {goal.description}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{goal.progress}%</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${
                    isDark ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div 
                      className={`h-full ${progressColor} transition-all duration-300`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Status Change Dropdown */}
                <div className="flex items-center justify-between">
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Due: {new Date(goal.dueDate).toLocaleDateString()}
                  </div>
                  <div className="w-36">
                    <DropdownSelect
                      placeholder="Status"
                      value={goal.status}
                      onChange={(value) => handleStatusChange(goal.id, value as GoalStatus)}
                      options={[
                        { 
                          value: GoalStatus.NOT_STARTED, 
                          label: 'Not Started',
                          icon: <Target className="w-4 h-4" />,
                          description: 'Yet to begin'
                        },
                        { 
                          value: GoalStatus.IN_PROGRESS, 
                          label: 'In Progress',
                          icon: <Clock className="w-4 h-4" />,
                          description: 'Currently working'
                        },
                        { 
                          value: GoalStatus.PAUSED, 
                          label: 'Paused',
                          icon: <AlertCircle className="w-4 h-4" />,
                          description: 'Temporarily on hold'
                        },
                        { 
                          value: GoalStatus.COMPLETED, 
                          label: 'Completed',
                          icon: <CheckCircle className="w-4 h-4" />,
                          description: 'Successfully finished'
                        }
                      ]}
                      disabled={updatingGoalId === goal.id}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <TrendingUp className={`w-12 h-12 ${
            isDark ? 'text-gray-600' : 'text-gray-300'
          } mx-auto mb-3`} />
          <p className={`${
            isDark ? 'text-gray-400' : 'text-gray-500'
          } text-sm mb-4`}>No active goals yet</p>
          <button
            onClick={() => navigate('/goals?action=create')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Goal
          </button>
        </div>
      )}
    </div>
  );
};

export default GoalsOverview;
