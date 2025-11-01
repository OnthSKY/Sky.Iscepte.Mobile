/**
 * Expenses Module Query Hooks
 * 
 * Single Responsibility: Provides Expenses-specific query hooks
 * Dependency Inversion: Uses useApiQuery wrapper, not direct httpService
 */

import { useApiQuery } from '../../../core/hooks/useApiQuery';
import { useApiMutation } from '../../../core/hooks/useApiMutation';
import { useApiInfiniteQuery } from '../../../core/hooks/useApiInfiniteQuery';
import { queryKeys } from '../../../core/services/queryClient';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import { Expense, ExpenseStats } from '../services/expenseService';
import { GridRequest } from '../../../shared/types/grid';
import { Paginated } from '../../../shared/types/module';
import { toQueryParams } from '../../../shared/utils/query';

/**
 * Hook for fetching expenses list
 */
export function useExpensesQuery(filters?: Record<string, any>) {
  return useApiQuery<Paginated<Expense>>({
    url: `${apiEndpoints.expenses.list}${filters ? toQueryParams({ filters } as GridRequest) : ''}`,
    queryKey: queryKeys.expenses.list(filters),
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
 * Hook for fetching single expense
 */
export function useExpenseQuery(id: string | number | undefined) {
  return useApiQuery<Expense>({
    url: id ? apiEndpoints.expenses.get(id) : '',
    queryKey: queryKeys.expenses.detail(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for fetching expense stats
 */
export function useExpenseStatsQuery() {
  return useApiQuery<ExpenseStats>({
    url: apiEndpoints.expenses.stats,
    queryKey: queryKeys.expenses.stats(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for infinite expenses list (pagination)
 */
export function useExpensesInfiniteQuery(pageSize: number = 20) {
  return useApiInfiniteQuery<Expense, number>({
    url: apiEndpoints.expenses.list,
    queryKey: queryKeys.expenses.lists(),
    pageSize,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}

/**
 * Hook for creating expense
 */
export function useCreateExpenseMutation() {
  return useApiMutation<Expense, Partial<Expense>>({
    url: apiEndpoints.expenses.create,
    method: 'POST',
    invalidateQueries: [
      queryKeys.expenses.all,
      queryKeys.expenses.stats(),
    ],
  });
}

/**
 * Hook for updating expense
 */
export function useUpdateExpenseMutation(id?: string | number) {
  return useApiMutation<Expense, { id: string; data: Partial<Expense> }>({
    url: (vars) => apiEndpoints.expenses.update(vars.id),
    method: 'PUT',
    bodyExtractor: (vars) => vars.data,
    invalidateQueries: [
      queryKeys.expenses.all,
      queryKeys.expenses.stats(),
      ...(id ? [queryKeys.expenses.detail(id)] : []),
    ],
    optimisticUpdate: {
      queryKeys: [
        queryKeys.expenses.all,
        ...(id ? [queryKeys.expenses.detail(id)] : []),
      ],
      updateFn: (oldData, vars) => {
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.map((item: Expense) =>
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
 * Hook for deleting expense
 */
export function useDeleteExpenseMutation() {
  return useApiMutation<void, string>({
    url: (id) => apiEndpoints.expenses.remove(id),
    method: 'DELETE',
    invalidateQueries: [
      queryKeys.expenses.all,
      queryKeys.expenses.stats(),
    ],
    optimisticUpdate: {
      queryKeys: [queryKeys.expenses.all],
      updateFn: (oldData, id) => {
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.filter((item: Expense) => item.id !== id),
            total: Math.max(0, (oldData.total || 0) - 1),
          };
        }
        return oldData;
      },
      rollbackFn: (oldData) => oldData,
    },
  });
}

