/**
 * useAsyncData Hook
 * 
 * Single Responsibility: Generic async data fetching with loading, error, and data state
 * Dependency Inversion: Accepts any async function, returns standardized state
 * 
 * This hook eliminates repeated async data fetching patterns across the codebase
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { log } from '../utils/logger';

export interface UseAsyncDataOptions<T> {
  /**
   * Initial data value (before first fetch)
   */
  initialData?: T | null;
  
  /**
   * Whether to fetch data immediately on mount
   * @default true
   */
  immediate?: boolean;
  
  /**
   * Function to transform the fetched data
   */
  transform?: (data: any) => T;
  
  /**
   * Custom error handler
   */
  onError?: (error: Error) => void;
  
  /**
   * Custom success handler
   */
  onSuccess?: (data: T) => void;
}

export interface UseAsyncDataResult<T> {
  /**
   * The fetched data
   */
  data: T | null;
  
  /**
   * Loading state
   */
  loading: boolean;
  
  /**
   * Error object if fetch failed
   */
  error: Error | null;
  
  /**
   * Manually trigger data fetch
   */
  refetch: () => Promise<void>;
  
  /**
   * Reset data, loading, and error states
   */
  reset: () => void;
}

/**
 * Generic hook for async data fetching
 * 
 * @param fetchFn - Function that returns a Promise with the data
 * @param deps - Dependency array (similar to useEffect)
 * @param options - Optional configuration
 * 
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useAsyncData(
 *   () => service.get(id),
 *   [id]
 * );
 * ```
 * 
 * @example With transformation
 * ```tsx
 * const { data, loading, error } = useAsyncData(
 *   () => fetchUser(id),
 *   [id],
 *   {
 *     transform: (user) => ({ ...user, fullName: `${user.firstName} ${user.lastName}` }),
 *     onError: (err) => log.error('Failed to load user:', err),
 *   }
 * );
 * ```
 */
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataResult<T> {
  const {
    initialData = null,
    immediate = true,
    transform,
    onError,
    onSuccess,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);
  
  // Use ref to track if component is mounted
  const mountedRef = useRef(true);
  
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const executeFetch = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFn();
      
      if (!mountedRef.current) return;
      
      const transformedData = transform ? transform(result) : result;
      setData(transformedData);
      
      if (onSuccess) {
        onSuccess(transformedData);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      setError(error);
      
      if (onError) {
        onError(error);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFn, transform, onError, onSuccess]);

  // Fetch data when dependencies change
  useEffect(() => {
    if (immediate) {
      executeFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps.concat([immediate]));

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    refetch: executeFetch,
    reset,
  };
}

