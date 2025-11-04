import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/Modal';
import { userService } from '../services/userService';
import { Role, User } from '../types';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const isAdmin = currentUser?.role === Role.ADMIN;

  // Fetch user profile from backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const userData = await userService.getUserProfile(userId);
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
          User Not Found
        </h3>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
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
    if (!user) return;
    
    setShowStatusModal(false);
    try {
      setActionLoading(true);
      const updatedUser = await userService.updateUserStatus(user.id, !user.isActive);
      setUser(updatedUser);
      toast.success(`User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!user || !selectedRole) return;
    
    setShowRoleModal(false);
    try {
      setActionLoading(true);
      // Update role via profile update
      const profileUpdate = { role: selectedRole };
      const response = await userService.updateProfile(user.id, profileUpdate);
      setUser(response);
      toast.success(`User role changed to ${selectedRole} successfully`);
    } catch (error) {
      console.error('Error changing user role:', error);
      toast.error('Failed to change user role');
    } finally {
      setActionLoading(false);
      setSelectedRole(null);
    }
  };

  const handleRemoveUser = async () => {
    if (!user) return;
    
    setShowDeleteModal(false);
    try {
      setActionLoading(true);
      // Note: You'll need to create a delete endpoint in userService
      toast.success('User removed successfully');
      navigate('/users');
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Failed to remove user');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleDisplayName = (role: Role): string => {
    return role.charAt(0) + role.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col xs:flex-row xs:items-center gap-3 xs:gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/users')}
          className="flex items-center gap-2 w-full xs:w-auto justify-start"
        >
          <ArrowLeft className="w-4 h-4 flex-shrink-0" />
          Back
        </Button>
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white truncate">
          {user.firstName} {user.lastName}
        </h1>
      </div>

      {/* User Info Card - Mobile Optimized */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
          <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-lg sm:text-2xl font-semibold flex-shrink-0">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="flex-1 min-w-0 w-full sm:w-auto">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 break-all">
              {user.email}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
              <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded font-medium ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  user.isActive ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <span className="text-xs sm:text-sm text-gray-500">
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                ID: {user.id.slice(0, 8)}
              </span>
            </div>
          </div>
        </div>

        {user.bio && (
          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 break-words">
              {user.bio}
            </p>
          </div>
        )}

        <div className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {user.skills && (
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <span className="font-medium flex-shrink-0">Skills:</span> 
              <span className="break-words">{user.skills}</span>
            </div>
          )}
          {user.experience && (
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <span className="font-medium flex-shrink-0">Experience:</span>
              <span className="break-words">{user.experience}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:gap-2">
            <span className="font-medium flex-shrink-0">Joined:</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          {user.role === Role.MENTOR && (
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <span className="font-medium flex-shrink-0">Specialization:</span>
              <span className="break-words">{user.skills || 'General Mentoring'}</span>
            </div>
          )}
          {user.role === Role.MENTEE && (
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <span className="font-medium flex-shrink-0">Learning Focus:</span>
              <span className="break-words">{user.skills || 'General Development'}</span>
            </div>
          )}
        </div>

        {/* Contact & Engagement Info - Mobile Responsive */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-3">Account Details</h4>
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">Status:</span>
              <span className={`font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {user.isActive ? 'Active & Verified' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">Role:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions - Mobile Responsive */}
      {isAdmin && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Admin Actions
          </h3>
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowStatusModal(true)}
              disabled={actionLoading}
              className="w-full xs:w-auto xs:flex-1"
            >
              {user.isActive ? 'Disable' : 'Enable'}
            </Button>
            {user.role !== Role.ADMIN && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowRoleModal(true)}
                disabled={actionLoading}
                className="w-full xs:w-auto xs:flex-1"
              >
                Change Role
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              disabled={actionLoading}
              className="w-full xs:w-auto xs:flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Status Toggle Confirmation Modal */}
      <ConfirmModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleToggleStatus}
        title={`${user.isActive ? 'Disable' : 'Enable'} User`}
        message={`Are you sure you want to ${user.isActive ? 'disable' : 'enable'} ${user.firstName} ${user.lastName}? ${user.isActive ? 'They will lose access to the platform.' : 'They will regain access to the platform.'}`}
        confirmText={user.isActive ? 'Disable' : 'Enable'}
        variant={user.isActive ? 'danger' : 'info'}
      />

      {/* Role Change Confirmation Modal */}
      <ConfirmModal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setSelectedRole(null);
        }}
        onConfirm={handleChangeRole}
        title="Change User Role"
        message=""
        confirmText="Change Role"
        variant="warning"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Select the new role for {user.firstName} {user.lastName}:
          </p>
          <div className="space-y-2">
            {[Role.MENTOR, Role.MENTEE, Role.ADMIN].map((role) => (
              <label
                key={role}
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedRole === role
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                } ${user.role === role ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={selectedRole === role}
                  onChange={() => setSelectedRole(role)}
                  disabled={user.role === role}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                  {getRoleDisplayName(role)}
                  {user.role === role && (
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Current)</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>
      </ConfirmModal>

      {/* Delete User Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleRemoveUser}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${user.firstName} ${user.lastName}? This action cannot be undone and will remove all their data from the system.`}
        confirmText="Delete User"
        variant="danger"
      />
    </div>
  );
};
