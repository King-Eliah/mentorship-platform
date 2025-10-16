import { 
  UserSkill, 
  SkillProgress,
  SkillStats,
  SkillFilters,
  SkillCategory,
  SkillLevel,
  CreateSkillAssessmentRequest,
  SkillAssessment
} from '../types/skills';
import { frontendService } from './frontendService';

class SkillService {
  // Get user's skills
  async getUserSkills(userId: string, filters?: SkillFilters): Promise<UserSkill[]> {
    let skills = await frontendService.simulateGetUserSkills(userId);
    
    if (filters) {
      if (filters.category && filters.category.length > 0) {
        skills = skills.filter(skill => filters.category!.includes(skill.skill.category));
      }
      if (filters.level && filters.level.length > 0) {
        skills = skills.filter(skill => filters.level!.includes(skill.currentLevel));
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        skills = skills.filter(skill => 
          skill.skill.name.toLowerCase().includes(search) ||
          skill.skill.description?.toLowerCase().includes(search)
        );
      }
    }
    
    return skills;
  }

  // Get skill progress for analytics
  async getSkillProgress(userId: string, skillId: string): Promise<SkillProgress | null> {
    const userSkills = await this.getUserSkills(userId);
    const userSkill = userSkills.find(s => s.skillId === skillId);
    
    if (!userSkill) return null;
    
    return {
      skillId: userSkill.skillId,
      skillName: userSkill.skill.name,
      category: userSkill.skill.category,
      currentLevel: userSkill.currentLevel,
      targetLevel: userSkill.targetLevel,
      progress: userSkill.progress,
      progressHistory: [
        {
          date: userSkill.createdAt,
          level: SkillLevel.BEGINNER,
          progress: 0,
          note: 'Initial skill added'
        },
        {
          date: userSkill.updatedAt,
          level: userSkill.currentLevel,
          progress: userSkill.progress,
          assessedBy: userSkill.assessedBy,
          note: 'Latest assessment'
        }
      ],
      lastUpdated: userSkill.updatedAt
    };
  }

  // Get skill statistics
  async getSkillStats(userId: string): Promise<SkillStats> {
    const skills = await this.getUserSkills(userId);
    
    const skillsByCategory = skills.reduce((acc, skill) => {
      const category = skill.skill.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<SkillCategory, number>);
    
    const skillsByLevel = skills.reduce((acc, skill) => {
      const level = skill.currentLevel;
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<SkillLevel, number>);
    
    const averageProgress = skills.length > 0 
      ? skills.reduce((sum, skill) => sum + skill.progress, 0) / skills.length 
      : 0;
    
    const endorsementCount = skills.reduce((sum, skill) => sum + skill.endorsements.length, 0);
    
    return {
      totalSkills: skills.length,
      skillsByCategory,
      skillsByLevel,
      averageProgress,
      endorsementCount,
      assessmentCount: skills.filter(s => s.lastAssessedAt).length
    };
  }

  // Create skill assessment
  async createSkillAssessment(assessmentData: CreateSkillAssessmentRequest): Promise<SkillAssessment> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const assessment: SkillAssessment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: assessmentData.userId,
      skillId: assessmentData.skillId,
      assessorId: '2', // Current mentor
      assessorName: 'Sarah Johnson',
      previousLevel: SkillLevel.BEGINNER, // Would get from current skill
      newLevel: assessmentData.newLevel,
      feedback: assessmentData.feedback,
      strengths: assessmentData.strengths,
      improvementAreas: assessmentData.improvementAreas,
      recommendedResources: assessmentData.recommendedResources,
      createdAt: new Date().toISOString()
    };
    
    return assessment;
  }

  // Helper methods for skill level calculations
  getSkillLevelProgress(level: SkillLevel): number {
    switch (level) {
      case SkillLevel.BEGINNER: return 25;
      case SkillLevel.INTERMEDIATE: return 50;
      case SkillLevel.ADVANCED: return 75;
      case SkillLevel.EXPERT: return 100;
      default: return 0;
    }
  }

  getSkillLevelColor(level: SkillLevel): string {
    switch (level) {
      case SkillLevel.BEGINNER:
        return 'text-red-600 bg-red-50 border-red-200';
      case SkillLevel.INTERMEDIATE:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case SkillLevel.ADVANCED:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case SkillLevel.EXPERT:
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  getCategoryColor(category: SkillCategory): string {
    switch (category) {
      case SkillCategory.TECHNICAL:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case SkillCategory.LEADERSHIP:
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case SkillCategory.COMMUNICATION:
        return 'text-green-600 bg-green-50 border-green-200';
      case SkillCategory.PROJECT_MANAGEMENT:
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case SkillCategory.DESIGN:
        return 'text-pink-600 bg-pink-50 border-pink-200';
      case SkillCategory.SOFT_SKILLS:
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  getNextLevel(currentLevel: SkillLevel): SkillLevel | null {
    switch (currentLevel) {
      case SkillLevel.BEGINNER: return SkillLevel.INTERMEDIATE;
      case SkillLevel.INTERMEDIATE: return SkillLevel.ADVANCED;
      case SkillLevel.ADVANCED: return SkillLevel.EXPERT;
      case SkillLevel.EXPERT: return null;
      default: return SkillLevel.BEGINNER;
    }
  }

  calculateSkillGap(currentLevel: SkillLevel, targetLevel: SkillLevel): number {
    const current = this.getSkillLevelProgress(currentLevel);
    const target = this.getSkillLevelProgress(targetLevel);
    return target - current;
  }
}

export const skillService = new SkillService();