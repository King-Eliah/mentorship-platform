import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Shuffle, Trash2, Eye } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal, ConfirmModal } from '../ui/Modal';
import { Role, UserStatus, MentorGroup, User } from '../../types';
import { groupService } from '../../services/groupService';
import { frontendService } from '../../services/frontendService';
import toast from 'react-hot-toast';

export const GroupManagement: React.FC = () => {
  const queryClient = useQueryClient();
  
  // State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<MentorGroup | null>(null);
  const [viewingGroup, setViewingGroup] = useState<MentorGroup | null>(null);
  
  // Manual group creation state
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMentor, setSelectedMentor] = useState('');
  const [selectedMentees, setSelectedMentees] = useState<string[]>([]);
  const [maxMembers, setMaxMembers] = useState(10);
  
  // Random group creation state
  const [menteesPerMentor, setMenteesPerMentor] = useState(3);
  const [selectedMentorsForRandom, setSelectedMentorsForRandom] = useState<string[]>([]);
  const [selectedMenteesForRandom, setSelectedMenteesForRandom] = useState<string[]>([]);
  const [useAllMentors, setUseAllMentors] = useState(true);
  const [useAllMentees, setUseAllMentees] = useState(true);

  // Queries
  const { data: groups = [], isLoading: loadingGroups } = useQuery({
    queryKey: ['admin-groups'],
    queryFn: () => groupService.getGroups()
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => frontendService.getUsers()
  });

  const mentors = allUsers.filter((u: User) => u.role === Role.MENTOR && u.status === UserStatus.ACTIVE);
  const mentees = allUsers.filter((u: User) => u.role === Role.MENTEE && u.status === UserStatus.ACTIVE);

  // Mutations
  const createGroupMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; mentorId: string; menteeIds: string[]; maxMembers?: number }) =>
      groupService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      setShowCreateModal(false);
      resetManualForm();
      toast.success('Group created successfully!');
    },
    onError: () => {
      toast.error('Failed to create group');
    }
  });

  const createRandomGroupsMutation = useMutation({
    mutationFn: (data: { menteesPerMentor: number; mentorIds?: string[]; menteeIds?: string[] }) =>
      groupService.createGroupsRandomly(data),
    onSuccess: (data: MentorGroup[]) => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      setShowRandomModal(false);
      resetRandomForm();
      toast.success(`${data.length} groups created successfully!`);
    },
    onError: () => {
      toast.error('Failed to create random groups');
    }
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: string) => groupService.deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      setShowDeleteConfirm(false);
      setSelectedGroup(null);
      toast.success('Group deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete group');
    }
  });

  // Helper functions
  const resetManualForm = () => {
    setGroupName('');
    setGroupDescription('');
    setSelectedMentor('');
    setSelectedMentees([]);
    setMaxMembers(10);
  };

  const resetRandomForm = () => {
    setMenteesPerMentor(3);
    setSelectedMentorsForRandom([]);
    setSelectedMenteesForRandom([]);
    setUseAllMentors(true);
    setUseAllMentees(true);
  };

  const handleCreateManualGroup = () => {
    if (!groupName.trim()) {
      toast.error('Group name is required');
      return;
    }
    if (!selectedMentor) {
      toast.error('Please select a mentor');
      return;
    }
    if (selectedMentees.length === 0) {
      toast.error('Please select at least one mentee');
      return;
    }

    createGroupMutation.mutate({
      name: groupName,
      description: groupDescription,
      mentorId: selectedMentor,
      menteeIds: selectedMentees,
      maxMembers
    });
  };

  const handleCreateRandomGroups = () => {
    if (menteesPerMentor < 1) {
      toast.error('Mentees per mentor must be at least 1');
      return;
    }

    const mentorIds = useAllMentors ? undefined : selectedMentorsForRandom;
    const menteeIds = useAllMentees ? undefined : selectedMenteesForRandom;

    if (!useAllMentors && mentorIds?.length === 0) {
      toast.error('Please select at least one mentor');
      return;
    }
    if (!useAllMentees && menteeIds?.length === 0) {
      toast.error('Please select at least one mentee');
      return;
    }

    createRandomGroupsMutation.mutate({
      menteesPerMentor,
      mentorIds,
      menteeIds
    });
  };

  const toggleMenteeSelection = (menteeId: string) => {
    setSelectedMentees(prev =>
      prev.includes(menteeId)
        ? prev.filter(id => id !== menteeId)
        : [...prev, menteeId]
    );
  };

  const toggleMentorForRandom = (mentorId: string) => {
    setSelectedMentorsForRandom(prev =>
      prev.includes(mentorId)
        ? prev.filter(id => id !== mentorId)
        : [...prev, mentorId]
    );
  };

  const toggleMenteeForRandom = (menteeId: string) => {
    setSelectedMenteesForRandom(prev =>
      prev.includes(menteeId)
        ? prev.filter(id => id !== menteeId)
        : [...prev, menteeId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Group Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Create and manage mentoring groups</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowRandomModal(true)}
            variant="secondary"
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Create Random Groups
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Manual Group
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Groups</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{groups.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Available Mentors</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{mentors.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Available Mentees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{mentees.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Groups</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {groups.filter((g: MentorGroup) => g.isActive).length}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Groups</h3>
        </CardHeader>
        <CardContent>
          {loadingGroups ? (
            <div className="text-center py-8 text-gray-500">Loading groups...</div>
          ) : groups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No groups created yet</div>
          ) : (
            <div className="space-y-4">
              {groups.map((group: MentorGroup) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{group.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Mentor: {group.mentorName || 'Unknown'} | Mentees: {group.menteeIds?.length || 0}
                    </p>
                    {group.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{group.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setViewingGroup(group)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowDeleteConfirm(true);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Create Group Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetManualForm();
        }}
        title="Create Manual Group"
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Group Name *
            </label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="Enter group description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Mentor *
              </label>
              <Select
                value={selectedMentor}
                onChange={(e) => setSelectedMentor(e.target.value)}
                options={[
                  { value: '', label: 'Choose a mentor...' },
                  ...mentors.map((m: User) => ({
                    value: m.id,
                    label: `${m.firstName} ${m.lastName} (${m.email})`
                  }))
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Members
              </label>
              <Input
                type="number"
                min="2"
                value={maxMembers}
                onChange={(e) => setMaxMembers(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Mentees * ({selectedMentees.length} selected)
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-md p-3 max-h-64 overflow-y-auto bg-white dark:bg-gray-700">
              {mentees.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No mentees available</p>
              ) : (
                <div className="space-y-2">
                  {mentees.map((mentee: User) => (
                    <label
                      key={mentee.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMentees.includes(mentee.id)}
                        onChange={() => toggleMenteeSelection(mentee.id)}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {mentee.firstName} {mentee.lastName} ({mentee.email})
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                resetManualForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateManualGroup}
              disabled={createGroupMutation.isPending}
            >
              {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Random Groups Modal */}
      <Modal
        isOpen={showRandomModal}
        onClose={() => {
          setShowRandomModal(false);
          resetRandomForm();
        }}
        title="Create Random Groups"
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mentees per Mentor *
            </label>
            <Input
              type="number"
              min="1"
              max="20"
              value={menteesPerMentor}
              onChange={(e) => setMenteesPerMentor(parseInt(e.target.value))}
              placeholder="Enter number of mentees per mentor"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will create groups with {menteesPerMentor} mentee(s) assigned to each mentor
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mentors
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAllMentors}
                  onChange={(e) => setUseAllMentors(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Use all mentors</span>
              </label>
            </div>

            {!useAllMentors && (
              <div className="border border-gray-300 dark:border-gray-600 rounded-md p-3 max-h-48 overflow-y-auto bg-white dark:bg-gray-700">
                {mentors.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No mentors available</p>
                ) : (
                  <div className="space-y-2">
                    {mentors.map((mentor: User) => (
                      <label
                        key={mentor.id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMentorsForRandom.includes(mentor.id)}
                          onChange={() => toggleMentorForRandom(mentor.id)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {mentor.firstName} {mentor.lastName}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mentees
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAllMentees}
                  onChange={(e) => setUseAllMentees(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Use all mentees</span>
              </label>
            </div>

            {!useAllMentees && (
              <div className="border border-gray-300 dark:border-gray-600 rounded-md p-3 max-h-48 overflow-y-auto bg-white dark:bg-gray-700">
                {mentees.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No mentees available</p>
                ) : (
                  <div className="space-y-2">
                    {mentees.map((mentee: User) => (
                      <label
                        key={mentee.id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMenteesForRandom.includes(mentee.id)}
                          onChange={() => toggleMenteeForRandom(mentee.id)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {mentee.firstName} {mentee.lastName}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowRandomModal(false);
                resetRandomForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRandomGroups}
              disabled={createRandomGroupsMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-purple-600"
            >
              {createRandomGroupsMutation.isPending ? 'Creating...' : 'Create Random Groups'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Group Details Modal */}
      {viewingGroup && (
        <Modal
          isOpen={!!viewingGroup}
          onClose={() => setViewingGroup(null)}
          title={viewingGroup.name}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h4>
              <p className="text-gray-900 dark:text-white">{viewingGroup.description || 'No description'}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mentor</h4>
              <p className="text-gray-900 dark:text-white">{viewingGroup.mentorName || 'Unknown'}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mentees ({viewingGroup.mentees?.length || 0})
              </h4>
              <div className="space-y-2">
                {viewingGroup.mentees && viewingGroup.mentees.length > 0 ? (
                  viewingGroup.mentees.map(mentee => (
                    <div key={mentee.id} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {mentee.firstName.charAt(0)}{mentee.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {mentee.firstName} {mentee.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{mentee.email}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No mentees assigned</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setViewingGroup(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedGroup(null);
        }}
        onConfirm={() => selectedGroup && deleteGroupMutation.mutate(selectedGroup.id)}
        title="Delete Group"
        message={`Are you sure you want to delete "${selectedGroup?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
