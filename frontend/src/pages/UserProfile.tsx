import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { mockApi } from '../services/mockApi';
import { Role } from '../types';
import { useAuth } from '../hooks/useAuth';

export const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  // Generate mock users to find the specific user
  const allUsers = useMemo(() => mockApi.generateMockUsers(25), []);
  const user = useMemo(() => allUsers.find(u => u.id === userId), [allUsers, userId]);

  // Mock additional user stats
  const userStats = useMemo(() => ({
    sessionsCompleted: Math.floor(Math.random() * 25) + 5,
    messagesExchanged: Math.floor(Math.random() * 150) + 20,
    lastLoginDate: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
    accountCreated: user?.createdAt ? new Date(user.createdAt) : new Date(),
    responseRate: Math.floor(Math.random() * 30) + 70,
    averageRating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0
  }), [user]);
  
  // Local state for user management actions
  const [localUser, setLocalUser] = useState(user);
  const [loading, setLoading] = useState(false);

  const isAdmin = currentUser?.role === Role.ADMIN;

  if (!localUser) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          User Not Found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The user you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate('/users')}>
          Back to Users
        </Button>
      </div>
    );
  }

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case Role.MENTOR:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case Role.MENTEE:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  // Admin action handlers
  const handleToggleStatus = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLocalUser(prev => prev ? { ...prev, isActive: !prev.isActive } : prev);
    setLoading(false);
  };

  const handleChangeRole = async (newRole: Role) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLocalUser(prev => prev ? { ...prev, role: newRole } : prev);
    setLoading(false);
  };

  const handleRemoveUser = async () => {
    if (window.confirm(`Are you sure you want to remove ${localUser.firstName} ${localUser.lastName}?`)) {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('User removed successfully');
      navigate('/users');
    }
  };

  const getNextRole = (currentRole: Role): Role => {
    if (currentRole === Role.MENTOR) return Role.MENTEE;
    if (currentRole === Role.MENTEE) return Role.MENTOR;
    return currentRole;
  };

  return (
    <div className="space-y-6">
      {/* Simple Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/users')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {localUser.firstName} {localUser.lastName}
        </h1>
      </div>

      {/* Simple User Info */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-lg font-semibold">
            {localUser.firstName[0]}{localUser.lastName[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {localUser.firstName} {localUser.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {localUser.email}
            </p>
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-2 py-1 text-xs rounded ${getRoleBadgeColor(localUser.role)}`}>
                {localUser.role}
              </span>
              <span className={`w-2 h-2 rounded-full ${
                localUser.isActive ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              <span className="text-sm text-gray-500">
                {localUser.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-gray-400 ml-2">
                ID: {localUser.id.slice(0, 8)}
              </span>
            </div>
          </div>
        </div>

        {localUser.bio && (
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300">
              {localUser.bio}
            </p>
          </div>
        )}

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          {localUser.skills && (
            <div>
              <span className="font-medium">Skills:</span> {localUser.skills}
            </div>
          )}
          {localUser.experience && (
            <div>
              <span className="font-medium">Experience:</span> {localUser.experience}
            </div>
          )}
          <div>
            <span className="font-medium">Joined:</span> {userStats.accountCreated.toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Last Login:</span> {userStats.lastLoginDate.toLocaleDateString()}
          </div>
          {localUser.role === Role.MENTOR && (
            <div>
              <span className="font-medium">Specialization:</span> {localUser.skills || 'General Mentoring'}
            </div>
          )}
          {localUser.role === Role.MENTEE && (
            <div>
              <span className="font-medium">Learning Focus:</span> {localUser.skills || 'General Development'}
            </div>
          )}
        </div>

        {/* Activity Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Activity Overview</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
              <div className="text-blue-600 dark:text-blue-400 font-medium">Sessions</div>
              <div className="text-blue-900 dark:text-blue-100 font-bold text-lg">{userStats.sessionsCompleted}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
              <div className="text-green-600 dark:text-green-400 font-medium">Messages</div>
              <div className="text-green-900 dark:text-green-100 font-bold text-lg">{userStats.messagesExchanged}</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900 p-3 rounded-lg">
              <div className="text-purple-600 dark:text-purple-400 font-medium">Response Rate</div>
              <div className="text-purple-900 dark:text-purple-100 font-bold text-lg">{userStats.responseRate}%</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900 p-3 rounded-lg">
              <div className="text-yellow-600 dark:text-yellow-400 font-medium">Rating</div>
              <div className="text-yellow-900 dark:text-yellow-100 font-bold text-lg">{userStats.averageRating}/5.0</div>
            </div>
          </div>
        </div>

        {/* Contact & Engagement Info */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Engagement Details</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Account Status:</span>
              <span className={`font-medium ${localUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {localUser.isActive ? 'Active & Verified' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg. Response Time:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.floor(Math.random() * 4) + 1}h {Math.floor(Math.random() * 60)}m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Timezone:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </span>
            </div>
            {localUser.role !== Role.ADMIN && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {localUser.role === Role.MENTOR ? 'Mentees Guided:' : 'Mentors Connected:'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.floor(Math.random() * 15) + 1}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simple Admin Actions */}
      {isAdmin && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Admin Actions
          </h3>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleStatus}
              disabled={loading}
            >
              {localUser.isActive ? 'Disable' : 'Enable'}
            </Button>
            {localUser.role !== Role.ADMIN && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleChangeRole(getNextRole(localUser.role))}
                disabled={loading}
              >
                Change to {getNextRole(localUser.role)}
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              onClick={handleRemoveUser}
              disabled={loading}
            >
              Remove User
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};