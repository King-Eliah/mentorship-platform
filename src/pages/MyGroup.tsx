import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, MessageSquare, RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { DetailsModal } from '../components/ui/DetailsModal';
import { User, Role } from '../types';
import { groupService } from '../services/groupService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const MyGroup: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for modals and UI
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: myGroups = [], isLoading } = useQuery({
    queryKey: ['my-groups'],
    queryFn: () => groupService.getMyGroups()
  });

  const group = myGroups[0] || null;

  const handleViewMember = (member: User) => {
    setSelectedMember(member);
    setShowDetailsModal(true);
  };

  const handleMessageUser = (userId: string, userName: string) => {
    // Navigate to messaging page with the user pre-selected
    navigate(`/messages?userId=${userId}`);
    toast.success(`Opening chat with ${userName}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Group Assigned
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {user?.role === Role.MENTOR 
            ? 'You haven\'t been assigned a mentoring group yet. Contact your administrator.'
            : 'You haven\'t been assigned to a mentoring group yet. Contact your administrator.'
          }
        </p>
      </div>
    );
  }

  // Get mentor and mentees
  const mentor = group.mentor;
  const mentees = group.mentees || group.members || [];
  const isMentor = user?.id === group.mentorId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{group.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {group.description || 'Your mentoring group'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mentor Card - Always shown to mentees */}
          {!isMentor && mentor && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Mentor</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {mentor.firstName.charAt(0)}{mentor.lastName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {mentor.firstName} {mentor.lastName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{mentor.email}</p>
                    {mentor.skills && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        <span className="font-medium">Skills:</span> {mentor.skills}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleViewMember(mentor)}
                      variant="outline"
                    >
                      View Profile
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleMessageUser(mentor.id, `${mentor.firstName} ${mentor.lastName}`)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mentees Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isMentor ? 'Your Mentees' : 'Other Mentees'} ({mentees.length})
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {mentees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No mentees in this group yet
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mentees
                    .filter(mentee => {
                      const fullName = `${mentee.firstName} ${mentee.lastName}`.toLowerCase();
                      const email = mentee.email.toLowerCase();
                      const query = searchQuery.toLowerCase();
                      return fullName.includes(query) || email.includes(query) || mentee.id.includes(query);
                    })
                    .map((mentee) => (
                      <div
                        key={mentee.id}
                        className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {mentee.firstName.charAt(0)}{mentee.lastName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {mentee.firstName} {mentee.lastName}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {mentee.email}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            ID: {mentee.id}
                          </p>
                          {mentee.skills && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 truncate mt-1">
                              {mentee.skills}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewMember(mentee)}
                            className="text-xs"
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleMessageUser(mentee.id, `${mentee.firstName} ${mentee.lastName}`)}
                            className="bg-primary-600 hover:bg-primary-700 text-xs"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Group Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Group Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your Role</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {isMentor ? '👨‍🏫 Mentor' : '👨‍🎓 Mentee'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Group Size</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {mentees.length + 1} members
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-base font-medium text-green-600 dark:text-green-400">
                  {group.isActive ? '✓ Active' : '✗ Inactive'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Messaging Guide
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                  How to Message
                </h4>
                <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                  <li>• Click "Chat" button next to any member</li>
                  <li>• Search by member ID in the messaging page</li>
                  <li>• Use the search bar to find members quickly</li>
                </ul>
              </div>
              
              <Button
                className="w-full"
                onClick={() => navigate('/messages')}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Go to Messages
              </Button>
            </CardContent>
          </Card>

          {/* Group Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Group Statistics
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Total Mentees</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {mentees.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Active Members</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {mentees.filter(m => m.isActive).length + (mentor?.isActive ? 1 : 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Created</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(group.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <DetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedMember(null);
          }}
          data={selectedMember}
          type="user"
        />
      )}
    </div>
  );
};