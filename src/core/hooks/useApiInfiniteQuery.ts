/**
 * useApiInfiniteQuery Hook
 * 
 * Single Responsibility: Wraps React Query useInfiniteQuery with httpService integration
 * Dependency Inversion: Depends on httpService interface, not concrete implementation
 * 
 * Provides type-safe infinite queries for pagination
 */

import { 
  useInfiniteQuery, 
  UseInfiniteQueryOptions, 
  UseInfiniteQueryResult,
  InfiniteData,
} from '@tanstack/react-query';
import httpService from '../../shared/services/httpService';
import { ApiError, isApiError } from '../types/apiErrors';
import { getErrorMessage, isRetryableError } from '../utils/errorUtils';

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore?: boolean;
}

/**
 * ApiInfiniteQuery options
 */
export interface ApiInfiniteQueryOptions<TData, TPageParam = number, TError = ApiError>
  extends Omit<UseInfiniteQueryOptions<PaginatedResponse<TData>, TError, InfiniteData<PaginatedResponse<TData>>, PaginatedResponse<TData>, string[], TPageParam>, 'queryFn' | 'retry'> {
  /**
   * API endpoint URL
   */
  url: string | ((pageParam: TPageParam) => string);
  
  /**
   * Request headers
   */
  headers?: Record<string, string>;
  
  /**
   * Initial page parameter (default: 1)
   */
  initialPageParam?: TPageParam;
  
  /**
   * Get next page parameter from response
   */
  getNextPageParam: (lastPage: PaginatedResponse<TData>, allPages: PaginatedResponse<TData>[]) => TPageParam | null | undefined;
  
  /**
   * Custom retry logic
   */
  retry?: boolean | number | ((failureCount: number, error: TError) => boolean);
  
  /**
   * Transform response data
   */
  transform?: (data: any) => PaginatedResponse<TData>;
  
  /**
   * Page size (for query params)
   */
  pageSize?: number;
}

/**
 * ApiInfiniteQuery result
 */
export type ApiInfiniteQueryResult<TData, TPageParam, TError = ApiError> = 
  UseInfiniteQueryResult<PaginatedResponse<TData>, TError> & {
    /**
     * All items from all pages (flattened)
     */
    allItems: TData[];
    
    /**
     * Total count from first page
     */
    total: number;
    
    /**
     * Whether there are more pages
     */
    hasMore: boolean;
    
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
 * useApiInfiniteQuery hook - Wrapper for React Query useInfiniteQuery with httpService
 * 
 * @example
 * ```tsx
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   allItems,
 * } = useApiInfiniteQuery<Product>({
 *   url: '/products',
 *   queryKey: ['products', 'list'],
 *   getNextPageParam: (lastPage) => 
 *     lastPage.page < Math.ceil(lastPage.total / lastPage.pageSize)
 *       ? lastPage.page + 1
 *       : undefined,
 *   initialPageParam: 1,
 * });
 * ```
 */
export function useApiInfiniteQuery<TData = unknown, TPageParam = number, TError = ApiError>(
  options: ApiInfiniteQueryOptions<TData, TPageParam, TError>
): ApiInfiniteQueryResult<TData, TPageParam, TError> {
  const {
    url,
    headers,
    initialPageParam = 1 as TPageParam,
    getNextPageParam,
    retry: customRetry,
    transform,
    pageSize = 20,
    ...queryOptions
  } = options;

  // Default retry logic
  const retry: UseInfiniteQueryOptions<PaginatedResponse<TData>, TError, InfiniteData<PaginatedResponse<TData>>, PaginatedResponse<TData>, string[], TPageParam>['retry'] = 
    customRetry !== undefined
      ? customRetry
      : (failureCount, error) => {
          if (isRetryableError(error)) {
            return failureCount < 3;
          }
          return false;
        };

  // Query function
  const queryFn = async ({ pageParam }: { pageParam: TPageParam }): Promise<PaginatedResponse<TData>> => {
    const urlString = typeof url === 'function' ? url(pageParam) : url;
    
    // Add pagination params to URL
    const separator = urlString.includes('?') ? '&' : '?';
    const pageParamKey = typeof pageParam === 'number' ? 'page' : 'cursor';
    const urlWithParams = `${urlString}${separator}${pageParamKey}=${pageParam}&pageSize=${pageSize}`;
    
    const result = await httpService.get<any>(urlWithParams, { headers });
    
    // Transform if provided
    const transformed = transform ? transform(result) : result;
    
    // Ensure paginated response structure
    if (!transformed.items && Array.isArray(transformed)) {
      return {
        items: transformed,
        total: transformed.length,
        page: pageParam as number,
        pageSize,
        hasMore: transformed.length >= pageSize,
      };
    }
    
    return {
      items: transformed.items || transformed.data || [],
      total: transformed.total || transformed.totalCount || 0,
      page: transformed.page || (pageParam as number),
      pageSize: transformed.pageSize || pageSize,
      hasMore: transformed.hasMore !== undefined 
        ? transformed.hasMore 
        : (transformed.items?.length || 0) >= pageSize,
    };
  };

  // Use React Query infinite query
  const queryResult = useInfiniteQuery<PaginatedResponse<TData>, TError, InfiniteData<PaginatedResponse<TData>>, string[], TPageParam>({
    ...queryOptions,
    queryFn,
    retry,
    initialPageParam,
    getNextPageParam,
  });

  // Flatten all items from all pages
  const allItems = queryResult.data?.pages.flatMap((page) => page.items) || [];
  
  // Get total from first page
  const total = queryResult.data?.pages[0]?.total || 0;
  
  // Check if there are more pages
  const hasMore = queryResult.hasNextPage ?? false;

  // Extract error message and retryable status
  const errorMessage = queryResult.error 
    ? getErrorMessage(queryResult.error) 
    : undefined;
  
  const isRetryable = queryResult.error 
    ? isRetryableError(queryResult.error) 
    : undefined;

  return {
    ...queryResult,
    allItems,
    total,
    hasMore,
    errorMessage,
    isRetryable,
  };
}

