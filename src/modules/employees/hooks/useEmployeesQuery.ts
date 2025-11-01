/**
 * Employees Module Query Hooks
 * 
 * Single Responsibility: Provides Employees-specific query hooks
 * Dependency Inversion: Uses useApiQuery wrapper, not direct httpService
 */

import { useApiQuery } from '../../../core/hooks/useApiQuery';
import { useApiMutation } from '../../../core/hooks/useApiMutation';
import { useApiInfiniteQuery } from '../../../core/hooks/useApiInfiniteQuery';
import { queryKeys } from '../../../core/services/queryClient';
import { Employee, EmployeeStats } from '../services/employeeService';
import { GridRequest } from '../../../shared/types/grid';
import { Paginated } from '../../../shared/types/module';
import { toQueryParams } from '../../../shared/utils/query';

/**
 * Hook for fetching employees list
 */
export function useEmployeesQuery(filters?: Record<string, any>) {
  return useApiQuery<Paginated<Employee>>({
    url: `/users${filters ? toQueryParams({ filters } as GridRequest) : ''}`,
    queryKey: queryKeys.employees.list(filters),
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
 * Hook for fetching single employee
 */
export function useEmployeeQuery(id: string | number | undefined) {
  return useApiQuery<Employee>({
    url: `/users/${id}`,
    queryKey: queryKeys.employees.detail(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for fetching employee stats
 */
export function useEmployeeStatsQuery() {
  return useApiQuery<EmployeeStats>({
    url: '/employees/stats',
    queryKey: queryKeys.employees.stats(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for infinite employees list (pagination)
 */
export function useEmployeesInfiniteQuery(pageSize: number = 20) {
  return useApiInfiniteQuery<Employee, number>({
    url: '/users',
    queryKey: queryKeys.employees.lists(),
    pageSize,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}

/**
 * Hook for creating employee
 */
export function useCreateEmployeeMutation() {
  return useApiMutation<Employee, Partial<Employee>>({
    url: '/users',
    method: 'POST',
    invalidateQueries: [
      queryKeys.employees.all,
      queryKeys.employees.stats(),
    ],
  });
}

/**
 * Hook for updating employee
 */
export function useUpdateEmployeeMutation(id?: string | number) {
  return useApiMutation<Employee, { id: string; data: Partial<Employee> }>({
    url: (vars) => `/users/${vars.id}`,
    method: 'PUT',
    bodyExtractor: (vars) => vars.data,
    invalidateQueries: [
      queryKeys.employees.all,
      queryKeys.employees.stats(),
      ...(id ? [queryKeys.employees.detail(id)] : []),
    ],
    optimisticUpdate: {
      queryKeys: [
        queryKeys.employees.all,
        ...(id ? [queryKeys.employees.detail(id)] : []),
      ],
      updateFn: (oldData, vars) => {
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.map((item: Employee) =>
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
 * Hook for deleting employee
 */
export function useDeleteEmployeeMutation() {
  return useApiMutation<void, string>({
    url: (id) => `/users/${id}`,
    method: 'DELETE',
    invalidateQueries: [
      queryKeys.employees.all,
      queryKeys.employees.stats(),
    ],
    optimisticUpdate: {
      queryKeys: [queryKeys.employees.all],
      updateFn: (oldData, id) => {
        if (oldData?.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.filter((item: Employee) => item.id !== id),
            total: Math.max(0, (oldData.total || 0) - 1),
          };
        }
        return oldData;
      },
      rollbackFn: (oldData) => oldData,
    },
  });
}

