/**
 * Reports Module Query Hooks
 * 
 * Single Responsibility: Provides Reports-specific query hooks
 * Dependency Inversion: Uses useApiQuery wrapper, not direct httpService
 */

import { useApiQuery } from '../../../core/hooks/useApiQuery';
import { useApiMutation } from '../../../core/hooks/useApiMutation';
import { useApiInfiniteQuery } from '../../../core/hooks/useApiInfiniteQuery';
import { queryKeys } from '../../../core/services/queryClient';
import { Report, ReportStats } from '../services/reportService';
import { GridRequest } from '../../../shared/types/grid';
import { Paginated } from '../../../shared/types/module';
import { toQueryParams } from '../../../shared/utils/query';

/**
 * Hook for fetching reports list
 */
export function useReportsQuery(filters?: Record<string, any>) {
  return useApiQuery<Paginated<Report>>({
    url: `/modules${filters ? toQueryParams({ filters } as GridRequest) : ''}`,
    queryKey: queryKeys.reports.list(filters),
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
 * Hook for fetching single report
 */
export function useReportQuery(id: string | number | undefined) {
  return useApiQuery<Report>({
    url: `/modules/${id}`,
    queryKey: queryKeys.reports.detail(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for fetching report stats
 */
export function useReportStatsQuery() {
  return useApiQuery<ReportStats>({
    url: '/reports/stats',
    queryKey: queryKeys.reports.stats(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for infinite reports list (pagination)
 */
export function useReportsInfiniteQuery(pageSize: number = 20) {
  return useApiInfiniteQuery<Report, number>({
    url: '/modules',
    queryKey: queryKeys.reports.lists(),
    pageSize,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}

/**
 * Hook for creating report
 */
export function useCreateReportMutation() {
  return useApiMutation<Report, Partial<Report>>({
    url: '/modules',
    method: 'POST',
    invalidateQueries: [
      queryKeys.reports.all,
      queryKeys.reports.stats(),
    ],
  });
}

/**
 * Hook for updating report
 */
export function useUpdateReportMutation(id?: string | number) {
  return useApiMutation<Report, { id: string; data: Partial<Report> }>({
    url: (vars) => `/modules/${vars.id}`,
    method: 'PUT',
    bodyExtractor: (vars) => vars.data,
    invalidateQueries: [
      queryKeys.reports.all,
      queryKeys.reports.stats(),
      ...(id ? [queryKeys.reports.detail(id)] : []),
    ],
    optimisticUpdate: {
      queryKeys: [
        queryKeys.reports.all,
        ...(id ? [queryKeys.reports.detail(id)] : []),
      ],
      updateFn: (oldData, vars) => {
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.map((item: Report) =>
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
 * Hook for deleting report
 */
export function useDeleteReportMutation() {
  return useApiMutation<void, string>({
    url: (id) => `/modules/${id}`,
    method: 'DELETE',
    invalidateQueries: [
      queryKeys.reports.all,
      queryKeys.reports.stats(),
    ],
    optimisticUpdate: {
      queryKeys: [queryKeys.reports.all],
      updateFn: (oldData, id) => {
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.filter((item: Report) => item.id !== id),
            total: Math.max(0, (oldData.total || 0) - 1),
          };
        }
        return oldData;
      },
      rollbackFn: (oldData) => oldData,
    },
  });
}

