import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { User } from '../../types';
import { Users, Plus, X, Settings, Save, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: GroupSettings) => Promise<void>;
  onDelete: () => Promise<void>;
  group: Group;
  availableUsers?: User[];
}

interface Group {
  id: string;
  name: string;
  description: string;
  maxMembers: number;
  isPrivate: boolean;
  category: string;
  members: User[];
  mentorId: string;
}

interface GroupSettings {
  name: string;
  description: string;
  maxMembers: number;
  isPrivate: boolean;
  category: string;
  memberIds: string[];
}

export const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  group,
  availableUsers = [],
}) => {
  const [formData, setFormData] = useState<GroupSettings>({
    name: '',
    description: '',
    maxMembers: 10,
    isPrivate: false,
    category: 'general',
    memberIds: [],
  });
  
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'danger'>('general');

  useEffect(() => {
    if (group && isOpen) {
      setFormData({
        name: group.name,
        description: group.description || '',
        maxMembers: group.maxMembers,
        isPrivate: group.isPrivate,
        category: group.category,
        memberIds: group.members.map(m => m.id),
      });
      setSelectedUsers(group.members);
    }
  }, [group, isOpen]);

  const filteredUsers = availableUsers.filter(user =>
    !selectedUsers.find(selected => selected.id === user.id) &&
    (`${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    if (formData.maxMembers < selectedUsers.length) {
      toast.error(`Max members cannot be less than current member count (${selectedUsers.length})`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        memberIds: selectedUsers.map(user => user.id),
      });
      toast.success('Group settings updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Failed to update group settings. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDelete();
      toast.success('Group deleted successfully!');
      onClose();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  const addUser = (user: User) => {
    if (selectedUsers.length < formData.maxMembers) {
      setSelectedUsers([...selectedUsers, user]);
    } else {
      toast.error('Maximum member limit reached');
    }
  };

  const removeUser = (userId: string) => {
    // Don't allow removing the mentor/creator
    if (userId === group.mentorId) {
      toast.error('Cannot remove group creator');
      return;
    }
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Group Settings" maxWidth="2xl">
      <div className="flex h-96">
        {/* Sidebar */}
        <div className="w-48 border-r border-gray-200 dark:border-gray-700 pr-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 pl-6">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">General Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Group Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter group name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category
                      </label>
                      <Select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        options={[
                          { value: 'general', label: 'General' },
                          { value: 'technical', label: 'Technical' },
                          { value: 'career', label: 'Career Development' },
                          { value: 'project', label: 'Project-based' },
                          { value: 'study', label: 'Study Group' },
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the group's purpose and goals..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max Members
                      </label>
                      <Input
                        type="number"
                        min={selectedUsers.length}
                        max="100"
                        value={formData.maxMembers}
                        onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        checked={formData.isPrivate}
                        onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Private Group
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Manage Members ({selectedUsers.length}/{formData.maxMembers})
                    </h3>
                  </div>
                  
                  <div>
                    <Input
                      type="search"
                      placeholder="Search users to add..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Current Members */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Members</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.firstName} {user.lastName}
                                {user.id === group.mentorId && (
                                  <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                    Creator
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          {user.id !== group.mentorId && (
                            <button
                              type="button"
                              onClick={() => removeUser(user.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Available Users */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Members</h4>
                    <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
                      {filteredUsers.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          {searchTerm ? 'No users found' : 'All available users are already members'}
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                              onClick={() => addUser(user)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {user.email} • {user.role}
                                    </p>
                                  </div>
                                </div>
                                <Plus className="h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'danger' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Danger Zone</h3>
                  
                  <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                          Delete Group
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          Once you delete a group, there is no going back. All messages, files, and member associations will be permanently deleted.
                        </p>
                        <div className="mt-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Delete Group
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {activeTab !== 'danger' && (
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Save className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
            <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all w-full max-w-md">
              <div className="px-6 py-4">
                <div className="flex items-center">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-0 ml-4 text-left">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Delete Group
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete "{group.name}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Group'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};