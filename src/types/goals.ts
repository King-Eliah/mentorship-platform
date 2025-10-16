export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  progress: number; // 0-100
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  mentorId?: string;
  assignedBy?: string;
  completedAt?: string;
  relatedSkills: string[];
  milestones: GoalMilestone[];
  attachments?: GoalAttachment[];
  isPublic: boolean;
  visibleToMentor?: boolean; // Default true - allows mentees to control goal visibility
}

export enum GoalCategory {
  SKILL_DEVELOPMENT = 'SKILL_DEVELOPMENT',
  CAREER_ADVANCEMENT = 'CAREER_ADVANCEMENT',
  LEARNING_OBJECTIVE = 'LEARNING_OBJECTIVE',
  PROJECT_COMPLETION = 'PROJECT_COMPLETION',
  PERSONAL_GROWTH = 'PERSONAL_GROWTH',
  NETWORKING = 'NETWORKING',
  CERTIFICATION = 'CERTIFICATION'
}

export enum GoalPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum GoalStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED'
}

export interface GoalMilestone {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  completed: boolean;
  completedAt?: string;
  order: number;
}

export interface GoalAttachment {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  url: string;
}

export interface CreateGoalRequest {
  title: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  dueDate: string;
  relatedSkills: string[];
  milestones: Omit<GoalMilestone, 'id' | 'completed' | 'completedAt'>[];
  isPublic: boolean;
  assignToUserId?: string; // For mentors assigning goals to mentees
}

export interface UpdateGoalRequest extends Partial<CreateGoalRequest> {
  status?: GoalStatus;
  progress?: number;
  completedAt?: string;
  visibleToMentor?: boolean;
}

export interface GoalFilters {
  status?: GoalStatus[];
  category?: GoalCategory[];
  priority?: GoalPriority[];
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
  userId?: string;
  mentorId?: string;
}

export interface GoalStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  completionRate: number;
  averageDaysToComplete: number;
  goalsThisMonth: number;
  goalsCompletedThisMonth: number;
}