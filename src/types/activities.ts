export interface RecentActivity {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  type: RecentActivityType;
  title: string;
  description: string;
  timestamp: string;
  relatedEntityId?: string;
  relatedEntityType?: 'goal' | 'skill' | 'event' | 'resource' | 'user' | 'group';
  metadata?: Record<string, any>;
  isPublic: boolean;
  iconType: string;
  color: string;
}

export enum RecentActivityType {
  GOAL_CREATED = 'GOAL_CREATED',
  GOAL_COMPLETED = 'GOAL_COMPLETED',
  GOAL_UPDATED = 'GOAL_UPDATED',
  GOAL_MILESTONE_COMPLETED = 'GOAL_MILESTONE_COMPLETED',
  SKILL_ADDED = 'SKILL_ADDED',
  SKILL_LEVEL_UPDATED = 'SKILL_LEVEL_UPDATED',
  SKILL_ENDORSED = 'SKILL_ENDORSED',
  SKILL_ASSESSED = 'SKILL_ASSESSED',
  LEARNING_ACTIVITY_CREATED = 'LEARNING_ACTIVITY_CREATED',
  LEARNING_ACTIVITY_STARTED = 'LEARNING_ACTIVITY_STARTED',
  LEARNING_ACTIVITY_COMPLETED = 'LEARNING_ACTIVITY_COMPLETED',
  LEARNING_PROGRESS = 'LEARNING_PROGRESS',
  LEARNING_COMPLETED = 'LEARNING_COMPLETED',
  EVENT_ATTENDED = 'EVENT_ATTENDED',
  EVENT_CREATED = 'EVENT_CREATED',
  RESOURCE_ACCESSED = 'RESOURCE_ACCESSED',
  RESOURCE_UPLOADED = 'RESOURCE_UPLOADED',
  RESOURCE_SHARED = 'RESOURCE_SHARED',
  MENTORING_SESSION_COMPLETED = 'MENTORING_SESSION_COMPLETED',
  GROUP_JOINED = 'GROUP_JOINED',
  GROUP_CREATED = 'GROUP_CREATED',
  FEEDBACK_RECEIVED = 'FEEDBACK_RECEIVED',
  FEEDBACK_GIVEN = 'FEEDBACK_GIVEN',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  CONNECTION_MADE = 'CONNECTION_MADE',
  ACHIEVEMENT_EARNED = 'ACHIEVEMENT_EARNED',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  CERTIFICATION_EARNED = 'CERTIFICATION_EARNED'
}

export interface RecentActivityFilters {
  types?: RecentActivityType[];
  users?: string[];
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  entityTypes?: string[];
  entityType?: string;
  isPublic?: boolean;
  search?: string;
}

export interface ActivityStats {
  totalActivities: number;
  activitiesByType: Record<RecentActivityType, number>;
  activitiesByDay: Record<string, number>;
  engagementScore: number;
  streakDays: number;
  mostActiveDay: string;
  averageActivitiesPerDay: number;
}

export interface CreateActivityRequest {
  type: RecentActivityType;
  title: string;
  description: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  metadata?: Record<string, any>;
  isPublic: boolean;
}