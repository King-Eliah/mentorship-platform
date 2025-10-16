import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface ProgressBarProps {
  completionScore: number;
  maxScore?: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'indigo' | 'green' | 'blue' | 'purple';
  className?: string;
}

interface CompletionField {
  name: string;
  completed: boolean;
  weight: number;
  description?: string;
}

interface ProfileCompletionProps {
  fields: CompletionField[];
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  completionScore,
  maxScore = 100,
  showPercentage = true,
  size = 'md',
  color = 'indigo',
  className = ''
}) => {
  const percentage = Math.min(100, (completionScore / maxScore) * 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  const colorClasses = {
    indigo: 'bg-indigo-600',
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    purple: 'bg-purple-600'
  };

  const getProgressColor = (percent: number) => {
    if (percent < 30) return 'bg-red-500';
    if (percent < 60) return 'bg-yellow-500';
    if (percent < 80) return 'bg-orange-500';
    return colorClasses[color];
  };

  const getProgressLabel = (percent: number) => {
    if (percent < 30) return 'Just getting started';
    if (percent < 60) return 'Making progress';
    if (percent < 80) return 'Almost there';
    if (percent < 100) return 'Nearly complete';
    return 'Profile complete!';
  };

  return (
    <div className={`w-full ${className}`}>
      {showPercentage && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              Profile Completion
            </span>
            <span className="text-xs text-gray-500">
              ({getProgressLabel(percentage)})
            </span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className={`w-full ${sizeClasses[size]} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`${sizeClasses[size]} ${getProgressColor(percentage)} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showPercentage && percentage === 100 && (
        <div className="flex items-center space-x-1 mt-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-600 font-medium">
            Congratulations! Your profile is complete.
          </span>
        </div>
      )}
    </div>
  );
};

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({
  fields,
  className = ''
}) => {
  const completedFields = fields.filter(field => field.completed);
  const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
  const completedWeight = completedFields.reduce((sum, field) => sum + field.weight, 0);
  const completionScore = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Bar */}
      <ProgressBar 
        completionScore={completionScore}
        maxScore={100}
        showPercentage={true}
        size="md"
        color="indigo"
      />

      {/* Completion Checklist */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Profile Checklist
        </h4>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div
              key={index}
              className="flex items-center space-x-3"
            >
              {field.completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className={`text-sm ${
                  field.completed 
                    ? 'text-gray-900 font-medium' 
                    : 'text-gray-600'
                }`}>
                  {field.name}
                </span>
                {field.description && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {field.description}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-400">
                  {field.weight}pts
                </span>
                {field.completed && (
                  <span className="text-xs text-green-600 font-medium">
                    ✓
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {completedFields.length} of {fields.length} sections complete
            </span>
            <span className="font-medium text-gray-900">
              {completedWeight} / {totalWeight} points
            </span>
          </div>
        </div>
      </div>

      {/* Tips for Improvement */}
      {completionScore < 100 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            💡 Quick Tips to Improve Your Profile
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {fields
              .filter(field => !field.completed)
              .slice(0, 3)
              .map((field, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-600">•</span>
                  <span>{field.description || `Complete your ${field.name.toLowerCase()}`}</span>
                </li>
              ))
            }
          </ul>
        </div>
      )}
    </div>
  );
};

export { ProgressBar, ProfileCompletion };
export type { ProgressBarProps, ProfileCompletionProps, CompletionField };