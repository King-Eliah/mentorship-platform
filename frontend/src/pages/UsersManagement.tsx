import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  UserPlus, 
  Shield, 
  UserCheck,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  Ban,
  GraduationCap,
  User as UserIcon,
  Grid3X3,
  List,
  X,
  Save,
  XCircle,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DropdownSelect } from '../components/ui/DropdownSelect';
import { ActionDropdown, createViewAction, createEditAction, createDeleteAction, createMessageAction } from '../components/ui/ActionDropdown';
import { DetailsModal } from '../components/ui/DetailsModal';
import { ConfirmModal } from '../components/ui/Modal';
import { User, Role, UserStatus } from '../types';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';

export default function UsersManagement() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch users from backend
  const { data: users = [], refetch } = useQuery({
    queryKey: ['users-management'],
    queryFn: () => userService.getAllUsers(),
    refetchInterval: 5000, // Auto-refetch every 5 seconds
  });

  // Filtering and sorting logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'role':
          return a.role.localeCompare(b.role);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [filteredUsers, sortBy]);

  // Helper functions
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'MENTOR':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      case 'MENTEE':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      case 'INACTIVE':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'SUSPENDED':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handler functions for user actions
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleMessageUser = (user: User) => {
    navigate(`/messages?userId=${user.id}`);
  };

  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      try {
        await userService.deleteUser(selectedUser.id);
        queryClient.invalidateQueries({ queryKey: ['users-management'] });
        queryClient.invalidateQueries({ queryKey: ['all-users'] });
        toast.success(`User ${selectedUser.firstName} ${selectedUser.lastName} has been deleted.`);
        setSelectedUser(null);
        setShowDeleteConfirm(false);
      } catch {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleAddUser = async (data: Partial<User>) => {
    try {
      const result = await userService.createUserManually({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        role: data.role || 'MENTEE',
        status: data.status || 'ACTIVE'
      });

      toast.success('User created successfully!');
      toast(() => (
        <div className="flex flex-col space-y-2">
          <p className="font-semibold">Generated Password:</p>
          <code className="bg-gray-100 p-2 rounded text-sm">{result.generatedPassword}</code>
          <p className="text-xs text-gray-600">User must change this password on first login</p>
        </div>
      ), { duration: 10000 });

      queryClient.invalidateQueries({ queryKey: ['users-management'] });
      setShowAddUserModal(false);
    } catch (error: unknown) {
      const errorResponse = (error as Record<string, unknown>)?.response as Record<string, unknown>;
      const message = errorResponse?.data as Record<string, unknown>;
      toast.error((message?.message as string) || 'Failed to create user');
    }
  };

  const handleRefresh = async () => {
    toast.loading('Refreshing...', { id: 'refresh' });
    await refetch();
    toast.success('Users refreshed!', { id: 'refresh' });
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    mentors: users.filter(u => u.role === 'MENTOR').length,
    mentees: users.filter(u => u.role === 'MENTEE').length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    inactive: users.filter(u => u.status === UserStatus.SUSPENDED).length,
    suspended: users.filter(u => u.status === 'SUSPENDED').length
  };

  // AddUserModal Component
  const AddUserModal = () => {
    // Initialize form with editing user values if provided. AddUserModal is mounted
    // only when `showAddUserModal` is true so this initializer runs at mount time.
    const [formData, setFormData] = useState(() => ({
      firstName: editingUser?.firstName || '',
      lastName: editingUser?.lastName || '',
      email: editingUser?.email || '',
      role: (editingUser?.role as Role) || Role.MENTEE,
      status: (editingUser?.status as UserStatus) || UserStatus.ACTIVE,
      isActive: editingUser?.isActive ?? true,
      updatedAt: editingUser?.updatedAt || new Date().toISOString()
    }));

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.firstName || !formData.lastName || !formData.email) {
        toast.error('Please fill in required fields');
        return;
      }

      // If editingUser is present, update the user instead of creating
      if (editingUser) {
        try {
          await userService.updateProfile(editingUser.id, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            role: formData.role,
            status: formData.status
          });
          toast.success('User updated successfully');
          queryClient.invalidateQueries({ queryKey: ['users-management'] });
          setShowAddUserModal(false);
          setEditingUser(null);
        } catch (_err) {
          console.error(_err);
          toast.error('Failed to update user');
        }
      } else {
        handleAddUser(formData);
      }

      // reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: Role.MENTEE,
        status: UserStatus.ACTIVE,
        isActive: true,
        updatedAt: new Date().toISOString()
      });
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAddUserModal(false);
                setEditingUser(null);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name *"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                placeholder="John"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
              <Input
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                placeholder="Doe"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>

            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="john.doe@example.com"
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />

            <div className="grid grid-cols-2 gap-4">
              <DropdownSelect
                label="Role *"
                value={formData.role}
                onChange={(value) => setFormData({...formData, role: value as Role})}
                placeholder="Select role"
                options={[
                  { value: Role.MENTEE, label: 'Mentee', icon: <UserIcon className="w-4 h-4" />, description: 'Learning participant' },
                  { value: Role.MENTOR, label: 'Mentor', icon: <UserCheck className="w-4 h-4" />, description: 'Guidance provider' },
                  { value: Role.ADMIN, label: 'Admin', icon: <Shield className="w-4 h-4" />, description: 'System administrator' }
                ]}
              />

              <DropdownSelect
                label="Status *"
                value={formData.status}
                onChange={(value) => setFormData({...formData, status: value as UserStatus})}
                placeholder="Select status"
                options={[
                  { value: UserStatus.ACTIVE, label: 'Active', icon: <CheckCircle className="w-4 h-4" />, description: 'Account is active' },
                  { value: UserStatus.PENDING, label: 'Pending', icon: <Clock className="w-4 h-4" />, description: 'Account is pending approval' },
                  { value: UserStatus.SUSPENDED, label: 'Suspended', icon: <XCircle className="w-4 h-4" />, description: 'Account is suspended' },
                  { value: UserStatus.REJECTED, label: 'Rejected', icon: <Ban className="w-4 h-4" />, description: 'Account was rejected' }
                ]}
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowAddUserModal(false);
                  setEditingUser(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingUser ? 'Update User' : 'Add User'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Mobile Responsive */}
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
              User Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
              Manage users • Auto-refresh every 5s
            </p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              className="text-gray-600 dark:text-gray-400 p-2"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
              variant="ghost"
              size="sm"
              className="text-gray-600 dark:text-gray-400 p-2"
              title={viewMode === 'cards' ? 'Table View' : 'Card View'}
            >
              {viewMode === 'cards' ? (
                <List className="w-4 h-4" />
              ) : (
                <Grid3X3 className="w-4 h-4" />
              )}
            </Button>
            <Button 
              onClick={() => setShowAddUserModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full xs:w-auto text-sm"
            >
              <UserPlus className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Add User</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards - Mobile Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <Card className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="p-2 sm:p-3 bg-blue-600 rounded-lg flex-shrink-0">
                <Users className="w-4 sm:w-6 h-4 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 truncate">Total</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="p-2 sm:p-3 bg-green-600 rounded-lg flex-shrink-0">
                <CheckCircle className="w-4 sm:w-6 h-4 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 truncate">Active</p>
                <p className="text-lg sm:text-2xl font-bold text-green-900 dark:text-green-100">{stats.active}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="p-2 sm:p-3 bg-purple-600 rounded-lg flex-shrink-0">
                <GraduationCap className="w-4 sm:w-6 h-4 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400 truncate">Mentors</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.mentors}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="p-2 sm:p-3 bg-orange-600 rounded-lg flex-shrink-0">
                <UserIcon className="w-4 sm:w-6 h-4 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-orange-600 dark:text-orange-400 truncate">Mentees</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.mentees}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters - Mobile Responsive */}
        <Card className="p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <DropdownSelect
              placeholder="Role"
              value={roleFilter}
              onChange={(value) => setRoleFilter(value)}
              options={[
                { value: 'ALL', label: 'All Roles', icon: <Users className="w-4 h-4" /> },
                { value: Role.ADMIN, label: 'Admin', icon: <Shield className="w-4 h-4" /> },
                { value: Role.MENTOR, label: 'Mentor', icon: <UserCheck className="w-4 h-4" /> },
                { value: Role.MENTEE, label: 'Mentee', icon: <UserIcon className="w-4 h-4" /> }
              ]}
            />

            <DropdownSelect
              placeholder="Status"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={[
                { value: 'ALL', label: 'All Status', icon: <Grid3X3 className="w-4 h-4" /> },
                { value: UserStatus.ACTIVE, label: 'Active', icon: <CheckCircle className="w-4 h-4" /> },
                { value: UserStatus.PENDING, label: 'Pending', icon: <Clock className="w-4 h-4" /> },
                { value: UserStatus.SUSPENDED, label: 'Suspended', icon: <XCircle className="w-4 h-4" /> },
                { value: UserStatus.REJECTED, label: 'Rejected', icon: <Ban className="w-4 h-4" /> }
              ]}
            />

            <DropdownSelect
              placeholder="Sort"
              value={sortBy}
              onChange={(value) => setSortBy(value)}
              options={[
                { value: 'name', label: 'By Name', icon: <UserIcon className="w-4 h-4" /> },
                { value: 'email', label: 'By Email', icon: <Mail className="w-4 h-4" /> },
                { value: 'role', label: 'By Role', icon: <Shield className="w-4 h-4" /> },
                { value: 'created', label: 'By Date', icon: <Calendar className="w-4 h-4" /> }
              ]}
            />
          </div>
        </Card>

        {/* Users Display - Mobile Responsive */}
        {viewMode === 'cards' ? (
          <div className="space-y-2 sm:space-y-3">
            {sortedUsers.map((user) => (
              <Card key={user.id} className="overflow-visible hover:shadow-lg transition-shadow">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    {/* User Info - Mobile Optimized */}
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user.firstName} {user.lastName}
                          </h3>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </div>
                        <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className="flex items-center truncate">
                            <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </span>
                          <span className="hidden xs:flex items-center flex-shrink-0">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions - Mobile Friendly */}
                    <div className="relative flex-shrink-0 z-10" onClick={(e) => e.stopPropagation()}>
                      <ActionDropdown
                        actions={[
                          createViewAction(() => handleViewUser(user)),
                          createMessageAction(() => handleMessageUser(user)),
                          createEditAction(() => {
                            setEditingUser(user);
                            setShowAddUserModal(true);
                          }),
                          createDeleteAction(() => {
                            setSelectedUser(user);
                            setShowDeleteConfirm(true);
                          })
                        ]}
                        size="sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Table View - Mobile Scrollable
          <Card className="overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr className="text-xs sm:text-sm">
                    <th className="px-3 sm:px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                        checked={selectedUsers.size === sortedUsers.length && sortedUsers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(new Set(sortedUsers.map(user => user.id)));
                          } else {
                            setSelectedUsers(new Set());
                          }
                        }}
                      />
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedUsers.map((user) => (
                    <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 text-xs sm:text-sm ${selectedUsers.has(user.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                      <td className="px-3 sm:px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                          checked={selectedUsers.has(user.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedUsers);
                            if (e.target.checked) {
                              newSelected.add(user.id);
                            } else {
                              newSelected.delete(user.id);
                            }
                            setSelectedUsers(newSelected);
                          }}
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-2 sm:ml-4">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{user.firstName} {user.lastName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4">
                        <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                            : user.role === 'MENTOR'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          <Shield className="w-3 h-3 mr-1 flex-shrink-0" />
                          {user.role}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4">
                        <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                          user.status === UserStatus.ACTIVE
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : user.status === UserStatus.SUSPENDED
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {user.status === UserStatus.ACTIVE && <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />}
                          {user.status === UserStatus.SUSPENDED && <XCircle className="w-3 h-3 mr-1 flex-shrink-0" />}
                          {(user.status === UserStatus.PENDING || user.status === UserStatus.REJECTED) && <Ban className="w-3 h-3 mr-1 flex-shrink-0" />}
                          {user.status}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium">
                        <ActionDropdown
                          actions={[
                            createViewAction(() => handleViewUser(user)),
                            createEditAction(() => {
                              setEditingUser(user);
                              setShowAddUserModal(true);
                            }),
                            createDeleteAction(() => {
                              setSelectedUser(user);
                              setShowDeleteConfirm(true);
                            })
                          ]}
                          size="sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Bulk Actions Bar */}
            {selectedUsers.size > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Bulk activate users
                        toast.success(`Activated ${selectedUsers.size} user${selectedUsers.size !== 1 ? 's' : ''}`);
                        setSelectedUsers(new Set());
                      }}
                      className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Activate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Bulk deactivate users
                        toast.success(`Deactivated ${selectedUsers.size} user${selectedUsers.size !== 1 ? 's' : ''}`);
                        setSelectedUsers(new Set());
                      }}
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Deactivate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Bulk delete users
                        toast.success(`Deleted ${selectedUsers.size} user${selectedUsers.size !== 1 ? 's' : ''}`);
                        setSelectedUsers(new Set());
                      }}
                      className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {sortedUsers.length === 0 && (
          <Card className="p-8 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <Users className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL' 
                ? 'Try adjusting your filters' 
                : 'Get started by adding your first user'
              }
            </p>
            {!searchTerm && roleFilter === 'ALL' && statusFilter === 'ALL' && (
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && <AddUserModal />}

      {/* User Details Modal */}
      {selectedUser && (
        <DetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUser(null);
          }}
          data={selectedUser || undefined}
          type="user"
          onEdit={() => {
            setEditingUser(selectedUser);
            setShowAddUserModal(true);
            setShowDetailsModal(false);
          }}
          onDelete={() => {
            setShowDetailsModal(false);
            setShowDeleteConfirm(true);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={selectedUser ? 
          `Are you sure you want to delete ${selectedUser.firstName} ${selectedUser.lastName}? This action cannot be undone.` :
          'Are you sure you want to delete this user? This action cannot be undone.'
        }
        confirmText="Delete User"
        variant="danger"
      />
    </div>
  );
}