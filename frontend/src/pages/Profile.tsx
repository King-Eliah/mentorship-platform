import React, { useState, useEffect } from 'react';
import { Mail, Briefcase, Award, Edit2, Save, X, Target, Camera, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import FileUpload from '../components/FileUpload';
import { profileService } from '../services/profileService';
import SkillInput, { Skill } from '../components/profile/SkillInput';
import InterestSelector, { Interest } from '../components/profile/InterestSelector';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    bio: user?.bio || '',
    skills: user?.skills || '',
    experience: user?.experience || '',
  });
  
  // Skills and Interests state
  const [userSkills, setUserSkills] = useState<Skill[]>([]);
  const [userInterests, setUserInterests] = useState<Interest[]>([]);

  // Update formData when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: user.bio || '',
        skills: user.skills || '',
        experience: user.experience || '',
      });
    }
  }, [user]);

  // Initialize skills and interests from user data
  useEffect(() => {
    // Initialize skills from comma-separated string or array
    if (user?.skills) {
      const skillsArray = typeof user.skills === 'string' 
        ? user.skills.split(',').map(s => s.trim()).filter(Boolean)
        : Array.isArray(user.skills) 
        ? user.skills 
        : [];
      
      const skills: Skill[] = skillsArray.map((skill: string, index: number) => ({
        id: `skill-${index}`,
        name: skill,
        level: 'intermediate' as const,
        category: 'General'
      }));
      setUserSkills(skills);
    }
    
    // Initialize interests (if available in extended user data)
    const userWithInterests = user as typeof user & { interests?: string[] };
    if (userWithInterests?.interests) {
      const interestsArray = Array.isArray(userWithInterests.interests) 
        ? userWithInterests.interests 
        : [];
      
      const interests: Interest[] = interestsArray.map((interest: string, index: number) => ({
        id: `interest-${index}`,
        name: interest,
        category: 'General'
      }));
      setUserInterests(interests);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAvatarUpload = async (fileUrl: string) => {
    setAvatarPreview(fileUrl);
    setShowAvatarUpload(false);
    
    try {
      await profileService.updateAvatar(user?.id || '', fileUrl);
      await refreshUser(); // Refresh user data to show updated avatar
      toast.success('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to update avatar');
    }
  };

  const handleAvatarError = (error: string) => {
    toast.error(`Avatar upload failed: ${error}`);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        profile: {
          skills: userSkills.map(s => s.name),
          interests: userInterests.map(i => i.name),
        }
      };

      await profileService.updateProfile(user?.id || '', updateData);
      
      // Refresh user data to show updated information
      await refreshUser();
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} size="sm" className="w-full xs:w-auto">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-2 gap-2">
            <Button onClick={handleSave} loading={loading} size="sm" className="w-full xs:w-auto">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleCancel} variant="secondary" size="sm" className="w-full xs:w-auto">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Profile Summary - Mobile Responsive */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="text-center p-4 sm:p-6">
              <div className="relative group mb-4">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Profile Avatar" 
                    className="w-20 sm:w-24 h-20 sm:h-24 rounded-full mx-auto object-cover"
                  />
                ) : (
                  <div className="w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-lg sm:text-2xl font-bold mx-auto">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                )}
                
                {isEditing && (
                  <button
                    onClick={() => setShowAvatarUpload(true)}
                    className="absolute inset-0 w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity mx-auto"
                  >
                    <Camera className="w-5 sm:w-6 h-5 sm:h-6" />
                  </button>
                )}
              </div>

              {/* Avatar Upload Modal - Mobile Optimized */}
              {showAvatarUpload && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Upload Avatar</h3>
                      <button
                        onClick={() => setShowAvatarUpload(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
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
              
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                {user.role}
              </p>
              <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-all px-1">
                <Mail className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs font-mono bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">ID:</span>
                <span className="text-gray-800 dark:text-gray-200 font-semibold">{user.id}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user.id);
                    toast.success('User ID copied!');
                  }}
                  className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Copy ID"
                >
                  📋
                </button>
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

        {/* Profile Details - Mobile Responsive */}
        <div className="md:col-span-2 space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                Basic Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <Input
                      name="firstName"
                      label="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      leftIcon={<UserIcon className="w-4 h-4" />}
                    />
                    <Input
                      name="lastName"
                      label="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      leftIcon={<UserIcon className="w-4 h-4" />}
                    />
                  </div>
                  <Input
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    leftIcon={<Mail className="w-4 h-4" />}
                  />
                </>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white">{user.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name
                    </label>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white">{user.lastName}</p>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">{user.email}</p>
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

          {/* Skills & Interests - Mobile Responsive */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <Award className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
                  Skills
                </h3>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <SkillInput
                    skills={userSkills}
                    onSkillsChange={setUserSkills}
                    placeholder="Start typing to add skills..."
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userSkills.length > 0 ? (
                      userSkills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-2 sm:px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full text-xs sm:text-sm font-medium"
                        >
                          {skill.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-300">No skills listed yet.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <Target className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
                  Interests
                </h3>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <InterestSelector
                    selectedInterests={userInterests}
                    onInterestsChange={setUserInterests}
                    placeholder="Select your interests..."
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userInterests.length > 0 ? (
                      userInterests.map((interest) => (
                        <span
                          key={interest.id}
                          className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs sm:text-sm font-medium"
                        >
                          {interest.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-300">No interests selected yet.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <Briefcase className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
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
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    {user.experience || 'No experience listed yet.'}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};