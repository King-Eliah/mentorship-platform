import { 
  LearningActivity,
  LearningPath,
  ActivityType,
  ActivityStatus,
  ActivityPriority,
  LearningProgress,
  LearningStats,
  ActivityFilters as LearningActivityFilters,
  CreateLearningActivityRequest,
  ActivityFeedback
} from '../types/learning';
import { frontendService } from './frontendService';

class LearningService {
  // Get user's learning activities
  async getLearningActivities(userId: string, filters?: LearningActivityFilters): Promise<LearningActivity[]> {
    let activities = await frontendService.simulateGetLearningActivities(userId);
    
    if (filters) {
      if (filters.type && filters.type.length > 0) {
        activities = activities.filter(activity => filters.type!.includes(activity.type));
      }
      if (filters.status && filters.status.length > 0) {
        activities = activities.filter(activity => filters.status!.includes(activity.status));
      }
      if (filters.priority && filters.priority.length > 0) {
        activities = activities.filter(activity => filters.priority!.includes(activity.priority));
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        activities = activities.filter(activity => 
          activity.title.toLowerCase().includes(search) ||
          activity.description?.toLowerCase().includes(search)
        );
      }
      if (filters.skillIds && filters.skillIds.length > 0) {
        activities = activities.filter(activity => 
          activity.relatedSkills?.some(skillId => filters.skillIds!.includes(skillId))
        );
      }
      if (filters.goalIds && filters.goalIds.length > 0) {
        activities = activities.filter(activity => 
          activity.relatedGoals?.some(goalId => filters.goalIds!.includes(goalId))
        );
      }
    }
    
    return activities;
  }

  // Create learning activity
  async createLearningActivity(activityData: CreateLearningActivityRequest): Promise<LearningActivity> {
    return await frontendService.simulateCreateLearningActivity(activityData);
  }

  // Update activity progress
  async updateActivityProgress(
    activityId: string, 
    progress: number
  ): Promise<LearningActivity> {
    return await frontendService.simulateUpdateLearningActivity(activityId, {
      progress,
      status: progress >= 100 ? ActivityStatus.COMPLETED : ActivityStatus.IN_PROGRESS,
      updatedAt: new Date().toISOString()
    });
  }

  // Complete learning activity
  async completeActivity(activityId: string, feedback?: ActivityFeedback): Promise<LearningActivity> {
    return await frontendService.simulateCompleteLearningActivity(activityId, feedback);
  }

  // Get learning paths
  async getLearningPaths(userId: string): Promise<LearningPath[]> {
    return await frontendService.simulateGetLearningPaths(userId);
  }

  // Get learning progress for specific path
  async getLearningProgress(userId: string, pathId?: string): Promise<LearningProgress> {
    const activities = await this.getLearningActivities(userId, 
      pathId ? { pathId } : undefined
    );
    
    const totalActivities = activities.length;
    const completedActivities = activities.filter(a => a.status === ActivityStatus.COMPLETED).length;
    const inProgressActivities = activities.filter(a => a.status === ActivityStatus.IN_PROGRESS).length;
    
    const totalProgress = activities.reduce((sum, activity) => sum + activity.progress, 0);
    const averageProgress = totalActivities > 0 ? totalProgress / totalActivities : 0;
    
    // Calculate estimated time to completion
    const remainingActivities = activities.filter(a => a.status !== ActivityStatus.COMPLETED);
    const estimatedTimeToCompletion = remainingActivities.reduce((sum, activity) => {
      const remainingProgress = 100 - activity.progress;
      const estimatedTime = activity.estimatedDuration * (remainingProgress / 100);
      return sum + estimatedTime;
    }, 0);
    
    return {
      userId,
      pathId,
      totalActivities,
      completedActivities,
      inProgressActivities,
      averageProgress,
      totalTimeSpent: activities.reduce((sum, a) => sum + (a.timeSpent || 0), 0),
      estimatedTimeToCompletion,
      lastActivityDate: activities.length > 0 
        ? activities.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].updatedAt
        : new Date().toISOString(),
      streak: this.calculateLearningStreak(activities)
    };
  }

  // Get learning statistics
  async getLearningStats(userId: string): Promise<LearningStats> {
    const activities = await this.getLearningActivities(userId);
    
    const activitiesByType = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<ActivityType, number>);
    
    const activitiesByStatus = activities.reduce((acc, activity) => {
      acc[activity.status] = (acc[activity.status] || 0) + 1;
      return acc;
    }, {} as Record<ActivityStatus, number>);
    
    const totalTimeSpent = activities.reduce((sum, activity) => sum + (activity.timeSpent || 0), 0);
    const averageProgress = activities.length > 0 
      ? activities.reduce((sum, activity) => sum + activity.progress, 0) / activities.length 
      : 0;
    
    const completionRate = activities.length > 0 
      ? (activities.filter(a => a.status === ActivityStatus.COMPLETED).length / activities.length) * 100 
      : 0;
    
    return {
      totalActivities: activities.length,
      activitiesByType,
      activitiesByStatus,
      totalTimeSpent,
      averageProgress,
      completionRate,
      currentStreak: this.calculateLearningStreak(activities),
      skillsImproved: this.getUniqueSkillsFromActivities(activities).length
    };
  }

  // Helper methods
  private calculateLearningStreak(activities: LearningActivity[]): number {
    // Simple streak calculation - days with completed activities
    const completedActivities = activities
      .filter(a => a.status === ActivityStatus.COMPLETED)
      .sort((a, b) => new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime());
    
    if (completedActivities.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < completedActivities.length; i++) {
      const activityDate = new Date(completedActivities[i].completedAt || completedActivities[i].updatedAt);
      const daysDiff = Math.floor((today.getTime() - activityDate.getTime()) / oneDay);
      
      if (daysDiff <= streak + 1) {
        streak = Math.max(streak, daysDiff + 1);
      } else {
        break;
      }
    }
    
    return streak;
  }

  private getUniqueSkillsFromActivities(activities: LearningActivity[]): string[] {
    const skillIds = new Set<string>();
    activities.forEach(activity => {
      activity.relatedSkills?.forEach(skillId => skillIds.add(skillId));
    });
    return Array.from(skillIds);
  }

  // Utility methods for UI
  getActivityTypeColor(type: ActivityType): string {
    switch (type) {
      case ActivityType.COURSE:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case ActivityType.WORKSHOP:
        return 'text-green-600 bg-green-50 border-green-200';
      case ActivityType.BOOK:
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case ActivityType.VIDEO:
        return 'text-red-600 bg-red-50 border-red-200';
      case ActivityType.ARTICLE:
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case ActivityType.PODCAST:
        return 'text-pink-600 bg-pink-50 border-pink-200';
      case ActivityType.PROJECT:
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case ActivityType.MENTORING:
        return 'text-teal-600 bg-teal-50 border-teal-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  getActivityStatusColor(status: ActivityStatus): string {
    switch (status) {
      case ActivityStatus.NOT_STARTED:
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case ActivityStatus.IN_PROGRESS:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case ActivityStatus.COMPLETED:
        return 'text-green-600 bg-green-50 border-green-200';
      case ActivityStatus.PAUSED:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case ActivityStatus.CANCELLED:
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  getPriorityColor(priority: ActivityPriority): string {
    switch (priority) {
      case ActivityPriority.LOW:
        return 'text-green-600 bg-green-50 border-green-200';
      case ActivityPriority.MEDIUM:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case ActivityPriority.HIGH:
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case ActivityPriority.URGENT:
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    } else {
      const days = Math.floor(minutes / 1440);
      const remainingHours = Math.floor((minutes % 1440) / 60);
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
  }
}

export const learningService = new LearningService();
