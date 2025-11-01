/**
 * Detail Prefetching Hook
 * 
 * Single Responsibility: Prefetches detail pages when navigating to lists
 * Dependency Inversion: Uses queryClient interface, not concrete implementation
 * 
 * Strategy: When list loads, prefetch first few items' detail pages
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/queryClient';
import { apiEndpoints } from '../config/apiEndpoints';
import httpService from '../../shared/services/httpService';

/**
 * Configuration for detail prefetching
 */
interface DetailPrefetchConfig {
  module: 'products' | 'sales' | 'customers' | 'expenses' | 'employees' | 'reports';
  getQueryKey: (id: string | number) => readonly unknown[];
  getDetailUrl: (id: string | number) => string;
  maxPrefetch?: number; // Maximum number of items to prefetch
}

/**
 * Detail prefetch configurations
 */
const DETAIL_PREFETCH_CONFIGS: Record<string, DetailPrefetchConfig> = {
  products: {
    module: 'products',
    getQueryKey: (id) => queryKeys.products.detail(id),
    getDetailUrl: (id) => apiEndpoints.products.get(id),
    maxPrefetch: 5, // Prefetch first 5 items
  },
  sales: {
    module: 'sales',
    getQueryKey: (id) => queryKeys.sales.detail(id),
    getDetailUrl: (id) => apiEndpoints.sales.get(id),
    maxPrefetch: 5,
  },
  customers: {
    module: 'customers',
    getQueryKey: (id) => queryKeys.customers.detail(id),
    getDetailUrl: (id) => apiEndpoints.customers.get(id),
    maxPrefetch: 3,
  },
  expenses: {
    module: 'expenses',
    getQueryKey: (id) => queryKeys.expenses.detail(id),
    getDetailUrl: (id) => apiEndpoints.expenses.get(id),
    maxPrefetch: 3,
  },
  employees: {
    module: 'employees',
    getQueryKey: (id) => queryKeys.employees.detail(id),
    getDetailUrl: (id) => apiEndpoints.employees.get(id),
    maxPrefetch: 3,
  },
  reports: {
    module: 'reports',
    getQueryKey: (id) => queryKeys.reports.detail(id),
    getDetailUrl: (id) => apiEndpoints.reports.get(id),
    maxPrefetch: 3,
  },
};

/**
 * useDetailPrefetch hook
 * Prefetches detail pages for items in a list
 * 
 * @param module - Module name
 * @param itemIds - Array of item IDs to prefetch
 * @param options - Prefetch options
 * 
 * @example
 * ```tsx
 * function ProductsListScreen() {
 *   const { items } = useProductsQuery();
 *   const itemIds = items?.map(item => item.id) || [];
 *   
 *   useDetailPrefetch('products', itemIds);
 *   // ... rest of component
 * }
 * ```
 */
export function useDetailPrefetch(
  module: keyof typeof DETAIL_PREFETCH_CONFIGS,
  itemIds: Array<string | number>,
  options: { maxPrefetch?: number } = {}
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const config = DETAIL_PREFETCH_CONFIGS[module];
    if (!config || !itemIds.length) return;

    const maxPrefetch = options.maxPrefetch ?? config.maxPrefetch ?? 5;
    const idsToPrefetch = itemIds.slice(0, maxPrefetch);

    // Prefetch detail pages
    const prefetchPromises = idsToPrefetch.map((id) => {
      return queryClient.prefetchQuery({
        queryKey: config.getQueryKey(id),
        queryFn: async () => {
          try {
            return await httpService.get(config.getDetailUrl(id));
          } catch (error) {
            // Silently fail - prefetch errors shouldn't break the app
            throw error;
          }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    });

    // Don't await - let it run in background
    Promise.allSettled(prefetchPromises).catch(() => {
      // Silently handle errors - prefetch failures are non-critical
    });
  }, [module, itemIds, queryClient, options.maxPrefetch]);
}

