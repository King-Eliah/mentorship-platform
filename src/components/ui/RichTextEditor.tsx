import React from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  height?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter your text...",
  readOnly = false,
  className = "",
  height = "200px"
}) => {
  return (
    <div className={`border border-gray-300 rounded-md ${className}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md"
        style={{ height }}
      />
    </div>
  );
};