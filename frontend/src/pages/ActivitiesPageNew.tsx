import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Filter,
  Search,
  Calendar,
  MessageSquare,
  UserPlus,
  Award,
  Clock,
  BookOpen,
  Bell,
  TrendingUp,
  MoreVertical,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { RecentActivity, RecentActivityType, RecentActivityFilters } from '../types/activities';
import { activityService } from '../services/activityService';

const ActivityTypeIcon: React.FC<{ type: RecentActivityType; className?: string }> = ({ type, className = "w-4 h-4" }) => {
  const iconMap = {
    [RecentActivityType.GOAL_CREATED]: <TrendingUp className={className} />,
    [RecentActivityType.GOAL_COMPLETED]: <Award className={className} />,
    [RecentActivityType.GOAL_UPDATED]: <TrendingUp className={className} />,
    [RecentActivityType.GOAL_MILESTONE_COMPLETED]: <Award className={className} />,
    [RecentActivityType.SKILL_ADDED]: <BookOpen className={className} />,
    [RecentActivityType.SKILL_LEVEL_UPDATED]: <TrendingUp className={className} />,
    [RecentActivityType.SKILL_ENDORSED]: <Award className={className} />,
    [RecentActivityType.SKILL_ASSESSED]: <BookOpen className={className} />,
    [RecentActivityType.LEARNING_ACTIVITY_CREATED]: <BookOpen className={className} />,
    [RecentActivityType.LEARNING_ACTIVITY_STARTED]: <BookOpen className={className} />,
    [RecentActivityType.LEARNING_ACTIVITY_COMPLETED]: <Award className={className} />,
    [RecentActivityType.LEARNING_PROGRESS]: <TrendingUp className={className} />,
    [RecentActivityType.LEARNING_COMPLETED]: <Award className={className} />,
    [RecentActivityType.EVENT_ATTENDED]: <Calendar className={className} />,
    [RecentActivityType.EVENT_CREATED]: <Calendar className={className} />,
    [RecentActivityType.RESOURCE_ACCESSED]: <BookOpen className={className} />,
    [RecentActivityType.RESOURCE_UPLOADED]: <BookOpen className={className} />,
    [RecentActivityType.RESOURCE_SHARED]: <MessageSquare className={className} />,
    [RecentActivityType.MENTORING_SESSION_COMPLETED]: <MessageSquare className={className} />,
    [RecentActivityType.GROUP_JOINED]: <UserPlus className={className} />,
    [RecentActivityType.GROUP_CREATED]: <UserPlus className={className} />,
    [RecentActivityType.FEEDBACK_RECEIVED]: <MessageSquare className={className} />,
    [RecentActivityType.FEEDBACK_GIVEN]: <MessageSquare className={className} />,
    [RecentActivityType.PROFILE_UPDATED]: <UserPlus className={className} />,
    [RecentActivityType.CONNECTION_MADE]: <UserPlus className={className} />,
    [RecentActivityType.ACHIEVEMENT_EARNED]: <Award className={className} />,
    [RecentActivityType.ACHIEVEMENT_UNLOCKED]: <Award className={className} />,
    [RecentActivityType.CERTIFICATION_EARNED]: <Award className={className} />
  };

  return iconMap[type] || <Bell className={className} />;
};

const ActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RecentActivityFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'engagement'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [timePeriod, setTimePeriod] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');

  useEffect(() => {
    loadActivities();
  }, [user?.id, filters, searchTerm, sortBy, sortOrder, timePeriod]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      
      // Apply time period filter
      const now = new Date();
      let dateFrom: string | undefined;
      
      switch (timePeriod) {
        case 'today':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFrom = weekAgo.toISOString();
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          dateFrom = monthAgo.toISOString();
          break;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          dateFrom = yearAgo.toISOString();
          break;
        default:
          dateFrom = undefined;
      }

      const fetchedActivities = await activityService.getRecentActivities(50, {
        ...filters,
        search: searchTerm || undefined,
        dateFrom
      });
      
      // Apply sorting
      const sortedActivities = sortActivities(fetchedActivities);
      setActivities(sortedActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const sortActivities = (activitiesArray: RecentActivity[]) => {
    return [...activitiesArray].sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'date':
          compareValue = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'type':
          compareValue = a.type.localeCompare(b.type);
          break;
        case 'engagement':
          // Simple engagement score based on activity type priority
          const getEngagementScore = (activity: RecentActivity) => {
            if (activity.type.includes('COMPLETED') || activity.type.includes('EARNED')) return 3;
            if (activity.type.includes('CREATED') || activity.type.includes('STARTED')) return 2;
            return 1;
          };
          compareValue = getEngagementScore(a) - getEngagementScore(b);
          break;
        default:
          compareValue = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - activityTime.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return activityTime.toLocaleDateString();
  };

  const getActivityColor = (type: RecentActivityType) => {
    if (type.includes('GOAL')) return 'text-blue-500';
    if (type.includes('SKILL') || type.includes('LEARNING')) return 'text-green-500';
    if (type.includes('EVENT')) return 'text-purple-500';
    if (type.includes('MESSAGE') || type.includes('FEEDBACK')) return 'text-orange-500';
    if (type.includes('ACHIEVEMENT') || type.includes('AWARD')) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getActivitySummary = () => {
    const summary = {
      total: activities.length,
      byCategory: {
        goals: 0,
        learning: 0,
        social: 0,
        achievements: 0
      },
      engagementLevel: {
        high: 0,
        medium: 0,
        low: 0
      }
    };

    activities.forEach(activity => {
      // Count by category
      if (activity.type.includes('GOAL')) summary.byCategory.goals++;
      else if (activity.type.includes('SKILL') || activity.type.includes('LEARNING')) summary.byCategory.learning++;
      else if (activity.type.includes('GROUP') || activity.type.includes('FEEDBACK') || activity.type.includes('CONNECTION')) summary.byCategory.social++;
      else if (activity.type.includes('ACHIEVEMENT') || activity.type.includes('CERTIFICATION')) summary.byCategory.achievements++;

      // Count by engagement level
      if (activity.type.includes('COMPLETED') || activity.type.includes('EARNED')) summary.engagementLevel.high++;
      else if (activity.type.includes('CREATED') || activity.type.includes('STARTED')) summary.engagementLevel.medium++;
      else summary.engagementLevel.low++;
    });

    return summary;
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={`animate-pulse border ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        } rounded-lg p-4`}>
          <div className="flex items-start space-x-3">
            <div className={`w-10 h-10 ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            } rounded-full`}></div>
            <div className="flex-1">
              <div className={`h-4 ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              } rounded w-3/4 mb-2`}></div>
              <div className={`h-3 ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              } rounded w-1/2`}></div>
            </div>
            <div className={`h-3 ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            } rounded w-16`}></div>
          </div>
        </div>
      ))}
    </div>
  );

  const ActivitySummary = () => {
    const summary = getActivitySummary();

    return (
      <div className={`${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border rounded-lg p-4 mb-6`}>
        <h3 className={`text-sm font-medium mb-3 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Activity Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {summary.total}
            </div>
            <div className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Total Activities
            </div>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold ${
              isDark ? 'text-green-400' : 'text-green-600'
            }`}>
              {summary.byCategory.goals}
            </div>
            <div className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Goals
            </div>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold ${
              isDark ? 'text-purple-400' : 'text-purple-600'
            }`}>
              {summary.byCategory.learning}
            </div>
            <div className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Learning
            </div>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold ${
              isDark ? 'text-yellow-400' : 'text-yellow-600'
            }`}>
              {summary.byCategory.achievements}
            </div>
            <div className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Achievements
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Engagement Level:
            </span>
            <div className="flex space-x-4">
              <span className="text-green-500">
                High: {summary.engagementLevel.high}
              </span>
              <span className="text-yellow-500">
                Medium: {summary.engagementLevel.medium}
              </span>
              <span className="text-gray-500">
                Low: {summary.engagementLevel.low}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SortingControls = () => (
    <div className={`${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border rounded-lg p-4 mb-4`}>
      <h3 className={`text-sm font-medium mb-3 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>Sort & Filter Options</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sort By */}
        <div>
          <label className={`text-xs font-medium ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          } mb-2 block`}>
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'type' | 'engagement')}
            className={`w-full text-sm px-3 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="date">Date</option>
            <option value="type">Activity Type</option>
            <option value="engagement">Engagement Level</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className={`text-xs font-medium ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          } mb-2 block`}>
            Order
          </label>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className={`w-full flex items-center justify-center px-3 py-2 text-sm rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
            } transition-colors`}
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        </div>

        {/* Time Period */}
        <div>
          <label className={`text-xs font-medium ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          } mb-2 block`}>
            Time Period
          </label>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as 'all' | 'today' | 'week' | 'month' | 'year')}
            className={`w-full text-sm px-3 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>
    </div>
  );

  const ActivityTypeFilter = () => {
    const activityTypes = Object.values(RecentActivityType);
    const categories = [
      { label: 'Goals', types: activityTypes.filter(t => t.includes('GOAL')) },
      { label: 'Skills & Learning', types: activityTypes.filter(t => t.includes('SKILL') || t.includes('LEARNING')) },
      { label: 'Events', types: activityTypes.filter(t => t.includes('EVENT')) },
      { label: 'Social', types: activityTypes.filter(t => t.includes('GROUP') || t.includes('FEEDBACK') || t.includes('CONNECTION')) },
      { label: 'Achievements', types: activityTypes.filter(t => t.includes('ACHIEVEMENT') || t.includes('CERTIFICATION')) }
    ];

    return (
      <div className={`${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border rounded-lg p-4 mb-4`}>
        <h3 className={`text-sm font-medium mb-3 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Filter by Activity Type</h3>
        
        <div className="space-y-3">
          {categories.map(category => (
            <div key={category.label}>
              <label className={`text-xs font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              } mb-1 block`}>
                {category.label}
              </label>
              <div className="flex flex-wrap gap-2">
                {category.types.map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      const currentTypes = filters.types || [];
                      const newTypes = currentTypes.includes(type)
                        ? currentTypes.filter(t => t !== type)
                        : [...currentTypes, type];
                      setFilters(prev => ({ ...prev, types: newTypes.length > 0 ? newTypes : undefined }));
                    }}
                    className={`text-xs px-2 py-1 rounded-full transition-colors ${
                      filters.types?.includes(type)
                        ? 'bg-blue-600 text-white'
                        : isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => setFilters({})}
            className={`text-xs px-3 py-1 rounded-lg ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            } transition-colors`}
          >
            Clear All
          </button>
          <button
            onClick={() => setShowFilters(false)}
            className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors`}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              } transition-colors`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Recent Activities
              </h1>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Track your progress and engagement across the platform
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Sort Controls */}
            <div className="flex items-center space-x-2">
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as 'all' | 'today' | 'week' | 'month' | 'year')}
                className={`text-sm px-3 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className={`p-2 rounded-lg ${
                  isDark 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                } transition-colors`}
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-2 text-sm font-medium ${
                isDark 
                  ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                  : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
              } rounded-lg transition-colors`}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <>
            <SortingControls />
            <ActivityTypeFilter />
          </>
        )}

        {/* Activity Summary */}
        {!loading && activities.length > 0 && <ActivitySummary />}

        {/* Activities List */}
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`border ${
                  isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                } rounded-lg p-4 hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-10 h-10 ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  } rounded-full flex items-center justify-center`}>
                    <ActivityTypeIcon 
                      type={activity.type} 
                      className={`w-5 h-5 ${getActivityColor(activity.type)}`} 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        } mb-1`}>
                          {activity.title}
                        </h3>
                        <p className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        } mb-2`}>
                          {activity.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs">
                          <span className={`${
                            isDark ? 'text-gray-500' : 'text-gray-400'
                          } flex items-center`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {activity.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          {activity.userRole && (
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              activity.userRole === 'mentor' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {activity.userRole}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button className={`p-1 rounded-lg ${
                        isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      } transition-colors`}>
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {activities.length === 0 && (
              <div className={`text-center py-12 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No activities found</h3>
                <p className="text-sm">
                  {searchTerm || filters.types?.length 
                    ? 'Try adjusting your search or filters' 
                    : 'Start engaging with the platform to see your activities here'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesPage;