import { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  Mail,
  Loader2,
  Eye,
  Plus,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  LogOut,
  Send,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGroups, useJoinGroup, useLeaveGroup } from '../hooks/useGroups';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DropdownSelect } from '../components/ui/DropdownSelect';
import toast from 'react-hot-toast';
import { GroupStatus, Role } from '../types';
import { MentorGroup } from '../types';

export default function GroupsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    sortBy: 'groupName',
  });
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState<'group_change' | 'mentee_change'>('group_change');

  // Role-based permissions
  const canCreateGroup = user?.role === Role.ADMIN;
  const canRequestGroupChange = user?.role === Role.MENTEE;
  const canRequestMenteeChange = user?.role === Role.MENTOR;

  const {
    items: groups,
    loading: isLoading,
    error,
    refresh,
    loadPage,
    hasMore,
  } = useGroups(filters);

  const { mutate: joinGroup, loading: joinLoading } = useJoinGroup();
  const { mutate: leaveGroup, loading: leaveLoading } = useLeaveGroup();

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroup(groupId);
      toast.success('Successfully joined group!');
      refresh();
    } catch (e) {
      // Error is already handled by the hook
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        await leaveGroup(groupId);
        toast.success('Successfully left group.');
        refresh();
      } catch (e) {
        // Error is already handled by the hook
      }
    }
  };

  const isUserInGroup = (group: MentorGroup) => {
    return group.members?.some(member => member.id === user?.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case GroupStatus.ACTIVE: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case GroupStatus.INACTIVE: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case GroupStatus.COMPLETED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case GroupStatus.ACTIVE: return <CheckCircle className="h-4 w-4 text-green-500" />;
      case GroupStatus.INACTIVE: return <Clock className="h-4 w-4 text-gray-500" />;
      case GroupStatus.COMPLETED: return <Star className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading && groups.length === 0) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to Load Groups</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
        <Button onClick={refresh}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">Mentorship Groups</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {user?.role === Role.ADMIN 
              ? 'Create and manage all mentorship groups in your organization'
              : 'View mentorship groups and request changes'
            }
          </p>
        </div>
        <div className="flex gap-3">
          {canCreateGroup && (
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Group
            </Button>
          )}
          
          {canRequestGroupChange && (
            <Button 
              variant="outline"
              onClick={() => {
                setRequestType('group_change');
                setShowRequestModal(true);
              }}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Request Group Change
            </Button>
          )}
          
          {canRequestMenteeChange && (
            <Button 
              variant="outline"
              onClick={() => {
                setRequestType('mentee_change');
                setShowRequestModal(true);
              }}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Request Mentee Change
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Search groups, mentors, or skills..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <DropdownSelect
              placeholder="Filter by status"
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              options={[
                { value: 'all', label: 'All Status', icon: <Star className="w-4 h-4" />, description: 'Show all groups' },
                { value: GroupStatus.ACTIVE, label: 'Active', icon: <CheckCircle className="w-4 h-4" />, description: 'Currently active groups' },
                { value: GroupStatus.INACTIVE, label: 'Inactive', icon: <Clock className="w-4 h-4" />, description: 'Inactive groups' },
                { value: GroupStatus.COMPLETED, label: 'Completed', icon: <Star className="w-4 h-4" />, description: 'Completed groups' },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {groups.length} groups found
            </span>
          </div>
        </div>
      </Card>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(groups as MentorGroup[]).map((group) => (
          <Card key={group.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
            <div className="p-6 flex-grow">
              {/* Group Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(group.status || 'active')}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(group.status || 'active')}`}>
                      {group.status || 'active'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Created</div>
                  <div className="text-sm font-medium">{formatDate(group.createdAt)}</div>
                </div>
              </div>

              {/* Description */}
              {group.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {group.description}
                </p>
              )}

              {/* Mentor Info */}
              {group.mentor && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Mentor</span>
                  </div>
                  <div className="ml-6">
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">{group.mentorName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {/* Mentor email is not available in this context */}
                    </div>
                  </div>
                </div>
              )}

              {/* Mentees */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Mentees</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {group.members?.length || 0} members
                  </span>
                </div>
              </div>

              {/* Shared Skills */}
              {group.sharedSkills && group.sharedSkills.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Shared Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {group.sharedSkills.slice(0, 3).map((skill: string, i: number) => (
                      <span key={i} className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                    {group.sharedSkills.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                        +{group.sharedSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 p-4 border-t border-gray-100 dark:border-gray-700">
              <Button size="sm" variant="ghost" className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20">
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              {isUserInGroup(group) ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleLeaveGroup(group.id)}
                  disabled={leaveLoading}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  {leaveLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <LogOut className="h-3 w-3 mr-1" />}
                  Leave
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleJoinGroup(group.id)}
                  disabled={joinLoading}
                  className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                >
                  {joinLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3 mr-1" />}
                  Join
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-6">
          <Button onClick={() => loadPage(groups.length / 20)} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {groups.length === 0 && !isLoading && (
        <Card className="p-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No groups found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {filters.search || filters.status !== 'all'
                ? 'Try adjusting your search filters'
                : 'Get started by creating your first mentorship group'}
            </p>
            {canCreateGroup && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create First Group
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {requestType === 'group_change' ? 'Request Group Change' : 'Request Mentee Change'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {requestType === 'group_change' 
                ? 'Submit a request to change your current group assignment.'
                : 'Submit a request to change your assigned mentee.'
              }
            </p>
            <textarea
              placeholder="Please explain your request..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <Button 
                onClick={() => {
                  toast.success('Request submitted successfully!');
                  setShowRequestModal(false);
                }}
                className="flex-1"
              >
                Submit Request
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowRequestModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
