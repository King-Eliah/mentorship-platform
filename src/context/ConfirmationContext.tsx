import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useTheme } from './ThemeContext';

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => void;
  confirmDelete: (itemName: string, onConfirm: () => void | Promise<void>) => void;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider');
  }
  return context;
};

interface ConfirmationProviderProps {
  children: ReactNode;
}

export const ConfirmationProvider: React.FC<ConfirmationProviderProps> = ({ children }) => {
  const { isDark } = useTheme();
  const [confirmationState, setConfirmationState] = useState<ConfirmationOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const confirm = (options: ConfirmationOptions) => {
    setConfirmationState(options);
  };

  const confirmDelete = (itemName: string, onConfirm: () => void | Promise<void>) => {
    confirm({
      title: `Delete ${itemName}`,
      message: `Are you sure you want to delete this ${itemName.toLowerCase()}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm
    });
  };

  const handleConfirm = async () => {
    if (!confirmationState) return;
    
    try {
      setIsLoading(true);
      await confirmationState.onConfirm();
      setConfirmationState(null);
    } catch (error) {
      console.error('Confirmation action failed:', error);
      // Keep dialog open if action fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirmationState?.onCancel) {
      confirmationState.onCancel();
    }
    setConfirmationState(null);
  };

  const getTypeStyles = (type: ConfirmationOptions['type']) => {
    switch (type) {
      case 'danger':
        return {
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          icon: <Trash2 className="w-6 h-6 text-red-500" />,
          iconBg: isDark ? 'bg-red-900/30' : 'bg-red-100'
        };
      case 'warning':
        return {
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
          iconBg: isDark ? 'bg-yellow-900/30' : 'bg-yellow-100'
        };
      default:
        return {
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
          icon: <AlertTriangle className="w-6 h-6 text-blue-500" />,
          iconBg: isDark ? 'bg-blue-900/30' : 'bg-blue-100'
        };
    }
  };

  return (
    <ConfirmationContext.Provider value={{ confirm, confirmDelete }}>
      {children}
      
      {confirmationState && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border rounded-lg max-w-md w-full mx-4 overflow-hidden`}>
            {/* Header */}
            <div className="flex items-start p-6 pb-4">
              <div className={`flex-shrink-0 ${getTypeStyles(confirmationState.type).iconBg} rounded-full p-2 mr-4`}>
                {getTypeStyles(confirmationState.type).icon}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                } mb-2`}>
                  {confirmationState.title}
                </h3>
                <p className={`text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {confirmationState.message}
                </p>
              </div>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className={`flex-shrink-0 p-1 rounded-lg ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } transition-colors disabled:opacity-50`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions */}
            <div className={`flex space-x-3 px-6 py-4 ${
              isDark ? 'bg-gray-700/30' : 'bg-gray-50'
            }`}>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  isDark 
                    ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                } rounded-lg transition-colors disabled:opacity-50`}
              >
                {confirmationState.cancelText || 'Cancel'}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  getTypeStyles(confirmationState.type).confirmButton
                } rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Loading...
                  </div>
                ) : (
                  confirmationState.confirmText || 'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmationContext.Provider>
  );
};