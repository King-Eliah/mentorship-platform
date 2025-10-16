import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { User } from '../../types';
import { Users, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateGroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (groupData: CreateGroupData) => Promise<void>;
  availableUsers?: User[];
}

interface CreateGroupData {
  name: string;
  description: string;
  maxMembers: number;
  isPrivate: boolean;
  category: string;
  memberIds: string[];
}

export const CreateGroupForm: React.FC<CreateGroupFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableUsers = [],
}) => {
  const [formData, setFormData] = useState<CreateGroupData>({
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

  const filteredUsers = availableUsers.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    if (formData.maxMembers < 2) {
      toast.error('Group must allow at least 2 members');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        memberIds: selectedUsers.map(user => user.id),
      });
      handleClose();
      toast.success('Group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      maxMembers: 10,
      isPrivate: false,
      category: 'general',
      memberIds: [],
    });
    setSelectedUsers([]);
    setSearchTerm('');
    onClose();
  };

  const addUser = (user: User) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Group" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Group Name *
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

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Members
            </label>
            <Input
              type="number"
              min="2"
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

        {/* Member Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add Members ({selectedUsers.length}/{formData.maxMembers - 1})
          </label>
          
          <div className="mb-3">
            <Input
              type="search"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Selected Members:</p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{user.firstName} {user.lastName}</span>
                    <button
                      type="button"
                      onClick={() => removeUser(user.id)}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Users */}
          <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No users found
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
                      {selectedUsers.find(u => u.id === user.id) ? (
                        <div className="text-blue-600 dark:text-blue-400">
                          <Users className="h-4 w-4" />
                        </div>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            addUser(user);
                          }}
                          disabled={selectedUsers.length >= formData.maxMembers - 1}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Group'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};