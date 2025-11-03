import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon: Icon,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      {Icon && (
        <div className="flex justify-center mb-6">
          <Icon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
        {message}
      </p>
      
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'primary'}
          className="inline-flex items-center gap-2"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};