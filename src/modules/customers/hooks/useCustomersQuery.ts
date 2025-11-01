/**
 * Customers Module Query Hooks
 * 
 * Single Responsibility: Provides Customers-specific query hooks
 * Dependency Inversion: Uses useApiQuery wrapper, not direct httpService
 */

import { useApiQuery } from '../../../core/hooks/useApiQuery';
import { useApiMutation } from '../../../core/hooks/useApiMutation';
import { useApiInfiniteQuery } from '../../../core/hooks/useApiInfiniteQuery';
import { queryKeys } from '../../../core/services/queryClient';
import { Customer, CustomerStats } from '../services/customerService';
import { GridRequest } from '../../../shared/types/grid';
import { Paginated } from '../../../shared/types/module';
import { toQueryParams } from '../../../shared/utils/query';

/**
 * Hook for fetching customers list
 */
export function useCustomersQuery(filters?: Record<string, any>) {
  return useApiQuery<Paginated<Customer>>({
    url: `/customers${filters ? toQueryParams({ filters } as GridRequest) : ''}`,
    queryKey: queryKeys.customers.list(filters),
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
 * Hook for fetching single customer
 */
export function useCustomerQuery(id: string | number | undefined) {
  return useApiQuery<Customer>({
    url: `/customers/${id}`,
    queryKey: queryKeys.customers.detail(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for fetching customer stats
 */
export function useCustomerStatsQuery() {
  return useApiQuery<CustomerStats>({
    url: '/customers/stats',
    queryKey: queryKeys.customers.stats(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for infinite customers list (pagination)
 */
export function useCustomersInfiniteQuery(pageSize: number = 20) {
  return useApiInfiniteQuery<Customer, number>({
    url: '/customers',
    queryKey: queryKeys.customers.lists(),
    pageSize,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}

/**
 * Hook for creating customer
 */
export function useCreateCustomerMutation() {
  return useApiMutation<Customer, Partial<Customer>>({
    url: '/customers',
    method: 'POST',
    invalidateQueries: [
      queryKeys.customers.all,
      queryKeys.customers.stats(),
    ],
  });
}

/**
 * Hook for updating customer
 */
export function useUpdateCustomerMutation(id?: string | number) {
  return useApiMutation<Customer, { id: string; data: Partial<Customer> }>({
    url: (vars) => `/customers/${vars.id}`,
    method: 'PUT',
    bodyExtractor: (vars) => vars.data,
    invalidateQueries: [
      queryKeys.customers.all,
      queryKeys.customers.stats(),
      ...(id ? [queryKeys.customers.detail(id)] : []),
    ],
    optimisticUpdate: {
      queryKeys: [
        queryKeys.customers.all,
        ...(id ? [queryKeys.customers.detail(id)] : []),
      ],
      updateFn: (oldData, vars) => {
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.map((item: Customer) =>
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
 * Hook for deleting customer
 */
export function useDeleteCustomerMutation() {
  return useApiMutation<void, string>({
    url: (id) => `/customers/${id}`,
    method: 'DELETE',
    invalidateQueries: [
      queryKeys.customers.all,
      queryKeys.customers.stats(),
    ],
    optimisticUpdate: {
      queryKeys: [queryKeys.customers.all],
      updateFn: (oldData, id) => {
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.filter((item: Customer) => item.id !== id),
            total: Math.max(0, (oldData.total || 0) - 1),
          };
        }
        return oldData;
      },
      rollbackFn: (oldData) => oldData,
    },
  });
}

