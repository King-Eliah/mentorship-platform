import React, { useState } from 'react';
import { FileText, Download, ExternalLink, Plus, Trash2, Upload, X, Link as LinkIcon, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { FileUpload } from '../components/ui/FileUpload';
import { resourceService, Resource } from '../services/resourceService';
import sharedResourceService, { SharedResource } from '../services/sharedResourceService';
import { useTheme } from '../context/ThemeContext';
import { Role } from '../types';
import { notify } from '../utils/notifications';

export const ResourceManager: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [sharedResources, setSharedResources] = useState<SharedResource[]>([]);
  const [filter, setFilter] = useState<'all' | 'my' | 'shared'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Check if user can upload resources (Mentors and Admins only)
  const canUpload = user?.role === Role.MENTOR || user?.role === Role.ADMIN;
  const isAdmin = user?.role === Role.ADMIN;
  const isMentee = user?.role === Role.MENTEE;
  const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: 'learning-materials'
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const loadResources = React.useCallback(async () => {
    setLoading(true);
    try {
      if (filter === 'shared') {
        // Load resources shared with the current user
        const shared = await sharedResourceService.getSharedWithMe();
        setSharedResources(shared);
        // Extract just the resources from shared data
        const sharedResourcesOnly = shared.map(sr => sr.resource) as Resource[];
        setResources(sharedResourcesOnly);
      } else {
        const data = filter === 'my' 
          ? await resourceService.getUserResources()
          : await resourceService.getResources();
        setResources(data);
        setSharedResources([]); // Clear shared resources when not in shared view
      }
    } catch (error) {
      console.error('Failed to load resources:', error);
      notify.error('Failed to load resources');
      setResources([]);
      setSharedResources([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    loadResources();
  }, [loadResources]);

  const resetUploadForm = () => {
    setUploadFormData({
      title: '',
      description: '',
      url: '',
      category: 'learning-materials'
    });
    setUploadedFile(null);
    setUploadType('file');
  };

  const handleDelete = async (id: string) => {
    notify.confirm(
      'Are you sure you want to delete this resource?',
      async () => {
        try {
          await resourceService.deleteResource(id);
          notify.success('Resource deleted successfully');
          loadResources();
        } catch (error) {
          console.error('Failed to delete resource:', error);
          notify.error('Failed to delete resource');
        }
      }
    );
  };

  const getFileType = (file: File): 'DOCUMENT' | 'VIDEO' | 'LINK' | 'OTHER' => {
    const mimeType = file.type.toLowerCase();
    
    if (mimeType.startsWith('video/')) {
      return 'VIDEO';
    } else if (mimeType.startsWith('image/') || 
               mimeType.includes('pdf') || 
               mimeType.includes('document') || 
               mimeType.includes('word') || 
               mimeType.includes('excel') || 
               mimeType.includes('powerpoint') || 
               mimeType.includes('text')) {
      return 'DOCUMENT';
    } else {
      return 'OTHER';
    }
  };

  const handleUpload = async () => {
    // Check permissions
    if (!canUpload) {
      notify.error('Only mentors and admins can upload resources');
      return;
    }

    if (!uploadFormData.title.trim()) {
      notify.error('Please provide a title');
      return;
    }

    setUploading(true);
    try {
      if (uploadType === 'file') {
        if (!uploadedFile) {
          notify.error('Please select a file to upload');
          setUploading(false);
          return;
        }

        // Check file size before conversion
        const fileSizeMB = uploadedFile.size / (1024 * 1024);
        
        if (fileSizeMB > 100) {
          notify.error(`File is too large (${fileSizeMB.toFixed(2)}MB). Maximum size is 100MB`);
          setUploading(false);
          return;
        }

        // Convert file to base64 for storage
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(uploadedFile);
        });

        const fileType = getFileType(uploadedFile);

        await resourceService.createResource({
          title: uploadFormData.title,
          description: uploadFormData.description,
          type: fileType,
          url: base64,
          isPublic: true
        });

        notify.success(`${fileType === 'VIDEO' ? 'Video' : fileType === 'DOCUMENT' ? 'Document' : 'File'} uploaded successfully!`);
      } else {
        if (!uploadFormData.url.trim()) {
          notify.error('Please provide a URL');
          setUploading(false);
          return;
        }

        await resourceService.createResource({
          title: uploadFormData.title,
          description: uploadFormData.description,
          type: 'LINK',
          url: uploadFormData.url,
          isPublic: true
        });

        notify.success('Link resource created successfully!');
      }

      setShowUploadModal(false);
      resetUploadForm();
      loadResources();
    } catch (error: unknown) {
      console.error('Failed to upload resource:', error);
      
      const errorObj = error as { message?: string; statusCode?: number };
      
      // Provide more specific error messages
      if (errorObj.message?.includes('fetch') || errorObj.message?.includes('Network')) {
        notify.error('Cannot connect to server. Please ensure the backend is running.');
      } else if (errorObj.statusCode === 401) {
        notify.error('You must be logged in to upload resources');
      } else if (errorObj.statusCode === 413) {
        notify.error('File is too large. Maximum size is 100MB');
      } else if (errorObj.message) {
        notify.error(`Failed to upload: ${errorObj.message}`);
      } else {
        notify.error('Failed to upload resource. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DOCUMENT': return '📄';
      case 'VIDEO': return '🎥';
      case 'LINK': return '🔗';
      case 'OTHER': return '📦';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DOCUMENT':
        return isDark 
          ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' 
          : 'bg-blue-50 text-blue-600 border-blue-200';
      case 'VIDEO':
        return isDark 
          ? 'bg-purple-900/20 text-purple-400 border-purple-800/50' 
          : 'bg-purple-50 text-purple-600 border-purple-200';
      case 'LINK':
        return isDark 
          ? 'bg-green-900/20 text-green-400 border-green-800/50' 
          : 'bg-green-50 text-green-600 border-green-200';
      default:
        return isDark 
          ? 'bg-gray-700 text-gray-300 border-gray-600' 
          : 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Resource Library
        </h1>
        {canUpload && (
          <Button onClick={() => setShowUploadModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </Button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          onClick={() => setFilter('all')}
        >
          All Resources
        </Button>
        {canUpload && (
          <Button
            variant={filter === 'my' ? 'primary' : 'secondary'}
            onClick={() => setFilter('my')}
          >
            My Resources
          </Button>
        )}
        {isMentee && (
          <Button
            variant={filter === 'shared' ? 'primary' : 'secondary'}
            onClick={() => setFilter('shared')}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Shared With Me
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : resources.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <FileText className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No resources found
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeIcon(resource.type)}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(resource.type)}`}>
                      {resource.type}
                    </span>
                  </div>
                  {(resource.userId === user?.id || isAdmin) && (
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="text-red-500 hover:text-red-700"
                      title={isAdmin && resource.userId !== user?.id ? "Admin: Delete any resource" : "Delete your resource"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {resource.title}
                </h3>

                {resource.description && (
                  <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {resource.description}
                  </p>
                )}

                {/* Show who shared this resource (only in shared view) */}
                {filter === 'shared' && sharedResources.length > 0 && (
                  (() => {
                    const sharedResource = sharedResources.find(sr => sr.resource.id === resource.id);
                    return sharedResource ? (
                      <div className="flex items-center gap-2 mb-3 text-sm">
                        <Share2 className="w-4 h-4 text-blue-500" />
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          Shared by <span className="font-semibold">{sharedResource.sharedBy.firstName} {sharedResource.sharedBy.lastName}</span>
                        </span>
                      </div>
                    ) : null;
                  })()
                )}

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{resource.downloadCount || 0}</span>
                    </div>
                    <span>{formatDate(resource.createdAt)}</span>
                  </div>

                  {resource.url && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setPreviewResource(resource);
                          setShowPreviewModal(true);
                        }}
                        className="text-blue-500 hover:text-blue-700 text-sm h-auto py-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  )}
                </div>

                {resource.user && (
                  <p className={`text-xs mt-2 pt-2 border-t ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                    By: {resource.user.firstName} {resource.user.lastName}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-lg shadow-xl my-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 rounded-t-lg ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Add New Resource
              </h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetUploadForm();
                }}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[calc(90vh-12rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {/* Upload Type Toggle */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={uploadType === 'file' ? 'primary' : 'secondary'}
                  onClick={() => setUploadType('file')}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
                <Button
                  variant={uploadType === 'link' ? 'primary' : 'secondary'}
                  onClick={() => setUploadType('link')}
                  className="flex-1"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
              </div>

              {/* Title Input */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title *
                </label>
                <Input
                  value={uploadFormData.title}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter resource title"
                  required
                />
              </div>

              {/* Description Input */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={uploadFormData.description}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter resource description"
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              {/* File Upload or URL Input */}
              {uploadType === 'file' ? (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select File *
                  </label>
                  <FileUpload
                    onFileSelect={(files) => setUploadedFile(files[0])}
                    acceptedTypes={[
                      // Documents
                      'application/pdf',
                      'application/msword',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      'application/vnd.ms-excel',
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                      'application/vnd.ms-powerpoint',
                      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                      'text/plain',
                      // Images
                      'image/*',
                      // Videos
                      'video/*',
                      // Audio
                      'audio/*',
                      // Archives
                      'application/zip',
                      'application/x-rar-compressed',
                      'application/x-7z-compressed'
                    ]}
                    maxFileSize={100}
                    maxFiles={1}
                    showPreview={true}
                  />
                  <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Supported: Documents (PDF, Word, Excel, PPT), Images, Videos, Audio, Archives • Max 100MB
                  </p>
                </div>
              ) : (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    URL *
                  </label>
                  <Input
                    value={uploadFormData.url}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com/resource"
                    type="url"
                    required
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`flex justify-end gap-3 px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowUploadModal(false);
                  resetUploadForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Resource'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewResource && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`w-full max-w-5xl rounded-lg shadow-xl my-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 rounded-t-lg ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getTypeIcon(previewResource.type)}</span>
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {previewResource.title}
                  </h2>
                  {previewResource.description && (
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {previewResource.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewResource(null);
                }}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(90vh-12rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {previewResource.type === 'LINK' ? (
                <div className="text-center py-8">
                  <LinkIcon className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                  <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    This is an external link resource
                  </p>
                  <a
                    href={previewResource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Open Link
                  </a>
                </div>
              ) : previewResource.url.startsWith('data:application/pdf') ? (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
                  <iframe
                    src={previewResource.url}
                    className="w-full h-[70vh] border-0"
                    title={previewResource.title}
                  />
                  <div className="p-4 text-center bg-white dark:bg-gray-800 border-t dark:border-gray-700">
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      If PDF doesn't display, use the download button below
                    </p>
                  </div>
                </div>
              ) : previewResource.type === 'VIDEO' || previewResource.url.startsWith('data:video/') ? (
                <div className="bg-black rounded-lg overflow-hidden">
                  <video
                    controls
                    className="w-full max-h-[70vh]"
                    preload="metadata"
                  >
                    <source src={previewResource.url} />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : previewResource.url.startsWith('data:image/') ? (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <img
                    src={previewResource.url}
                    alt={previewResource.title}
                    className="max-w-full max-h-[70vh] mx-auto rounded"
                  />
                </div>
              ) : previewResource.type === 'DOCUMENT' ? (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
                  <iframe
                    src={previewResource.url}
                    className="w-full h-[70vh] border-0"
                    title={previewResource.title}
                  />
                  <div className="p-4 text-center bg-white dark:bg-gray-800 border-t dark:border-gray-700">
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      If PDF doesn't display, use the download button below
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
                  <FileText className="w-24 h-24 mx-auto mb-4 text-gray-400" />
                  <p className={`text-lg mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    File Preview Not Available
                  </p>
                  <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    This file type cannot be previewed. Please download to view.
                  </p>
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = previewResource.url;
                      link.download = previewResource.title;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>
                </div>
              )}

              {/* File Info */}
              <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Type</p>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{previewResource.type}</p>
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Downloads</p>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{previewResource.downloadCount || 0}</p>
                  </div>
                  {previewResource.user && (
                    <>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Uploaded by</p>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {previewResource.user.firstName} {previewResource.user.lastName}
                        </p>
                      </div>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Upload Date</p>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{formatDate(previewResource.createdAt)}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`flex justify-end gap-3 px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewResource(null);
                }}
              >
                Close
              </Button>
              {previewResource.type !== 'LINK' && (
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = previewResource.url;
                    link.download = previewResource.title;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    notify.success('Download started');
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManager;
