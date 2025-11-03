import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, CheckCircle, AlertCircle } from 'lucide-react';
import { frontendService } from '../services/frontendService';
import { Button } from './ui/Button';

interface FileUploadResponse {
  url?: string;
  fileUrl?: string;
  filename?: string;
}

interface UploadedFile {
  file: File;
  url?: string;
  error?: string;
  uploading: boolean;
  progress: number;
  preview?: string;
}

interface FileUploadProps {
  onFileUpload: (fileUrl: string, fileName: string) => void;
  onError?: (error: string) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  uploadEndpoint?: string;
  multiple?: boolean;
  className?: string;
  showPreview?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  onError,
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt'],
  maxSize = 10, // 10MB default
  uploadEndpoint = '/files/upload',
  multiple = false,
  className = '',
  showPreview = true,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileName.endsWith(type);
      }
      if (type.includes('/*')) {
        const category = type.split('/')[0];
        return fileType.startsWith(category);
      }
      return fileType === type;
    });

    if (!isValidType) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  }, [acceptedTypes, maxSize]);

  const createFilePreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  }, []);

  const uploadFile = useCallback(async (file: File, index: number) => {
    try {
      // Mock file upload with progress simulation
      const mockProgress = async () => {
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
          setFiles(prev => prev.map((f, i) => 
            i === index ? { ...f, progress } : f
          ));
        }
      };
      
      await mockProgress();

      // Update file with success
      setFiles(prev => prev.map((f, i) => 
        i === index 
          ? { ...f, uploading: false, url: `mock-url-${file.name}`, progress: 100 }
          : f
      ));

      // Call success callback with mock data
      onFileUpload(`mock-url-${file.name}`, file.name);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      // Update file with error
      setFiles(prev => prev.map((f, i) => 
        i === index 
          ? { ...f, uploading: false, error: errorMessage, progress: 0 }
          : f
      ));

      onError?.(errorMessage);
    }
  }, [uploadEndpoint, onFileUpload, onError]);

  const handleFileSelect = useCallback(async (selectedFiles: FileList) => {
    const fileArray = Array.from(selectedFiles);
    
    if (!multiple && fileArray.length > 1) {
      onError?.('Only one file can be uploaded at a time');
      return;
    }

    const newFiles: UploadedFile[] = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      
      if (validationError) {
        onError?.(validationError);
        continue;
      }

      const preview = showPreview ? await createFilePreview(file) : undefined;
      
      newFiles.push({
        file,
        uploading: true,
        progress: 0,
        preview,
      });
    }

    // Update files list
    setFiles(prev => multiple ? [...prev, ...newFiles] : newFiles);

    // Start uploads
    const startIndex = multiple ? files.length : 0;
    newFiles.forEach((fileObj, index) => {
      uploadFile(fileObj.file, startIndex + index);
    });
  }, [files.length, multiple, onError, showPreview, validateFile, createFilePreview, uploadFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const retryUpload = (index: number) => {
    const file = files[index];
    if (file && file.error) {
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, error: undefined, uploading: true, progress: 0 } : f
      ));
      uploadFile(file.file, index);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${files.some(f => f.uploading) ? 'pointer-events-none opacity-75' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isDragOver ? 'Drop files here' : 'Upload files'}
        </h3>
        <p className="text-gray-600 mb-2">
          Drag and drop files here, or click to select
        </p>
        <p className="text-sm text-gray-500">
          Accepted: {acceptedTypes.join(', ')} • Max size: {maxSize}MB
          {multiple && ' • Multiple files allowed'}
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            {multiple ? 'Uploaded Files' : 'File Upload'}
          </h4>
          
          {files.map((fileObj, index) => (
            <div key={index} className="border rounded-lg p-4 bg-white">
              <div className="flex items-start space-x-3">
                {/* File Icon/Preview */}
                <div className="flex-shrink-0">
                  {showPreview && fileObj.preview ? (
                    <img
                      src={fileObj.preview}
                      alt="Preview"
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    getFileIcon(fileObj.file)
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fileObj.file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(fileObj.file.size)}
                      </p>
                    </div>

                    {/* Status Icon */}
                    <div className="flex items-center space-x-2">
                      {fileObj.uploading && (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                      )}
                      {fileObj.url && !fileObj.error && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {fileObj.error && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {fileObj.uploading && (
                    <div className="mt-2">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${fileObj.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Uploading... {fileObj.progress}%
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {fileObj.error && (
                    <div className="mt-2">
                      <p className="text-sm text-red-600">{fileObj.error}</p>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-1"
                        onClick={() => retryUpload(index)}
                      >
                        Retry Upload
                      </Button>
                    </div>
                  )}

                  {/* Success Message */}
                  {fileObj.url && !fileObj.error && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600">Upload successful!</p>
                      {showPreview && fileObj.url && (
                        <a
                          href={fileObj.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View file
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;