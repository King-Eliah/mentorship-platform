import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Mail } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { ListSkeleton, CardSkeleton } from '../ui/Skeleton';
import { PendingUser, Role, UserStatus } from '../../types';
import toast from 'react-hot-toast';

interface PendingUserManagerProps {
  onRefresh?: () => void;
}

export const PendingUserManager: React.FC<PendingUserManagerProps> = ({ onRefresh }) => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    setLoading(true);
    try {
      // Mock pending users data with different statuses
      const mockPendingUsers: PendingUser[] = [
        {
          id: '1',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          requestedRole: Role.MENTOR,
          bio: 'Experienced software engineer with 10+ years in tech',
          skills: 'JavaScript, React, Node.js, Python',
          experience: 'Senior Developer at TechCorp, Team Lead for 5 years',
          inviteCode: 'MENTOR-ABC123',
          status: UserStatus.PENDING,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'jane.smith@student.university.edu',
          firstName: 'Jane',
          lastName: 'Smith',
          requestedRole: Role.MENTEE,
          bio: 'Computer Science student passionate about web development',
          skills: 'HTML, CSS, JavaScript, Python basics',
          experience: 'Currently studying CS, completed several personal projects',
          status: UserStatus.PENDING,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          email: 'approved.user@example.com',
          firstName: 'Sarah',
          lastName: 'Johnson',
          requestedRole: Role.MENTOR,
          bio: 'Product manager with mentoring experience',
          skills: 'Product Management, UX, Leadership',
          experience: 'PM at StartupCo for 5 years',
          inviteCode: 'MENTOR-XYZ456',
          status: UserStatus.ACTIVE,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          email: 'rejected.user@example.com',
          firstName: 'Tom',
          lastName: 'Brown',
          requestedRole: Role.ADMIN,
          bio: 'Invalid request',
          skills: 'N/A',
          experience: 'N/A',
          inviteCode: 'INVALID-CODE',
          status: UserStatus.REJECTED,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setPendingUsers(mockPendingUsers);
    } catch {
      toast.error('Failed to load pending users');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId: string, action: 'approve' | 'reject', assignedRole?: Role) => {
    setProcessingId(userId);
    try {
      // Mock API call - in real implementation, would send request to backend
      // const request: AdminApprovalRequest = { userId, action, assignedRole, rejectionReason };
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (action === 'approve') {
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        toast.success(`User approved as ${assignedRole}`);
      } else {
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        toast.success('User registration rejected');
      }
      
      onRefresh?.();
    } catch {
      toast.error(`Failed to ${action} user`);
    } finally {
      setProcessingId(null);
    }
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case Role.MENTOR:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case Role.MENTEE:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTimeSinceRegistration = (dateString: string) => {
    const now = new Date();
    const registrationDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case UserStatus.ACTIVE:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case UserStatus.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredUsers = filter === 'all' 
    ? pendingUsers 
    : pendingUsers.filter(user => user.status === filter.toUpperCase());

  const counts = {
    pending: pendingUsers.filter(u => u.status === UserStatus.PENDING).length,
    approved: pendingUsers.filter(u => u.status === UserStatus.ACTIVE).length,
    rejected: pendingUsers.filter(u => u.status === UserStatus.REJECTED).length,
    all: pendingUsers.length,
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Approvals</h2>
          <p className="text-gray-600 dark:text-gray-400">Review and manage user registrations</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'pending', label: 'Pending', count: counts.pending },
          { id: 'approved', label: 'Approved', count: counts.approved },
          { id: 'rejected', label: 'Rejected', count: counts.rejected },
          { id: 'all', label: 'All', count: counts.all },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {loading ? (
        <ListSkeleton items={3} itemComponent={CardSkeleton} />
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No {filter} users</h3>
            <p className="text-gray-500">There are no users with this status</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* User Info - Compact */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.firstName} {user.lastName}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(user.requestedRole)}`}>
                          {user.requestedRole}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center truncate">
                          <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                          {user.email}
                        </span>
                        <span className="flex items-center flex-shrink-0">
                          <Clock className="w-3 h-3 mr-1" />
                          {getTimeSinceRegistration(user.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions - Only for pending */}
                  {user.status === UserStatus.PENDING && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        onClick={() => handleApproval(user.id, 'approve', user.requestedRole)}
                        disabled={processingId === user.id}
                        className="bg-green-600 hover:bg-green-700 text-xs px-3 py-1 h-8"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleApproval(user.id, 'reject')}
                        disabled={processingId === user.id}
                        variant="outline"
                        className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 text-xs px-3 py-1 h-8"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};