/**
 * Products Module Query Hooks
 * 
 * Single Responsibility: Provides Products-specific query hooks
 * Dependency Inversion: Uses useApiQuery wrapper, not direct httpService
 */

import { useApiQuery } from '../../../core/hooks/useApiQuery';
import { useApiMutation } from '../../../core/hooks/useApiMutation';
import { useApiInfiniteQuery } from '../../../core/hooks/useApiInfiniteQuery';
import { queryKeys } from '../../../core/services/queryClient';
import { Product, ProductStats } from '../services/productService';
import { GridRequest } from '../../../shared/types/grid';
import { Paginated } from '../../../shared/types/module';
import { toQueryParams } from '../../../shared/utils/query';

/**
 * Hook for fetching products list
 */
export function useProductsQuery(filters?: Record<string, any>) {
  return useApiQuery<Paginated<Product>>({
    url: `/products${filters ? toQueryParams({ filters } as GridRequest) : ''}`,
    queryKey: queryKeys.products.list(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes for lists (fresher than detail)
    transform: (data) => {
      // Ensure proper paginated structure
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
 * Hook for fetching single product
 */
export function useProductQuery(id: string | number | undefined) {
  return useApiQuery<Product>({
    url: `/products/${id}`,
    queryKey: queryKeys.products.detail(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for details
  });
}

/**
 * Hook for fetching product stats
 */
export function useProductStatsQuery() {
  return useApiQuery<ProductStats>({
    url: '/products/stats',
    queryKey: queryKeys.products.stats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for infinite products list (pagination)
 */
export function useProductsInfiniteQuery(pageSize: number = 20) {
  return useApiInfiniteQuery<Product, number>({
    url: '/products',
    queryKey: queryKeys.products.lists(),
    pageSize,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}

/**
 * Hook for creating product
 */
export function useCreateProductMutation() {
  return useApiMutation<Product, Partial<Product>>({
    url: '/products',
    method: 'POST',
    invalidateQueries: [
      queryKeys.products.all,
      queryKeys.products.stats(),
    ],
  });
}

/**
 * Hook for updating product
 */
export function useUpdateProductMutation(id?: string | number) {
  return useApiMutation<Product, { id: string; data: Partial<Product> }>({
    url: (vars) => `/products/${vars.id}`,
    method: 'PUT',
    bodyExtractor: (vars) => vars.data,
    invalidateQueries: [
      queryKeys.products.all,
      queryKeys.products.stats(),
      ...(id ? [queryKeys.products.detail(id)] : []),
    ],
    optimisticUpdate: {
      queryKeys: [
        queryKeys.products.all,
        ...(id ? [queryKeys.products.detail(id)] : []),
      ],
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
 * Hook for deleting product
 */
export function useDeleteProductMutation() {
  return useApiMutation<void, string>({
    url: (id) => `/products/${id}`,
    method: 'DELETE',
    invalidateQueries: [
      queryKeys.products.all,
      queryKeys.products.stats(),
    ],
    optimisticUpdate: {
      queryKeys: [queryKeys.products.all],
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

