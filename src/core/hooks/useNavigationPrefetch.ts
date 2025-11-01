/**
 * Navigation-Based Prefetching Hook
 * 
 * Single Responsibility: Prefetches data when navigating to routes
 * Dependency Inversion: Uses navigation and queryClient interfaces
 * 
 * Strategy: Listen to navigation events and prefetch related data
 */

import React, { useEffect, useRef } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/queryClient';
import httpService from '../../shared/services/httpService';
import type { NavigationProp } from '@react-navigation/native';

/**
 * Route to query key mapping
 * Maps route names to their corresponding query keys and fetch functions
 */
const ROUTE_PREFETCH_MAP: Record<
  string,
  {
    queryKeys: readonly (readonly unknown[])[];
    prefetchFns: Array<() => Promise<any>>;
  }
> = {
  // Products
  ProductsDashboard: {
    queryKeys: [queryKeys.products.stats()],
    prefetchFns: [() => httpService.get('/products/stats')],
  },
  ProductsList: {
    queryKeys: [queryKeys.products.list()],
    prefetchFns: [() => httpService.get('/products')],
  },
  
  // Sales
  SalesDashboard: {
    queryKeys: [queryKeys.sales.stats()],
    prefetchFns: [() => httpService.get('/sales/stats')],
  },
  SalesList: {
    queryKeys: [queryKeys.sales.list()],
    prefetchFns: [() => httpService.get('/sales')],
  },
  
  // Customers
  CustomersDashboard: {
    queryKeys: [queryKeys.customers.stats()],
    prefetchFns: [() => httpService.get('/customers/stats')],
  },
  CustomersList: {
    queryKeys: [queryKeys.customers.list()],
    prefetchFns: [() => httpService.get('/customers')],
  },
  
  // Expenses
  ExpensesDashboard: {
    queryKeys: [queryKeys.expenses.stats()],
    prefetchFns: [() => httpService.get('/expenses/stats')],
  },
  ExpensesList: {
    queryKeys: [queryKeys.expenses.list()],
    prefetchFns: [() => httpService.get('/expenses')],
  },
  
  // Employees
  EmployeesDashboard: {
    queryKeys: [queryKeys.employees.stats()],
    prefetchFns: [() => httpService.get('/employees/stats')],
  },
  EmployeesList: {
    queryKeys: [queryKeys.employees.list()],
    prefetchFns: [() => httpService.get('/employees')],
  },
  
  // Reports
  ReportsDashboard: {
    queryKeys: [queryKeys.reports.stats()],
    prefetchFns: [() => httpService.get('/reports/stats')],
  },
  ReportsList: {
    queryKeys: [queryKeys.reports.list()],
    prefetchFns: [() => httpService.get('/reports')],
  },
};

/**
 * Prefetch detail data when list is navigated
 */
const LIST_TO_DETAIL_PREFETCH: Record<string, (itemIds: string[]) => void> = {
  ProductsList: (itemIds: string[]) => {
    // Prefetch first few items when list loads
    const queryClient = require('../services/queryClient').queryClient;
    itemIds.slice(0, 3).forEach((id) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.products.detail(id),
        queryFn: () => httpService.get(`/products/${id}`),
      });
    });
  },
};

/**
 * useNavigationPrefetch hook
 * Prefetches data based on navigation events
 * 
 * @param options - Prefetch options
 * @param options.enableDetailPrefetch - Whether to prefetch detail pages when list loads
 * 
 * @example
 * ```tsx
 * function MyScreen() {
 *   useNavigationPrefetch({ enableDetailPrefetch: true });
 *   // ... rest of component
 * }
 * ```
 */
export function useNavigationPrefetch(options: { enableDetailPrefetch?: boolean } = {}) {
  const navigation = useNavigation<NavigationProp<any>>();
  const queryClient = useQueryClient();
  const { enableDetailPrefetch = true } = options;
  
  const navigationStateRef = useRef<string | null>(null);

  // Listen to navigation state changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e) => {
      const currentRoute = e.data?.state?.routes?.[e.data.state.index];
      if (currentRoute?.name && currentRoute.name !== navigationStateRef.current) {
        navigationStateRef.current = currentRoute.name;
        
        // Get prefetch config for current route
        const prefetchConfig = ROUTE_PREFETCH_MAP[currentRoute.name];
        
        if (prefetchConfig) {
          // Prefetch all queries for this route
          Promise.allSettled(
            prefetchConfig.queryKeys.map((queryKey, index) => {
              return queryClient.prefetchQuery({
                queryKey,
                queryFn: prefetchConfig.prefetchFns[index],
                staleTime: 2 * 60 * 1000, // 2 minutes
              });
            })
          ).catch(() => {
            // Silently handle errors - prefetch failures are non-critical
          });
        }
      }
    });

    return unsubscribe;
  }, [navigation, queryClient]);

  // Also prefetch on focus (when screen comes into focus)
  useFocusEffect(
    React.useCallback(() => {
      const state = navigation.getState();
      const currentRoute = state?.routes?.[state.index];
      
      if (currentRoute?.name) {
        const prefetchConfig = ROUTE_PREFETCH_MAP[currentRoute.name];
        
        if (prefetchConfig) {
          // Prefetch on focus
          Promise.allSettled(
            prefetchConfig.queryKeys.map((queryKey, index) => {
              return queryClient.prefetchQuery({
                queryKey,
                queryFn: prefetchConfig.prefetchFns[index],
                staleTime: 2 * 60 * 1000,
              });
            })
          ).catch(() => {
            // Silently handle errors
          });
        }
      }
    }, [navigation, queryClient])
  );
}

