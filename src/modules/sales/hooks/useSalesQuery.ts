/**
 * Sales Module Query Hooks
 * 
 * Single Responsibility: Provides Sales-specific query hooks
 * Dependency Inversion: Uses useApiQuery wrapper, not direct httpService
 */

import { useApiQuery } from '../../../core/hooks/useApiQuery';
import { useApiMutation } from '../../../core/hooks/useApiMutation';
import { useApiInfiniteQuery } from '../../../core/hooks/useApiInfiniteQuery';
import { queryKeys } from '../../../core/services/queryClient';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import { Sale, SalesStats } from '../services/salesService';
import { GridRequest } from '../../../shared/types/grid';
import { Paginated } from '../../../shared/types/module';
import { toQueryParams } from '../../../shared/utils/query';

/**
 * Hook for fetching sales list
 */
export function useSalesQuery(filters?: Record<string, any>) {
  return useApiQuery<Paginated<Sale>>({
    url: `${apiEndpoints.sales.list}${filters ? toQueryParams({ filters } as GridRequest) : ''}`,
    queryKey: queryKeys.sales.list(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes for lists
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
 * Hook for fetching single sale
 */
export function useSaleQuery(id: string | number | undefined) {
  return useApiQuery<Sale>({
    url: id ? apiEndpoints.sales.get(id) : '',
    queryKey: queryKeys.sales.detail(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for details
  });
}

/**
 * Hook for fetching sale stats
 */
export function useSaleStatsQuery() {
  return useApiQuery<SalesStats>({
    url: apiEndpoints.sales.stats,
    queryKey: queryKeys.sales.stats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for infinite sales list (pagination)
 */
export function useSalesInfiniteQuery(pageSize: number = 20) {
  return useApiInfiniteQuery<Sale, number>({
    url: apiEndpoints.sales.list,
    queryKey: queryKeys.sales.lists(),
    pageSize,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}

/**
 * Hook for creating sale
 */
export function useCreateSaleMutation() {
  return useApiMutation<Sale, Partial<Sale>>({
    url: apiEndpoints.sales.create,
    method: 'POST',
    invalidateQueries: [
      queryKeys.sales.all,
      queryKeys.sales.stats(),
    ],
  });
}

/**
 * Hook for updating sale
 */
export function useUpdateSaleMutation(id?: string | number) {
  return useApiMutation<Sale, { id: string; data: Partial<Sale> }>({
    url: (vars) => apiEndpoints.sales.update(vars.id),
    method: 'PUT',
    bodyExtractor: (vars) => vars.data,
    invalidateQueries: [
      queryKeys.sales.all,
      queryKeys.sales.stats(),
      ...(id ? [queryKeys.sales.detail(id)] : []),
    ],
    optimisticUpdate: {
      queryKeys: [
        queryKeys.sales.all,
        ...(id ? [queryKeys.sales.detail(id)] : []),
      ],
      updateFn: (oldData, vars) => {
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.map((item: Sale) =>
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
 * Hook for deleting sale
 */
export function useDeleteSaleMutation() {
  return useApiMutation<void, string>({
    url: (id) => apiEndpoints.sales.remove(id),
    method: 'DELETE',
    invalidateQueries: [
      queryKeys.sales.all,
      queryKeys.sales.stats(),
    ],
    optimisticUpdate: {
      queryKeys: [queryKeys.sales.all],
      updateFn: (oldData, id) => {
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.filter((item: Sale) => item.id !== id),
            total: Math.max(0, (oldData.total || 0) - 1),
          };
        }
        return oldData;
      },
      rollbackFn: (oldData) => oldData,
    },
  });
}

