import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowRight, Target, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { frontendService } from '../../services/frontendService';
import { goalService } from '../../services/goalService';
import { User, MentorGroup, Goal, GoalStatus } from '../../types';
import { useNavigate } from 'react-router-dom';

interface MenteeWithProgress extends User {
  completedGoals: number;
  totalGoals: number;
  eventsAttended: number;
  progressPercentage: number;
}

export const MenteeProgress: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [mentees, setMentees] = useState<MenteeWithProgress[]>([]);
  const [group, setGroup] = useState<MentorGroup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenteesWithProgress = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        // Fetch mentor's group
        const groups = await frontendService.getGroups();
        const mentorGroup = groups.find(g => g.mentorId === user.id);
        
        if (mentorGroup) {
          setGroup(mentorGroup);
          
          // Get all users to find mentees in this group
          const allUsers = await frontendService.getUsers();
          const groupMentees = allUsers.filter(u => 
            u.role === 'MENTEE' && u.isActive
          ).slice(0, 6); // Show up to 6 mentees
          
          // Fetch progress data for each mentee
          const menteesWithProgress = await Promise.all(
            groupMentees.map(async (mentee) => {
              // Get mentee's goals (only those visible to mentor)
              const goals: Goal[] = await goalService.getGoals(mentee.id);
              const visibleGoals = goals.filter(g => g.visibleToMentor !== false); // Default to visible
              const completedGoals = visibleGoals.filter(g => g.status === GoalStatus.COMPLETED).length;
              const totalGoals = visibleGoals.length;
              
              // Get events attended by mentee
              const joinedEventIds = JSON.parse(
                localStorage.getItem('mentorconnect_joined_events') || '[]'
              );
              const eventsAttended = joinedEventIds.filter((id: string) => 
                id.startsWith(`${mentee.id}_`)
              ).length;
              
              // Calculate progress: (completed goals + events) / max(total goals + events, 1)
              const totalMetrics = Math.max(totalGoals + eventsAttended, 1);
              const completedMetrics = completedGoals + eventsAttended;
              const progressPercentage = Math.round((completedMetrics / totalMetrics) * 100);
              
              return {
                ...mentee,
                completedGoals,
                totalGoals,
                eventsAttended,
                progressPercentage: Math.min(progressPercentage, 100)
              };
            })
          );
          
          // Sort by progress percentage (highest first)
          menteesWithProgress.sort((a, b) => b.progressPercentage - a.progressPercentage);
          setMentees(menteesWithProgress);
        }
      } catch (error) {
        console.error('Failed to fetch mentee progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenteesWithProgress();
  }, [user?.id]);

  const handleViewAllMentees = () => {
    navigate('/my-mentees');
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    if (percentage >= 50) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
    if (percentage >= 25) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className={`${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } rounded-lg shadow-sm border p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Mentee Progress
            </h3>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className={`h-20 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mentees.length === 0) {
    return (
      <div className={`${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } rounded-lg shadow-sm border p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Mentee Progress
            </h3>
          </div>
        </div>
        <div className="text-center py-8">
          <TrendingUp className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No mentees assigned yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } rounded-lg shadow-sm border p-6`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Mentee Progress
          </h3>
        </div>
        {group && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
          }`}>
            {group.name}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {mentees.map((mentee) => (
          <div
            key={mentee.id}
            className={`p-4 rounded-lg border ${
              isDark 
                ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            } transition-colors cursor-pointer`}
            onClick={handleViewAllMentees}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'bg-blue-900/50' : 'bg-blue-100'
                }`}>
                  <span className="text-sm font-medium text-blue-600">
                    {mentee.firstName[0]}{mentee.lastName[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {mentee.firstName} {mentee.lastName}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Target className={`w-3 h-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {mentee.completedGoals}/{mentee.totalGoals} Goals
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className={`w-3 h-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {mentee.eventsAttended} Events
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getProgressColor(mentee.progressPercentage)}`}>
                {mentee.progressPercentage}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
              <div 
                className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(mentee.progressPercentage)}`}
                style={{ width: `${mentee.progressPercentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {mentees.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleViewAllMentees}
            className={`w-full flex items-center justify-center gap-2 text-sm font-medium ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            } transition-colors`}
          >
            View All Mentees
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
