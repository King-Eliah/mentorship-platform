import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LoadingContextType {
  showSkeleton: boolean;
  setShowSkeleton: (show: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-hide skeleton after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const value = {
    showSkeleton,
    setShowSkeleton,
    isLoading,
    setIsLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};