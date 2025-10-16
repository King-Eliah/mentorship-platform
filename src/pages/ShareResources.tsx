import React, { useState, useEffect } from 'react';
import { Share2, Upload, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Resource, Role } from '../types';
import { frontendService } from '../services/frontendService';
import toast from 'react-hot-toast';

export const ShareResources: React.FC = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());
  const [selectedMentees, setSelectedMentees] = useState<Set<string>>(new Set());
  const [mentees, setMentees] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'existing' | 'upload'>('existing');
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    description: ''
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchResources();
    fetchMentees();
  }, []);

  const fetchResources = () => {
    const savedResources = JSON.parse(localStorage.getItem('resources') || '[]');
    setResources(savedResources);
  };

  const fetchMentees = async () => {
    if (user?.role === Role.MENTOR) {
      try {
        const groups = await frontendService.getGroups();
        const mentorGroup = groups.find((g: any) => g.mentorId === user.id);
        
        if (mentorGroup) {
          const allUsers = await frontendService.getUsers();
          const groupMentees = allUsers.filter(u => 
            u.role === 'MENTEE' && u.isActive
          );
          setMentees(groupMentees);
        }
      } catch (error) {
        console.error('Failed to fetch mentees:', error);
      }
    }
  };

  const toggleResourceSelection = (resourceId: string) => {
    const newSelection = new Set(selectedResources);
    if (newSelection.has(resourceId)) {
      newSelection.delete(resourceId);
    } else {
      newSelection.add(resourceId);
    }
    setSelectedResources(newSelection);
  };

  const toggleMenteeSelection = (menteeId: string) => {
    const newSelection = new Set(selectedMentees);
    if (newSelection.has(menteeId)) {
      newSelection.delete(menteeId);
    } else {
      newSelection.add(menteeId);
    }
    setSelectedMentees(newSelection);
  };

  const toggleSelectAllResources = () => {
    if (selectedResources.size === resources.length) {
      setSelectedResources(new Set());
    } else {
      setSelectedResources(new Set(resources.map(r => r.id)));
    }
  };

  const toggleSelectAllMentees = () => {
    if (selectedMentees.size === mentees.length) {
      setSelectedMentees(new Set());
    } else {
      setSelectedMentees(new Set(mentees.map(m => m.id)));
    }
  };

  const handleShare = () => {
    if (selectedResources.size === 0) {
      toast.error('Please select at least one resource to share');
      return;
    }
    if (selectedMentees.size === 0) {
      toast.error('Please select at least one mentee to share with');
      return;
    }

    try {
      // Share each selected resource with each selected mentee
      selectedMentees.forEach(menteeId => {
        const existingShares = JSON.parse(
          localStorage.getItem(`shared_resources_${menteeId}`) || '[]'
        );
        
        const updatedShares = new Set([...existingShares, ...Array.from(selectedResources)]);
        localStorage.setItem(
          `shared_resources_${menteeId}`,
          JSON.stringify(Array.from(updatedShares))
        );
      });

      toast.success(
        `Shared ${selectedResources.size} resource(s) with ${selectedMentees.size} mentee(s)`
      );
      
      // Reset selections
      setSelectedResources(new Set());
      setSelectedMentees(new Set());
    } catch (error) {
      console.error('Failed to share resources:', error);
      toast.error('Failed to share resources');
    }
  };

  const handleUpload = async () => {
    if (!uploadFormData.title.trim() || !uploadedFile) {
      toast.error('Please provide a title and select a file');
      return;
    }

    try {
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(uploadedFile);
      });

      const newResource: Resource = {
        id: Date.now().toString(),
        title: uploadFormData.title,
        description: uploadFormData.description,
        category: 'learning-materials',
        fileName: uploadedFile.name,
        originalFileName: uploadedFile.name,
        fileSize: uploadedFile.size,
        uploadedBy: user?.firstName + ' ' + user?.lastName || 'Unknown',
        uploadedAt: new Date().toISOString(),
        downloadCount: 0,
        fileData: fileBase64,
        fileType: uploadedFile.type
      };

      const savedResources = JSON.parse(localStorage.getItem('resources') || '[]');
      localStorage.setItem('resources', JSON.stringify([newResource, ...savedResources]));
      
      setResources([newResource, ...resources]);
      setUploadFormData({ title: '', description: '' });
      setUploadedFile(null);
      
      toast.success('Resource uploaded successfully');
      window.dispatchEvent(new CustomEvent('resourcesUpdated'));
    } catch (error) {
      console.error('Failed to upload resource:', error);
      toast.error('Failed to upload file');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Share Resources</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Share learning materials and resources with your mentees
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('existing')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'existing'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Share Existing Resources
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Upload & Share New
          </button>
        </nav>
      </div>

      {activeTab === 'existing' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resources Selection */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select Resources ({selectedResources.size} selected)
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAllResources}
                >
                  {selectedResources.size === resources.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {resources.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No resources available
                  </p>
                ) : (
                  resources.map((resource) => (
                    <div
                      key={resource.id}
                      onClick={() => toggleResourceSelection(resource.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedResources.has(resource.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedResources.has(resource.id)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {selectedResources.has(resource.id) && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {resource.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {resource.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mentees Selection */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select Mentees ({selectedMentees.size} selected)
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAllMentees}
                >
                  {selectedMentees.size === mentees.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {mentees.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No mentees found
                  </p>
                ) : (
                  mentees.map((mentee) => (
                    <div
                      key={mentee.id}
                      onClick={() => toggleMenteeSelection(mentee.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedMentees.has(mentee.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedMentees.has(mentee.id)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {selectedMentees.has(mentee.id) && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {mentee.firstName?.[0]}{mentee.lastName?.[0]}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {mentee.firstName} {mentee.lastName}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {mentee.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upload New Resource
            </h3>

            <Input
              label="Title"
              value={uploadFormData.title}
              onChange={(e) => setUploadFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={uploadFormData.description}
                onChange={(e) => setUploadFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter resource description..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                File
              </label>
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setUploadedFile(file);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {uploadedFile && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Selected: {uploadedFile.name}
                </p>
              )}
            </div>

            <Button onClick={handleUpload} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Upload Resource
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Share Button */}
      {activeTab === 'existing' && (
        <div className="flex justify-end">
          <Button
            onClick={handleShare}
            disabled={selectedResources.size === 0 || selectedMentees.size === 0}
            size="lg"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share {selectedResources.size} Resource(s) with {selectedMentees.size} Mentee(s)
          </Button>
        </div>
      )}
    </div>
  );
};
