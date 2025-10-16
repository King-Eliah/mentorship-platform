import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText, AlertCircle, Check } from 'lucide-react';
import { Button } from './Button';

export interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  onFileRemove?: (index: number) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  multiple?: boolean;
  showPreview?: boolean;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  uploadText?: string;
  dragText?: string;
}

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt'],
  maxFileSize = 10, // 10MB default
  maxFiles = 5,
  multiple = true,
  showPreview = true,
  className = '',
  disabled = false,
  children,
  uploadText = 'Click to upload or drag and drop',
  dragText = 'Drop files here'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((fileList: FileList) => {
    const validateFile = (file: File): string | null => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        return `File "${file.name}" is too large. Maximum size is ${maxFileSize}MB.`;
      }

      // Check file type
      if (acceptedTypes.length > 0) {
        const fileType = file.type;
        const fileName = file.name.toLowerCase();
        const isValidType = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return fileName.endsWith(type);
          }
          if (type.includes('/*')) {
            const baseType = type.split('/')[0];
            return fileType.startsWith(baseType);
          }
          return fileType === type;
        });

        if (!isValidType) {
          return `File "${file.name}" has an unsupported format. Accepted types: ${acceptedTypes.join(', ')}.`;
        }
      }

      return null;
    };

    const newFiles: FileWithPreview[] = [];
    const newErrors: string[] = [];

    Array.from(fileList).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
        return;
      }

      if (files.length + newFiles.length >= maxFiles) {
        newErrors.push(`Maximum ${maxFiles} files allowed.`);
        return;
      }

      const fileWithPreview: FileWithPreview = Object.assign(file, {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      });

      // Create preview for images
      if (showPreview && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileWithPreview.preview = e.target?.result as string;
          setFiles(prev => [...prev]);
        };
        reader.readAsDataURL(file);
      }

      newFiles.push(fileWithPreview);
    });

    if (newFiles.length > 0) {
      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
      setFiles(updatedFiles);
      onFileSelect(updatedFiles);
    }

    setErrors(newErrors);
  }, [files, maxFiles, multiple, onFileSelect, showPreview, acceptedTypes, maxFileSize]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [disabled, processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }, [disabled, processFiles]);

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFileSelect(updatedFiles);
    onFileRemove?.(index);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    if (file.type.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (file.type.includes('word') || file.type.includes('document')) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer
          ${dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          bg-white dark:bg-gray-800
        `}
        onClick={handleClick}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          disabled={disabled}
        />

        {children || (
          <div className="space-y-2">
            <Upload className={`mx-auto h-8 w-8 ${dragActive ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`} />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {dragActive ? dragText : uploadText}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {acceptedTypes.join(', ')} up to {maxFileSize}MB
            </div>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-3 space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* File Preview */}
      {showPreview && files.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Selected Files ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="h-10 w-10 object-cover rounded border border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="h-10 w-10 flex items-center justify-center bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-600">
                      {getFileIcon(file)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-gray-400 hover:text-red-500"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress Placeholder */}
      {/* In a real app, you would show upload progress here */}
    </div>
  );
};

export default FileUpload;