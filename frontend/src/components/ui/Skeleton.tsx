import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'rectangular',
  width,
  height
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variants = {
    text: 'h-4 rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  };

  const style = {
    ...(width && { width }),
    ...(height && { height })
  };

  return (
    <div 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={style}
    />
  );
};

// Predefined skeleton components for common use cases
export const TextSkeleton: React.FC<{ className?: string; lines?: number }> = ({ 
  className = '', 
  lines = 1 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton 
        key={index} 
        variant="text" 
        className={index === lines - 1 ? 'w-3/4' : 'w-full'}
      />
    ))}
  </div>
);

export const CircleSkeleton: React.FC<{ size?: number; className?: string }> = ({ 
  size = 8, 
  className = '' 
}) => (
  <Skeleton 
    variant="circular" 
    className={`w-${size} h-${size} ${className}`}
  />
);

// Card skeleton for lists
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 ${className}`}>
    <div className="flex items-center space-x-3">
      <CircleSkeleton size={10} />
      <div className="flex-1">
        <Skeleton variant="text" className="h-5 w-3/4 mb-2" />
        <Skeleton variant="text" className="h-4 w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton variant="text" className="h-4 w-full" />
      <Skeleton variant="text" className="h-4 w-2/3" />
    </div>
  </div>
);

// Dashboard stats skeleton
export const StatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <CircleSkeleton size={8} className="mr-3" />
          <div className="flex-1">
            <Skeleton variant="text" className="h-4 w-20 mb-2" />
            <Skeleton variant="text" className="h-8 w-12" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Table skeleton for user management
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" className="h-5 w-3/4" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4 py-3 border-b border-gray-200 dark:border-gray-700" 
           style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={colIndex} className="flex items-center space-x-2">
            {colIndex === 0 && <CircleSkeleton size={6} />}
            <Skeleton variant="text" className="h-4 flex-1" />
          </div>
        ))}
      </div>
    ))}
  </div>
);

// Chat message skeleton
export const MessageSkeleton: React.FC<{ isOwn?: boolean }> = ({ isOwn = false }) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`flex space-x-3 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {!isOwn && <CircleSkeleton size={8} />}
      <div className={`px-4 py-2 rounded-lg ${isOwn ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'}`}>
        <div className="space-y-1">
          <Skeleton variant="text" className="h-4 w-32" />
          <Skeleton variant="text" className="h-4 w-24" />
        </div>
      </div>
    </div>
  </div>
);

// Conversation list skeleton
export const ConversationSkeleton: React.FC = () => (
  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
    <div className="flex items-center space-x-3">
      <div className="relative">
        <CircleSkeleton size={12} />
        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800">
          <Skeleton variant="circular" className="w-full h-full" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="h-4 w-24" />
          <Skeleton variant="text" className="h-3 w-12" />
        </div>
        <Skeleton variant="text" className="h-3 w-full mt-1" />
      </div>
    </div>
  </div>
);

// Event card skeleton
export const EventSkeleton: React.FC = () => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <Skeleton variant="text" className="h-6 w-3/4 mb-2" />
        <Skeleton variant="text" className="h-4 w-1/2" />
      </div>
      <Skeleton variant="rectangular" className="w-16 h-6" />
    </div>
    
    <div className="space-y-2">
      <Skeleton variant="text" className="h-4 w-full" />
      <Skeleton variant="text" className="h-4 w-2/3" />
    </div>
    
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <CircleSkeleton size={4} />
        <Skeleton variant="text" className="h-4 w-16" />
      </div>
      <div className="flex items-center space-x-2">
        <CircleSkeleton size={4} />
        <Skeleton variant="text" className="h-4 w-12" />
      </div>
    </div>
    
    <div className="flex space-x-2">
      <Skeleton variant="rectangular" className="h-8 w-20" />
      <Skeleton variant="rectangular" className="h-8 w-16" />
    </div>
  </div>
);

// Resource card skeleton for file uploads
export const ResourceSkeleton: React.FC = () => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
    <div className="flex items-center space-x-3">
      <CircleSkeleton size={10} />
      <div className="flex-1">
        <Skeleton variant="text" className="h-5 w-3/4 mb-2" />
        <Skeleton variant="text" className="h-4 w-1/2" />
      </div>
      <Skeleton variant="rectangular" className="w-8 h-8" />
    </div>
    <div className="space-y-2">
      <Skeleton variant="text" className="h-4 w-full" />
      <Skeleton variant="text" className="h-4 w-2/3" />
    </div>
    <div className="flex space-x-2">
      <Skeleton variant="rectangular" className="h-8 w-20" />
      <Skeleton variant="rectangular" className="h-8 w-16" />
      <Skeleton variant="rectangular" className="h-8 w-12" />
    </div>
  </div>
);

// Users management table row skeleton
export const UserRowSkeleton: React.FC = () => (
  <tr className="border-b border-gray-200 dark:border-gray-700">
    <td className="px-4 py-3">
      <div className="flex items-center">
        <Skeleton variant="rectangular" className="w-4 h-4 mr-3" />
        <CircleSkeleton size={8} className="mr-3" />
        <div>
          <Skeleton variant="text" className="h-4 w-32 mb-1" />
          <Skeleton variant="text" className="h-3 w-24" />
        </div>
      </div>
    </td>
    <td className="px-4 py-3">
      <Skeleton variant="text" className="h-4 w-48" />
    </td>
    <td className="px-4 py-3">
      <Skeleton variant="rectangular" className="h-6 w-16" />
    </td>
    <td className="px-4 py-3">
      <Skeleton variant="rectangular" className="h-6 w-12" />
    </td>
    <td className="px-4 py-3">
      <Skeleton variant="text" className="h-4 w-20" />
    </td>
    <td className="px-4 py-3">
      <div className="flex space-x-2">
        <Skeleton variant="rectangular" className="h-8 w-8" />
        <Skeleton variant="rectangular" className="h-8 w-8" />
      </div>
    </td>
  </tr>
);

// Upload progress skeleton with animated progress bar
export const UploadSkeleton: React.FC<{ fileName?: string }> = ({ fileName = 'Processing...' }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
        <div className="w-4 h-4 bg-blue-500 rounded animate-pulse"></div>
      </div>
      <div className="flex-1">
        <div className="font-medium text-sm">{fileName}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Uploading to server...</div>
      </div>
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '45%' }}></div>
    </div>
  </div>
);

// List loading skeleton with multiple items
export const ListSkeleton: React.FC<{ 
  items?: number; 
  itemComponent?: React.ComponentType 
}> = ({ 
  items = 5, 
  itemComponent: ItemComponent = CardSkeleton 
}) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, i) => (
      <ItemComponent key={i} />
    ))}
  </div>
);