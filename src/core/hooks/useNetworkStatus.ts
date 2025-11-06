/**
 * useNetworkStatus Hook
 * 
 * Provides network connectivity status and offline queue management
 */

import { useState, useEffect } from 'react';
import networkService, { NetworkState } from '../services/networkService';

interface UseNetworkStatusResult {
  isOnline: boolean;
  isConnected: boolean;
  isInternetReachable: boolean;
  networkType: string | null;
  queueLength: number;
  retryQueue: () => Promise<void>;
}

/**
 * Hook to monitor network status
 */
export function useNetworkStatus(): UseNetworkStatusResult {
  const [networkState, setNetworkState] = useState<NetworkState>(networkService.getNetworkState());
  const [queueLength, setQueueLength] = useState(0);

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = networkService.subscribe((state) => {
      setNetworkState(state);
    });

    // Update queue length periodically
    const updateQueueLength = () => {
      setQueueLength(networkService.getQueueItems().length);
    };

    updateQueueLength();
    const interval = setInterval(updateQueueLength, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const retryQueue = async () => {
    // Force process queue
    await (networkService as any).processOfflineQueue();
  };

  return {
    isOnline: networkState.isConnected && networkState.isInternetReachable,
    isConnected: networkState.isConnected,
    isInternetReachable: networkState.isInternetReachable,
    networkType: networkState.type,
    queueLength,
    retryQueue,
  };
}

export default useNetworkStatus;

