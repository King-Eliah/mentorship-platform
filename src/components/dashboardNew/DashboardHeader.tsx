import React from 'react';
import { CalendarDays, Clock, User, MessageSquare, Share2, Users as UsersIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Role } from '../../types';
import { LucideIcon } from 'lucide-react';

interface QuickAction {
  icon: LucideIcon;
  label: string;
  href?: string;
  count?: number;
  action?: () => void;
}

interface DashboardHeaderProps {
  dashboardStats?: {
    totalUsers?: number;
    totalMentors?: number;
    totalMentees?: number;
    totalSessions?: number;
    totalEvents?: number;
    pendingSessions?: number;
  };
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ dashboardStats }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    const timeGreeting = 
      hour < 12 ? 'Good morning' : 
      hour < 18 ? 'Good afternoon' : 
      'Good evening';
    
    const roleBasedMessage = {
      [Role.ADMIN]: 'Ready to manage the platform today?',
      [Role.MENTOR]: 'Ready to guide and inspire today?',
      [Role.MENTEE]: 'Ready to learn and grow today?',
      [Role.PENDING]: 'Your account is pending approval.'
    };

    return {
      greeting: `${timeGreeting}, ${user?.firstName || 'User'}!`,
      message: roleBasedMessage[user?.role as Role] || 'Welcome to your dashboard!'
    };
  };

  const getQuickActions = (): QuickAction[] => {
    switch (user?.role) {
      case Role.ADMIN:
        return [
          { icon: User, label: 'Manage Users', href: '/users', count: dashboardStats?.totalUsers },
          { icon: CalendarDays, label: 'View Events', href: '/events', count: dashboardStats?.totalEvents },
          { icon: Clock, label: 'Session Logs', href: '/sessions', count: dashboardStats?.totalSessions }
        ];
      case Role.MENTOR:
        return [
          { icon: UsersIcon, label: 'My Group', href: '/groups' },
          { icon: CalendarDays, label: 'Create Event', href: '/events' },
          { icon: Share2, label: 'Share Resources', href: '/resources/share' }
        ];
      case Role.MENTEE:
        return [
          { icon: User, label: 'Groups', href: '/groups' },
          { icon: CalendarDays, label: 'Join Events', href: '/events' },
          { icon: MessageSquare, label: 'Messages', href: '/messages' }
        ];
      default:
        return [];
    }
  };

  const { greeting, message } = getGreetingMessage();
  const quickActions = getQuickActions();

  return (
    <div className={`${
      isDark ? 'bg-gray-800' : 'bg-white'
    } rounded-lg shadow-sm border ${
      isDark ? 'border-gray-700' : 'border-gray-200'
    } p-4 sm:p-6 mb-6`}>
      {/* Greeting Section */}
      <div className="mb-4 sm:mb-6">
        <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${
          isDark ? 'text-white' : 'text-gray-900'
        } mb-2`}>{greeting}</h1>
        <p className={`text-sm sm:text-base ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>{message}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action, index) => (
          action.action ? (
            <button
              key={index}
              onClick={action.action}
              className={`flex items-center p-3 sm:p-4 text-left ${
                isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
              } rounded-lg transition-colors duration-200 group`}
            >
              <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 ${
                isDark ? 'bg-blue-900/50 group-hover:bg-blue-800/50' : 'bg-blue-100 group-hover:bg-blue-200'
              } rounded-lg flex items-center justify-center transition-colors`}>
                <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                <p className={`text-sm sm:text-base font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                } truncate`}>
                  {action.label}
                </p>
                {action.count !== undefined && (
                  <p className={`text-xs sm:text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  } mt-1`}>
                    {action.count} items
                  </p>
                )}
              </div>
            </button>
          ) : (
            <a
              key={index}
              href={action.href}
              className={`flex items-center p-3 sm:p-4 ${
                isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
              } rounded-lg transition-colors duration-200 group`}
            >
              <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 ${
                isDark ? 'bg-blue-900/50 group-hover:bg-blue-800/50' : 'bg-blue-100 group-hover:bg-blue-200'
              } rounded-lg flex items-center justify-center transition-colors`}>
                <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                <p className={`text-sm sm:text-base font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                } truncate`}>
                  {action.label}
                </p>
                {action.count !== undefined && (
                  <p className={`text-xs sm:text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  } mt-1`}>
                    {action.count} items
                  </p>
                )}
              </div>
            </a>
          )
        ))}
      </div>
    </div>
  );
};

export default DashboardHeader;