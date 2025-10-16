import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(option => option.value === value);
  
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-4 py-3 text-sm 
          bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
          rounded-xl shadow-sm transition-all duration-150 ease-in-out
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:border-primary-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
          }
          ${isOpen ? 'border-primary-500 shadow-md' : ''}
        `}
      >
        <span className={`truncate ${selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Options */}
          <div className="
            absolute top-full left-0 mt-2 min-w-full w-max max-w-xs
            bg-white dark:bg-gray-800 
            rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 
            z-20 py-2 max-h-60 overflow-y-auto
            animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200
            backdrop-blur-sm
          ">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full flex items-center px-4 py-3 text-sm text-left
                  transition-all duration-150 rounded-lg mx-2 my-1
                  ${option.value === value
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                  hover:scale-[1.02] whitespace-nowrap
                `}
              >
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};