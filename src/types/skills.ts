export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description?: string;
  level: SkillLevel;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  skill: Skill;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  progress: number; // 0-100
  lastAssessedAt?: string;
  assessedBy?: string; // mentor who assessed
  endorsements: SkillEndorsement[];
  learningResources: string[]; // resource IDs
  relatedGoals: string[]; // goal IDs
  createdAt: string;
  updatedAt: string;
}

export enum SkillCategory {
  TECHNICAL = 'TECHNICAL',
  LEADERSHIP = 'LEADERSHIP',
  COMMUNICATION = 'COMMUNICATION',
  PROJECT_MANAGEMENT = 'PROJECT_MANAGEMENT',
  DESIGN = 'DESIGN',
  MARKETING = 'MARKETING',
  SALES = 'SALES',
  FINANCE = 'FINANCE',
  OPERATIONS = 'OPERATIONS',
  SOFT_SKILLS = 'SOFT_SKILLS',
  LANGUAGE = 'LANGUAGE',
  INDUSTRY_SPECIFIC = 'INDUSTRY_SPECIFIC'
}

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export interface SkillEndorsement {
  id: string;
  endorserId: string;
  endorserName: string;
  endorserRole: string;
  comment?: string;
  createdAt: string;
}

export interface SkillProgress {
  skillId: string;
  skillName: string;
  category: SkillCategory;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  progress: number;
  progressHistory: SkillProgressEntry[];
  lastUpdated: string;
}

export interface SkillProgressEntry {
  date: string;
  level: SkillLevel;
  progress: number;
  assessedBy?: string;
  note?: string;
}

export interface SkillAssessment {
  id: string;
  userId: string;
  skillId: string;
  assessorId: string;
  assessorName: string;
  previousLevel: SkillLevel;
  newLevel: SkillLevel;
  feedback: string;
  strengths: string[];
  improvementAreas: string[];
  recommendedResources: string[];
  createdAt: string;
}

export interface CreateSkillAssessmentRequest {
  userId: string;
  skillId: string;
  newLevel: SkillLevel;
  feedback: string;
  strengths: string[];
  improvementAreas: string[];
  recommendedResources: string[];
}

export interface SkillFilters {
  category?: SkillCategory[];
  level?: SkillLevel[];
  search?: string;
  userId?: string;
  hasEndorsements?: boolean;
}

export interface SkillStats {
  totalSkills: number;
  skillsByCategory: Record<SkillCategory, number>;
  skillsByLevel: Record<SkillLevel, number>;
  averageProgress: number;
  endorsementCount: number;
  assessmentCount: number;
}