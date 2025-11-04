import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  UserPlus, 
  Award, 
  Clock, 
  BookOpen,
  Bell,
  TrendingUp
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { RecentActivity, RecentActivityType } from '../../types/activities';
import { activityService } from '../../services/activityService';

interface ActivityFeedProps {
  loading?: boolean;
  activities?: RecentActivity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ loading: externalLoading = false, activities: externalActivities = [] }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [internalActivities, setInternalActivities] = useState<RecentActivity[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setInternalLoading(true);
        // Show top 3 most recent platform activities on dashboard
        const fetchedActivities = await activityService.getRecentActivities(3);
        setInternalActivities(fetchedActivities);
      } catch (error) {
        console.error('Failed to load activities:', error);
        setInternalActivities([]);
      } finally {
        setInternalLoading(false);
      }
    };

    if (externalActivities.length === 0) {
      loadActivities();
    }
  }, [externalActivities.length]);

  const displayActivities = externalActivities.length > 0 ? externalActivities : internalActivities;
  const loading = externalLoading || internalLoading;

  const getActivityIcon = (type: RecentActivityType) => {
    switch (type) {
      case RecentActivityType.LEARNING_ACTIVITY_COMPLETED:
      case RecentActivityType.LEARNING_ACTIVITY_STARTED:
        return BookOpen;
      case RecentActivityType.MENTORING_SESSION_COMPLETED:
        return Calendar;
      case RecentActivityType.GOAL_COMPLETED:
      case RecentActivityType.ACHIEVEMENT_EARNED:
        return Award;
      case RecentActivityType.EVENT_ATTENDED:
      case RecentActivityType.EVENT_CREATED:
        return Bell;
      case RecentActivityType.CONNECTION_MADE:
      case RecentActivityType.GROUP_JOINED:
        return UserPlus;
      case RecentActivityType.RESOURCE_SHARED:
      case RecentActivityType.RESOURCE_ACCESSED:
        return BookOpen;
      default:
        return Clock;
    }
  };

  const getActivityColor = (activity: RecentActivity) => {
    // Use the color from the activity itself, or default based on type
    if (activity.color) {
      return activity.color;
    }
    
    switch (activity.type) {
      case RecentActivityType.LEARNING_ACTIVITY_COMPLETED:
      case RecentActivityType.LEARNING_ACTIVITY_STARTED:
        return 'bg-blue-100 text-blue-600';
      case RecentActivityType.MENTORING_SESSION_COMPLETED:
        return 'bg-green-100 text-green-600';
      case RecentActivityType.GOAL_COMPLETED:
      case RecentActivityType.ACHIEVEMENT_EARNED:
        return 'bg-yellow-100 text-yellow-600';
      case RecentActivityType.EVENT_ATTENDED:
      case RecentActivityType.EVENT_CREATED:
        return 'bg-purple-100 text-purple-600';
      case RecentActivityType.CONNECTION_MADE:
      case RecentActivityType.GROUP_JOINED:
        return 'bg-indigo-100 text-indigo-600';
      case RecentActivityType.RESOURCE_SHARED:
      case RecentActivityType.RESOURCE_ACCESSED:
        return 'bg-pink-100 text-pink-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Remove getDefaultActivities since we're using real data
  // Remove duplicate displayActivities declaration

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse flex items-start space-x-3">
          <div className={`w-10 h-10 ${
            isDark ? 'bg-gray-600' : 'bg-gray-200'
          } rounded-lg`}></div>
          <div className="flex-1 space-y-2">
            <div className={`h-4 ${
              isDark ? 'bg-gray-600' : 'bg-gray-200'
            } rounded w-3/4`}></div>
            <div className={`h-3 ${
              isDark ? 'bg-gray-600' : 'bg-gray-200'
            } rounded w-1/2`}></div>
            <div className={`h-3 ${
              isDark ? 'bg-gray-600' : 'bg-gray-200'
            } rounded w-1/4`}></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } rounded-lg shadow-sm border p-6`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Recent Activity</h3>
        <button 
          onClick={() => navigate('/activities')}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          View All
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-4">
          {displayActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity);

            return (
              <div
                key={activity.id}
                className={`flex items-start space-x-3 p-3 rounded-lg ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                } transition-colors duration-150`}
              >
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    } truncate`}>
                      {activity.title}
                    </h4>
                    <span className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    } whitespace-nowrap ml-2`}>
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className={`text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  } mb-1`}>
                    {activity.description}
                  </p>
                  
                  <p className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    by {activity.userName}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {displayActivities.length === 0 && !loading && (
        <div className="text-center py-8">
          <TrendingUp className={`w-12 h-12 ${
            isDark ? 'text-gray-600' : 'text-gray-300'
          } mx-auto mb-3`} />
          <p className={`${
            isDark ? 'text-gray-400' : 'text-gray-500'
          } text-sm`}>No recent activity to display</p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;