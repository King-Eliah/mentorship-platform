import { 
  RecentActivity,
  RecentActivityType,
  RecentActivityFilters,
  ActivityStats
} from '../types/activities';
import { frontendService } from './frontendService';

class ActivityService {
  // Get recent activities
  async getRecentActivities(limit?: number, filters?: RecentActivityFilters): Promise<RecentActivity[]> {
    let activities = await frontendService.simulateGetRecentActivities(limit);
    
    if (filters) {
      if (filters.types && filters.types.length > 0) {
        activities = activities.filter(activity => filters.types!.includes(activity.type));
      }
      if (filters.userId) {
        activities = activities.filter(activity => activity.userId === filters.userId);
      }
      if (filters.dateFrom) {
        activities = activities.filter(activity => 
          new Date(activity.timestamp) >= new Date(filters.dateFrom!)
        );
      }
      if (filters.dateTo) {
        activities = activities.filter(activity => 
          new Date(activity.timestamp) <= new Date(filters.dateTo!)
        );
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        activities = activities.filter(activity => 
          activity.title.toLowerCase().includes(search) ||
          activity.description.toLowerCase().includes(search)
        );
      }
      if (filters.entityType) {
        activities = activities.filter(activity => 
          activity.relatedEntityType === filters.entityType
        );
      }
    }
    
    return activities;
  }

  // Delete an activity
  async deleteActivity(activityId: string): Promise<void> {
    return frontendService.simulateDeleteActivity(activityId);
  }

  // Get activity statistics
  async getActivityStats(userId?: string, dateRange?: { from: string; to: string }): Promise<ActivityStats> {
    const activities = await this.getRecentActivities(undefined, {
      userId,
      dateFrom: dateRange?.from,
      dateTo: dateRange?.to
    });
    
    const activitiesByType = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<RecentActivityType, number>);
    
    const activitiesByDay = this.groupActivitiesByDay(activities);
    const engagementScore = this.calculateEngagementScore(activities);
    const streakDays = this.calculateActivityStreak(activities);
    
    return {
      totalActivities: activities.length,
      activitiesByType,
      activitiesByDay,
      engagementScore,
      streakDays,
      mostActiveDay: this.getMostActiveDay(activitiesByDay),
      averageActivitiesPerDay: this.getAverageActivitiesPerDay(activitiesByDay)
    };
  }

  // Helper methods for activity calculations
  private groupActivitiesByDay(activities: RecentActivity[]): Record<string, number> {
    return activities.reduce((acc, activity) => {
      const date = new Date(activity.timestamp).toDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateEngagementScore(activities: RecentActivity[]): number {
    // Simple engagement score based on activity types and frequency
    const weights = {
      [RecentActivityType.GOAL_CREATED]: 10,
      [RecentActivityType.GOAL_COMPLETED]: 15,
      [RecentActivityType.GOAL_UPDATED]: 5,
      [RecentActivityType.SKILL_ADDED]: 8,
      [RecentActivityType.SKILL_LEVEL_UPDATED]: 12,
      [RecentActivityType.LEARNING_ACTIVITY_COMPLETED]: 12,
      [RecentActivityType.LEARNING_ACTIVITY_STARTED]: 8,
      [RecentActivityType.EVENT_ATTENDED]: 10,
      [RecentActivityType.RESOURCE_SHARED]: 6,
      [RecentActivityType.PROFILE_UPDATED]: 3,
      [RecentActivityType.CONNECTION_MADE]: 7,
      [RecentActivityType.ACHIEVEMENT_EARNED]: 15
    } as Record<RecentActivityType, number>;
    
    return activities.reduce((score, activity) => {
      return score + (weights[activity.type] || 5);
    }, 0);
  }

  private calculateActivityStreak(activities: RecentActivity[]): number {
    if (activities.length === 0) return 0;
    
    const activityDates = [...new Set(
      activities.map(a => new Date(a.timestamp).toDateString())
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    // Check if there's activity today or yesterday to start the streak
    if (activityDates.includes(today) || activityDates.includes(yesterday)) {
      let currentDate = new Date();
      
      for (const dateStr of activityDates) {
        const activityDate = new Date(dateStr);
        const diffDays = Math.floor((currentDate.getTime() - activityDate.getTime()) / (24 * 60 * 60 * 1000));
        
        if (diffDays <= streak + 1) {
          streak++;
          currentDate = activityDate;
        } else {
          break;
        }
      }
    }
    
    return streak;
  }

  private getMostActiveDay(activitiesByDay: Record<string, number>): string {
    let maxActivities = 0;
    let mostActiveDay = '';
    
    for (const [day, count] of Object.entries(activitiesByDay)) {
      if (count > maxActivities) {
        maxActivities = count;
        mostActiveDay = day;
      }
    }
    
    return mostActiveDay;
  }

  private getAverageActivitiesPerDay(activitiesByDay: Record<string, number>): number {
    const days = Object.keys(activitiesByDay).length;
    const totalActivities = Object.values(activitiesByDay).reduce((sum, count) => sum + count, 0);
    return days > 0 ? totalActivities / days : 0;
  }

  // Utility methods for UI
  getActivityTypeIcon(type: RecentActivityType): string {
    switch (type) {
      case RecentActivityType.GOAL_CREATED:
      case RecentActivityType.GOAL_UPDATED:
        return 'target';
      case RecentActivityType.GOAL_COMPLETED:
        return 'check-circle';
      case RecentActivityType.SKILL_ADDED:
      case RecentActivityType.SKILL_LEVEL_UPDATED:
        return 'trending-up';
      case RecentActivityType.LEARNING_ACTIVITY_STARTED:
      case RecentActivityType.LEARNING_ACTIVITY_COMPLETED:
        return 'book-open';
      case RecentActivityType.EVENT_ATTENDED:
        return 'calendar';
      case RecentActivityType.RESOURCE_SHARED:
        return 'share';
      case RecentActivityType.PROFILE_UPDATED:
        return 'user';
      case RecentActivityType.CONNECTION_MADE:
        return 'users';
      case RecentActivityType.ACHIEVEMENT_EARNED:
        return 'award';
      default:
        return 'activity';
    }
  }

  getActivityTypeColor(type: RecentActivityType): string {
    switch (type) {
      case RecentActivityType.GOAL_CREATED:
      case RecentActivityType.GOAL_UPDATED:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case RecentActivityType.GOAL_COMPLETED:
        return 'text-green-600 bg-green-50 border-green-200';
      case RecentActivityType.SKILL_ADDED:
      case RecentActivityType.SKILL_LEVEL_UPDATED:
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case RecentActivityType.LEARNING_ACTIVITY_STARTED:
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case RecentActivityType.LEARNING_ACTIVITY_COMPLETED:
        return 'text-green-600 bg-green-50 border-green-200';
      case RecentActivityType.EVENT_ATTENDED:
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case RecentActivityType.RESOURCE_SHARED:
        return 'text-teal-600 bg-teal-50 border-teal-200';
      case RecentActivityType.PROFILE_UPDATED:
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case RecentActivityType.CONNECTION_MADE:
        return 'text-pink-600 bg-pink-50 border-pink-200';
      case RecentActivityType.ACHIEVEMENT_EARNED:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - activityTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return activityTime.toLocaleDateString();
    }
  }
}

export const activityService = new ActivityService();