/**
 * Owner Dashboard Summary Hooks
 * 
 * Single Responsibility: Provides owner dashboard summary query hooks
 * Dependency Inversion: Uses useApiQuery wrapper, not direct httpService
 */

import { useApiQuery } from './useApiQuery';
import { queryKeys } from '../services/queryClient';
import { apiEndpoints } from '../config/apiEndpoints';
import { OwnerTodaySummary, OwnerTotalSummary, OwnerEmployeeSummary } from '../services/ownerDashboardService';

/**
 * Hook for fetching owner today summary
 */
export function useOwnerTodaySummary() {
  return useApiQuery<OwnerTodaySummary>({
    url: apiEndpoints.dashboard.owner.todaySummary,
    queryKey: ['dashboard', 'owner', 'today-summary'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for fetching owner total summary
 */
export function useOwnerTotalSummary() {
  return useApiQuery<OwnerTotalSummary>({
    url: apiEndpoints.dashboard.owner.totalSummary,
    queryKey: ['dashboard', 'owner', 'total-summary'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching owner employee summary
 */
export function useOwnerEmployeeSummary(employeeId?: string | number, period: 'today' | 'all' = 'today') {
  return useApiQuery<OwnerEmployeeSummary>({
    url: apiEndpoints.dashboard.owner.employeeSummary(employeeId, period),
    queryKey: ['dashboard', 'owner', 'employee-summary', employeeId || 'total', period],
    enabled: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

