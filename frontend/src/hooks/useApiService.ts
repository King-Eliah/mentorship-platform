import { useState, useCallback } from 'react';
import { APIError, apiUtils } from '../services/api';
import toast from 'react-hot-toast';

export interface UseApiServiceOptions {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  retryable?: boolean;
  loadingInitial?: boolean;
  enabled?: boolean;
}

export interface UseApiServiceResult<T> {
  data: T | null;
  loading: boolean;
  error: APIError | null;
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
  retry: () => void;
}

/**
 * Enhanced hook for API calls with standardized error handling, loading states, and toast notifications
 * This replaces direct mock API usage throughout the application
 */
export function useApiService<T>(
  apiFunction: (...args: unknown[]) => Promise<T>,
  options: UseApiServiceOptions = {}
): UseApiServiceResult<T> {
  const {
    showErrorToast = true,
    showSuccessToast = false,
    retryable = true,
    loadingInitial = false
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(loadingInitial);
  const [error, setError] = useState<APIError | null>(null);
  const [lastArgs, setLastArgs] = useState<unknown[]>([]);

  const execute = useCallback(async (...args: unknown[]): Promise<T | null> => {
    setLoading(true);
    setError(null);
    setLastArgs(args);

    try {
      const result = await apiFunction(...args);
      setData(result);
      
      if (showSuccessToast) {
        toast.success('Operation completed successfully');
      }
      
      return result;
    } catch (err) {
      const apiError = apiUtils.formatError(err);
      setError(apiError);
      
      if (showErrorToast) {
        const errorMessage = apiError.message || 'An unexpected error occurred';
        toast.error(retryable ? `${errorMessage} (Use retry button to try again)` : errorMessage);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, showErrorToast, showSuccessToast, retryable]);

  const retry = useCallback(() => {
    if (lastArgs.length > 0) {
      execute(...lastArgs);
    }
  }, [execute, lastArgs]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    setLastArgs([]);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    retry
  };
}

/**
 * Specialized hook for paginated API calls
 */
export interface UsePaginatedApiOptions extends UseApiServiceOptions {
  initialPage?: number;
  initialSize?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  hasMore: boolean;
}

export interface UsePaginatedApiResult<T> extends Omit<UseApiServiceResult<PaginatedResponse<T>>, 'execute'> {
  items: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
  loadPage: (page: number, size?: number) => Promise<PaginatedResponse<T> | null>;
  loadMore: () => Promise<PaginatedResponse<T> | null>;
  refresh: () => Promise<PaginatedResponse<T> | null>;
}

export function usePaginatedApi<T>(
  apiFunction: (page: number, size: number, ...args: unknown[]) => Promise<PaginatedResponse<T>>,
  options: UsePaginatedApiOptions = {}
): UsePaginatedApiResult<T> {
  const { initialPage = 0, initialSize = 20, ...restOptions } = options;
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialSize);
  
  const baseApi = useApiService(
    apiFunction as (...args: unknown[]) => Promise<PaginatedResponse<T>>,
    restOptions
  );

  const loadPage = useCallback(async (page: number, size?: number): Promise<PaginatedResponse<T> | null> => {
    const effectiveSize = size || pageSize;
    setCurrentPage(page);
    if (size) setPageSize(size);
    
    return baseApi.execute(page, effectiveSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const loadMore = useCallback(async (): Promise<PaginatedResponse<T> | null> => {
    return loadPage(currentPage + 1);
  }, [loadPage, currentPage]);

  const refresh = useCallback(async (): Promise<PaginatedResponse<T> | null> => {
    return loadPage(0);
  }, [loadPage]);

  return {
    ...baseApi,
    items: baseApi.data?.content || [],
    totalElements: baseApi.data?.totalElements || 0,
    totalPages: baseApi.data?.totalPages || 0,
    currentPage,
    pageSize,
    hasMore: baseApi.data?.hasMore || false,
    loadPage,
    loadMore,
    refresh
  };
}

/**
 * Hook for mutation operations (POST, PUT, DELETE)
 */
export interface UseMutationOptions extends UseApiServiceOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: APIError) => void;
  invalidateQueries?: string[];
}

export function useMutation<T, TArgs extends unknown[]>(
  mutationFunction: (...args: TArgs) => Promise<T>,
  options: UseMutationOptions = {}
): UseApiServiceResult<T> & { mutate: (...args: TArgs) => Promise<T | null> } {
  const { onSuccess, onError, invalidateQueries, ...restOptions } = options;
  
  const baseApi = useApiService(
    mutationFunction as (...args: unknown[]) => Promise<T>,
    {
      ...restOptions,
      showSuccessToast: restOptions.showSuccessToast ?? true
    }
  );

  const mutate = useCallback(async (...args: TArgs): Promise<T | null> => {
    const result = await baseApi.execute(...args);
    
    if (result) {
      onSuccess?.(result);
      
      // TODO: Implement query invalidation if using React Query
      // For now, just notify about successful operation
      if (invalidateQueries) {
        console.log('Would invalidate queries:', invalidateQueries);
      }
    } else if (baseApi.error) {
      onError?.(baseApi.error);
    }
    
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSuccess, onError, invalidateQueries]);

  return {
    ...baseApi,
    mutate
  };
}