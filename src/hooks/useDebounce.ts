import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value and prevent rapid state changes
 * Useful for preventing skeleton UI flickering
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debounced loading states to prevent skeleton flickering
 */
export function useDebouncedLoading(loading: boolean, delay: number = 300) {
  const [isLoading, setIsLoading] = useState(loading);
  const [shouldShowSkeleton, setShouldShowSkeleton] = useState(loading);

  useEffect(() => {
    if (loading) {
      // Show skeleton immediately when loading starts
      setIsLoading(true);
      setShouldShowSkeleton(true);
    } else {
      // Debounce hiding the skeleton to prevent flickering
      setIsLoading(false);
      const timer = setTimeout(() => {
        setShouldShowSkeleton(false);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [loading, delay]);

  return {
    isLoading,
    shouldShowSkeleton,
  };
}