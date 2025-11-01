import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useSaleStatsQuery } from '../hooks/useSalesQuery';
import { ModuleDashboardScreen, ModuleStat, ModuleQuickAction } from '../../../shared/components/ModuleDashboardScreen';
import { errorMessages, createError } from '../../../core/utils/errorUtils';
import LoadingState from '../../../shared/components/LoadingState';
import ErrorState from '../../../shared/components/ErrorState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';

/**
 * SalesDashboardScreen - Dashboard for Sales module
 */
export default function SalesDashboardScreen() {
  const { t } = useTranslation(['sales', 'common']);
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';
  
  // Use React Query hook for stats
  const { data: stats, isLoading, error } = useSaleStatsQuery();

  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        key: 'total-sales',
        label: t('sales:total_sales', { defaultValue: 'Toplam Satış' }),
        value: stats.totalSales ?? 0,
        icon: 'receipt-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
        route: 'Sales',
      },
      {
        key: 'total-revenue',
        label: t('sales:total_revenue', { defaultValue: 'Toplam Gelir' }),
        value: typeof stats.totalRevenue === 'number' 
          ? `₺${stats.totalRevenue.toLocaleString()}` 
          : stats.totalRevenue ?? '₺0',
        icon: 'cash-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'Sales',
      },
      {
        key: 'monthly-sales',
        label: t('sales:monthly_sales', { defaultValue: 'Aylık Satış' }),
        value: stats.monthlySales ?? 0,
        icon: 'calendar-outline',
        color: isDark ? '#F59E0B' : '#D97706',
        route: 'Sales',
      },
      {
        key: 'average-order',
        label: t('sales:average_order_value', { defaultValue: 'Ortalama Sipariş' }),
        value: typeof stats.averageOrderValue === 'number' 
          ? `₺${stats.averageOrderValue.toLocaleString()}` 
          : stats.averageOrderValue ?? '₺0',
        icon: 'stats-chart-outline',
        color: isDark ? '#A78BFA' : '#7C3AED',
        route: 'Sales',
      },
    ];
  }, [stats, t, isDark]);

  // Fetch stats function (for ModuleDashboardScreen compatibility)
  const fetchStats = React.useCallback(async (): Promise<ModuleStat[]> => {
    if (error) {
      const errorMessage = errorMessages.failedToLoad('sales');
      throw createError(errorMessage, 'DASHBOARD_STATS_ERROR');
    }
    return moduleStats;
  }, [error, moduleStats]);

  // Show loading state
  if (isLoading) {
    return (
      <ScreenLayout>
        <LoadingState />
      </ScreenLayout>
    );
  }

  // Show error state
  if (error || !stats) {
    return (
      <ScreenLayout>
        <ErrorState
          error={error || new Error(errorMessages.failedToLoad('sales'))}
          showRetry={false}
        />
      </ScreenLayout>
    );
  }

  // Define quick actions
  const quickActions: ModuleQuickAction[] = [
    {
      key: 'view-sales',
      label: t('sales:sales', { defaultValue: 'Satışlar' }),
      icon: 'list-outline',
      color: isDark ? '#60A5FA' : '#1D4ED8',
      route: 'Sales',
    },
    {
      key: 'add-sale',
      label: t('sales:new_sale', { defaultValue: 'Yeni Satış' }),
      icon: 'add-circle-outline',
      color: isDark ? '#34D399' : '#059669',
      route: 'SalesCreate',
    },
  ];

  return (
    <ModuleDashboardScreen
      config={{
        module: 'sales',
        stats: fetchStats,
        quickActions: quickActions,
        mainStatKey: 'total-revenue',
      }}
    />
  );
}

