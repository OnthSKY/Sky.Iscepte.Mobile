/**
 * Network Service
 * 
 * Single Responsibility: Provides network connectivity monitoring and offline queue management
 * Open/Closed: Can be extended with different network monitoring strategies
 */

import { logger } from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Network state
interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string | null;
}

// Offline queue item
interface OfflineQueueItem {
  id: string;
  timestamp: number;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  body?: any;
  headers?: Record<string, string>;
  retryCount: number;
  maxRetries: number;
}

// Network event listeners
type NetworkStateListener = (state: NetworkState) => void;

class NetworkService {
  private isConnected: boolean = true;
  private isInternetReachable: boolean = true;
  private networkType: string | null = null;
  private listeners: Set<NetworkStateListener> = new Set();
  private offlineQueue: OfflineQueueItem[] = [];
  private isProcessingQueue: boolean = false;
  private queueStorageKey = 'OFFLINE_QUEUE';
  private maxQueueSize = 100;

  constructor() {
    this.loadOfflineQueue();
    this.initializeNetworkMonitoring();
  }

  /**
   * Initialize network monitoring
   * Uses NetInfo if available, otherwise falls back to basic connectivity checks
   */
  private async initializeNetworkMonitoring(): Promise<void> {
    try {
      // Try to use @react-native-community/netinfo
      const NetInfo = await import('@react-native-community/netinfo').catch(() => null);
      
      if (NetInfo) {
        // Get initial state
        const state = await NetInfo.default.fetch();
        this.updateNetworkState({
          isConnected: state.isConnected ?? true,
          isInternetReachable: state.isInternetReachable ?? true,
          type: state.type ?? null,
        });

        // Subscribe to network state changes
        NetInfo.default.addEventListener((state) => {
          this.updateNetworkState({
            isConnected: state.isConnected ?? true,
            isInternetReachable: state.isInternetReachable ?? true,
            type: state.type ?? null,
          });

          // If network comes back online, process queue
          if (state.isConnected && state.isInternetReachable) {
            this.processOfflineQueue();
          }
        });
      } else {
        // Fallback: assume connected if NetInfo is not available
        logger.warn('NetInfo not available, assuming network is connected');
        this.updateNetworkState({
          isConnected: true,
          isInternetReachable: true,
          type: null,
        });
      }
    } catch (error) {
      logger.warn('Failed to initialize network monitoring:', error);
      // Fallback: assume connected
      this.updateNetworkState({
        isConnected: true,
        isInternetReachable: true,
        type: null,
      });
    }
  }

  /**
   * Update network state and notify listeners
   */
  private updateNetworkState(state: NetworkState): void {
    const wasOffline = !this.isConnected || !this.isInternetReachable;
    this.isConnected = state.isConnected;
    this.isInternetReachable = state.isInternetReachable;
    this.networkType = state.type;

    const isNowOnline = this.isConnected && this.isInternetReachable;

    // Notify listeners
    this.listeners.forEach((listener) => {
      try {
        listener({
          isConnected: this.isConnected,
          isInternetReachable: this.isInternetReachable,
          type: this.networkType,
        });
      } catch (error) {
        logger.error('Error in network state listener:', error);
      }
    });

    // If just came online, process queue
    if (wasOffline && isNowOnline) {
      logger.info('Network connection restored, processing offline queue');
      this.processOfflineQueue();
    }
  }

  /**
   * Get current network state
   */
  getNetworkState(): NetworkState {
    return {
      isConnected: this.isConnected,
      isInternetReachable: this.isInternetReachable,
      type: this.networkType,
    };
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return this.isConnected && this.isInternetReachable;
  }

  /**
   * Subscribe to network state changes
   */
  subscribe(listener: NetworkStateListener): () => void {
    this.listeners.add(listener);
    
    // Immediately call with current state
    listener(this.getNetworkState());

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Add request to offline queue
   */
  async addToQueue(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<string> {
    const item: OfflineQueueItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      method,
      url,
      body,
      headers,
      retryCount: 0,
      maxRetries: 3,
    };

    // Add to queue
    this.offlineQueue.push(item);

    // Limit queue size
    if (this.offlineQueue.length > this.maxQueueSize) {
      this.offlineQueue = this.offlineQueue.slice(-this.maxQueueSize);
      logger.warn(`Offline queue limit reached, removing oldest items`);
    }

    // Save to storage
    await this.saveOfflineQueue();

    logger.info(`Added request to offline queue: ${method} ${url}`);

    return item.id;
  }

  /**
   * Process offline queue
   */
  private async processOfflineQueue(): Promise<void> {
    if (this.isProcessingQueue || !this.isOnline() || this.offlineQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    logger.info(`Processing offline queue: ${this.offlineQueue.length} items`);

    const itemsToProcess = [...this.offlineQueue];
    const successfulItems: string[] = [];
    const failedItems: OfflineQueueItem[] = [];

    for (const item of itemsToProcess) {
      try {
        // Try to execute the request
        const response = await this.executeQueuedRequest(item);
        
        if (response.ok) {
          successfulItems.push(item.id);
          logger.info(`Successfully processed queued request: ${item.method} ${item.url}`);
        } else {
          // Retry if not exceeded max retries
          if (item.retryCount < item.maxRetries) {
            item.retryCount++;
            failedItems.push(item);
            logger.warn(`Failed to process queued request, will retry: ${item.method} ${item.url}`);
          } else {
            logger.error(`Failed to process queued request after max retries: ${item.method} ${item.url}`);
            successfulItems.push(item.id); // Remove from queue even if failed
          }
        }
      } catch (error) {
        // Retry if not exceeded max retries
        if (item.retryCount < item.maxRetries) {
          item.retryCount++;
          failedItems.push(item);
          logger.warn(`Error processing queued request, will retry: ${item.method} ${item.url}`, error);
        } else {
          logger.error(`Error processing queued request after max retries: ${item.method} ${item.url}`, error);
          successfulItems.push(item.id); // Remove from queue even if failed
        }
      }
    }

    // Remove successful items from queue
    this.offlineQueue = this.offlineQueue.filter(
      (item) => !successfulItems.includes(item.id)
    );

    // Update failed items (with incremented retry count)
    failedItems.forEach((failedItem) => {
      const index = this.offlineQueue.findIndex((item) => item.id === failedItem.id);
      if (index !== -1) {
        this.offlineQueue[index] = failedItem;
      }
    });

    // Save updated queue
    await this.saveOfflineQueue();

    this.isProcessingQueue = false;

    if (successfulItems.length > 0) {
      logger.info(`Processed ${successfulItems.length} items from offline queue`);
    }
  }

  /**
   * Execute a queued request
   */
  private async executeQueuedRequest(item: OfflineQueueItem): Promise<Response> {
    const { appConfig } = await import('../config/appConfig');
    
    const response = await fetch(`${appConfig.apiBaseUrl}${item.url}`, {
      method: item.method,
      headers: {
        'Content-Type': 'application/json',
        ...(item.headers || {}),
      },
      body: item.body ? JSON.stringify(item.body) : undefined,
    });

    return response;
  }

  /**
   * Get offline queue items
   */
  getQueueItems(): OfflineQueueItem[] {
    return [...this.offlineQueue];
  }

  /**
   * Clear offline queue
   */
  async clearQueue(): Promise<void> {
    this.offlineQueue = [];
    await this.saveOfflineQueue();
    logger.info('Offline queue cleared');
  }

  /**
   * Remove specific item from queue
   */
  async removeFromQueue(itemId: string): Promise<void> {
    this.offlineQueue = this.offlineQueue.filter((item) => item.id !== itemId);
    await this.saveOfflineQueue();
  }

  /**
   * Save offline queue to storage
   */
  private async saveOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.queueStorageKey, JSON.stringify(this.offlineQueue));
    } catch (error) {
      logger.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Load offline queue from storage
   */
  private async loadOfflineQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.queueStorageKey);
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
        logger.info(`Loaded ${this.offlineQueue.length} items from offline queue`);
      }
    } catch (error) {
      logger.error('Failed to load offline queue:', error);
      this.offlineQueue = [];
    }
  }
}

// Singleton instance
export const networkService = new NetworkService();

// Export types
export type { NetworkState, OfflineQueueItem, NetworkStateListener };

export default networkService;

