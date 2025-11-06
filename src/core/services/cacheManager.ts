/**
 * Cache Manager Service
 *
 * Single Responsibility: Manages cache size limits, cleanup, and smart invalidation
 * Open/Closed: Easy to extend with new cleanup strategies
 *
 * Features:
 * - Cache size limit enforcement
 * - Automatic cleanup of old queries
 * - Smart invalidation based on query patterns
 * - Cache statistics and monitoring
 */

import { QueryClient, QueryKey, Query } from '@tanstack/react-query';
import {
  shouldPersistQuery,
  defaultCacheCleanupConfig,
  CacheCleanupConfig,
  CACHE_SIZE_LIMIT,
  MAX_PERSISTED_QUERIES,
  estimateCacheSize,
} from './cacheConfig';

/**
 * Cache statistics
 */
export interface CacheStats {
  totalQueries: number;
  persistedQueries: number;
  memoryQueries: number;
  estimatedSize: number; // in bytes
  oldestQueryAge: number; // in milliseconds
  newestQueryAge: number; // in milliseconds
}

/**
 * Cache cleanup result
 */
export interface CacheCleanupResult {
  removedQueries: number;
  freedSize: number; // in bytes
  remainingQueries: number;
  remainingSize: number; // in bytes
}

/**
 * Cache Manager class
 * Manages cache size limits, cleanup, and invalidation
 */
export class CacheManager {
  private queryClient: QueryClient;
  private cleanupConfig: CacheCleanupConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(queryClient: QueryClient, config?: CacheCleanupConfig) {
    this.queryClient = queryClient;
    this.cleanupConfig = { ...defaultCacheCleanupConfig, ...config };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const queries = this.queryClient.getQueryCache().getAll();
    const persistedQueries = queries.filter((q) => shouldPersistQuery(q.queryKey));
    const memoryQueries = queries.filter((q) => !shouldPersistQuery(q.queryKey));

    let estimatedSize = 0;
    let oldestAge = Date.now();
    let newestAge = 0;

    queries.forEach((query) => {
      try {
        const { data } = query.state;
        if (data) {
          estimatedSize += estimateCacheSize(data);
        }
      } catch {
        // Ignore serialization errors
      }

      const age = query.state.dataUpdatedAt;
      if (age < oldestAge) {
        oldestAge = age;
      }
      if (age > newestAge) {
        newestAge = age;
      }
    });

    return {
      totalQueries: queries.length,
      persistedQueries: persistedQueries.length,
      memoryQueries: memoryQueries.length,
      estimatedSize,
      oldestQueryAge: Date.now() - oldestAge,
      newestQueryAge: Date.now() - newestAge,
    };
  }

  /**
   * Check if cache size limit is exceeded
   */
  isSizeLimitExceeded(): boolean {
    const stats = this.getStats();
    return stats.estimatedSize > CACHE_SIZE_LIMIT;
  }

  /**
   * Check if query count limit is exceeded
   */
  isQueryCountLimitExceeded(): boolean {
    const stats = this.getStats();
    return stats.totalQueries > MAX_PERSISTED_QUERIES;
  }

  /**
   * Cleanup old non-critical queries
   * Removes queries that haven't been accessed recently
   */
  cleanupOldQueries(maxAge?: number): CacheCleanupResult {
    const maxAgeToUse = maxAge || this.cleanupConfig.maxAgeNonCritical || 60 * 60 * 1000; // 1 hour default
    const now = Date.now();
    const queries = this.queryClient.getQueryCache().getAll();

    let removedQueries = 0;
    let freedSize = 0;

    // Sort queries by last access time (oldest first)
    const sortedQueries = [...queries].sort(
      (a, b) => a.state.dataUpdatedAt - b.state.dataUpdatedAt
    );

    for (const query of sortedQueries) {
      const age = now - query.state.dataUpdatedAt;
      const isNonCritical = !shouldPersistQuery(query.queryKey);

      // Remove old non-critical queries
      if (age > maxAgeToUse && isNonCritical) {
        try {
          const { data } = query.state;
          if (data) {
            freedSize += estimateCacheSize(data);
          }
        } catch {
          // Ignore serialization errors
        }

        this.queryClient.removeQueries({ queryKey: query.queryKey });
        removedQueries++;
      }
    }

    const remainingStats = this.getStats();

    return {
      removedQueries,
      freedSize,
      remainingQueries: remainingStats.totalQueries,
      remainingSize: remainingStats.estimatedSize,
    };
  }

  /**
   * Cleanup queries to enforce size limit
   * Removes oldest non-critical queries until size limit is met
   */
  enforceSizeLimit(): CacheCleanupResult {
    if (!this.isSizeLimitExceeded()) {
      return {
        removedQueries: 0,
        freedSize: 0,
        remainingQueries: this.getStats().totalQueries,
        remainingSize: this.getStats().estimatedSize,
      };
    }

    const queries = this.queryClient.getQueryCache().getAll();

    // Filter non-critical queries and sort by last access time (oldest first)
    const nonCriticalQueries = queries
      .filter((q) => !shouldPersistQuery(q.queryKey))
      .sort((a, b) => a.state.dataUpdatedAt - b.state.dataUpdatedAt);

    let removedQueries = 0;
    let freedSize = 0;
    let currentSize = this.getStats().estimatedSize;

    for (const query of nonCriticalQueries) {
      if (currentSize <= CACHE_SIZE_LIMIT) {
        break;
      }

      try {
        const { data } = query.state;
        if (data) {
          const querySize = estimateCacheSize(data);
          freedSize += querySize;
          currentSize -= querySize;
        }
      } catch {
        // Ignore serialization errors
      }

      this.queryClient.removeQueries({ queryKey: query.queryKey });
      removedQueries++;
    }

    const remainingStats = this.getStats();

    return {
      removedQueries,
      freedSize,
      remainingQueries: remainingStats.totalQueries,
      remainingSize: remainingStats.estimatedSize,
    };
  }

  /**
   * Cleanup queries to enforce query count limit
   * Removes oldest non-critical queries until count limit is met
   */
  enforceQueryCountLimit(): CacheCleanupResult {
    if (!this.isQueryCountLimitExceeded()) {
      return {
        removedQueries: 0,
        freedSize: 0,
        remainingQueries: this.getStats().totalQueries,
        remainingSize: this.getStats().estimatedSize,
      };
    }

    const queries = this.queryClient.getQueryCache().getAll();

    // Filter non-critical queries and sort by last access time (oldest first)
    const nonCriticalQueries = queries
      .filter((q) => !shouldPersistQuery(q.queryKey))
      .sort((a, b) => a.state.dataUpdatedAt - b.state.dataUpdatedAt);

    const excessQueries = queries.length - MAX_PERSISTED_QUERIES;
    let removedQueries = 0;
    let freedSize = 0;

    for (let i = 0; i < excessQueries && i < nonCriticalQueries.length; i++) {
      const query = nonCriticalQueries[i];

      try {
        const { data } = query.state;
        if (data) {
          freedSize += estimateCacheSize(data);
        }
      } catch {
        // Ignore serialization errors
      }

      this.queryClient.removeQueries({ queryKey: query.queryKey });
      removedQueries++;
    }

    const remainingStats = this.getStats();

    return {
      removedQueries,
      freedSize,
      remainingQueries: remainingStats.totalQueries,
      remainingSize: remainingStats.estimatedSize,
    };
  }

  /**
   * Perform full cache cleanup
   * Enforces both size and count limits
   */
  performCleanup(): CacheCleanupResult {
    // First cleanup old queries
    const oldQueriesResult = this.cleanupOldQueries();

    // Then enforce size limit
    const sizeLimitResult = this.enforceSizeLimit();

    // Finally enforce query count limit
    const countLimitResult = this.enforceQueryCountLimit();

    return {
      removedQueries:
        oldQueriesResult.removedQueries +
        sizeLimitResult.removedQueries +
        countLimitResult.removedQueries,
      freedSize:
        oldQueriesResult.freedSize + sizeLimitResult.freedSize + countLimitResult.freedSize,
      remainingQueries: this.getStats().totalQueries,
      remainingSize: this.getStats().estimatedSize,
    };
  }

  /**
   * Start automatic cleanup interval
   * Performs cleanup every specified interval
   */
  startAutoCleanup(intervalMs: number = 5 * 60 * 1000): void {
    // Default: 5 minutes
    this.stopAutoCleanup();

    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, intervalMs);
  }

  /**
   * Stop automatic cleanup interval
   */
  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Smart invalidation based on query patterns
   * Invalidates related queries when a mutation occurs
   */
  smartInvalidate(
    invalidatedKey: QueryKey,
    options?: {
      invalidateRelated?: boolean;
      invalidateModule?: boolean;
    }
  ): Promise<void> {
    const { invalidateRelated = true, invalidateModule = true } = options || {};

    const promises: Promise<void>[] = [];

    // Invalidate exact match
    promises.push(this.queryClient.invalidateQueries({ queryKey: invalidatedKey }));

    if (invalidateRelated) {
      // Invalidate related queries (same module, different endpoints)
      if (Array.isArray(invalidatedKey) && invalidatedKey.length > 0) {
        const moduleKey = invalidatedKey[0];
        const relatedKey = [moduleKey] as QueryKey;
        promises.push(this.queryClient.invalidateQueries({ queryKey: relatedKey }));
      }
    }

    if (invalidateModule && Array.isArray(invalidatedKey) && invalidatedKey.length > 0) {
      const moduleKey = invalidatedKey[0];
      // Invalidate all queries in the module
      promises.push(
        this.queryClient.invalidateQueries({
          predicate: (query) => {
            const firstKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
            return firstKey === moduleKey;
          },
        })
      );
    }

    return Promise.all(promises).then(() => undefined);
  }

  /**
   * Get queries by pattern
   */
  getQueriesByPattern(pattern: (queryKey: QueryKey) => boolean): Query[] {
    return this.queryClient
      .getQueryCache()
      .getAll()
      .filter((query) => pattern(query.queryKey));
  }

  /**
   * Clear all non-critical queries
   */
  clearNonCriticalQueries(): void {
    this.queryClient
      .getQueryCache()
      .getAll()
      .forEach((query) => {
        if (!shouldPersistQuery(query.queryKey)) {
          this.queryClient.removeQueries({ queryKey: query.queryKey });
        }
      });
  }

  /**
   * Clear all queries (including critical ones)
   * Use with caution!
   */
  clearAllQueries(): void {
    this.queryClient.clear();
  }
}

/**
 * Create a cache manager instance
 */
export function createCacheManager(
  queryClient: QueryClient,
  config?: CacheCleanupConfig
): CacheManager {
  return new CacheManager(queryClient, config);
}
