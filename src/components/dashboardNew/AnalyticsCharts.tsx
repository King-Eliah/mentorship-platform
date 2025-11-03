import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';
import { JoinedEvents } from './JoinedEvents';
import { RecentMessages } from './RecentMessages';
import { MenteeProgress } from './MenteeProgress';
import { IncidentReports } from './IncidentReports';
import { RequestsForApproval } from './RequestsForApproval';
import { Feedback } from './Feedback';

interface AnalyticsChartsProps {
  loading?: boolean;
  analyticsData?: any;
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = () => {
  const { user } = useAuth();

  const renderAdminCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Incident Reports */}
      <IncidentReports />

      {/* Requests for Approval */}
      <RequestsForApproval />

      {/* Feedback */}
      <Feedback />

      {/* Recent Messages */}
      <RecentMessages />
    </div>
  );

  const renderMentorCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Messages */}
      <RecentMessages />

      {/* Assigned Mentees */}
      <MenteeProgress />
    </div>
  );

  const renderMenteeCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Messages */}
      <RecentMessages />

      {/* Joined Events */}
      <JoinedEvents />
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