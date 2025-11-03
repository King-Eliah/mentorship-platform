import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Globe,
  Briefcase,
  GraduationCap,
  Clock
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import SkillInput, { Skill } from '../components/profile/SkillInput';
import InterestSelector, { Interest } from '../components/profile/InterestSelector';
import { ProfileCompletion, CompletionField } from '../components/profile/ProgressBar';
import AchievementGrid, { Achievement } from '../components/profile/AchievementGrid';
import { calculateAchievementProgress } from '../data/mockAchievements';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  profilePicture?: string;
  website?: string;
  linkedIn?: string;
  twitter?: string;
  company?: string;
  jobTitle?: string;
  education?: string;
  experience?: string;
  availability?: {
    hoursPerWeek: number;
    preferredTimes: string[];
    timezone: string;
  };
  role: 'mentor' | 'mentee' | 'both';
  skills: Skill[];
  interests: Interest[];
  createdAt: string;
  updatedAt: string;
  isEmailVerified: boolean;
  isProfileComplete: boolean;
}

const UserProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    linkedIn: '',
    twitter: '',
    company: '',
    jobTitle: '',
    education: '',
    experience: '',
    skills: [] as Skill[],
    interests: [] as Interest[]
  });

  const { user } = useAuth();
  
  // Simple notification handler since the hook doesn't have addNotification
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    // Show notification to user
    if (type === 'success') {
      alert(`Success: ${message}`);
    } else if (type === 'error') {
      alert(`Error: ${message}`);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAchievements();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use frontendService for consistency with mock data
      const { frontendService } = await import('../services');
      const userData = await frontendService.getUser(user?.id || '');
      
      // Transform User to UserProfile format
      const data: UserProfile = {
        ...userData,
        location: '',
        timezone: '',
        profilePicture: userData.avatarUrl,
        website: '',
        linkedIn: '',
        twitter: '',
        company: '',
        jobTitle: '',
        education: '',
        skills: userData.skills ? JSON.parse(userData.skills) : [],
        interests: [], // Initialize empty for now
        role: userData.role === 'MENTOR' ? 'mentor' : userData.role === 'MENTEE' ? 'mentee' : 'both',
        isEmailVerified: true,
        isProfileComplete: !!(userData.bio && userData.skills)
      };
      
      setProfile(data);
      
      // Initialize edit form with current data
      setEditForm({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
        bio: data.bio || '',
        location: data.location || '',
        website: data.website || '',
        linkedIn: data.linkedIn || '',
        twitter: data.twitter || '',
        company: data.company || '',
        jobTitle: data.jobTitle || '',
        education: data.education || '',
        experience: data.experience || '',
        skills: data.skills || [],
        interests: data.interests || []
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
      showNotification('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      // Use mock achievements since we're using mock services
      const mockAchievements = calculateAchievementProgress(user?.id || '');
      setAchievements(mockAchievements);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      // Fallback to empty array
      setAchievements([]);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Transform skills array to string for User type
      const userUpdateData = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        bio: editForm.bio,
        experience: editForm.experience,
        skills: JSON.stringify(editForm.skills), // Convert array to string
      };

      // Use frontendService for consistency with mock data
      const { frontendService } = await import('../services');
      
      const updatedUser = await frontendService.updateUser(profile?.id || '', userUpdateData);
      
      // Transform back to UserProfile format
      const updatedProfile: UserProfile = {
        ...updatedUser,
        location: editForm.location,
        website: editForm.website,
        linkedIn: editForm.linkedIn,
        twitter: editForm.twitter,
        company: editForm.company,
        jobTitle: editForm.jobTitle,
        education: editForm.education,
        skills: editForm.skills,
        interests: editForm.interests,
        role: updatedUser.role === 'MENTOR' ? 'mentor' : updatedUser.role === 'MENTEE' ? 'mentee' : 'both',
        isEmailVerified: true,
        isProfileComplete: !!(updatedUser.bio && updatedUser.skills)
      };
      
      setProfile(updatedProfile);
      setIsEditing(false);
      showNotification('Profile updated successfully', 'success');
      
      // Refresh achievements as profile completion may have changed
      fetchAchievements();
    } catch (err) {
      console.error('Error updating profile:', err);
      showNotification(
        err instanceof Error ? err.message : 'Failed to update profile',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        linkedIn: profile.linkedIn || '',
        twitter: profile.twitter || '',
        company: profile.company || '',
        jobTitle: profile.jobTitle || '',
        education: profile.education || '',
        experience: profile.experience || '',
        skills: profile.skills || [],
        interests: profile.interests || []
      });
    }
    setIsEditing(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      showNotification('Please select an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showNotification('Image must be less than 5MB', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch('/api/users/profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const { imageUrl } = await response.json();
      
      if (profile) {
        setProfile({ ...profile, profilePicture: imageUrl });
      }
      
      showNotification('Profile picture updated successfully', 'success');
    } catch (err) {
      console.error('Error uploading image:', err);
      showNotification('Failed to upload image', 'error');
    }
  };

  const getCompletionFields = (): CompletionField[] => {
    if (!profile) return [];

    return [
      {
        name: 'Basic Information',
        completed: !!(profile.firstName && profile.lastName && profile.email),
        weight: 10,
        description: 'Complete your name and email'
      },
      {
        name: 'Profile Picture',
        completed: !!profile.profilePicture,
        weight: 10,
        description: 'Upload a professional photo'
      },
      {
        name: 'Bio & Description',
        completed: !!(profile.bio && profile.bio.length >= 50),
        weight: 15,
        description: 'Write at least 50 characters about yourself'
      },
      {
        name: 'Contact Information',
        completed: !!(profile.phone && profile.location),
        weight: 10,
        description: 'Add phone number and location'
      },
      {
        name: 'Professional Details',
        completed: !!(profile.company && profile.jobTitle),
        weight: 15,
        description: 'Add your current job and company'
      },
      {
        name: 'Skills',
        completed: profile.skills && profile.skills.length >= 3,
        weight: 20,
        description: 'Add at least 3 skills with proficiency levels'
      },
      {
        name: 'Interests',
        completed: profile.interests && profile.interests.length >= 2,
        weight: 10,
        description: 'Select at least 2 areas of interest'
      },
      {
        name: 'Education & Experience',
        completed: !!(profile.education && profile.experience),
        weight: 10,
        description: 'Add your educational background and experience'
      }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Unable to Load Profile
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchProfile}>Retry</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const completionFields = getCompletionFields();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
          </div>
          
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Profile</span>
            </Button>
          ) : (
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Profile Completion */}
        <Card className="p-6">
          <ProfileCompletion fields={completionFields} />
        </Card>

        {/* Main Profile Card */}
        <Card className="p-6">
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start space-x-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        required
                      />
                      <Input
                        label="Last Name"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {profile.firstName} {profile.lastName}
                      </h2>
                      {profile.isEmailVerified && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-1">{profile.email}</p>
                    {profile.jobTitle && profile.company && (
                      <p className="text-gray-600">
                        {profile.jobTitle} at {profile.company}
                      </p>
                    )}
                    {profile.location && (
                      <div className="flex items-center space-x-1 text-gray-500 mt-2">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Role Badge */}
              <div className="flex-shrink-0">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  profile.role === 'mentor' 
                    ? 'bg-purple-100 text-purple-800'
                    : profile.role === 'mentee'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {profile.role === 'both' ? 'Mentor & Mentee' : profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
              </div>
            </div>

            {/* Bio Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">About</h3>
              {isEditing ? (
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Tell us about yourself, your background, and what you're passionate about..."
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">
                  {profile.bio || 'No bio provided yet.'}
                </p>
              )}
            </div>

            {/* Contact & Professional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      label="Phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                    <Input
                      label="Location"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="City, State, Country"
                    />
                    <Input
                      label="Website"
                      value={editForm.website}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      placeholder="https://your-website.com"
                    />
                    <Input
                      label="LinkedIn"
                      value={editForm.linkedIn}
                      onChange={(e) => setEditForm({ ...editForm, linkedIn: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile.phone && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Globe className="h-4 w-4" />
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          {profile.website}
                        </a>
                      </div>
                    )}
                    {profile.linkedIn && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <span className="text-blue-600">in</span>
                        <a 
                          href={profile.linkedIn} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
                
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      label="Company"
                      value={editForm.company}
                      onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                      placeholder="Your current company"
                    />
                    <Input
                      label="Job Title"
                      value={editForm.jobTitle}
                      onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
                      placeholder="Your current role"
                    />
                    <Input
                      label="Education"
                      value={editForm.education}
                      onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
                      placeholder="Your educational background"
                    />
                    <textarea
                      value={editForm.experience}
                      onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Describe your professional experience..."
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile.company && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Briefcase className="h-4 w-4" />
                        <span>{profile.company}</span>
                      </div>
                    )}
                    {profile.education && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <GraduationCap className="h-4 w-4" />
                        <span>{profile.education}</span>
                      </div>
                    )}
                    {profile.experience && (
                      <div className="mt-3">
                        <h4 className="font-medium text-gray-900 mb-1">Experience</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {profile.experience}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Skills Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Skills & Expertise</h3>
            <SkillInput
              skills={isEditing ? editForm.skills : profile.skills || []}
              onSkillsChange={(skills) => setEditForm({ ...editForm, skills })}
              disabled={!isEditing}
              placeholder="Search and add your skills..."
            />
          </div>
        </Card>

        {/* Interests Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Interests</h3>
            <InterestSelector
              selectedInterests={isEditing ? editForm.interests : profile.interests || []}
              onInterestsChange={(interests) => setEditForm({ ...editForm, interests })}
              disabled={!isEditing}
              placeholder="Select your areas of interest..."
            />
          </div>
        </Card>

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                <div className="text-sm text-gray-500">
                  {achievements.filter(a => a.earned).length} of {achievements.length} earned
                </div>
              </div>
              <AchievementGrid
                achievements={achievements}
                showProgress={true}
                gridCols={4}
              />
            </div>
          </Card>
        )}

        {/* Account Information */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Member since {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Last updated {new Date(profile.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span className="flex items-center space-x-1">
                  <span>Email</span>
                  {profile.isEmailVerified ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                  )}
                  <span className="text-xs">
                    {profile.isEmailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserProfilePage;