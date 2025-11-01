/**
 * Dashboard Prefetching Hook
 * 
 * Single Responsibility: Prefetches module dashboard stats when main dashboard loads
 * Dependency Inversion: Uses queryClient interface, not concrete implementation
 * 
 * Strategy: Prefetch all module stats when dashboard is visible
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/queryClient';
import httpService from '../../shared/services/httpService';

/**
 * Module stats service interfaces
 */
interface ModuleStatsService {
  stats: () => Promise<any>;
}

/**
 * Configuration for module prefetching
 */
interface ModulePrefetchConfig {
  module: string;
  service: ModuleStatsService;
  queryKey: readonly unknown[];
}

/**
 * Available modules for prefetching
 */
const MODULE_PREFETCH_CONFIGS: ModulePrefetchConfig[] = [
  {
    module: 'products',
    service: {
      stats: () => httpService.get<any>('/products/stats'),
    },
    queryKey: queryKeys.products.stats(),
  },
  {
    module: 'sales',
    service: {
      stats: () => httpService.get<any>('/sales/stats'),
    },
    queryKey: queryKeys.sales.stats(),
  },
  {
    module: 'customers',
    service: {
      stats: () => httpService.get<any>('/customers/stats'),
    },
    queryKey: queryKeys.customers.stats(),
  },
  {
    module: 'expenses',
    service: {
      stats: () => httpService.get<any>('/expenses/stats'),
    },
    queryKey: queryKeys.expenses.stats(),
  },
  {
    module: 'employees',
    service: {
      stats: () => httpService.get<any>('/employees/stats'),
    },
    queryKey: queryKeys.employees.stats(),
  },
  {
    module: 'reports',
    service: {
      stats: () => httpService.get<any>('/reports/stats'),
    },
    queryKey: queryKeys.reports.stats(),
  },
];

/**
 * useDashboardPrefetch hook
 * Prefetches all module dashboard stats when dashboard is visible
 * 
 * @example
 * ```tsx
 * function DashboardScreen() {
 *   useDashboardPrefetch();
 *   // ... rest of component
 * }
 * ```
 */
export function useDashboardPrefetch() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch all module stats
    const prefetchPromises = MODULE_PREFETCH_CONFIGS.map((config) => {
      return queryClient.prefetchQuery({
        queryKey: config.queryKey,
        queryFn: async () => {
          try {
            return await config.service.stats();
          } catch (error) {
            // Silently fail - prefetch errors shouldn't break the app
            console.warn(`Failed to prefetch ${config.module} stats:`, error);
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
  }, [queryClient]);
}

