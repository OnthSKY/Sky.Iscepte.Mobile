/**
 * Purchases Module Query Hooks
 * 
 * Single Responsibility: Provides Purchase-specific query hooks
 * Dependency Inversion: Uses useApiQuery wrapper, not direct httpService
 */

import { useApiQuery } from '../../../core/hooks/useApiQuery';
import { useApiMutation } from '../../../core/hooks/useApiMutation';
import { useApiInfiniteQuery } from '../../../core/hooks/useApiInfiniteQuery';
import { queryKeys } from '../../../core/services/queryClient';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import { Purchase, PurchaseStats } from '../services/purchaseService';
import { GridRequest } from '../../../shared/types/grid';
import { Paginated } from '../../../shared/types/module';
import { toQueryParams } from '../../../shared/utils/query';

/**
 * Hook for fetching purchases list
 */
export function usePurchasesQuery(filters?: Record<string, any>) {
  return useApiQuery<Paginated<Purchase>>({
    url: `${apiEndpoints.purchases.list}${filters ? toQueryParams({ filters } as GridRequest) : ''}`,
    queryKey: queryKeys.purchases.list(filters),
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
 * Hook for fetching single purchase
 */
export function usePurchaseQuery(id: string | number | undefined) {
  return useApiQuery<Purchase>({
    url: id ? apiEndpoints.purchases.get(id) : '',
    queryKey: queryKeys.purchases.detail(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for details
  });
}

/**
 * Hook for fetching purchase stats
 */
export function usePurchaseStatsQuery() {
  return useApiQuery<PurchaseStats>({
    url: apiEndpoints.purchases.stats,
    queryKey: queryKeys.purchases.stats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for infinite purchases list (pagination)
 */
export function usePurchasesInfiniteQuery(pageSize: number = 20) {
  return useApiInfiniteQuery<Purchase, number>({
    url: apiEndpoints.purchases.list,
    queryKey: queryKeys.purchases.lists(),
    pageSize,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}

/**
 * Hook for creating purchase
 */
export function useCreatePurchaseMutation() {
  return useApiMutation<Purchase, Partial<Purchase>>({
    url: apiEndpoints.purchases.create,
    method: 'POST',
    invalidateQueries: [
      queryKeys.purchases.all,
      queryKeys.purchases.stats(),
      queryKeys.stock.all, // Invalidate stock since purchase affects stock
    ],
  });
}

/**
 * Hook for updating purchase
 */
export function useUpdatePurchaseMutation(id?: string | number) {
  return useApiMutation<Purchase, { id: string; data: Partial<Purchase> }>({
    url: (vars) => apiEndpoints.purchases.update(vars.id),
    method: 'PUT',
    bodyExtractor: (vars) => vars.data,
    invalidateQueries: [
      queryKeys.purchases.all,
      queryKeys.purchases.stats(),
      queryKeys.stock.all, // Invalidate stock since purchase affects stock
      ...(id ? [queryKeys.purchases.detail(id)] : []),
    ],
    optimisticUpdate: {
      queryKeys: [
        queryKeys.purchases.all,
        ...(id ? [queryKeys.purchases.detail(id)] : []),
      ],
      updateFn: (oldData, vars) => {
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.map((item: Purchase) =>
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
 * Hook for deleting purchase
 */
export function useDeletePurchaseMutation() {
  return useApiMutation<void, string>({
    url: (id) => apiEndpoints.purchases.remove(id),
    method: 'DELETE',
    invalidateQueries: [
      queryKeys.purchases.all,
      queryKeys.purchases.stats(),
      queryKeys.stock.all, // Invalidate stock since purchase affects stock
    ],
    optimisticUpdate: {
      queryKeys: [queryKeys.purchases.all],
      updateFn: (oldData, id) => {
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.filter((item: Purchase) => item.id !== id),
            total: Math.max(0, (oldData.total || 0) - 1),
          };
        }
        return oldData;
      },
      rollbackFn: (oldData) => oldData,
    },
  });
}

