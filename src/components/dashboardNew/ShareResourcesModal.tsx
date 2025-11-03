import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { frontendService } from '../../services/frontendService';
import { Resource, User } from '../../types';
import toast from 'react-hot-toast';

interface ShareResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedResourceId?: string;
}

export const ShareResourcesModal: React.FC<ShareResourcesModalProps> = ({ isOpen, onClose, preSelectedResourceId }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [mentees, setMentees] = useState<User[]>([]);
  const [selectedMentees, setSelectedMentees] = useState<string[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    category: 'learning-materials' as Resource['category']
  });
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');

  useEffect(() => {
    if (isOpen) {
      fetchMentees();
      fetchResources();
      
      // If a resource is pre-selected, set it and switch to existing tab
      if (preSelectedResourceId) {
        setSelectedResource(preSelectedResourceId);
        setActiveTab('existing');
      }
    }
  }, [isOpen, user?.id, preSelectedResourceId]);

  const fetchMentees = async () => {
    if (!user?.id) return;
    
    try {
      // Get mentor's group
      const groups = await frontendService.getGroups();
      const mentorGroup = groups.find(g => g.mentorId === user.id);
      
      if (mentorGroup) {
        // Get all users to find mentees
        const allUsers = await frontendService.getUsers();
        const groupMentees = allUsers.filter(u => 
          u.role === 'MENTEE' && u.isActive
        );
        setMentees(groupMentees);
        // Select all by default
        setSelectedMentees(groupMentees.map(m => m.id));
      }
    } catch (error) {
      console.error('Failed to fetch mentees:', error);
      toast.error('Failed to load mentees');
    }
  };

  const fetchResources = async () => {
    try {
      const savedResources = JSON.parse(localStorage.getItem('resources') || '[]');
      setResources(savedResources);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    }
  };

  const handleShareExisting = async () => {
    if (!selectedResource || selectedMentees.length === 0) {
      toast.error('Please select a resource and at least one mentee');
      return;
    }

    try {
      setLoading(true);
      
      // In a real app, this would send notifications to mentees
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Resource shared with ${selectedMentees.length} mentee(s)`);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to share resource:', error);
      toast.error('Failed to share resource');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAndShare = async () => {
    if (!newResource.title.trim() || !uploadFile || selectedMentees.length === 0) {
      toast.error('Please fill all fields and select at least one mentee');
      return;
    }

    try {
      setUploadLoading(true);
      
      // Convert file to base64
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(uploadFile);
      });
      
      // Create new resource
      const resource: Resource = {
        id: Date.now().toString(),
        title: newResource.title,
        description: newResource.description,
        category: newResource.category,
        fileName: uploadFile.name,
        originalFileName: uploadFile.name,
        fileSize: uploadFile.size,
        uploadedBy: `${user?.firstName} ${user?.lastName}`,
        uploadedAt: new Date().toISOString(),
        downloadCount: 0,
        fileData: fileBase64,
        fileType: uploadFile.type
      };
      
      // Save to localStorage
      const savedResources = JSON.parse(localStorage.getItem('resources') || '[]');
      localStorage.setItem('resources', JSON.stringify([resource, ...savedResources]));
      
      // Share with mentees
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Resource uploaded and shared with ${selectedMentees.length} mentee(s)`);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to upload and share resource:', error);
      toast.error('Failed to upload resource');
    } finally {
      setUploadLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedResource('');
    setSelectedMentees([]);
    setUploadFile(null);
    setNewResource({
      title: '',
      description: '',
      category: 'learning-materials'
    });
    setActiveTab('existing');
  };

  const toggleMentee = (menteeId: string) => {
    setSelectedMentees(prev =>
      prev.includes(menteeId)
        ? prev.filter(id => id !== menteeId)
        : [...prev, menteeId]
    );
  };

  const selectAllMentees = () => {
    setSelectedMentees(mentees.map(m => m.id));
  };

  const deselectAllMentees = () => {
    setSelectedMentees([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className={`inline-block align-bottom ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full`}>
          {/* Header */}
          <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Share Resources with Mentees
              </h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className={`px-6 pt-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('existing')}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'existing'
                    ? 'border-blue-600 text-blue-600'
                    : isDark
                    ? 'border-transparent text-gray-400 hover:text-gray-300'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Share Existing
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'new'
                    ? 'border-blue-600 text-blue-600'
                    : isDark
                    ? 'border-transparent text-gray-400 hover:text-gray-300'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Upload New
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {/* Mentees Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Select Mentees ({selectedMentees.length} selected)
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllMentees}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Select All
                  </button>
                  <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>|</span>
                  <button
                    onClick={deselectAllMentees}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {mentees.map(mentee => (
                  <label
                    key={mentee.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedMentees.includes(mentee.id)
                        ? isDark
                          ? 'bg-blue-900/30 border-blue-700'
                          : 'bg-blue-50 border-blue-200'
                        : isDark
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMentees.includes(mentee.id)}
                      onChange={() => toggleMentee(mentee.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {mentee.firstName} {mentee.lastName}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {mentee.email}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'existing' ? (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Select Resource
                </label>
                <select
                  value={selectedResource}
                  onChange={(e) => setSelectedResource(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">-- Select a resource --</option>
                  {resources.map(resource => (
                    <option key={resource.id} value={resource.id}>
                      {resource.title} ({resource.category})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newResource.title}
                    onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter resource title"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={newResource.description}
                    onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Describe the resource"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Category
                  </label>
                  <select
                    value={newResource.category}
                    onChange={(e) => setNewResource(prev => ({ ...prev, category: e.target.value as Resource['category'] }))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="learning-materials">Learning Materials</option>
                    <option value="templates">Templates</option>
                    <option value="guides">Guides</option>
                    <option value="tools">Tools</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    File *
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    isDark ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    <input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {uploadFile ? (
                        <>
                          <FileText className="w-12 h-12 text-blue-600 mb-2" />
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {uploadFile.name}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-gray-400 mb-2" />
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            Click to upload file
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={activeTab === 'existing' ? handleShareExisting : handleUploadAndShare}
                disabled={loading || uploadLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {(loading || uploadLoading) && <Loader2 className="w-4 h-4 animate-spin" />}
                {activeTab === 'existing' ? 'Share Resource' : 'Upload & Share'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
