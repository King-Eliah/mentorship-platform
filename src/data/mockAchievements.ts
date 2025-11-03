import { Achievement } from '../components/profile/AchievementGrid';

export const mockAchievements: Achievement[] = [
  // Profile Achievements
  {
    id: 'profile-complete',
    name: 'Profile Master',
    description: 'Complete 100% of your profile information',
    icon: 'award',
    color: 'bg-green-100 text-green-600',
    category: 'profile',
    earned: false,
    progress: {
      current: 75,
      total: 100,
      unit: '%'
    },
    rarity: 'common'
  },
  {
    id: 'first-photo',
    name: 'Picture Perfect',
    description: 'Upload your first profile picture',
    icon: 'star',
    color: 'bg-yellow-100 text-yellow-600',
    category: 'profile',
    earned: true,
    earnedAt: '2024-01-15T10:00:00Z',
    rarity: 'common'
  },
  {
    id: 'skill-master',
    name: 'Skill Collector',
    description: 'Add 10 or more skills to your profile',
    icon: 'target',
    color: 'bg-blue-100 text-blue-600',
    category: 'profile',
    earned: false,
    progress: {
      current: 7,
      total: 10,
      unit: 'skills'
    },
    rarity: 'rare'
  },
  
  // Mentoring Achievements
  {
    id: 'first-session',
    name: 'First Steps',
    description: 'Complete your first mentoring session',
    icon: 'calendar',
    color: 'bg-purple-100 text-purple-600',
    category: 'mentoring',
    earned: true,
    earnedAt: '2024-02-01T14:30:00Z',
    rarity: 'common'
  },
  {
    id: 'mentor-veteran',
    name: 'Seasoned Mentor',
    description: 'Complete 50 mentoring sessions',
    icon: 'crown',
    color: 'bg-purple-100 text-purple-600',
    category: 'mentoring',
    earned: false,
    progress: {
      current: 23,
      total: 50,
      unit: 'sessions'
    },
    rarity: 'epic'
  },
  {
    id: 'feedback-champion',
    name: 'Feedback Champion',
    description: 'Maintain a 4.5+ star rating over 20 sessions',
    icon: 'heart',
    color: 'bg-red-100 text-red-600',
    category: 'mentoring',
    earned: true,
    earnedAt: '2024-03-10T09:15:00Z',
    rarity: 'rare'
  },
  
  // Social Achievements
  {
    id: 'network-builder',
    name: 'Network Builder',
    description: 'Connect with 25 different mentors or mentees',
    icon: 'users',
    color: 'bg-indigo-100 text-indigo-600',
    category: 'social',
    earned: false,
    progress: {
      current: 18,
      total: 25,
      unit: 'connections'
    },
    rarity: 'rare'
  },
  {
    id: 'conversation-starter',
    name: 'Conversation Starter',
    description: 'Send your first message',
    icon: 'message',
    color: 'bg-green-100 text-green-600',
    category: 'social',
    earned: true,
    earnedAt: '2024-01-20T16:45:00Z',
    rarity: 'common'
  },
  {
    id: 'community-champion',
    name: 'Community Champion',
    description: 'Be active for 6 consecutive months',
    icon: 'shield',
    color: 'bg-blue-100 text-blue-600',
    category: 'social',
    earned: false,
    progress: {
      current: 4,
      total: 6,
      unit: 'months'
    },
    rarity: 'epic'
  },
  
  // Learning Achievements
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: 'Complete 10 learning sessions as a mentee',
    icon: 'book',
    color: 'bg-emerald-100 text-emerald-600',
    category: 'learning',
    earned: true,
    earnedAt: '2024-02-28T11:20:00Z',
    rarity: 'common'
  },
  {
    id: 'lifelong-learner',
    name: 'Lifelong Learner',
    description: 'Maintain active learning for 12 months',
    icon: 'lightbulb',
    color: 'bg-yellow-100 text-yellow-600',
    category: 'learning',
    earned: false,
    progress: {
      current: 8,
      total: 12,
      unit: 'months'
    },
    rarity: 'rare'
  },
  {
    id: 'skill-diversifier',
    name: 'Skill Diversifier',
    description: 'Learn skills in 5 different categories',
    icon: 'zap',
    color: 'bg-orange-100 text-orange-600',
    category: 'learning',
    earned: false,
    progress: {
      current: 3,
      total: 5,
      unit: 'categories'
    },
    rarity: 'epic'
  },
  
  // Special Achievements
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'One of the first 100 users to join the platform',
    icon: 'crown',
    color: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-600',
    category: 'special',
    earned: true,
    earnedAt: '2024-01-01T00:00:00Z',
    rarity: 'legendary'
  },
  {
    id: 'platform-ambassador',
    name: 'Platform Ambassador',
    description: 'Invite 10 friends to join the platform',
    icon: 'users',
    color: 'bg-indigo-100 text-indigo-600',
    category: 'special',
    earned: false,
    progress: {
      current: 3,
      total: 10,
      unit: 'invites'
    },
    rarity: 'epic'
  },
  {
    id: 'bug-hunter',
    name: 'Bug Hunter',
    description: 'Report a critical bug that helps improve the platform',
    icon: 'shield',
    color: 'bg-red-100 text-red-600',
    category: 'special',
    earned: false,
    rarity: 'rare'
  },
  {
    id: 'golden-contributor',
    name: 'Golden Contributor',
    description: 'Achieve the highest level of contribution across all categories',
    icon: 'trophy',
    color: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-600',
    category: 'special',
    earned: false,
    progress: {
      current: 85,
      total: 100,
      unit: '%'
    },
    rarity: 'legendary'
  }
];

// Helper functions for achievement calculations
export const calculateAchievementProgress = (_userId: string): Achievement[] => {
  // This would normally fetch real user data and calculate progress
  // For now, return mock data with some randomization for demo purposes
  return mockAchievements.map(achievement => {
    if (achievement.earned) return achievement;
    
    if (achievement.progress) {
      // Add some random progress for demo
      const randomProgress = Math.floor(Math.random() * achievement.progress.total);
      return {
        ...achievement,
        progress: {
          ...achievement.progress,
          current: Math.min(randomProgress, achievement.progress.total)
        }
      };
    }
    
    return achievement;
  });
};

export const getAchievementsByCategory = (achievements: Achievement[]) => {
  return achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);
};

export const getEarnedAchievements = (achievements: Achievement[]) => {
  return achievements.filter(achievement => achievement.earned);
};

export const getAchievementStats = (achievements: Achievement[]) => {
  const total = achievements.length;
  const earned = getEarnedAchievements(achievements).length;
  const byRarity = achievements.reduce((acc, achievement) => {
    if (achievement.earned) {
      acc[achievement.rarity] = (acc[achievement.rarity] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total,
    earned,
    percentage: total > 0 ? Math.round((earned / total) * 100) : 0,
    byRarity
  };
};