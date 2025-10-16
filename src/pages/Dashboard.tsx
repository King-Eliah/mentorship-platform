import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDashboardStats, useAnalytics } from '../hooks/useDashboardFrontend';
import { responsive } from '../utils/responsive';
import MobileNavigation from '../components/layout/MobileNavigation';

// Import new dashboard components
import DashboardHeader from '../components/dashboardNew/DashboardHeader';
import DashboardStats from '../components/dashboardNew/DashboardStats';
import ActivityFeed from '../components/dashboardNew/ActivityFeed';
import AnalyticsCharts from '../components/dashboardNew/AnalyticsCharts';
import GoalsOverview from '../components/dashboardNew/GoalsOverview';

const Dashboard: React.FC = () => {
  const { isDark } = useTheme();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { data: analytics, loading: analyticsLoading } = useAnalytics();

  return (
    <div className={`min-h-screen ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Mobile Navigation */}
      <MobileNavigation currentPage="dashboard" />
      
      {/* Main Content */}
      <div className={`
        ${responsive.container.all}
        pt-20 pb-24 sm:pt-8 sm:pb-8
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
          <AnalyticsCharts loading={analyticsLoading} analyticsData={analytics || undefined} />
        </div>
        
        {/* Content Grid */}
        <div className={`
          grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8
        `}>
          <div className="order-1">
            <ActivityFeed />
          </div>
          <div className="order-2">
            <GoalsOverview />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
