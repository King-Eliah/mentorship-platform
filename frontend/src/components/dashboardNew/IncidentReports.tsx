import React from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Incident {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved';
  reportedBy: string;
  reportedAt: string;
}

export const IncidentReports: React.FC = () => {
  const { isDark } = useTheme();

  // Mock data - replace with real data
  const incidents: Incident[] = [
    {
      id: '1',
      title: 'User unable to access dashboard',
      severity: 'high',
      status: 'investigating',
      reportedBy: 'John Doe',
      reportedAt: '2 hours ago'
    },
    {
      id: '2',
      title: 'Message sending failure',
      severity: 'critical',
      status: 'open',
      reportedBy: 'Jane Smith',
      reportedAt: '30 minutes ago'
    },
    {
      id: '3',
      title: 'Event creation error',
      severity: 'medium',
      status: 'investigating',
      reportedBy: 'Mike Johnson',
      reportedAt: '5 hours ago'
    },
    {
      id: '4',
      title: 'Profile update not saving',
      severity: 'low',
      status: 'resolved',
      reportedBy: 'Sarah Wilson',
      reportedAt: '1 day ago'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return isDark ? 'bg-red-900/20 text-red-300 border-red-800/50' : 'bg-red-50 text-red-600 border-red-200';
      case 'high':
        return isDark ? 'bg-orange-900/20 text-orange-300 border-orange-800/50' : 'bg-orange-50 text-orange-600 border-orange-200';
      case 'medium':
        return isDark ? 'bg-yellow-900/20 text-yellow-300 border-yellow-800/50' : 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'low':
        return isDark ? 'bg-blue-900/20 text-blue-300 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-200';
      default:
        return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />;
      case 'investigating':
        return <Clock className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />;
      case 'resolved':
        return <CheckCircle className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-500'}`} />;
      default:
        return <XCircle className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />;
    }
  };

  return (
    <div className={`${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } rounded-lg shadow-sm border p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        } flex items-center`}>
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
          Recent Incident Reports
        </h3>
        <button
          onClick={() => window.location.href = 'http://localhost:5176/incidents'}
          className={`text-sm font-medium ${
            isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
          } transition-colors`}
        >
          View All
        </button>
      </div>

      <div className="space-y-2">
        {incidents.slice(0, 3).map((incident) => (
          <div
            key={incident.id}
            className={`p-2.5 rounded-lg border ${
              isDark ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            } transition-colors cursor-pointer`}
            onClick={() => window.location.href = 'http://localhost:5176/incidents'}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-2">
                <h4 className={`font-medium text-sm ${
                  isDark ? 'text-white' : 'text-gray-900'
                } truncate`}>
                  {incident.title}
                </h4>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                  {incident.severity}
                </span>
                {getStatusIcon(incident.status)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {incidents.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No incident reports
          </p>
        </div>
      )}
    </div>
  );
};
