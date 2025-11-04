import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';
import { JoinedEvents } from './JoinedEvents';
import { MenteeProgressCard } from './MenteeProgressCard';
import ActivityFeed from './ActivityFeed';
import GoalsOverview from './GoalsOverview';

interface AnalyticsChartsProps {
  loading?: boolean;
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = () => {
  const { user } = useAuth();

  const renderAdminCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Admin-specific charts can go here if needed */}
      {/* The 4 admin cards (Incidents, Users, Feedback, Messages) are now in Dashboard.tsx */}
    </div>
  );

  const renderMentorCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Mentee Progress Card */}
      <MenteeProgressCard />
      {/* Activity Feed */}
      <ActivityFeed />
    </div>
  );

  const renderMenteeCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Joined Events */}
      <JoinedEvents />
      {/* Recent Goals */}
      <GoalsOverview />
    </div>
  );

  const renderCharts = () => {
    switch (user?.role) {
      case Role.ADMIN:
        return renderAdminCharts();
      case Role.MENTOR:
        return renderMentorCharts();
      case Role.MENTEE:
        return renderMenteeCharts();
      default:
        return renderAdminCharts();
    }
  };

  return (
    <div className="mb-8">
      {renderCharts()}
    </div>
  );
};

export default AnalyticsCharts;