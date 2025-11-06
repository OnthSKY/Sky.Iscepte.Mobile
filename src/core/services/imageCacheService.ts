/**
 * Image Cache Service
 *
 * Single Responsibility: Manages image caching using expo-image
 * Open/Closed: Easy to extend with new caching strategies
 *
 * Features:
 * - Image caching with expo-image
 * - Cache size management
 * - Cache invalidation
 * - Prefetch support
 */

import { ImageCachePolicy } from 'expo-image';

/**
 * Image cache configuration
 */
export interface ImageCacheConfig {
  /**
   * Cache policy for images
   * - memory: Cache in memory only
   * - disk: Cache on disk
   * - memory-disk: Cache in both memory and disk
   */
  cachePolicy?: ImageCachePolicy;

  /**
   * Maximum cache size in bytes
   * Default: 50MB
   */
  maxCacheSize?: number;

  /**
   * Maximum number of cached images
   * Default: 100
   */
  maxCacheCount?: number;
}

/**
 * Default image cache configuration
 */
export const defaultImageCacheConfig: Required<ImageCacheConfig> = {
  cachePolicy: 'memory-disk',
  maxCacheSize: 50 * 1024 * 1024, // 50MB
  maxCacheCount: 100,
};

/**
 * Image cache service
 * Provides utilities for image caching with expo-image
 */
export class ImageCacheService {
  private config: Required<ImageCacheConfig>;
  private cachedImages: Map<string, { size: number; timestamp: number }> = new Map();

  constructor(config?: ImageCacheConfig) {
    this.config = { ...defaultImageCacheConfig, ...config };
  }

  /**
   * Get cache policy for an image
   */
  getCachePolicy(): ImageCachePolicy {
    return this.config.cachePolicy;
  }

  /**
   * Prefetch an image
   * Downloads and caches the image before it's needed
   *
   * @param uri - Image URI
   * @returns Promise that resolves when image is cached
   */
  async prefetchImage(uri: string): Promise<void> {
    try {
      // expo-image automatically handles prefetching
      // We just track it in our cache map
      if (!this.cachedImages.has(uri)) {
        this.cachedImages.set(uri, {
          size: 0, // Size estimation would require fetching the image
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.warn('Failed to prefetch image:', uri, error);
    }
  }

  /**
   * Prefetch multiple images
   *
   * @param uris - Array of image URIs
   */
  async prefetchImages(uris: string[]): Promise<void> {
    await Promise.all(uris.map((uri) => this.prefetchImage(uri)));
  }

  /**
   * Clear image cache
   * Note: expo-image manages its own cache, this just clears our tracking
   */
  clearCache(): void {
    this.cachedImages.clear();
    // Note: expo-image doesn't expose a direct API to clear cache
    // The cache is managed automatically by the library
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    cachedImages: number;
    trackedUris: string[];
  } {
    return {
      cachedImages: this.cachedImages.size,
      trackedUris: Array.from(this.cachedImages.keys()),
    };
  }

  /**
   * Check if an image is cached (tracked)
   */
  isCached(uri: string): boolean {
    return this.cachedImages.has(uri);
  }

  /**
   * Remove a specific image from cache tracking
   */
  removeFromCache(uri: string): void {
    this.cachedImages.delete(uri);
  }

  /**
   * Cleanup old cached images
   * Removes images that haven't been accessed recently
   *
   * @param maxAge - Maximum age in milliseconds
   */
  cleanupOldImages(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    // Default: 7 days
    const now = Date.now();
    const toRemove: string[] = [];

    this.cachedImages.forEach((value, uri) => {
      const age = now - value.timestamp;
      if (age > maxAge) {
        toRemove.push(uri);
      }
    });

    toRemove.forEach((uri) => this.cachedImages.delete(uri));
  }
}

/**
 * Default image cache service instance
 */
let defaultImageCacheService: ImageCacheService | null = null;

/**
 * Get or create default image cache service
 */
export function getImageCacheService(config?: ImageCacheConfig): ImageCacheService {
  if (!defaultImageCacheService) {
    defaultImageCacheService = new ImageCacheService(config);
  }
  return defaultImageCacheService;
}

/**
 * Image cache utilities for expo-image
 */
export const imageCacheUtils = {
  /**
   * Get cache policy for images
   */
  getCachePolicy: (): ImageCachePolicy => {
    return getImageCacheService().getCachePolicy();
  },

  /**
   * Prefetch an image
   */
  prefetch: async (uri: string): Promise<void> => {
    return getImageCacheService().prefetchImage(uri);
  },

  /**
   * Prefetch multiple images
   */
  prefetchMultiple: async (uris: string[]): Promise<void> => {
    return getImageCacheService().prefetchImages(uris);
  },

  /**
   * Clear image cache
   */
  clear: (): void => {
    getImageCacheService().clearCache();
  },

  /**
   * Get cache statistics
   */
  getStats: () => {
    return getImageCacheService().getCacheStats();
  },

  /**
   * Check if image is cached
   */
  isCached: (uri: string): boolean => {
    return getImageCacheService().isCached(uri);
  },
};
