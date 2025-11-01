/**
 * Cache Utilities
 * 
 * Single Responsibility: Provides helper functions for cache management
 * Open/Closed: Easy to extend with new invalidation strategies
 */

import { QueryClient, QueryKey } from '@tanstack/react-query';
import { CacheInvalidationStrategy, shouldPersistQuery, shouldNotPersistQuery } from './cacheConfig';

/**
 * Invalidate queries matching a pattern
 * 
 * @param queryClient - QueryClient instance
 * @param queryKey - Query key or pattern to invalidate
 * 
 * @example
 * ```ts
 * invalidateQueries(queryClient, ['products']);
 * invalidateQueries(queryClient, (key) => key[0] === 'products');
 * ```
 */
export function invalidateQueries(
  queryClient: QueryClient,
  queryKey: QueryKey | ((queryKey: QueryKey) => boolean)
): Promise<void> {
  if (typeof queryKey === 'function') {
    // Invalidate all queries matching the predicate
    return queryClient.invalidateQueries({ predicate: queryKey });
  }
  
  return queryClient.invalidateQueries({ queryKey });
}

/**
 * Invalidate all non-critical queries
 * Useful for cleanup operations
 * 
 * @param queryClient - QueryClient instance
 */
export function invalidateNonCriticalQueries(queryClient: QueryClient): Promise<void> {
  return invalidateQueries(queryClient, CacheInvalidationStrategy.NON_CRITICAL);
}

/**
 * Invalidate queries for a specific module
 * 
 * @param queryClient - QueryClient instance
 * @param module - Module name (e.g., 'products', 'sales')
 */
export function invalidateModuleQueries(
  queryClient: QueryClient,
  module: string
): Promise<void> {
  return invalidateQueries(queryClient, CacheInvalidationStrategy.MODULE(module));
}

/**
 * Invalidate queries on logout
 * Clears all auth-related queries
 * 
 * @param queryClient - QueryClient instance
 */
export function invalidateOnLogout(queryClient: QueryClient): Promise<void> {
  const strategies = CacheInvalidationStrategy.ON_LOGOUT.map((key) => [key] as QueryKey);
  return Promise.all(strategies.map((key) => invalidateQueries(queryClient, key))).then(() => undefined);
}

/**
 * Invalidate queries on login
 * Refreshes user data
 * 
 * @param queryClient - QueryClient instance
 */
export function invalidateOnLogin(queryClient: QueryClient): Promise<void> {
  const strategies = CacheInvalidationStrategy.ON_LOGIN.map((key) => [key] as QueryKey);
  return Promise.all(strategies.map((key) => invalidateQueries(queryClient, key))).then(() => undefined);
}

/**
 * Invalidate queries on permission change
 * 
 * @param queryClient - QueryClient instance
 */
export function invalidateOnPermissionChange(queryClient: QueryClient): Promise<void> {
  const strategies = CacheInvalidationStrategy.ON_PERMISSION_CHANGE.map((key) => [key] as QueryKey);
  return Promise.all(strategies.map((key) => invalidateQueries(queryClient, key))).then(() => undefined);
}

/**
 * Remove queries matching a pattern
 * Unlike invalidate, this removes from cache without refetching
 * 
 * @param queryClient - QueryClient instance
 * @param queryKey - Query key or pattern to remove
 */
export function removeQueries(
  queryClient: QueryClient,
  queryKey: QueryKey | ((queryKey: QueryKey) => boolean)
): void {
  if (typeof queryKey === 'function') {
    queryClient.removeQueries({ predicate: queryKey });
  } else {
    queryClient.removeQueries({ queryKey });
  }
}

/**
 * Clear all queries from cache
 * 
 * @param queryClient - QueryClient instance
 */
export function clearAllQueries(queryClient: QueryClient): void {
  queryClient.clear();
}

/**
 * Get cache size estimate
 * 
 * @param queryClient - QueryClient instance
 * @returns Estimated cache size in bytes
 */
export function getCacheSizeEstimate(queryClient: QueryClient): number {
  const queries = queryClient.getQueryCache().getAll();
  let size = 0;
  
  queries.forEach((query) => {
    try {
      const data = query.state.data;
      if (data) {
        const serialized = JSON.stringify(data);
        size += serialized.length * 2; // Rough estimate: 2 bytes per char
      }
    } catch {
      // Ignore serialization errors
    }
  });
  
  return size;
}

/**
 * Cleanup old queries
 * Removes queries that haven't been accessed recently
 * 
 * @param queryClient - QueryClient instance
 * @param maxAge - Maximum age in milliseconds
 */
export function cleanupOldQueries(
  queryClient: QueryClient,
  maxAge: number = 24 * 60 * 60 * 1000 // 24 hours
): void {
  const now = Date.now();
  const queries = queryClient.getQueryCache().getAll();
  
  queries.forEach((query) => {
    const lastAccessed = query.state.dataUpdatedAt;
    const age = now - lastAccessed;
    
    // Remove queries older than maxAge (except critical ones)
    if (age > maxAge && !shouldPersistQuery(query.queryKey)) {
      queryClient.removeQueries({ queryKey: query.queryKey });
    }
  });
}

/**
 * Prefetch a query
 * 
 * @param queryClient - QueryClient instance
 * @param queryKey - Query key to prefetch
 * @param queryFn - Query function
 */
export async function prefetchQuery<TData>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  queryFn: () => Promise<TData>
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
}

/**
 * Prefetch multiple queries
 * 
 * @param queryClient - QueryClient instance
 * @param queries - Array of { queryKey, queryFn } objects
 */
export async function prefetchQueries<TData>(
  queryClient: QueryClient,
  queries: Array<{ queryKey: QueryKey; queryFn: () => Promise<TData> }>
): Promise<void> {
  await Promise.all(queries.map(({ queryKey, queryFn }) => prefetchQuery(queryClient, queryKey, queryFn)));
}

