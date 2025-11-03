import React, { useState, useEffect } from 'react';
import { UserCheck, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { PendingUser, UserStatus } from '../../types';

interface ApprovalRequest {
  id: string;
  userName: string;
  email: string;
  role: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const RequestsForApproval: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      // Mock data - in production, fetch from backend
      // const response = await fetch('/api/admin/pending-users');
      // const data = await response.json();
      
      const mockPendingUsers: PendingUser[] = [
        {
          id: '1',
          firstName: 'Alex',
          lastName: 'Thompson',
          email: 'alex.thompson@example.com',
          requestedRole: 'MENTOR' as any,
          status: UserStatus.PENDING,
          inviteCode: 'MENTOR2024',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          firstName: 'Maria',
          lastName: 'Garcia',
          email: 'maria.garcia@example.com',
          requestedRole: 'MENTEE' as any,
          status: UserStatus.PENDING,
          createdAt: new Date(Date.now() - 10800000).toISOString(),
        },
        {
          id: '3',
          firstName: 'David',
          lastName: 'Chen',
          email: 'david.chen@example.com',
          requestedRole: 'MENTOR' as any,
          status: UserStatus.PENDING,
          inviteCode: 'MENTOR2024',
          createdAt: new Date(Date.now() - 18000000).toISOString(),
        },
      ];

      // Convert to approval requests format
      const formattedRequests: ApprovalRequest[] = mockPendingUsers
        .filter(user => user.status === UserStatus.PENDING)
        .map(user => ({
          id: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.requestedRole,
          requestedAt: getTimeAgo(user.createdAt),
          status: 'pending'
        }));

      setRequests(formattedRequests);
    } catch (error) {
      console.error('Failed to load pending requests:', error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'MENTOR':
        return isDark ? 'bg-purple-900/20 text-purple-300 border-purple-800/50' : 'bg-purple-50 text-purple-600 border-purple-200';
      case 'MENTEE':
        return isDark ? 'bg-blue-900/20 text-blue-300 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-200';
      case 'ADMIN':
        return isDark ? 'bg-red-900/20 text-red-300 border-red-800/50' : 'bg-red-50 text-red-600 border-red-200';
      default:
        return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />;
      case 'approved':
        return <CheckCircle className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-500'}`} />;
      case 'rejected':
        return <XCircle className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />;
      default:
        return null;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className={`${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } rounded-lg shadow-sm border p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          } flex items-center`}>
            <UserCheck className="w-5 h-5 mr-2 text-indigo-600" />
            Requests for Approval
          </h3>
          {pendingCount > 0 && (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              isDark ? 'bg-yellow-900/20 text-yellow-300' : 'bg-yellow-50 text-yellow-600'
            }`}>
              {pendingCount} pending
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/admin')}
          className={`text-sm font-medium ${
            isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
          } transition-colors`}
        >
          View All
        </button>
      </div>

      <div className="space-y-2">
        {requests.slice(0, 3).map((request) => (
          <div
            key={request.id}
            className={`p-2.5 rounded-lg border ${
              isDark ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            } transition-colors cursor-pointer ${
              request.status === 'pending' ? 'ring-1 ring-yellow-500/20' : ''
            }`}
            onClick={() => navigate('/admin')}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-2">
                <h4 className={`font-medium text-sm ${
                  isDark ? 'text-white' : 'text-gray-900'
                } truncate`}>
                  {request.userName}
                </h4>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getRoleColor(request.role)}`}>
                  {request.role}
                </span>
                {getStatusIcon(request.status)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {requests.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No pending requests
          </p>
        </div>
      )}
    </div>
  );
};
