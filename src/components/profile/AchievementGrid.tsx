import React, { useState } from 'react';
import { 
  Award, 
  Trophy, 
  Star, 
  Calendar, 
  Users, 
  BookOpen,
  MessageSquare,
  Target,
  Zap,
  Crown,
  Shield,
  Heart,
  Lightbulb
} from 'lucide-react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'profile' | 'mentoring' | 'social' | 'learning' | 'special';
  earned: boolean;
  earnedAt?: string;
  progress?: {
    current: number;
    total: number;
    unit?: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementGridProps {
  achievements: Achievement[];
  className?: string;
  showProgress?: boolean;
  gridCols?: 2 | 3 | 4 | 6;
}

interface AchievementTooltipProps {
  achievement: Achievement;
  isVisible: boolean;
  position: { x: number; y: number };
}

const AchievementTooltip: React.FC<AchievementTooltipProps> = ({
  achievement,
  isVisible,
  position
}) => {
  if (!isVisible) return null;

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-50';
      case 'rare': return 'border-blue-400 bg-blue-50';
      case 'epic': return 'border-purple-400 bg-purple-50';
      case 'legendary': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const getRarityText = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'Common';
      case 'rare': return 'Rare';
      case 'epic': return 'Epic';
      case 'legendary': return 'Legendary';
      default: return '';
    }
  };

  return (
    <div
      className={`fixed z-50 max-w-xs p-4 bg-white border-2 rounded-lg shadow-xl pointer-events-none ${getRarityColor(achievement.rarity)}`}
      style={{
        left: position.x - 150, // Center tooltip on cursor
        top: position.y - 120,   // Position above cursor
        transform: 'translateX(-50%)'
      }}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${achievement.color}`}>
            {getAchievementIcon(achievement.icon, 'h-4 w-4')}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">
              {achievement.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                achievement.rarity === 'common' ? 'bg-gray-200 text-gray-700' :
                achievement.rarity === 'rare' ? 'bg-blue-200 text-blue-700' :
                achievement.rarity === 'epic' ? 'bg-purple-200 text-purple-700' :
                'bg-yellow-200 text-yellow-700'
              }`}>
                {getRarityText(achievement.rarity)}
              </span>
              {achievement.earned && achievement.earnedAt && (
                <span className="text-xs text-gray-500">
                  {new Date(achievement.earnedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600">
          {achievement.description}
        </p>

        {/* Progress */}
        {achievement.progress && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">
                {achievement.progress.current} / {achievement.progress.total}
                {achievement.progress.unit && ` ${achievement.progress.unit}`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  achievement.earned ? 'bg-green-500' : 'bg-indigo-500'
                }`}
                style={{
                  width: `${Math.min(100, (achievement.progress.current / achievement.progress.total) * 100)}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Status */}
        <div className={`text-center py-1 px-2 rounded text-xs font-medium ${
          achievement.earned 
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {achievement.earned ? '🏆 Earned' : '🔒 Locked'}
        </div>
      </div>
    </div>
  );
};

const getAchievementIcon = (iconName: string, className: string = 'h-6 w-6') => {
  const icons: { [key: string]: React.ReactNode } = {
    award: <Award className={className} />,
    trophy: <Trophy className={className} />,
    star: <Star className={className} />,
    calendar: <Calendar className={className} />,
    users: <Users className={className} />,
    book: <BookOpen className={className} />,
    message: <MessageSquare className={className} />,
    target: <Target className={className} />,
    zap: <Zap className={className} />,
    crown: <Crown className={className} />,
    shield: <Shield className={className} />,
    heart: <Heart className={className} />,
    lightbulb: <Lightbulb className={className} />
  };
  
  return icons[iconName] || <Award className={className} />;
};

const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  className = '',
  showProgress = true,
  gridCols = 4
}) => {
  const [hoveredAchievement, setHoveredAchievement] = useState<Achievement | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (achievement: Achievement, event: React.MouseEvent) => {
    setHoveredAchievement(achievement);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredAchievement(null);
  };

  const getGridColsClass = () => {
    switch (gridCols) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-2 md:grid-cols-4';
      case 6: return 'grid-cols-3 md:grid-cols-6';
      default: return 'grid-cols-2 md:grid-cols-4';
    }
  };

  const getRarityGlow = (rarity: Achievement['rarity'], earned: boolean) => {
    if (!earned) return '';
    
    switch (rarity) {
      case 'rare': return 'ring-2 ring-blue-300 shadow-blue-200';
      case 'epic': return 'ring-2 ring-purple-300 shadow-purple-200';
      case 'legendary': return 'ring-2 ring-yellow-300 shadow-yellow-200';
      default: return '';
    }
  };

  const categorizedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const categoryNames = {
    profile: 'Profile',
    mentoring: 'Mentoring',
    social: 'Social',
    learning: 'Learning',
    special: 'Special'
  };

  const categoryIcons = {
    profile: <Users className="h-4 w-4" />,
    mentoring: <Lightbulb className="h-4 w-4" />,
    social: <Heart className="h-4 w-4" />,
    learning: <BookOpen className="h-4 w-4" />,
    special: <Crown className="h-4 w-4" />
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {Object.entries(categorizedAchievements).map(([category, categoryAchievements]) => {
        const earnedCount = categoryAchievements.filter(a => a.earned).length;
        
        return (
          <div key={category} className="space-y-4">
            {/* Category Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-gray-100 rounded">
                  {categoryIcons[category as keyof typeof categoryIcons]}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {categoryNames[category as keyof typeof categoryNames]}
                </h3>
                <span className="text-sm text-gray-500">
                  ({earnedCount}/{categoryAchievements.length})
                </span>
              </div>
              
              {earnedCount > 0 && (
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span>{earnedCount} earned</span>
                </div>
              )}
            </div>

            {/* Achievements Grid */}
            <div className={`grid gap-4 ${getGridColsClass()}`}>
              {categoryAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`relative p-4 bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer transform hover:scale-105 ${
                    achievement.earned
                      ? `border-gray-200 ${getRarityGlow(achievement.rarity, true)} shadow-md`
                      : 'border-gray-200 opacity-60 hover:opacity-80'
                  }`}
                  onMouseEnter={(e) => handleMouseEnter(achievement, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Achievement Icon */}
                  <div className="flex items-center justify-center mb-3">
                    <div className={`p-3 rounded-full ${
                      achievement.earned 
                        ? achievement.color
                        : 'bg-gray-200 text-gray-400'
                    } ${achievement.rarity === 'legendary' && achievement.earned ? 'animate-pulse' : ''}`}>
                      {getAchievementIcon(achievement.icon, 'h-6 w-6')}
                    </div>
                  </div>

                  {/* Achievement Name */}
                  <h4 className={`text-sm font-medium text-center mb-2 ${
                    achievement.earned ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {achievement.name}
                  </h4>

                  {/* Progress Bar */}
                  {showProgress && achievement.progress && !achievement.earned && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Progress</span>
                        <span>
                          {achievement.progress.current}/{achievement.progress.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="h-1 bg-indigo-500 rounded-full transition-all"
                          style={{
                            width: `${(achievement.progress.current / achievement.progress.total) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Earned Badge */}
                  {achievement.earned && (
                    <div className="absolute -top-2 -right-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        achievement.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                        achievement.rarity === 'rare' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                        'bg-green-500'
                      }`}>
                        ✓
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Tooltip */}
      <AchievementTooltip
        achievement={hoveredAchievement!}
        isVisible={!!hoveredAchievement}
        position={mousePosition}
      />

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {achievements.filter(a => a.earned).length}
            </div>
            <div className="text-sm text-gray-600">Total Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {achievements.filter(a => a.earned && a.rarity === 'rare').length}
            </div>
            <div className="text-sm text-gray-600">Rare</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600">
              {achievements.filter(a => a.earned && a.rarity === 'epic').length}
            </div>
            <div className="text-sm text-gray-600">Epic</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {achievements.filter(a => a.earned && a.rarity === 'legendary').length}
            </div>
            <div className="text-sm text-gray-600">Legendary</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementGrid;
export type { AchievementGridProps };