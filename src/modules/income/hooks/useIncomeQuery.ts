/**
 * Income Module Query Hooks
 * 
 * Single Responsibility: Provides Income-specific query hooks
 * Dependency Inversion: Uses useApiQuery wrapper, not direct httpService
 */

import { useApiQuery } from '../../../core/hooks/useApiQuery';
import { useApiMutation } from '../../../core/hooks/useApiMutation';
import { useApiInfiniteQuery } from '../../../core/hooks/useApiInfiniteQuery';
import { queryKeys } from '../../../core/services/queryClient';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import { Income, IncomeStats } from '../services/incomeService';
import { GridRequest } from '../../../shared/types/grid';
import { Paginated } from '../../../shared/types/module';
import { toQueryParams } from '../../../shared/utils/query';

/**
 * Hook for fetching income list
 */
export function useIncomeQuery(filters?: Record<string, any>) {
  return useApiQuery<Paginated<Income>>({
    url: `${apiEndpoints.income.list}${filters ? toQueryParams({ filters } as GridRequest) : ''}`,
    queryKey: queryKeys.income.list(filters),
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
 * Hook for fetching single income
 */
export function useIncomeDetailQuery(id: string | number | undefined) {
  return useApiQuery<Income>({
    url: id ? apiEndpoints.income.get(id) : '',
    queryKey: queryKeys.income.detail(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for fetching income stats
 */
export function useIncomeStatsQuery() {
  return useApiQuery<IncomeStats>({
    url: apiEndpoints.income.stats,
    queryKey: queryKeys.income.stats(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for infinite income list (pagination)
 */
export function useIncomeInfiniteQuery(pageSize: number = 20) {
  return useApiInfiniteQuery<Income, number>({
    url: apiEndpoints.income.list,
    queryKey: queryKeys.income.lists(),
    pageSize,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}

/**
 * Hook for creating income
 */
export function useCreateIncomeMutation() {
  return useApiMutation<Income, Partial<Income>>({
    url: apiEndpoints.income.create,
    method: 'POST',
    invalidateQueries: [
      queryKeys.income.all,
      queryKeys.income.stats(),
    ],
  });
}

/**
 * Hook for updating income
 */
export function useUpdateIncomeMutation(id?: string | number) {
  return useApiMutation<Income, { id: string; data: Partial<Income> }>({
    url: (vars) => apiEndpoints.income.update(vars.id),
    method: 'PUT',
    bodyExtractor: (vars) => vars.data,
    invalidateQueries: [
      queryKeys.income.all,
      queryKeys.income.stats(),
      ...(id ? [queryKeys.income.detail(id)] : []),
    ],
    optimisticUpdate: {
      queryKeys: [
        queryKeys.income.all,
        ...(id ? [queryKeys.income.detail(id)] : []),
      ],
      updateFn: (oldData, vars) => {
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.map((item: Income) =>
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
 * Hook for deleting income
 */
export function useDeleteIncomeMutation() {
  return useApiMutation<void, string>({
    url: (id) => apiEndpoints.income.remove(id),
    method: 'DELETE',
    invalidateQueries: [
      queryKeys.income.all,
      queryKeys.income.stats(),
    ],
    optimisticUpdate: {
      queryKeys: [queryKeys.income.all],
      updateFn: (oldData, id) => {
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.filter((item: Income) => item.id !== id),
            total: Math.max(0, (oldData.total || 0) - 1),
          };
        }
        return oldData;
      },
      rollbackFn: (oldData) => oldData,
    },
  });
}

