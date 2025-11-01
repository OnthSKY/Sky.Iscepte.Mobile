/**
 * useApiMutation Hook
 * 
 * Single Responsibility: Wraps React Query useMutation with httpService integration
 * Dependency Inversion: Depends on httpService interface, not concrete implementation
 * 
 * Provides type-safe, error-handled mutation hooks with optimistic updates support
 */

import { useMutation, UseMutationOptions, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import httpService from '../../shared/services/httpService';
import { ApiError, isApiError } from '../types/apiErrors';
import { getErrorMessage, isRetryableError } from '../utils/errorUtils';

/**
 * ApiMutation options extending React Query mutation options
 */
export interface ApiMutationOptions<TData, TVariables = unknown, TError = ApiError> 
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn' | 'retry'> {
  /**
   * API endpoint URL
   */
  url: string | ((variables: TVariables) => string);
  
  /**
   * HTTP method (default: POST)
   */
  method?: 'POST' | 'PUT' | 'DELETE';
  
  /**
   * Extract body from variables
   * If not provided, entire variables will be sent as body
   */
  bodyExtractor?: (variables: TVariables) => any;
  
  /**
   * Request headers
   */
  headers?: Record<string, string> | ((variables: TVariables) => Record<string, string>);
  
  /**
   * Custom retry logic
   */
  retry?: boolean | number | ((failureCount: number, error: TError) => boolean);
  
  /**
   * Transform response data
   */
  transform?: (data: any) => TData;
  
  /**
   * Query keys to invalidate after successful mutation
   */
  invalidateQueries?: ReadonlyArray<readonly unknown[]>;
  
  /**
   * Optimistic update configuration
   */
  optimisticUpdate?: {
    /**
     * Query keys to update optimistically
     */
    queryKeys: ReadonlyArray<readonly unknown[]>;
    /**
     * Function to update cache optimistically
     */
    updateFn: (oldData: any, variables: TVariables) => any;
    /**
     * Function to rollback on error
     */
    rollbackFn?: (oldData: any, variables: TVariables) => any;
  };
}

/**
 * ApiMutation result extending React Query mutation result
 */
export type ApiMutationResult<TData, TVariables, TError = ApiError> = UseMutationResult<TData, TError, TVariables> & {
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
 * useApiMutation hook - Wrapper for React Query useMutation with httpService
 * 
 * @example
 * ```tsx
 * const createProduct = useApiMutation<Product, Partial<Product>>({
 *   url: '/products',
 *   method: 'POST',
 *   invalidateQueries: [['products']],
 * });
 * 
 * const handleCreate = () => {
 *   createProduct.mutate({ name: 'New Product', price: 100 });
 * };
 * ```
 * 
 * @example With optimistic update
 * ```tsx
 * const updateProduct = useApiMutation<Product, { id: string; data: Partial<Product> }>({
 *   url: (vars) => `/products/${vars.id}`,
 *   method: 'PUT',
 *   bodyExtractor: (vars) => vars.data,
 *   optimisticUpdate: {
 *     queryKeys: [['products', 'detail', id]],
 *     updateFn: (old, vars) => ({ ...old, ...vars.data }),
 *   },
 * });
 * ```
 */
export function useApiMutation<TData = unknown, TVariables = unknown, TError = ApiError>(
  options: ApiMutationOptions<TData, TVariables, TError>
): ApiMutationResult<TData, TVariables, TError> {
  const {
    url,
    method = 'POST',
    bodyExtractor,
    headers,
    retry: customRetry,
    transform,
    invalidateQueries,
    optimisticUpdate,
    onSuccess,
    onError,
    ...mutationOptions
  } = options;

  const queryClient = useQueryClient();

  // Default retry: only retry network/server errors
  const retry: UseMutationOptions<TData, TError, TVariables>['retry'] = customRetry !== undefined
    ? customRetry
    : (failureCount, error) => {
        if (isRetryableError(error)) {
          return failureCount < 1; // Mutations: only 1 retry
        }
        return false;
      };

  // Mutation function
  const mutationFn = async (variables: TVariables): Promise<TData> => {
    const urlString = typeof url === 'function' ? url(variables) : url;
    const body = bodyExtractor ? bodyExtractor(variables) : variables;
    const headersObj = typeof headers === 'function' ? headers(variables) : headers;
    
    let result: any;
    
    switch (method) {
      case 'POST':
        result = await httpService.post<TData>(urlString, body, { headers: headersObj });
        break;
      case 'PUT':
        result = await httpService.put<TData>(urlString, body, { headers: headersObj });
        break;
      case 'DELETE':
        result = await httpService.delete<TData>(urlString, { headers: headersObj });
        break;
      default:
        result = await httpService.post<TData>(urlString, body, { headers: headersObj });
    }
    
    // Apply transformation if provided
    return transform ? transform(result) : result;
  };

  // Enhanced onSuccess with cache invalidation
  const handleSuccess = (data: TData, variables: TVariables, context: any) => {
    // Invalidate queries
    if (invalidateQueries) {
      invalidateQueries.forEach((queryKey) => {
        // Convert readonly array to mutable array for queryClient
        queryClient.invalidateQueries({ queryKey: [...queryKey] });
      });
    }
    
    // Call original onSuccess if provided
    if (onSuccess) {
      onSuccess(data, variables, context);
    }
  };

  // Optimistic update setup
  const onMutate = optimisticUpdate 
    ? async (variables: TVariables) => {
        // Cancel outgoing refetches
        const promises = optimisticUpdate.queryKeys.map((queryKey) =>
          queryClient.cancelQueries({ queryKey: [...queryKey] })
        );
        await Promise.all(promises);

        // Snapshot previous values for rollback
        const snapshots = optimisticUpdate.queryKeys.map((queryKey) => {
          const mutableKey = [...queryKey];
          const snapshot = queryClient.getQueryData(mutableKey);
          // Update optimistically
          queryClient.setQueryData(mutableKey, (old: any) => {
            return optimisticUpdate.updateFn(old, variables);
          });
          return { queryKey: mutableKey, snapshot };
        });

        return { snapshots };
      }
    : undefined;

  // Enhanced onError with rollback
  const handleError = (error: TError, variables: TVariables, context: any) => {
    // Rollback optimistic update if configured
    if (optimisticUpdate && context?.snapshots) {
      context.snapshots.forEach(({ queryKey, snapshot }: { queryKey: readonly unknown[]; snapshot: any }) => {
        if (optimisticUpdate.rollbackFn && snapshot !== undefined) {
          const mutableKey = [...queryKey];
          queryClient.setQueryData(mutableKey, (old: any) => {
            return optimisticUpdate.rollbackFn?.(old, variables) ?? snapshot;
          });
        } else {
          // If no rollback function, just restore snapshot
          const mutableKey = [...queryKey];
          queryClient.setQueryData(mutableKey, snapshot);
        }
      });
    }
    
    // Call original onError if provided
    if (onError) {
      onError(error, variables, context);
    }
  };

  // Use React Query mutation
  const mutationResult = useMutation<TData, TError, TVariables>({
    ...mutationOptions,
    mutationFn,
    retry,
    onSuccess: handleSuccess,
    onError: handleError,
    onMutate,
  });

  // Extract error message and retryable status
  const errorMessage = mutationResult.error 
    ? getErrorMessage(mutationResult.error) 
    : undefined;
  
  const isRetryable = mutationResult.error 
    ? isRetryableError(mutationResult.error) 
    : undefined;

  return {
    ...mutationResult,
    errorMessage,
    isRetryable,
  };
}

