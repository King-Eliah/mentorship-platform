import React, { useState, useEffect } from 'react';
import { Download, Upload, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { ConfirmModal } from '../components/ui/Modal';
import { Role, Resource } from '../types';
import toast from 'react-hot-toast';

type TabType = 'all' | 'shared-with-me';

export const ResourceManager: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    description: '',
    category: 'learning-materials' as Resource['category'],
    tags: '',
    isPublic: true
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Simple version - just show resources
  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      // Load from localStorage first
      const savedResources = JSON.parse(localStorage.getItem('resources') || '[]');
      
      // If there are saved resources, use them; otherwise use mock data
      if (savedResources.length > 0) {
        setResources(savedResources);
      } else {
        // Mock resources data
        const mockResources: Resource[] = [
          {
            id: '1',
            title: 'Mentoring Best Practices Guide',
            description: 'A comprehensive guide on effective mentoring techniques',
            category: 'learning-materials',
            fileName: 'mentoring-guide.pdf',
            originalFileName: 'mentoring-guide.pdf',
            fileSize: 2048000,
            uploadedBy: 'Admin',
            uploadedAt: new Date().toISOString(),
            downloadCount: 45
          },
          {
            id: '2',
            title: 'Goal Setting Template',
            description: 'Template for setting SMART goals in mentoring relationships',
            category: 'templates',
            fileName: 'goal-template.docx',
            originalFileName: 'goal-template.docx',
            fileSize: 512000,
            uploadedBy: 'Admin',
            uploadedAt: new Date().toISOString(),
            downloadCount: 23
          }
        ];
        setResources(mockResources);
        localStorage.setItem('resources', JSON.stringify(mockResources));
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      toast.error('Failed to load resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUpload = async () => {
    if (!uploadFormData.title.trim() || !uploadedFile) {
      setShowErrorModal(true);
      return;
    }

    try {
      // Convert file to base64 for storage
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(uploadedFile);
      });
      
      // Create new resource with actual file data
      const newResource: Resource = {
        id: Date.now().toString(),
        title: uploadFormData.title,
        description: uploadFormData.description,
        category: uploadFormData.category as Resource['category'],
        fileName: uploadedFile.name,
        originalFileName: uploadedFile.name,
        fileSize: uploadedFile.size,
        uploadedBy: user?.firstName + ' ' + user?.lastName || 'Unknown',
        uploadedAt: new Date().toISOString(),
        downloadCount: 0,
        fileData: fileBase64, // Store the actual file data
        fileType: uploadedFile.type
      };
      
      setResources(prev => [newResource, ...prev]);
      
      // Save to localStorage for persistence
      const savedResources = JSON.parse(localStorage.getItem('resources') || '[]');
      localStorage.setItem('resources', JSON.stringify([newResource, ...savedResources]));
      
      setShowUploadModal(false);
      setUploadFormData({
        title: '',
        description: '',
        category: 'learning-materials',
        tags: '',
        isPublic: true
      });
      setUploadedFile(null);
      setShowSuccessModal(true);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('resourcesUpdated'));
    } catch (error) {
      console.error('Failed to upload resource:', error);
      toast.error('Failed to upload file');
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      // Get the file data from the resource
      const fileData = resource.fileData || resource.fileUrl;
      
      if (!fileData) {
        toast.error('File data not available');
        return;
      }
      
      // Create a download link
      const link = document.createElement('a');
      link.href = fileData;
      link.download = resource.originalFileName || resource.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Update download count
      setResources(prev => prev.map(r => 
        r.id === resource.id 
          ? { ...r, downloadCount: r.downloadCount + 1 }
          : r
      ));
      
      // Update localStorage
      const savedResources = JSON.parse(localStorage.getItem('resources') || '[]');
      const updatedResources = savedResources.map((r: Resource) =>
        r.id === resource.id ? { ...r, downloadCount: r.downloadCount + 1 } : r
      );
      localStorage.setItem('resources', JSON.stringify(updatedResources));
      
      // Show success modal
      setShowDownloadSuccess(true);
    } catch (error) {
      console.error('Failed to download resource:', error);
      toast.error('Failed to download file');
    }
  };

  const canUpload = user?.role === Role.ADMIN || user?.role === Role.MENTOR;
  const isMentee = user?.role === Role.MENTEE;

  // Filter resources based on active tab
  const getFilteredResources = () => {
    if (activeTab === 'shared-with-me' && isMentee) {
      // Get resources shared with this mentee
      const sharedResources = JSON.parse(localStorage.getItem(`shared_resources_${user?.id}`) || '[]');
      return resources.filter(r => sharedResources.includes(r.id));
    }
    return resources;
  };

  const filteredResources = getFilteredResources();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resource Manager</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage and access resources for the mentorship program
          </p>
        </div>
        {canUpload && (
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Resource
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            All Resources
          </button>
          
          {isMentee && (
            <button
              onClick={() => setActiveTab('shared-with-me')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'shared-with-me'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Shared With Me
            </button>
          )}
        </nav>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id}>
            <CardContent>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                {resource.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {resource.description}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                <span>Uploaded by {resource.uploadedBy}</span>
                <span>{new Date(resource.uploadedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(resource)}
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === 'shared-with-me' ? 'No resources shared with you yet' : 'No resources found'}
          </p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Upload Resource</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    if (file) {
                      setUploadedFile(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {uploadedFile && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Selected: {uploadedFile.name}
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <Button onClick={handleSubmitUpload} className="flex-1">
                  Upload Resource
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Modal */}
      <ConfirmModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="Upload Successful"
        message="Your file has been uploaded successfully!"
        confirmText="OK"
        variant="info"
      />

      {/* Error Modal */}
      <ConfirmModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onConfirm={() => setShowErrorModal(false)}
        title="Upload Failed"
        message="Please enter a title and select a file before uploading."
        confirmText="OK"
        variant="danger"
      />

      {/* Download Success Modal */}
      <ConfirmModal
        isOpen={showDownloadSuccess}
        onClose={() => setShowDownloadSuccess(false)}
        onConfirm={() => setShowDownloadSuccess(false)}
        title="Download Started"
        message="Your file download has started successfully!"
        confirmText="OK"
        variant="info"
      />
    </div>
  );
};