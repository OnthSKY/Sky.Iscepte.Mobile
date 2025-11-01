import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useCustomerStatsQuery } from '../hooks/useCustomersQuery';
import { ModuleDashboardScreen, ModuleStat, ModuleQuickAction } from '../../../shared/components/ModuleDashboardScreen';
import { errorMessages, createError } from '../../../core/utils/errorUtils';
import LoadingState from '../../../shared/components/LoadingState';
import ErrorState from '../../../shared/components/ErrorState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';

/**
 * CustomersDashboardScreen - Dashboard for Customers module
 */
export default function CustomersDashboardScreen() {
  const { t } = useTranslation(['customers', 'common']);
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';
  
  // Use React Query hook for stats
  const { data: stats, isLoading, error } = useCustomerStatsQuery();

  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        key: 'total-customers',
        label: t('customers:total_customers', { defaultValue: 'Toplam Müşteri' }),
        value: stats.totalCustomers ?? 0,
        icon: 'people-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
        route: 'Customers',
      },
      {
        key: 'active-customers',
        label: t('customers:active_customers', { defaultValue: 'Aktif Müşteri' }),
        value: stats.activeCustomers ?? 0,
        icon: 'checkmark-circle-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'Customers',
      },
      {
        key: 'total-orders',
        label: t('customers:total_orders', { defaultValue: 'Toplam Sipariş' }),
        value: stats.totalOrders ?? 0,
        icon: 'receipt-outline',
        color: isDark ? '#F59E0B' : '#D97706',
        route: 'Sales',
      },
    ];
  }, [stats, t, isDark]);

  // Fetch stats function (for ModuleDashboardScreen compatibility)
  const fetchStats = React.useCallback(async (): Promise<ModuleStat[]> => {
    if (error) {
      const errorMessage = errorMessages.failedToLoad('customers');
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
          error={error || new Error(errorMessages.failedToLoad('customers'))}
          showRetry={false}
        />
      </ScreenLayout>
    );
  }

  // Define quick actions
  const quickActions: ModuleQuickAction[] = [
    {
      key: 'view-customers',
      label: t('customers:customers', { defaultValue: 'Müşteriler' }),
      icon: 'list-outline',
      color: isDark ? '#60A5FA' : '#1D4ED8',
      route: 'Customers',
    },
    {
      key: 'add-customer',
      label: t('customers:new_customer', { defaultValue: 'Yeni Müşteri' }),
      icon: 'add-circle-outline',
      color: isDark ? '#34D399' : '#059669',
      route: 'CustomerCreate',
    },
  ];

  return (
    <ModuleDashboardScreen
      config={{
        module: 'customers',
        stats: fetchStats,
        quickActions: quickActions,
        mainStatKey: 'total-customers',
      }}
    />
  );
}

