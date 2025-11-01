import { DashboardStatData, QuickActionData } from '../services/dashboardService.types';
import { useAsyncData } from './useAsyncData';

/**
 * Single Responsibility: Handles dashboard data fetching and state
 * Dependency Inversion: Depends on abstractions (dashboard service)
 */

export interface DashboardStat {
  key: string;
  label: string;
  value: string;
  icon: string;
  color: string;
  route: string;
}

export interface QuickAction {
  key: string;
  label: string;
  icon: string;
  color: string;
  route: string;
}

export interface DashboardData {
  stats: DashboardStat[];
  quickActions: QuickAction[];
  mainStat: DashboardStat;
  secondaryStats: DashboardStat[];
}

export interface DashboardService {
  getStats(): Promise<DashboardStatData[]>;
  getQuickActions(): Promise<QuickActionData[]>;
}

/**
 * Custom hook for dashboard data
 * SRP: Only responsible for data fetching and state management
 * 
 * @param service - Dashboard service implementation
 * @param translate - Translation function
 * @param getColor - Function to get color by key
 */
export function useDashboardData(
  service: DashboardService,
  translate: (key: string, defaultValue?: string) => string,
  getColor: (key: 'primary' | 'success' | 'error' | 'info') => string
) {
  const { data, loading, error } = useAsyncData<DashboardData>(
    async () => {
      const [statsData, quickActionsData] = await Promise.all([
        service.getStats(),
        service.getQuickActions(),
      ]);

      // Transform service data to UI-ready format
      const stats: DashboardStat[] = statsData.map((stat) => ({
        key: stat.key,
        label: translate(stat.translationKey, stat.key),
        value: stat.value,
        icon: stat.icon,
        color: getColor(stat.colorKey),
        route: stat.route,
      }));

      const quickActions: QuickAction[] = quickActionsData.map((action) => ({
        key: action.key,
        label: translate(action.translationKey, action.key),
        icon: action.icon,
        color: getColor(action.colorKey),
        route: action.route,
      }));

      const mainStat = stats[0];
      const secondaryStats = stats.slice(1);

      return {
        stats,
        quickActions,
        mainStat,
        secondaryStats,
      };
    },
    [service, translate, getColor]
  );

  return { data, loading, error };
}

