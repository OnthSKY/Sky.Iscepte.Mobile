/**
 * Owner Dashboard Summary Hooks
 * 
 * Single Responsibility: Provides owner dashboard summary query hooks
 * Dependency Inversion: Uses useApiQuery wrapper, not direct httpService
 */

import { useApiQuery } from './useApiQuery';
import { queryKeys } from '../services/queryClient';
import { apiEndpoints } from '../config/apiEndpoints';
import { OwnerStoreSummary, OwnerEmployeeSummary, OwnerTopProducts } from '../services/ownerDashboardService';

/**
 * Hook for fetching owner store summary
 */
export function useOwnerStoreSummary(period: 'day' | 'week' | 'month' | 'year' | 'all' = 'all') {
  return useApiQuery<OwnerStoreSummary>({
    url: apiEndpoints.dashboard.owner.storeSummary(period),
    queryKey: ['dashboard', 'owner', 'store-summary', period],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for fetching owner employee summary
 */
export function useOwnerEmployeeSummary(employeeId?: string | number, period: 'day' | 'week' | 'month' | 'year' | 'all' = 'all') {
  return useApiQuery<OwnerEmployeeSummary>({
    url: apiEndpoints.dashboard.owner.employeeSummary(employeeId, period),
    queryKey: ['dashboard', 'owner', 'employee-summary', employeeId || 'total', period],
    enabled: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for fetching owner top products
 */
export function useOwnerTopProducts(period: 'day' | 'week' | 'month' | 'year' | 'all' = 'all', limit: number = 10) {
  return useApiQuery<OwnerTopProducts>({
    url: apiEndpoints.dashboard.owner.topProducts(period, limit),
    queryKey: ['dashboard', 'owner', 'top-products', period, limit],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

