/**
 * Suppliers Module Query Hooks
 * 
 * Single Responsibility: Provides Suppliers-specific query hooks
 * Dependency Inversion: Uses useApiQuery wrapper, not direct httpService
 */

import { useApiQuery } from '../../../core/hooks/useApiQuery';
import { useApiMutation } from '../../../core/hooks/useApiMutation';
import { useApiInfiniteQuery } from '../../../core/hooks/useApiInfiniteQuery';
import { queryKeys } from '../../../core/services/queryClient';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import { Supplier, SupplierStats } from '../services/supplierService';
import { GridRequest } from '../../../shared/types/grid';
import { Paginated } from '../../../shared/types/module';
import { toQueryParams } from '../../../shared/utils/query';

/**
 * Hook for fetching suppliers list
 */
export function useSuppliersQuery(filters?: Record<string, any>) {
  return useApiQuery<Paginated<Supplier>>({
    url: `${apiEndpoints.suppliers.list}${filters ? toQueryParams({ filters } as GridRequest) : ''}`,
    queryKey: queryKeys.suppliers.list(filters),
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
 * Hook for fetching single supplier
 */
export function useSupplierQuery(id: string | number | undefined) {
  return useApiQuery<Supplier>({
    url: id ? apiEndpoints.suppliers.get(id) : '',
    queryKey: queryKeys.suppliers.detail(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for fetching supplier stats
 */
export function useSupplierStatsQuery() {
  return useApiQuery<SupplierStats>({
    url: apiEndpoints.suppliers.stats,
    queryKey: queryKeys.suppliers.stats(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for infinite suppliers list (pagination)
 */
export function useSuppliersInfiniteQuery(pageSize: number = 20) {
  return useApiInfiniteQuery<Supplier, number>({
    url: apiEndpoints.suppliers.list,
    queryKey: queryKeys.suppliers.lists(),
    pageSize,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}

/**
 * Hook for creating supplier
 */
export function useCreateSupplierMutation() {
  return useApiMutation<Supplier, Partial<Supplier>>({
    url: apiEndpoints.suppliers.create,
    method: 'POST',
    invalidateQueries: [
      queryKeys.suppliers.all,
      queryKeys.suppliers.stats(),
    ],
  });
}

/**
 * Hook for updating supplier
 */
export function useUpdateSupplierMutation(id?: string | number) {
  return useApiMutation<Supplier, { id: string; data: Partial<Supplier> }>({
    url: (vars) => apiEndpoints.suppliers.update(vars.id),
    method: 'PUT',
    bodyExtractor: (vars) => vars.data,
    invalidateQueries: [
      queryKeys.suppliers.all,
      queryKeys.suppliers.stats(),
      ...(id ? [queryKeys.suppliers.detail(id)] : []),
    ],
    optimisticUpdate: {
      queryKeys: [
        queryKeys.suppliers.all,
        ...(id ? [queryKeys.suppliers.detail(id)] : []),
      ],
      updateFn: (oldData, vars) => {
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.map((item: Supplier) =>
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
 * Hook for deleting supplier
 */
export function useDeleteSupplierMutation() {
  return useApiMutation<void, string>({
    url: (id) => apiEndpoints.suppliers.remove(id),
    method: 'DELETE',
    invalidateQueries: [
      queryKeys.suppliers.all,
      queryKeys.suppliers.stats(),
    ],
    optimisticUpdate: {
      queryKeys: [queryKeys.suppliers.all],
      updateFn: (oldData, id) => {
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.filter((item: Supplier) => item.id !== id),
            total: Math.max(0, (oldData.total || 0) - 1),
          };
        }
        return oldData;
      },
      rollbackFn: (oldData) => oldData,
    },
  });
}

