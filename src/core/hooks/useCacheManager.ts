/**
 * useCacheManager Hook
 *
 * Single Responsibility: Provides access to cache manager functionality
 *
 * Features:
 * - Cache statistics
 * - Manual cache cleanup
 * - Automatic cache cleanup
 * - Smart invalidation
 */

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKey } from '@tanstack/react-query';
import { CacheManager, createCacheManager } from '../services/cacheManager';

/**
 * useCacheManager hook options
 */
export interface UseCacheManagerOptions {
  /**
   * Enable automatic cleanup
   * Default: true
   */
  enableAutoCleanup?: boolean;

  /**
   * Cleanup interval in milliseconds
   * Default: 5 minutes
   */
  cleanupInterval?: number;

  /**
   * Enable automatic cleanup on mount
   * Default: true
   */
  cleanupOnMount?: boolean;
}

/**
 * useCacheManager hook return type
 */
export interface UseCacheManagerReturn {
  /**
   * Cache manager instance
   */
  cacheManager: CacheManager;

  /**
   * Get cache statistics
   */
  getStats: () => ReturnType<CacheManager['getStats']>;

  /**
   * Perform manual cache cleanup
   */
  cleanup: () => ReturnType<CacheManager['performCleanup']>;

  /**
   * Smart invalidation
   */
  smartInvalidate: (
    invalidatedKey: QueryKey,
    options?: Parameters<CacheManager['smartInvalidate']>[1]
  ) => Promise<void>;

  /**
   * Check if size limit is exceeded
   */
  isSizeLimitExceeded: () => boolean;

  /**
   * Check if query count limit is exceeded
   */
  isQueryCountLimitExceeded: () => boolean;

  /**
   * Start automatic cleanup
   */
  startAutoCleanup: (intervalMs?: number) => void;

  /**
   * Stop automatic cleanup
   */
  stopAutoCleanup: () => void;
}

/**
 * useCacheManager hook
 * Provides access to cache manager functionality
 *
 * @param options - Hook options
 * @returns Cache manager utilities
 *
 * @example
 * ```tsx
 * const { getStats, cleanup, smartInvalidate } = useCacheManager();
 *
 * // Get cache statistics
 * const stats = getStats();
 * console.log('Cache size:', stats.estimatedSize);
 *
 * // Perform cleanup
 * const result = cleanup();
 * console.log('Removed queries:', result.removedQueries);
 *
 * // Smart invalidation
 * await smartInvalidate(['products', 'list']);
 * ```
 */
export function useCacheManager(options: UseCacheManagerOptions = {}): UseCacheManagerReturn {
  const {
    enableAutoCleanup = true,
    cleanupInterval = 5 * 60 * 1000, // 5 minutes
    cleanupOnMount = true,
  } = options;

  const queryClient = useQueryClient();
  const cacheManagerRef = useRef<CacheManager | null>(null);

  // Create cache manager instance (singleton per query client)
  if (!cacheManagerRef.current) {
    cacheManagerRef.current = createCacheManager(queryClient);
  }

  const cacheManager = cacheManagerRef.current;

  // Cleanup on mount
  useEffect(() => {
    if (cleanupOnMount) {
      cacheManager.performCleanup();
    }
  }, [cacheManager, cleanupOnMount]);

  // Auto cleanup
  useEffect(() => {
    if (enableAutoCleanup) {
      cacheManager.startAutoCleanup(cleanupInterval);

      return () => {
        cacheManager.stopAutoCleanup();
      };
    }
  }, [cacheManager, enableAutoCleanup, cleanupInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cacheManager.stopAutoCleanup();
    };
  }, [cacheManager]);

  const getStats = useCallback(() => {
    return cacheManager.getStats();
  }, [cacheManager]);

  const cleanup = useCallback(() => {
    return cacheManager.performCleanup();
  }, [cacheManager]);

  const smartInvalidate = useCallback(
    (invalidatedKey: QueryKey, options?: Parameters<CacheManager['smartInvalidate']>[1]) => {
      return cacheManager.smartInvalidate(invalidatedKey, options);
    },
    [cacheManager]
  );

  const isSizeLimitExceeded = useCallback(() => {
    return cacheManager.isSizeLimitExceeded();
  }, [cacheManager]);

  const isQueryCountLimitExceeded = useCallback(() => {
    return cacheManager.isQueryCountLimitExceeded();
  }, [cacheManager]);

  const startAutoCleanup = useCallback(
    (intervalMs?: number) => {
      cacheManager.startAutoCleanup(intervalMs);
    },
    [cacheManager]
  );

  const stopAutoCleanup = useCallback(() => {
    cacheManager.stopAutoCleanup();
  }, [cacheManager]);

  return {
    cacheManager,
    getStats,
    cleanup,
    smartInvalidate,
    isSizeLimitExceeded,
    isQueryCountLimitExceeded,
    startAutoCleanup,
    stopAutoCleanup,
  };
}
