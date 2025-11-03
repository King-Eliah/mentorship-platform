import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  MessageSquare, 
  Clock,
  Target,
  Award,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Role, EventStatus, GoalStatus } from '../../types';
import { eventService } from '../../services/eventService';
import { goalService } from '../../services/goalService';
import { frontendService } from '../../services/frontendService';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType = 'neutral', 
  subtitle,
  loading = false 
}) => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className={`${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } rounded-lg shadow-sm border p-6`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className={`h-4 ${
              isDark ? 'bg-gray-600' : 'bg-gray-200'
            } rounded w-24`}></div>
            <div className={`h-8 w-8 ${
              isDark ? 'bg-gray-600' : 'bg-gray-200'
            } rounded-lg`}></div>
          </div>
          <div className={`h-8 ${
            isDark ? 'bg-gray-600' : 'bg-gray-200'
          } rounded w-16 mb-2`}></div>
          <div className={`h-3 ${
            isDark ? 'bg-gray-600' : 'bg-gray-200'
          } rounded w-20`}></div>
        </div>
      </div>
    );
  }

  // Special styling for mentee cards
  const isMentee = user?.role === Role.MENTEE;
  const isMentor = user?.role === Role.MENTOR;
  const isAdmin = user?.role === Role.ADMIN;
  
  const getIconBgClass = () => {
    // Mentee cards
    if (isMentee) {
      if (title === 'Active Goals') return isDark ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20' : 'bg-gradient-to-br from-blue-50 to-blue-100';
      if (title === 'Achievements') return isDark ? 'bg-gradient-to-br from-yellow-500/20 to-amber-600/20' : 'bg-gradient-to-br from-yellow-50 to-amber-100';
      if (title === 'Events Joined') return isDark ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/20' : 'bg-gradient-to-br from-purple-50 to-purple-100';
      if (title === 'Upcoming Events') return isDark ? 'bg-gradient-to-br from-green-500/20 to-green-600/20' : 'bg-gradient-to-br from-green-50 to-green-100';
    }
    
    // Mentor cards
    if (isMentor) {
      if (title === 'Active Mentees') return isDark ? 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/20' : 'bg-gradient-to-br from-indigo-50 to-indigo-100';
      if (title === 'Upcoming Sessions') return isDark ? 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/20' : 'bg-gradient-to-br from-cyan-50 to-cyan-100';
      if (title === 'Sessions Completed') return isDark ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20' : 'bg-gradient-to-br from-emerald-50 to-emerald-100';
      if (title === 'Messages') return isDark ? 'bg-gradient-to-br from-rose-500/20 to-rose-600/20' : 'bg-gradient-to-br from-rose-50 to-rose-100';
    }
    
    // Admin cards
    if (isAdmin) {
      if (title === 'Total Users') return isDark ? 'bg-gradient-to-br from-violet-500/20 to-violet-600/20' : 'bg-gradient-to-br from-violet-50 to-violet-100';
      if (title === 'Active Mentors') return isDark ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20' : 'bg-gradient-to-br from-blue-50 to-blue-100';
      if (title === 'Total Sessions') return isDark ? 'bg-gradient-to-br from-teal-500/20 to-teal-600/20' : 'bg-gradient-to-br from-teal-50 to-teal-100';
      if (title === 'Total Events') return isDark ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/20' : 'bg-gradient-to-br from-orange-50 to-orange-100';
    }
    
    return isDark ? 'bg-blue-900/20' : 'bg-blue-50';
  };

  const getIconColorClass = () => {
    // Mentee cards
    if (isMentee) {
      if (title === 'Active Goals') return 'text-blue-600';
      if (title === 'Achievements') return 'text-yellow-600';
      if (title === 'Events Joined') return 'text-purple-600';
      if (title === 'Upcoming Events') return 'text-green-600';
    }
    
    // Mentor cards
    if (isMentor) {
      if (title === 'Active Mentees') return 'text-indigo-600';
      if (title === 'Upcoming Sessions') return 'text-cyan-600';
      if (title === 'Sessions Completed') return 'text-emerald-600';
      if (title === 'Messages') return 'text-rose-600';
    }
    
    // Admin cards
    if (isAdmin) {
      if (title === 'Total Users') return 'text-violet-600';
      if (title === 'Active Mentors') return 'text-blue-600';
      if (title === 'Total Sessions') return 'text-teal-600';
      if (title === 'Total Events') return 'text-orange-600';
    }
    
    return 'text-blue-600';
  };

  return (
    <div className={`${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } rounded-xl shadow-sm border p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden`}>
      {/* Background watermark icon for all roles */}
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 ${
        isDark ? 'opacity-10' : ''
      }`}>
        <Icon className="w-full h-full" />
      </div>
      
      <div className="flex items-center justify-between mb-3 sm:mb-4 relative z-10">
        <h3 className={`text-xs sm:text-sm font-semibold ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>{title}</h3>
        <div className={`p-2 sm:p-2.5 ${getIconBgClass()} rounded-xl shadow-sm`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${getIconColorClass()}`} />
        </div>
      </div>
      
      <div className="flex items-baseline justify-between relative z-10">
        <div>
          <p className={`text-2xl sm:text-3xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          } mb-1`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className={`text-xs sm:text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>{subtitle}</p>
          )}
        </div>
        
        {change && (
          <span className={`text-xs sm:text-sm font-semibold px-2 py-1 rounded-full ${
            changeType === 'positive' 
              ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
              : changeType === 'negative'
              ? isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
              : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
};

interface DashboardStatsProps {
  loading?: boolean;
  dashboardData?: {
    totalUsers?: number;
    totalMentors?: number;
    totalMentees?: number;
    totalSessions?: number;
    totalEvents?: number;
    totalMessages?: number;
    pendingSessions?: number;
    completedSessions?: number;
    upcomingEvents?: number;
    activeConnections?: number;
    learningHours?: number;
    achievements?: number;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ loading = false, dashboardData = {} }) => {
  const { user } = useAuth();
  const [menteeStats, setMenteeStats] = useState({
    activeGoals: 0,
    completedGoals: 0,
    joinedEventsCount: 0,
    upcomingEventsThisWeek: 0
  });

  const [mentorStats, setMentorStats] = useState({
    activeMentees: 0,
    upcomingSessions: 0,
    completedSessions: 0
  });

  // Fetch real data for mentee stats
  useEffect(() => {
    const fetchMenteeStats = async () => {
      if (user?.role === Role.MENTEE) {
        try {
          // Get joined events
          const joinedEvents = await eventService.getJoinedEvents();
          const joinedEventsCount = joinedEvents.length;
          
          // Get upcoming events this week
          const now = new Date();
          const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          const upcomingEventsThisWeek = joinedEvents.filter(event => {
            const eventDate = new Date(event.scheduledAt);
            return event.status === EventStatus.SCHEDULED && 
                   eventDate >= now && 
                   eventDate <= oneWeekFromNow;
          }).length;

          // Get goals data
          const goals = await goalService.getGoals(user.id);
          const activeGoals = goals.filter((g: any) => g.status !== GoalStatus.COMPLETED).length;
          const completedGoals = goals.filter((g: any) => g.status === GoalStatus.COMPLETED).length;

          setMenteeStats({
            activeGoals,
            completedGoals,
            joinedEventsCount,
            upcomingEventsThisWeek
          });
        } catch (error) {
          console.error('Failed to fetch mentee stats:', error);
        }
      }
    };

    fetchMenteeStats();
  }, [user]);

  // Fetch real data for mentor stats
  useEffect(() => {
    const fetchMentorStats = async () => {
      if (user?.role === Role.MENTOR) {
        try {
          // 1. Get active mentees count
          const groups = await frontendService.getGroups();
          const mentorGroup = groups.find((g: any) => g.mentorId === user.id);
          const activeMentees = mentorGroup?.members?.length || 0;

          // 2. Get upcoming sessions (events created by mentor in next 7 days)
          const allEvents = await eventService.getEvents({});
          const now = new Date();
          const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          
          const upcomingSessions = allEvents.filter(event => {
            const eventDate = new Date(event.scheduledAt);
            return event.organizerId === user.id && 
                   eventDate >= now && 
                   eventDate <= nextWeek &&
                   event.status !== EventStatus.CANCELLED;
          }).length;

          // 3. Get completed sessions (events created by mentor that are completed)
          const completedSessions = allEvents.filter(event => 
            event.organizerId === user.id && 
            event.status === EventStatus.COMPLETED
          ).length;

          setMentorStats({
            activeMentees,
            upcomingSessions,
            completedSessions
          });
        } catch (error) {
          console.error('Failed to fetch mentor stats:', error);
        }
      }
    };

    fetchMentorStats();
  }, [user]);

  const getStatsConfig = () => {
    switch (user?.role) {
      case Role.ADMIN:
        return [
          {
            title: 'Total Users',
            value: dashboardData.totalUsers || 0,
            icon: Users,
            change: '+12%',
            changeType: 'positive' as const,
            subtitle: 'Active platform users'
          },
          {
            title: 'Active Mentors',
            value: dashboardData.totalMentors || 0,
            icon: UserCheck,
            change: '+8%',
            changeType: 'positive' as const,
            subtitle: 'Available for mentoring'
          },
          {
            title: 'Total Sessions',
            value: dashboardData.totalSessions || 0,
            icon: Calendar,
            change: '+15%',
            changeType: 'positive' as const,
            subtitle: 'Completed this month'
          },
          {
            title: 'Total Events',
            value: dashboardData.totalEvents || 0,
            icon: CalendarCheck,
            change: '+5%',
            changeType: 'positive' as const,
            subtitle: 'Organized events'
          }
        ];
      
      case Role.MENTOR:
        return [
          {
            title: 'Active Mentees',
            value: mentorStats.activeMentees,
            icon: Users,
            subtitle: 'Currently mentoring',
            change: mentorStats.activeMentees > 0 ? `${mentorStats.activeMentees} mentees` : undefined,
            changeType: 'positive' as const
          },
          {
            title: 'Upcoming Sessions',
            value: mentorStats.upcomingSessions,
            icon: Clock,
            subtitle: 'Scheduled this week',
            change: mentorStats.upcomingSessions > 0 ? 'This week' : undefined,
            changeType: 'neutral' as const
          },
          {
            title: 'Sessions Completed',
            value: mentorStats.completedSessions,
            icon: Award,
            subtitle: 'Total completed',
            change: mentorStats.completedSessions > 0 ? `${mentorStats.completedSessions} total` : undefined,
            changeType: 'positive' as const
          },
          {
            title: 'Messages',
            value: dashboardData.totalMessages || 0,
            icon: MessageSquare,
            subtitle: 'Unread conversations',
            change: undefined,
            changeType: 'neutral' as const
          }
        ];
      
      case Role.MENTEE:
        return [
          {
            title: 'Active Goals',
            value: menteeStats.activeGoals,
            icon: Target,
            change: menteeStats.activeGoals > 0 ? `${menteeStats.activeGoals} active` : undefined,
            changeType: 'positive' as const,
            subtitle: 'Goals in progress'
          },
          {
            title: 'Achievements',
            value: menteeStats.completedGoals,
            icon: Award,
            change: menteeStats.completedGoals > 0 ? `+${menteeStats.completedGoals} completed` : undefined,
            changeType: 'positive' as const,
            subtitle: 'Goals completed'
          },
          {
            title: 'Events Joined',
            value: menteeStats.joinedEventsCount,
            icon: CalendarCheck,
            change: menteeStats.joinedEventsCount > 0 ? 'Keep it up!' : undefined,
            changeType: 'neutral' as const,
            subtitle: 'Total participation'
          },
          {
            title: 'Upcoming Events',
            value: menteeStats.upcomingEventsThisWeek,
            icon: Clock,
            change: menteeStats.upcomingEventsThisWeek > 0 ? 'This week' : undefined,
            changeType: 'neutral' as const,
            subtitle: menteeStats.upcomingEventsThisWeek === 1 ? 'Event scheduled' : 'Events scheduled'
          }
        ];
      
      default:
        return [];
    }
  };

  const statsConfig = getStatsConfig();

  return (
    <div className="mb-6 sm:mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsConfig.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            changeType={stat.changeType}
            subtitle={stat.subtitle}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;