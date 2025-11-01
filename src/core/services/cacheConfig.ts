/**
 * Cache Persistence Configuration
 * 
 * Single Responsibility: Configures which queries should be persisted
 * Open/Closed: Easy to extend with new critical query patterns
 * 
 * Strategies:
 * - Critical queries: Persist to AsyncStorage (user data, permissions, stats)
 * - Non-critical queries: Memory-only (lists, details)
 */

import { QueryKey } from '@tanstack/react-query';

/**
 * Cache size limit (50MB in bytes)
 * Note: AsyncStorage has ~6MB limit on iOS, but we set a soft limit
 */
export const CACHE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB

/**
 * Maximum number of persisted queries
 */
export const MAX_PERSISTED_QUERIES = 100;

/**
 * Critical query prefixes that should be persisted
 * These are queries that are essential for app startup and offline functionality
 */
export const CRITICAL_QUERY_PREFIXES = [
  'auth', // Authentication data
  'user', // User profile
  'permissions', // User permissions
  'settings', // App settings
] as const;

/**
 * Critical query patterns (matches query keys)
 * These patterns determine which queries are persisted
 */
export const CRITICAL_QUERY_PATTERNS = [
  // Auth-related
  (queryKey: QueryKey) => {
    const firstKey = Array.isArray(queryKey) ? queryKey[0] : queryKey;
    return typeof firstKey === 'string' && firstKey === 'auth';
  },
  
  // User profile
  (queryKey: QueryKey) => {
    const firstKey = Array.isArray(queryKey) ? queryKey[0] : queryKey;
    return typeof firstKey === 'string' && (firstKey === 'user' || firstKey === 'profile');
  },
  
  // Permissions
  (queryKey: QueryKey) => {
    const firstKey = Array.isArray(queryKey) ? queryKey[0] : queryKey;
    return typeof firstKey === 'string' && firstKey === 'permissions';
  },
  
  // Stats (dashboard data - useful for offline)
  (queryKey: QueryKey) => {
    if (!Array.isArray(queryKey)) return false;
    const lastKey = queryKey[queryKey.length - 1];
    return lastKey === 'stats';
  },
  
  // Settings
  (queryKey: QueryKey) => {
    const firstKey = Array.isArray(queryKey) ? queryKey[0] : queryKey;
    return typeof firstKey === 'string' && firstKey === 'settings';
  },
];

/**
 * Check if a query key should be persisted
 * 
 * @param queryKey - Query key to check
 * @returns true if query should be persisted
 * 
 * @example
 * ```ts
 * shouldPersistQuery(['auth', 'profile']); // true
 * shouldPersistQuery(['products', 'list']); // false
 * ```
 */
export function shouldPersistQuery(queryKey: QueryKey): boolean {
  // Check against critical patterns
  return CRITICAL_QUERY_PATTERNS.some((pattern) => pattern(queryKey));
}

/**
 * Check if a query key should NOT be persisted (non-critical)
 * Non-critical queries are typically:
 * - Lists (products, sales, customers, etc.)
 * - Details (individual items)
 * - Search results
 * 
 * @param queryKey - Query key to check
 * @returns true if query should NOT be persisted
 */
export function shouldNotPersistQuery(queryKey: QueryKey): boolean {
  if (!Array.isArray(queryKey)) return false;
  
  const firstKey = queryKey[0];
  const lastKey = queryKey[queryKey.length - 1];
  
  // Lists should not be persisted (they change frequently)
  if (lastKey === 'list' || lastKey === 'lists') {
    return true;
  }
  
  // Details should not be persisted (too many, frequently accessed)
  if (lastKey === 'detail' || lastKey === 'details') {
    return true;
  }
  
  // Search results should not be persisted
  if (queryKey.some((key) => typeof key === 'string' && key.includes('search'))) {
    return true;
  }
  
  return false;
}

/**
 * Cache invalidation strategies
 */
export const CacheInvalidationStrategy = {
  /**
   * Invalidate on logout
   */
  ON_LOGOUT: ['auth', 'user', 'permissions'],
  
  /**
   * Invalidate on login
   */
  ON_LOGIN: ['auth', 'user'],
  
  /**
   * Invalidate on permission change
   */
  ON_PERMISSION_CHANGE: ['permissions'],
  
  /**
   * Invalidate all non-critical queries
   */
  NON_CRITICAL: (queryKey: QueryKey) => {
    return !shouldPersistQuery(queryKey);
  },
  
  /**
   * Invalidate all module queries
   */
  MODULE: (module: string) => {
    return (queryKey: QueryKey) => {
      const firstKey = Array.isArray(queryKey) ? queryKey[0] : queryKey;
      return typeof firstKey === 'string' && firstKey === module;
    };
  },
} as const;

/**
 * Get cache size estimation (rough calculation)
 * Note: This is an approximation, actual size may vary
 * 
 * @param queryData - Query data to estimate
 * @returns Estimated size in bytes
 */
export function estimateCacheSize(queryData: any): number {
  try {
    const serialized = JSON.stringify(queryData);
    return new Blob([serialized]).size || serialized.length * 2; // Rough estimate: 2 bytes per char
  } catch {
    return 0;
  }
}

/**
 * Cache cleanup configuration
 */
export interface CacheCleanupConfig {
  /**
   * Maximum age for non-critical queries (in milliseconds)
   * Default: 1 hour
   */
  maxAgeNonCritical?: number;
  
  /**
   * Maximum age for critical queries (in milliseconds)
   * Default: 24 hours
   */
  maxAgeCritical?: number;
  
  /**
   * Maximum number of queries to keep
   */
  maxQueries?: number;
}

/**
 * Default cache cleanup configuration
 */
export const defaultCacheCleanupConfig: CacheCleanupConfig = {
  maxAgeNonCritical: 60 * 60 * 1000, // 1 hour
  maxAgeCritical: 24 * 60 * 60 * 1000, // 24 hours
  maxQueries: MAX_PERSISTED_QUERIES,
};

