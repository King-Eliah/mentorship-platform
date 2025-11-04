import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { useDashboardStats, useAnalytics } from '../hooks/useDashboardFrontend';
import { responsive } from '../utils/responsive';

// Import new dashboard components
import DashboardHeader from '../components/dashboardNew/DashboardHeader';
import DashboardStats from '../components/dashboardNew/DashboardStats';
import AnalyticsCharts from '../components/dashboardNew/AnalyticsCharts';
import RecentIncidents from '../components/dashboardNew/RecentIncidents';
import RecentFeedback from '../components/dashboardNew/RecentFeedback';
import { RequestsForApproval } from '../components/dashboardNew/RequestsForApproval';

const Dashboard: React.FC = () => {
  const { isDark } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { loading: analyticsLoading } = useAnalytics();

  const isAdmin = user?.role === Role.ADMIN;

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      
      {/* Main Content */}
      <div className={`
        ${responsive.container.all}
        pb-24 sm:pb-8
        ${responsive.spacing.section}
      `}>
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <DashboardHeader dashboardStats={stats || undefined} />
        </div>
        
        {/* Stats Section */}
        <div className="mb-6 sm:mb-8">
          <DashboardStats loading={statsLoading} dashboardData={stats || undefined} />
        </div>
        
        {/* Analytics Section */}
        <div className="mb-6 sm:mb-8">
          <AnalyticsCharts loading={analyticsLoading} />
        </div>
        
        {/* Admin-Only Section: 3 Cards in Grid */}
        {isAdmin && (
          <div className={`
            grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 sm:mb-8
          `}>
            <RecentIncidents />
            <RequestsForApproval />
            <RecentFeedback />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
