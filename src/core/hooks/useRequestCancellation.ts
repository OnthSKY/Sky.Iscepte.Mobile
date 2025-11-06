/**
 * useRequestCancellation Hook
 *
 * NEDEN: Component unmount olduğunda request'leri cancel etmek için
 * - useEffect cleanup ile otomatik cancellation
 * - Request lifecycle yönetimi
 */

import { useEffect, useRef } from 'react';
import { requestManager } from '../services/requestManager';

type RequestId = string;

/**
 * useRequestCancellation Hook
 *
 * NEDEN: Component unmount olduğunda request'leri cancel etmek için
 * - useEffect cleanup ile otomatik cancellation
 * - Request lifecycle yönetimi
 *
 * @example
 * ```tsx
 * const { registerRequest, cancelAll } = useRequestCancellation();
 *
 * const fetchData = async () => {
 *   const requestId = requestManager.generateId('GET', '/api/data');
 *   registerRequest(requestId);
 *   try {
 *     await httpService.get('/api/data');
 *   } finally {
 *     requestManager.removeRequest(requestId);
 *   }
 * };
 * ```
 */
export function useRequestCancellation() {
  const requestIdsRef = useRef<Set<RequestId>>(new Set());

  /**
   * Register request for cancellation
   */
  const registerRequest = (requestId: RequestId): void => {
    requestIdsRef.current.add(requestId);
  };

  /**
   * Cancel specific request
   */
  const cancelRequest = (requestId: RequestId): void => {
    requestManager.cancelRequest(requestId);
    requestIdsRef.current.delete(requestId);
  };

  /**
   * Cancel all registered requests
   */
  const cancelAll = (): void => {
    requestIdsRef.current.forEach((id) => {
      requestManager.cancelRequest(id);
    });
    requestIdsRef.current.clear();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel all registered requests when component unmounts
      cancelAll();
    };
  }, []);

  return {
    registerRequest,
    cancelRequest,
    cancelAll,
  };
}

export default useRequestCancellation;
