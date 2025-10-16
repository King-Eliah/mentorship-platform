import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    label,
    error,
    helperText,
    resize = 'vertical',
    fullWidth = false,
    className = '',
    id,
    rows = 4,
    ...props
  }, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const widthClass = fullWidth ? 'w-full' : '';

    const baseClasses = `
      block px-3 py-2 border rounded-lg text-sm
      placeholder-gray-400 
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-colors
    `;

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    const textareaClasses = hasError
      ? `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-500`
      : `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;

    return (
      <div className={widthClass}>
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={`${textareaClasses} ${resizeClasses[resize]} ${className}`}
          {...props}
        />
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';