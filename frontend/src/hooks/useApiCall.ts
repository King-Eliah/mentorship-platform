import { useCallback, useEffect, useState, useRef } from 'react';

export interface ApiCallOptions {
  immediate?: boolean;
  debounceMs?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ApiCallResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  call: (...args: any[]) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook to manage API calls with loading states, error handling, and debouncing
 * Prevents infinite re-fetching and provides smooth loading states
 */
export function useApiCall<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: ApiCallOptions = {}
): ApiCallResult<T> {
  const {
    immediate = false,
    debounceMs = 300,
    retries = 3,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retriesRef = useRef(0);

  const call = useCallback(
    async (...args: any[]) => {
      // Clear any existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Debounce the API call
      debounceRef.current = setTimeout(async () => {
        // Cancel any previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();
        
        setLoading(true);
        setError(null);
        retriesRef.current = 0;

        const makeRequest = async (): Promise<void> => {
          try {
            const result = await apiFunction(...args);
            if (!abortControllerRef.current?.signal.aborted) {
              setData(result);
              setError(null);
            }
          } catch (err) {
            if (!abortControllerRef.current?.signal.aborted) {
              // Retry logic
              if (retriesRef.current < retries && (err as Error).name !== 'AbortError') {
                retriesRef.current++;
                setTimeout(makeRequest, retryDelay);
                return;
              }
              
              setError(err as Error);
              setData(null);
            }
          } finally {
            if (!abortControllerRef.current?.signal.aborted) {
              setLoading(false);
            }
          }
        };

        await makeRequest();
      }, debounceMs);
    },
    [apiFunction, debounceMs, retries, retryDelay]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    retriesRef.current = 0;
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Make immediate call if requested
  useEffect(() => {
    if (immediate) {
      call();
    }
  }, [immediate, call]);

  return {
    data,
    loading,
    error,
    call,
    reset,
  };
}