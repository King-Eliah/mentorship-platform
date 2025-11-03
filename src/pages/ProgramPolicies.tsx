import React from 'react';
import { Shield } from 'lucide-react';

export const ProgramPolicies: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <Shield className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Program Policies
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        Policy management functionality coming soon
      </p>
    </div>
  );
};