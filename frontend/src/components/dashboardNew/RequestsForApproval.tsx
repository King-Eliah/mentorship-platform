import React, { useState, useEffect } from 'react';
import { UserCheck, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Role } from '../../types';
import { api } from '../../services/api';

interface RecentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export const RequestsForApproval: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    loadRecentUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const loadRecentUsers = async () => {
    // Only load for admins
    if (user?.role !== Role.ADMIN) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get<{ users: RecentUser[]; total: number }>('/admin/users?limit=3');
      const users = response.users || [];
      
      setRecentUsers(users);
      setTotalUsers(response.total || 0);
    } catch (error) {
      console.error('Failed to load recent users:', error);
      setRecentUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not admin
  if (user?.role !== Role.ADMIN) {
    return null;
  }

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.MENTOR:
        return isDark 
          ? 'bg-purple-900/20 text-purple-400 border-purple-800/50' 
          : 'bg-purple-50 text-purple-600 border-purple-200';
      case Role.MENTEE:
        return isDark 
          ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' 
          : 'bg-blue-50 text-blue-600 border-blue-200';
      case Role.ADMIN:
        return isDark 
          ? 'bg-red-900/20 text-red-400 border-red-800/50' 
          : 'bg-red-50 text-red-600 border-red-200';
      default:
        return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className={`${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } rounded-lg shadow-sm border p-6 flex flex-col min-h-[400px]`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          } flex items-center`}>
            <UserCheck className="w-5 h-5 mr-2 text-indigo-600" />
            Recent Users
          </h3>
          {totalUsers > 3 && (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              isDark ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-600'
            }`}>
              {totalUsers} total
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/users')}
          className={`text-sm font-medium ${
            isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
          } transition-colors`}
        >
          View All
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className={`h-16 rounded-lg ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`} />
            </div>
          ))}
        </div>
      ) : recentUsers.length === 0 ? (
        <div className="text-center py-8">
          <UserCheck className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No users yet
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {recentUsers.map((recentUser) => (
            <div
              key={recentUser.id}
              className={`p-2.5 rounded-lg border ${
                isDark ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              } transition-colors cursor-pointer`}
              onClick={() => navigate('/users')}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-2">
                  <h4 className={`font-medium text-sm ${
                    isDark ? 'text-white' : 'text-gray-900'
                  } truncate`}>
                    {recentUser.firstName} {recentUser.lastName}
                  </h4>
                  <p className={`text-xs mt-0.5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {formatDate(recentUser.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium border uppercase ${getRoleColor(recentUser.role)}`}>
                    {recentUser.role}
                  </span>
                  <Clock className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

