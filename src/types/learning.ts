export interface LearningActivity {
  id: string;
  userId: string;
  type: ActivityType;
  title: string;
  description: string;
  status: ActivityStatus;
  priority: ActivityPriority;
  progress: number; // 0-100
  startedAt?: string;
  completedAt?: string;
  dueDate?: string;
  estimatedDuration: number; // minutes
  actualDuration?: number; // minutes
  timeSpent?: number; // actual time spent in minutes
  relatedSkills: string[];
  relatedGoals: string[];
  resourceId?: string;
  eventId?: string;
  mentorId?: string;
  feedback?: ActivityFeedback;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export enum ActivityPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum ActivityType {
  COURSE = 'COURSE',
  WORKSHOP = 'WORKSHOP',
  WEBINAR = 'WEBINAR',
  BOOK = 'BOOK',
  READING = 'READING',
  VIDEO = 'VIDEO',
  VIDEO_COURSE = 'VIDEO_COURSE',
  ARTICLE = 'ARTICLE',
  PODCAST = 'PODCAST',
  MENTORING = 'MENTORING',
  MENTORING_SESSION = 'MENTORING_SESSION',
  GROUP_SESSION = 'GROUP_SESSION',
  SELF_STUDY = 'SELF_STUDY',
  PROJECT = 'PROJECT',
  ASSIGNMENT = 'ASSIGNMENT',
  QUIZ = 'QUIZ',
  CERTIFICATION = 'CERTIFICATION',
  NETWORKING = 'NETWORKING'
}

export enum ActivityStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED'
}

export interface ActivityFeedback {
  rating: number; // 1-5
  comment: string;
  strengths: string[];
  improvementAreas: string[];
  skillsImproved: string[];
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface CreateLearningActivityRequest {
  type: ActivityType;
  title: string;
  description: string;
  dueDate?: string;
  estimatedDuration: number;
  relatedSkills: string[];
  relatedGoals: string[];
  resourceId?: string;
  eventId?: string;
  tags: string[];
}

export interface UpdateLearningActivityRequest extends Partial<CreateLearningActivityRequest> {
  status?: ActivityStatus;
  progress?: number;
  actualDuration?: number;
  completedAt?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedDuration: number; // total minutes
  activities: string[]; // activity IDs in order
  prerequisites: string[]; // skill IDs
  outcomes: string[]; // expected skills/competencies
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningProgress {
  userId: string;
  pathId?: string;
  totalActivities: number;
  completedActivities: number;
  inProgressActivities: number;
  averageProgress: number;
  totalTimeSpent: number; // minutes
  estimatedTimeToCompletion: number; // minutes
  lastActivityDate: string;
  streak: number;
}

export interface ActivityFilters {
  type?: ActivityType[];
  status?: ActivityStatus[];
  priority?: ActivityPriority[];
  skills?: string[];
  skillIds?: string[];
  goalIds?: string[];
  pathId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  mentorId?: string;
  tags?: string[];
}

export interface LearningStats {
  totalActivities: number;
  activitiesByType: Record<ActivityType, number>;
  activitiesByStatus: Record<ActivityStatus, number>;
  totalTimeSpent: number;
  averageProgress: number;
  completionRate: number;
  currentStreak: number;
  skillsImproved: number;
}
