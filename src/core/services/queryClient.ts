/**
 * QueryClient Configuration
 * 
 * Single Responsibility: Configures TanStack Query client with caching, retry, and persistence
 * Dependency Inversion: Uses AsyncStorage interface, not concrete implementation
 */

import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shouldPersistQuery, shouldNotPersistQuery } from './cacheConfig';
import { createRetryFunction, createRetryDelayFunction, RetryConfigs, RetryStrategies } from '../utils/retryUtils';

/**
 * AsyncStorage persister for query cache
 * Only persists critical queries (auth, user, permissions, stats)
 */
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'REACT_QUERY_OFFLINE_CACHE',
  throttleTime: 1000, // Throttle writes to AsyncStorage (1 second)
  serialize: (data) => {
    // Filter only critical queries before serializing
    const filtered = {
      ...data,
      clientState: {
        ...data.clientState,
        queries: data.clientState?.queries?.filter((query: any) => {
          const queryKey = query.queryKey;
          // Only persist critical queries, exclude non-critical ones
          return shouldPersistQuery(queryKey) && !shouldNotPersistQuery(queryKey);
        }) || [],
      },
    };
    return JSON.stringify(filtered);
  },
  deserialize: (cached: string) => {
    try {
      return JSON.parse(cached);
    } catch {
      return { clientState: { queries: [] } };
    }
  },
});

/**
 * QueryClient with optimized defaults for mobile
 * 
 * Default Options:
 * - staleTime: 5 minutes - Data is fresh for 5 minutes
 * - cacheTime: 10 minutes - Unused data stays in cache for 10 minutes
 * - retry: 3 - Retry failed requests 3 times
 * - retryDelay: Exponential backoff (1s, 2s, 4s, max 30s)
 * - refetchOnWindowFocus: true - Refetch when app comes to foreground
 * - refetchOnReconnect: true - Refetch when network reconnects
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - Data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - Unused data stays in cache (formerly cacheTime)
      retry: createRetryFunction(RetryConfigs.query), // Smart retry with exponential backoff
      retryDelay: createRetryDelayFunction(RetryConfigs.query), // Exponential backoff with jitter
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: createRetryFunction(RetryStrategies.mutation()), // Minimal retries for mutations
      retryDelay: createRetryDelayFunction(RetryConfigs.mutation), // Quick retry for mutations
    },
  },
});

/**
 * PersistedQueryClientProvider wrapper component
 * Provides query client with persistence to AsyncStorage
 */
export { PersistQueryClientProvider, asyncStoragePersister };

/**
 * Query keys factory for type-safe query keys
 */
export const queryKeys = {
  // Auth (CRITICAL - persisted)
  auth: {
    all: ['auth'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
    permissions: () => [...queryKeys.auth.all, 'permissions'] as const,
  },
  
  // User (CRITICAL - persisted)
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    settings: () => [...queryKeys.user.all, 'settings'] as const,
  },
  
  // Permissions (CRITICAL - persisted)
  permissions: {
    all: ['permissions'] as const,
    list: () => [...queryKeys.permissions.all, 'list'] as const,
  },
  
  // Settings (CRITICAL - persisted)
  settings: {
    all: ['settings'] as const,
    app: () => [...queryKeys.settings.all, 'app'] as const,
    theme: () => [...queryKeys.settings.all, 'theme'] as const,
    language: () => [...queryKeys.settings.all, 'language'] as const,
  },
  
  // Stock (NON-CRITICAL - memory only, except stats)
  stock: {
    all: ['stock'] as const,
    lists: () => [...queryKeys.stock.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.stock.lists(), { filters }] as const,
    details: () => [...queryKeys.stock.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.stock.details(), id] as const,
    stats: () => [...queryKeys.stock.all, 'stats'] as const, // Stats are persisted (useful for offline)
    histories: () => [...queryKeys.stock.all, 'history'] as const,
    history: (id: string | number) => [...queryKeys.stock.histories(), id] as const,
  },
  
  // Sales (NON-CRITICAL - memory only, except stats)
  sales: {
    all: ['sales'] as const,
    lists: () => [...queryKeys.sales.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.sales.lists(), { filters }] as const,
    details: () => [...queryKeys.sales.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.sales.details(), id] as const,
    stats: () => [...queryKeys.sales.all, 'stats'] as const, // Stats are persisted
  },
  
  // Purchases (NON-CRITICAL - memory only, except stats)
  purchases: {
    all: ['purchases'] as const,
    lists: () => [...queryKeys.purchases.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.purchases.lists(), { filters }] as const,
    details: () => [...queryKeys.purchases.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.purchases.details(), id] as const,
    stats: () => [...queryKeys.purchases.all, 'stats'] as const, // Stats are persisted
  },
  
  // Customers (NON-CRITICAL - memory only, except stats)
  customers: {
    all: ['customers'] as const,
    lists: () => [...queryKeys.customers.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.customers.lists(), { filters }] as const,
    details: () => [...queryKeys.customers.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.customers.details(), id] as const,
    stats: () => [...queryKeys.customers.all, 'stats'] as const, // Stats are persisted
  },
  
  // Expenses (NON-CRITICAL - memory only, except stats)
  expenses: {
    all: ['expenses'] as const,
    lists: () => [...queryKeys.expenses.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.expenses.lists(), { filters }] as const,
    details: () => [...queryKeys.expenses.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.expenses.details(), id] as const,
    stats: () => [...queryKeys.expenses.all, 'stats'] as const, // Stats are persisted
  },
  
  // Revenue (NON-CRITICAL - memory only, except stats)
  revenue: {
    all: ['revenue'] as const,
    lists: () => [...queryKeys.revenue.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.revenue.lists(), { filters }] as const,
    details: () => [...queryKeys.revenue.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.revenue.details(), id] as const,
    stats: () => [...queryKeys.revenue.all, 'stats'] as const, // Stats are persisted
  },
  
  // Employees (NON-CRITICAL - memory only, except stats)
  employees: {
    all: ['employees'] as const,
    lists: () => [...queryKeys.employees.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.employees.lists(), { filters }] as const,
    details: () => [...queryKeys.employees.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.employees.details(), id] as const,
    stats: () => [...queryKeys.employees.all, 'stats'] as const, // Stats are persisted
  },
  
  // Reports (NON-CRITICAL - memory only, except stats)
  reports: {
    all: ['reports'] as const,
    lists: () => [...queryKeys.reports.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.reports.lists(), { filters }] as const,
    details: () => [...queryKeys.reports.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.reports.details(), id] as const,
    stats: () => [...queryKeys.reports.all, 'stats'] as const, // Stats are persisted
  },
  
  // Suppliers (NON-CRITICAL - memory only, except stats)
  suppliers: {
    all: ['suppliers'] as const,
    lists: () => [...queryKeys.suppliers.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.suppliers.lists(), { filters }] as const,
    details: () => [...queryKeys.suppliers.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.suppliers.details(), id] as const,
    stats: () => [...queryKeys.suppliers.all, 'stats'] as const, // Stats are persisted
  },
  
  // Modules helper (for form templates and other module-specific queries)
  modules: (module: string) => [module] as const,
};

