import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    showPasswordToggle = false,
    fullWidth = false,
    inputSize = 'md',
    type = 'text',
    className = '',
    id,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [inputType, setInputType] = useState(type);

    const handleTogglePassword = () => {
      setShowPassword(!showPassword);
      setInputType(showPassword ? 'password' : 'text');
    };

    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const widthClass = fullWidth ? 'w-full' : '';

    // Size-based padding and text size
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-3 py-2.5 text-base'
    };

    const baseInputClasses = `
      block border rounded-lg w-full
      placeholder-gray-400 dark:placeholder-gray-500
      bg-white dark:bg-gray-800
      text-gray-900 dark:text-gray-100
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-colors
      ${sizeClasses[inputSize]}
    `;

    const inputClasses = hasError
      ? `${baseInputClasses} border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500`
      : `${baseInputClasses} border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500`;

    const containerClasses = `relative ${widthClass}`;
    const paddingLeft = leftIcon ? 'pl-10' : 'pl-3';
    const paddingRight = (rightIcon || (showPasswordToggle && type === 'password')) ? 'pr-10' : 'pr-3';

    return (
      <div className={containerClasses}>
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 dark:text-gray-500">{leftIcon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={showPasswordToggle && type === 'password' ? inputType : type}
            className={`${inputClasses} ${paddingLeft} ${paddingRight} ${className}`}
            {...props}
          />
          
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
              onClick={handleTogglePassword}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
          
          {rightIcon && !showPasswordToggle && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 dark:text-gray-500">{rightIcon}</span>
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';