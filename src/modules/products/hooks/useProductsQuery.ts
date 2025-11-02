/**
 * Stock Module Query Hooks
 * 
 * Single Responsibility: Provides Stock-specific query hooks
 * Dependency Inversion: Uses useApiQuery wrapper, not direct httpService
 */

import { useApiQuery } from '../../../core/hooks/useApiQuery';
import { useApiMutation } from '../../../core/hooks/useApiMutation';
import { useApiInfiniteQuery } from '../../../core/hooks/useApiInfiniteQuery';
import { queryKeys } from '../../../core/services/queryClient';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import { Product, ProductStats, ProductHistoryItem } from '../services/productService';
import { GridRequest } from '../../../shared/types/grid';
import { Paginated } from '../../../shared/types/module';
import { PaginatedData } from '../../../shared/types/apiResponse';
import { toQueryParams } from '../../../shared/utils/query';

/**
 * Hook for fetching stock list
 */
export function useProductsQuery(filters?: Record<string, any>) {
  return useApiQuery<Paginated<Product>>({
    url: `${apiEndpoints.stock.list}${filters ? toQueryParams({ filters } as GridRequest) : ''}`,
    queryKey: queryKeys.stock.list(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes for lists (fresher than detail)
    transform: (data: any) => {
      // Handle PaginatedData format (from new API structure)
      if (data && 'totalCount' in data && 'totalPage' in data) {
        const paginatedData = data as PaginatedData<Product>;
        return {
          items: paginatedData.items || [],
          total: paginatedData.totalCount || 0,
          page: paginatedData.page || 1,
          pageSize: paginatedData.pageSize || 20,
        } as Paginated<Product>;
      }
      
      // Handle legacy array format
      if (!data.items && Array.isArray(data)) {
        return {
          items: data,
          total: data.length,
          page: 1,
          pageSize: 20,
        } as Paginated<Product>;
      }
      
      // Ensure proper paginated structure (fallback)
      return {
        items: data?.items || [],
        total: data?.total || data?.totalCount || 0,
        page: data?.page || 1,
        pageSize: data?.pageSize || 20,
      } as Paginated<Product>;
    },
  });
}

/**
 * Hook for fetching single stock item
 */
export function useProductQuery(id: string | number | undefined) {
  return useApiQuery<Product>({
    url: id ? apiEndpoints.stock.get(id) : '',
    queryKey: queryKeys.stock.detail(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for details
  });
}

/**
 * Hook for fetching stock stats
 */
export function useProductStatsQuery() {
  return useApiQuery<ProductStats>({
    url: apiEndpoints.stock.stats,
    queryKey: queryKeys.stock.stats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for infinite stock list (pagination)
 */
export function useProductsInfiniteQuery(pageSize: number = 20) {
  return useApiInfiniteQuery<Product, number>({
    url: apiEndpoints.stock.list,
    queryKey: queryKeys.stock.lists(),
    pageSize,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    transform: (data: any) => {
      // Handle PaginatedData format (from new API structure)
      if (data && 'totalCount' in data && 'totalPage' in data) {
        const paginatedData = data as PaginatedData<Product>;
        return {
          items: paginatedData.items || [],
          total: paginatedData.totalCount || 0,
          page: paginatedData.page || 1,
          pageSize: paginatedData.pageSize || 20,
        };
      }
      
      // Handle legacy Paginated format
      return {
        items: data?.items || [],
        total: data?.total || data?.totalCount || 0,
        page: data?.page || 1,
        pageSize: data?.pageSize || 20,
      };
    },
  });
}

/**
 * Hook for creating stock item
 */
export function useCreateProductMutation() {
  return useApiMutation<Product, Partial<Product>>({
    url: apiEndpoints.stock.create,
    method: 'POST',
    invalidateQueries: [
      queryKeys.stock.all,
      queryKeys.stock.stats(),
    ] as ReadonlyArray<readonly unknown[]>,
  });
}

/**
 * Hook for updating stock item
 */
export function useUpdateProductMutation(id?: string | number) {
  return useApiMutation<Product, { id: string; data: Partial<Product> }>({
    url: (vars) => apiEndpoints.stock.update(vars.id),
    method: 'PUT',
    bodyExtractor: (vars) => vars.data,
    invalidateQueries: [
      queryKeys.stock.all,
      queryKeys.stock.stats(),
      ...(id ? [queryKeys.stock.detail(id)] : []),
    ] as ReadonlyArray<readonly unknown[]>,
    optimisticUpdate: {
      queryKeys: [
        queryKeys.stock.all,
        ...(id ? [queryKeys.stock.detail(id)] : []),
      ] as ReadonlyArray<readonly unknown[]>,
      updateFn: (oldData, vars) => {
        // If oldData is paginated list
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.map((item: Product) =>
              item.id === vars.id ? { ...item, ...vars.data } : item
            ),
          };
        }
        // If oldData is single product
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
 * Hook for deleting stock item
 */
export function useDeleteProductMutation() {
  return useApiMutation<void, string>({
    url: (id) => apiEndpoints.stock.remove(id),
    method: 'DELETE',
    invalidateQueries: [
      queryKeys.stock.all,
      queryKeys.stock.stats(),
    ] as ReadonlyArray<readonly unknown[]>,
    optimisticUpdate: {
      queryKeys: [queryKeys.stock.all] as ReadonlyArray<readonly unknown[]>,
      updateFn: (oldData, id) => {
        // Remove product from cache
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.filter((item: Product) => item.id !== id),
            total: Math.max(0, (oldData.total || 0) - 1),
          };
        }
        return oldData;
      },
      rollbackFn: (oldData) => oldData,
    },
  });
}

/**
 * Hook for fetching product history/timeline
 */
export function useProductHistoryQuery(
  id: string | number | undefined,
  options: { enabled?: boolean } = {}
) {
  return useApiQuery<ProductHistoryItem[]>({
    url: id ? apiEndpoints.stock.history(id) : '',
    queryKey: queryKeys.stock.history(id!),
    enabled: !!id && (options.enabled !== false),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

