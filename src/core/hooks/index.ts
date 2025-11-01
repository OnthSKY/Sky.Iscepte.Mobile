/**
 * Core Hooks Index
 * 
 * Centralized exports for all core hooks
 */

export { useApiQuery, type ApiQueryOptions, type ApiQueryResult } from './useApiQuery';
export { useApiMutation, type ApiMutationOptions, type ApiMutationResult } from './useApiMutation';
export { useApiInfiniteQuery, type ApiInfiniteQueryOptions, type ApiInfiniteQueryResult, type PaginatedResponse } from './useApiInfiniteQuery';
export { useAsyncData, type UseAsyncDataOptions, type UseAsyncDataResult } from './useAsyncData';
export { useDashboardData, type DashboardService, type DashboardData, type DashboardStat, type QuickAction } from './useDashboardData';
export { useDetailScreen, type DetailScreenConfig } from './useDetailScreen';
export { useFormScreen, type FormScreenConfig } from './useFormScreen';
export { useListScreen, type ListScreenConfig } from './useListScreen';
export { useDashboardPrefetch } from './useDashboardPrefetch';
export { useNavigationPrefetch } from './useNavigationPrefetch';
export { useDetailPrefetch } from './useDetailPrefetch';

