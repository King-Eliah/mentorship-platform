import React, { useState, useEffect } from 'react';
import { Moon, Sun, Keyboard } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggleHint: React.FC = () => {
  const [show, setShow] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    // Show hint after 3 seconds if user hasn't toggled theme
    const timer = setTimeout(() => {
      setShow(true);
    }, 3000);

    // Hide hint after 10 seconds
    const hideTimer = setTimeout(() => {
      setShow(false);
    }, 13000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            {isDark ? (
              <Sun className="w-4 h-4 text-white" />
            ) : (
              <Moon className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Try Dark Mode!
            </p>
            <div className="flex items-center space-x-1 mt-1">
              <Keyboard className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Ctrl+Shift+D
              </span>
            </div>
          </div>
          <button
            onClick={() => setShow(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};