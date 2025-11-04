import React, { useState } from 'react';
import { Mail, Briefcase, Award, Edit2, Save, X, Target, Plus, Calendar, Trash2, Camera, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import FileUpload from '../components/FileUpload';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { Role } from '../types';
import { useGoals } from '../context/GoalContext';
import { frontendService } from '../services/frontendService';
import toast from 'react-hot-toast';

interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  skills?: string;
  experience?: string;
}

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { goals, addGoal, deleteGoal, toggleGoalStatus } = useGoals();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    goalId: string | null;
    goalTitle: string;
  }>({
    isOpen: false,
    goalId: null,
    goalTitle: ''
  });
  const [goalFormData, setGoalFormData] = useState({
    title: '',
    description: '',
    deadline: ''
  });
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    bio: user?.bio || '',
    skills: user?.skills || '',
    experience: user?.experience || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGoalFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setGoalFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAvatarUpload = (fileUrl: string) => {
    setAvatarPreview(fileUrl);
    setShowAvatarUpload(false);
    toast.success('Avatar uploaded successfully!');
  };

  const handleAvatarError = (error: string) => {
    toast.error(`Avatar upload failed: ${error}`);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData: UpdateUserRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        skills: formData.skills,
        experience: formData.experience,
      };

      await frontendService.updateUser(user?.id || '', updateData);
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      bio: user?.bio || '',
      skills: user?.skills || '',
      experience: user?.experience || '',
    });
    setIsEditing(false);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goalFormData.title.trim() || !goalFormData.description.trim() || !goalFormData.deadline) {
      toast.error('Please fill in all fields');
      return;
    }

    addGoal({
      title: goalFormData.title,
      description: goalFormData.description,
      deadline: goalFormData.deadline,
      status: 'pending'
    });

    setGoalFormData({ title: '', description: '', deadline: '' });
    setShowGoalForm(false);
    toast.success('Goal created successfully!');
  };

  const handleDeleteGoal = (goalId: string, goalTitle: string) => {
    setDeleteConfirmation({
      isOpen: true,
      goalId: goalId,
      goalTitle: goalTitle
    });
  };

  const confirmDeleteGoal = () => {
    if (deleteConfirmation.goalId) {
      deleteGoal(deleteConfirmation.goalId);
      toast.success('Goal deleted successfully!');
      setDeleteConfirmation({
        isOpen: false,
        goalId: null,
        goalTitle: ''
      });
    }
  };

  const cancelDeleteGoal = () => {
    setDeleteConfirmation({
      isOpen: false,
      goalId: null,
      goalTitle: ''
    });
  };

  const handleToggleGoalStatus = (goalId: string) => {
    toggleGoalStatus(goalId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} size="sm">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button onClick={handleSave} loading={loading} size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleCancel} variant="secondary" size="sm">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="text-center p-6">
              <div className="relative group mb-4">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Profile Avatar" 
                    className="w-24 h-24 rounded-full mx-auto object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                )}
                
                {isEditing && (
                  <button
                    onClick={() => setShowAvatarUpload(true)}
                    className="absolute inset-0 w-24 h-24 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity mx-auto"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Avatar Upload Modal */}
              {showAvatarUpload && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Avatar</h3>
                      <button
                        onClick={() => setShowAvatarUpload(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <FileUpload
                      onFileUpload={handleAvatarUpload}
                      onError={handleAvatarError}
                      acceptedTypes={['image/*']}
                      maxSize={5}
                      multiple={false}
                      showPreview={true}
                    />
                  </div>
                </div>
              )}
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {user.role}
              </p>
              <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                <Mail className="w-4 h-4 mr-1" />
                {user.email}
              </div>
              <div className={`mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                user.isActive 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Basic Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="firstName"
                      label="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      icon={<UserIcon className="w-4 h-4" />}
                    />
                    <Input
                      name="lastName"
                      label="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      icon={<UserIcon className="w-4 h-4" />}
                    />
                  </div>
                  <Input
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    icon={<Mail className="w-4 h-4" />}
                  />
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{user.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{user.lastName}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">About Me</h3>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">
                  {user.bio || 'No bio provided yet.'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Skills & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Skills
                </h3>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Input
                    name="skills"
                    label="Skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">
                    {user.skills || 'No skills listed yet.'}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Experience
                </h3>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Input
                    name="experience"
                    label="Experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g., 3+ years in web development"
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">
                    {user.experience || 'No experience listed yet.'}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Goals Section - Only for Mentees */}
      {user.role === Role.MENTEE && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Target className="w-5 h-5 mr-2" />
                My Goals
              </h3>
              <Button 
                onClick={() => setShowGoalForm(!showGoalForm)} 
                size="sm"
                variant={showGoalForm ? "secondary" : "primary"}
              >
                <Plus className="w-4 h-4 mr-2" />
                {showGoalForm ? 'Cancel' : 'Add Goal'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Goal Creation Form */}
            {showGoalForm && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Create New Goal</h4>
                <form onSubmit={handleCreateGoal} className="space-y-4">
                  <Input
                    name="title"
                    label="Goal Title"
                    value={goalFormData.title}
                    onChange={handleGoalFormChange}
                    placeholder="e.g., Learn React Native"
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={goalFormData.description}
                      onChange={handleGoalFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                      placeholder="Describe your goal and how you plan to achieve it..."
                      required
                    />
                  </div>
                  <Input
                    name="deadline"
                    label="Deadline"
                    type="date"
                    value={goalFormData.deadline}
                    onChange={handleGoalFormChange}
                    icon={<Calendar className="w-4 h-4" />}
                    required
                  />
                  <div className="flex space-x-2">
                    <Button type="submit" size="sm">
                      Create Goal
                    </Button>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setShowGoalForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Goals List */}
            {goals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No goals yet</h4>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Set your first goal to start tracking your progress
                </p>
                <Button onClick={() => setShowGoalForm(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Goal
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      goal.status === 'completed'
                        ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            checked={goal.status === 'completed'}
                            onChange={() => handleToggleGoalStatus(goal.id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <h5 className={`font-medium ${
                            goal.status === 'completed'
                              ? 'line-through text-gray-500 dark:text-gray-400'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {goal.title}
                          </h5>
                        </div>
                        <p className={`text-sm mb-3 ${
                          goal.status === 'completed'
                            ? 'text-gray-400 dark:text-gray-500'
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {goal.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Deadline: {formatDate(goal.deadline)}
                          </div>
                          <div>
                            Created: {formatDate(goal.createdAt)}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteGoal(goal.id, goal.title)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
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
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        title="Delete Goal"
        message={`Are you sure you want to delete the goal "${deleteConfirmation.goalTitle}"? This action cannot be undone.`}
        onConfirm={confirmDeleteGoal}
        onCancel={cancelDeleteGoal}
        confirmText="Delete Goal"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
};