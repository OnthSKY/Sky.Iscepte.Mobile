/**
 * useApiQuery Hook
 * 
 * Single Responsibility: Wraps React Query useQuery with httpService integration
 * Dependency Inversion: Depends on httpService interface, not concrete implementation
 * 
 * Provides type-safe, error-handled query hooks with automatic retry and caching
 */

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import httpService from '../../shared/services/httpService';
import { ApiError, isApiError } from '../types/apiErrors';
import { getErrorMessage, isRetryableError } from '../utils/errorUtils';
import { createRetryFunction, createRetryDelayFunction, RetryConfigs, getRetryStrategyForError } from '../utils/retryUtils';

/**
 * ApiQuery options extending React Query options
 */
export interface ApiQueryOptions<TData, TError = ApiError> extends Omit<UseQueryOptions<TData, TError>, 'queryFn' | 'retry'> {
  /**
   * API endpoint URL
   */
  url: string;
  
  /**
   * HTTP method (default: GET)
   */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  
  /**
   * Request body (for POST, PUT)
   */
  body?: any;
  
  /**
   * Request headers
   */
  headers?: Record<string, string>;
  
  /**
   * Custom retry logic based on error type
   */
  retry?: boolean | number | ((failureCount: number, error: TError) => boolean);
  
  /**
   * Whether to enable the query
   */
  enabled?: boolean;
  
  /**
   * Transform response data
   */
  transform?: (data: any) => TData;
}

/**
 * ApiQuery result extending React Query result
 */
export type ApiQueryResult<TData, TError = ApiError> = UseQueryResult<TData, TError> & {
  /**
   * Human-readable error message
   */
  errorMessage?: string;
  
  /**
   * Whether error is retryable
   */
  isRetryable?: boolean;
};

/**
 * useApiQuery hook - Wrapper for React Query useQuery with httpService
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useApiQuery<ProductStats>({
 *   url: '/products/stats',
 *   queryKey: ['products', 'stats'],
 * });
 * ```
 * 
 * @example With custom retry
 * ```tsx
 * const { data } = useApiQuery<Product>({
 *   url: `/products/${id}`,
 *   queryKey: ['products', id],
 *   retry: (failureCount, error) => {
 *     if (isRetryableError(error)) {
 *       return failureCount < 3;
 *     }
 *     return false;
 *   },
 * });
 * ```
 */
export function useApiQuery<TData = unknown, TError = ApiError>(
  options: ApiQueryOptions<TData, TError>
): ApiQueryResult<TData, TError> {
  const {
    url,
    method = 'GET',
    body,
    headers,
    retry: customRetry,
    enabled = true,
    transform,
    queryKey,
    ...queryOptions
  } = options;
  
  // Require queryKey
  if (!queryKey) {
    throw new Error('queryKey is required for useApiQuery');
  }

  // Default retry logic: smart retry based on error type
  const retry: UseQueryOptions<TData, TError>['retry'] = customRetry !== undefined
    ? customRetry
    : createRetryFunction(RetryConfigs.query);
  
  // Default retry delay: exponential backoff with jitter
  const retryDelay: UseQueryOptions<TData, TError>['retryDelay'] = 
    queryOptions.retryDelay !== undefined
      ? queryOptions.retryDelay
      : createRetryDelayFunction(RetryConfigs.query);

  // Query function
  const queryFn = async (): Promise<TData> => {
    let result: any;
    
    switch (method) {
      case 'GET':
        result = await httpService.get<TData>(url, { headers });
        break;
      case 'POST':
        result = await httpService.post<TData>(url, body, { headers });
        break;
      case 'PUT':
        result = await httpService.put<TData>(url, body, { headers });
        break;
      case 'DELETE':
        result = await httpService.delete<TData>(url, { headers });
        break;
      default:
        result = await httpService.get<TData>(url, { headers });
    }
    
    // Apply transformation if provided
    return transform ? transform(result) : result;
  };

  // Use React Query
  const queryResult = useQuery<TData, TError>({
    ...queryOptions,
    queryKey,
    queryFn,
    retry,
    retryDelay,
    enabled,
  });

  // Extract error message and retryable status
  const errorMessage = queryResult.error 
    ? getErrorMessage(queryResult.error) 
    : undefined;
  
  const isRetryable = queryResult.error 
    ? isRetryableError(queryResult.error) 
    : undefined;

  return {
    ...queryResult,
    errorMessage,
    isRetryable,
  };
}

