/**
 * Revenue Module Query Hooks
 * 
 * Single Responsibility: Provides Revenue-specific query hooks
 * Dependency Inversion: Uses useApiQuery wrapper, not direct httpService
 */

import { useApiQuery } from '../../../core/hooks/useApiQuery';
import { useApiMutation } from '../../../core/hooks/useApiMutation';
import { useApiInfiniteQuery } from '../../../core/hooks/useApiInfiniteQuery';
import { queryKeys } from '../../../core/services/queryClient';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import { Revenue, RevenueStats } from '../services/revenueService';
import { GridRequest } from '../../../shared/types/grid';
import { Paginated } from '../../../shared/types/module';
import { toQueryParams } from '../../../shared/utils/query';

/**
 * Hook for fetching revenue list
 */
export function useRevenueQuery(filters?: Record<string, any>) {
  return useApiQuery<Paginated<Revenue>>({
    url: `${apiEndpoints.revenue.list}${filters ? toQueryParams({ filters } as GridRequest) : ''}`,
    queryKey: queryKeys.revenue.list(filters),
    staleTime: 2 * 60 * 1000,
    transform: (data) => {
      if (!data.items && Array.isArray(data)) {
        return {
          items: data,
          total: data.length,
          page: 1,
          pageSize: 20,
        };
      }
      return data;
    },
  });
}

/**
 * Hook for fetching single revenue
 */
export function useRevenueDetailQuery(id: string | number | undefined) {
  return useApiQuery<Revenue>({
    url: id ? apiEndpoints.revenue.get(id) : '',
    queryKey: queryKeys.revenue.detail(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for fetching revenue stats
 */
export function useRevenueStatsQuery() {
  return useApiQuery<RevenueStats>({
    url: apiEndpoints.revenue.stats,
    queryKey: queryKeys.revenue.stats(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for infinite revenue list (pagination)
 */
export function useRevenueInfiniteQuery(pageSize: number = 20) {
  return useApiInfiniteQuery<Revenue, number>({
    url: apiEndpoints.revenue.list,
    queryKey: queryKeys.revenue.lists(),
    pageSize,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}

/**
 * Hook for creating revenue
 */
export function useCreateRevenueMutation() {
  return useApiMutation<Revenue, Partial<Revenue>>({
    url: apiEndpoints.revenue.create,
    method: 'POST',
    invalidateQueries: [
      queryKeys.revenue.all,
      queryKeys.revenue.stats(),
    ],
  });
}

/**
 * Hook for updating revenue
 */
export function useUpdateRevenueMutation(id?: string | number) {
  return useApiMutation<Revenue, { id: string; data: Partial<Revenue> }>({
    url: (vars) => apiEndpoints.revenue.update(vars.id),
    method: 'PUT',
    bodyExtractor: (vars) => vars.data,
    invalidateQueries: [
      queryKeys.revenue.all,
      queryKeys.revenue.stats(),
      ...(id ? [queryKeys.revenue.detail(id)] : []),
    ],
    optimisticUpdate: {
      queryKeys: [
        queryKeys.revenue.all,
        ...(id ? [queryKeys.revenue.detail(id)] : []),
      ],
      updateFn: (oldData, vars) => {
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.map((item: Revenue) =>
              item.id === vars.id ? { ...item, ...vars.data } : item
            ),
          };
        }
        if (oldData?.id === vars.id) {
          return { ...oldData, ...vars.data };
        }
        return oldData;
      },
      rollbackFn: (oldData) => oldData,
    },
  });
}

/**
 * Hook for deleting revenue
 */
export function useDeleteRevenueMutation() {
  return useApiMutation<void, string>({
    url: (id) => apiEndpoints.revenue.remove(id),
    method: 'DELETE',
    invalidateQueries: [
      queryKeys.revenue.all,
      queryKeys.revenue.stats(),
    ],
    optimisticUpdate: {
      queryKeys: [queryKeys.revenue.all],
      updateFn: (oldData, id) => {
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.filter((item: Revenue) => item.id !== id),
            total: Math.max(0, (oldData.total || 0) - 1),
          };
        }
        return oldData;
      },
      rollbackFn: (oldData) => oldData,
    },
  });
}

