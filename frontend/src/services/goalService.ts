import { 
  Goal, 
  CreateGoalRequest, 
  UpdateGoalRequest, 
  GoalFilters, 
  GoalStats,
  GoalStatus,
  GoalCategory,
  GoalPriority 
} from '../types/goals';
import { frontendService } from './frontendService';

class GoalService {
  // Get user's goals
  async getGoals(userId: string, filters?: GoalFilters): Promise<Goal[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    return frontendService.simulateGetGoals(userId, filters);
  }

  // Get goal by ID
  async getGoalById(goalId: string): Promise<Goal> {
    return frontendService.simulateGetGoalById(goalId);
  }

  // Create new goal
  async createGoal(goalData: CreateGoalRequest): Promise<Goal> {
    return frontendService.simulateCreateGoal(goalData);
  }

  // Update goal
  async updateGoal(goalId: string, updates: UpdateGoalRequest): Promise<Goal> {
    return frontendService.simulateUpdateGoal(goalId, updates);
  }

  // Delete goal
  async deleteGoal(goalId: string): Promise<void> {
    return frontendService.simulateDeleteGoal(goalId);
  }

  // Update goal progress
  async updateGoalProgress(goalId: string, progress: number, milestoneId?: string): Promise<Goal> {
    return frontendService.simulateUpdateGoalProgress(goalId, progress, milestoneId);
  }

  // Complete goal
  async completeGoal(goalId: string): Promise<Goal> {
    return frontendService.simulateCompleteGoal(goalId);
  }

  // Get goal statistics
  async getGoalStats(userId: string): Promise<GoalStats> {
    return frontendService.simulateGetGoalStats(userId);
  }

  // Get goals assigned by mentor
  async getMentorAssignedGoals(mentorId: string): Promise<Goal[]> {
    return frontendService.simulateGetMentorAssignedGoals(mentorId);
  }

  // Get public goals (for inspiration)
  async getPublicGoals(filters?: GoalFilters): Promise<Goal[]> {
    return frontendService.simulateGetPublicGoals(filters);
  }

  // Helper methods for status calculations
  calculateGoalStatus(goal: Goal): GoalStatus {
    if (goal.progress === 100 && goal.completedAt) {
      return GoalStatus.COMPLETED;
    }
    
    if (goal.status === GoalStatus.PAUSED || goal.status === GoalStatus.CANCELLED) {
      return goal.status;
    }
    
    const now = new Date();
    const dueDate = new Date(goal.dueDate);
    
    if (dueDate < now && goal.progress < 100) {
      return GoalStatus.OVERDUE;
    }
    
    if (goal.progress > 0) {
      return GoalStatus.IN_PROGRESS;
    }
    
    return GoalStatus.NOT_STARTED;
  }

  calculateProgressFromMilestones(goal: Goal): number {
    if (!goal.milestones || goal.milestones.length === 0) {
      return goal.progress;
    }
    
    const completedMilestones = goal.milestones.filter(m => m.completed).length;
    return Math.round((completedMilestones / goal.milestones.length) * 100);
  }

  getDaysUntilDue(dueDate: string): number {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getPriorityColor(priority: GoalPriority): string {
    switch (priority) {
      case GoalPriority.CRITICAL:
        return 'text-red-600 bg-red-50 border-red-200';
      case GoalPriority.HIGH:
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case GoalPriority.MEDIUM:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case GoalPriority.LOW:
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  getCategoryColor(category: GoalCategory): string {
    switch (category) {
      case GoalCategory.SKILL_DEVELOPMENT:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case GoalCategory.CAREER_ADVANCEMENT:
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case GoalCategory.LEARNING_OBJECTIVE:
        return 'text-green-600 bg-green-50 border-green-200';
      case GoalCategory.PROJECT_COMPLETION:
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case GoalCategory.PERSONAL_GROWTH:
        return 'text-pink-600 bg-pink-50 border-pink-200';
      case GoalCategory.NETWORKING:
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case GoalCategory.CERTIFICATION:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  getStatusColor(status: GoalStatus): string {
    switch (status) {
      case GoalStatus.COMPLETED:
        return 'text-green-600 bg-green-50 border-green-200';
      case GoalStatus.IN_PROGRESS:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case GoalStatus.OVERDUE:
        return 'text-red-600 bg-red-50 border-red-200';
      case GoalStatus.PAUSED:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case GoalStatus.CANCELLED:
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }
}

export const goalService = new GoalService();