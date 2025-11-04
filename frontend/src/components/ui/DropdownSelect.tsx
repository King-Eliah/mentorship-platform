import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface DropdownSelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  showSearch?: boolean;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export const DropdownSelect: React.FC<DropdownSelectProps> = ({
  label,
  placeholder = 'Select an option...',
  options,
  value,
  onChange,
  error,
  disabled = false,
  className = '',
  showSearch = false,
  position = 'bottom-left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(option => option.value === value);

  const filteredOptions = showSearch && searchTerm
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, showSearch]);

  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

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
        return 'left-0 top-full mt-2';
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
            bg-white dark:bg-gray-700 text-left
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-150 flex items-center justify-between
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'}
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          `}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {selectedOption?.icon && (
              <div className="flex-shrink-0 text-gray-400">
                {selectedOption.icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {selectedOption ? (
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {selectedOption.label}
                  </div>
                  {selectedOption.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {selectedOption.description}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
              )}
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className={`
            absolute ${getPositionClasses()} w-full min-w-full max-w-sm
            bg-white dark:bg-gray-800 
            rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 
            z-[60] py-1 max-h-64 overflow-y-auto
            animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200
          `}>
            {/* Search Input */}
            {showSearch && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded 
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* Options List */}
            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect(option.value)}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm transition-all duration-150 
                      text-left hover:bg-gray-100 dark:hover:bg-gray-700
                      ${value === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}
                    `}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {option.icon && (
                        <div className="flex-shrink-0 text-gray-400">
                          {option.icon}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${
                          value === option.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </div>
                    {value === option.value && (
                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default DropdownSelect;