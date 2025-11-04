import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Edit, Trash2, UserPlus, UserMinus, Settings, Copy, Share } from 'lucide-react';

interface ActionItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success';
  disabled?: boolean;
}

interface ActionDropdownProps {
  actions: ActionItem[];
  size?: 'sm' | 'md';
  align?: 'left' | 'right';
  className?: string;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({
  actions,
  size = 'md',
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
  };

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
  };

  const getVariantClasses = (variant: ActionItem['variant']) => {
    switch (variant) {
      case 'danger':
        return 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20';
      case 'success':
        return 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20';
      default:
        return 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`${sizeClasses[size]} flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
      >
        <MoreVertical className={iconSizeClasses[size]} />
      </button>

      {isOpen && (
        <div className={`absolute top-full mt-1 ${alignClasses[align]} z-50 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700`}>
          <div className="py-1">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!action.disabled) {
                      action.onClick();
                      setIsOpen(false);
                    }
                  }}
                  disabled={action.disabled}
                  className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                    action.disabled 
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                      : getVariantClasses(action.variant)
                  }`}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Pre-built action creators for common use cases
export const createViewAction = (onClick: () => void): ActionItem => ({
  icon: Eye,
  label: 'View Details',
  onClick,
});

export const createEditAction = (onClick: () => void): ActionItem => ({
  icon: Edit,
  label: 'Edit',
  onClick,
});

export const createDeleteAction = (onClick: () => void): ActionItem => ({
  icon: Trash2,
  label: 'Delete',
  onClick,
  variant: 'danger',
});

export const createAddMemberAction = (onClick: () => void): ActionItem => ({
  icon: UserPlus,
  label: 'Add Member',
  onClick,
  variant: 'success',
});

export const createRemoveMemberAction = (onClick: () => void): ActionItem => ({
  icon: UserMinus,
  label: 'Remove Member',
  onClick,
  variant: 'danger',
});

export const createSettingsAction = (onClick: () => void): ActionItem => ({
  icon: Settings,
  label: 'Settings',
  onClick,
});

export const createCopyAction = (onClick: () => void): ActionItem => ({
  icon: Copy,
  label: 'Copy',
  onClick,
});

export const createShareAction = (onClick: () => void): ActionItem => ({
  icon: Share,
  label: 'Share',
  onClick,
});