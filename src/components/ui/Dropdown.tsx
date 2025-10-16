import React, { useRef, useEffect, ReactNode } from 'react';

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  trigger,
  children,
  className = '',
  position = 'bottom-right'
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'left-0 top-full mt-2';
      case 'bottom-right':
        return 'right-0 top-full mt-2';
      case 'top-left':
        return 'left-0 bottom-full mb-2';
      case 'top-right':
        return 'right-0 bottom-full mb-2';
      default:
        return 'right-0 top-full mt-2';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {trigger}
      
      {isOpen && (
        <div className={`
          absolute ${getPositionClasses()} min-w-48 max-w-64
          bg-white dark:bg-gray-800 
          rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 
          z-[60] py-1 
          animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200
          backdrop-blur-sm overflow-hidden
          ${className}
        `}>
          {children}
        </div>
      )}
    </div>
  );
};

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
  className?: string;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onClick,
  href,
  variant = 'default',
  disabled = false,
  className = ''
}) => {
  const baseClasses = `
    flex items-center px-3 py-2 text-sm transition-all duration-150 w-full text-left rounded-md mx-1 my-0.5
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${variant === 'destructive' 
      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300' 
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }
    ${className}
  `;

  if (href && !disabled) {
    return (
      <a href={href} className={baseClasses} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button 
      className={baseClasses} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export const DropdownSeparator: React.FC = () => (
  <hr className="my-1 mx-1 border-gray-200 dark:border-gray-600" />
);