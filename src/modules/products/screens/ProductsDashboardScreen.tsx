import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useProductStatsQuery } from '../hooks/useProductsQuery';
import { ModuleDashboardScreen, ModuleStat, ModuleQuickAction } from '../../../shared/components/ModuleDashboardScreen';
import { errorMessages, createError } from '../../../core/utils/errorUtils';
import LoadingState from '../../../shared/components/LoadingState';
import ErrorState from '../../../shared/components/ErrorState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';

/**
 * ProductsDashboardScreen - Dashboard for Products module
 */
export default function ProductsDashboardScreen() {
  const { t } = useTranslation(['products', 'common']);
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';
  
  // Use React Query hook for stats
  const { data: stats, isLoading, error } = useProductStatsQuery();

  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
      
    return [
      {
        key: 'total-products',
        label: t('products:total_products', { defaultValue: 'Toplam Ürün' }),
        value: stats.totalProducts ?? 0,
        icon: 'cube-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
        route: 'Products',
      },
      {
        key: 'total-categories',
        label: t('products:total_categories', { defaultValue: 'Toplam Kategori' }),
        value: stats.totalCategories ?? 0,
        icon: 'apps-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'Products',
      },
      {
        key: 'active-products',
        label: t('products:active_products', { defaultValue: 'Aktif Ürün' }),
        value: stats.totalActive ?? 0,
        icon: 'checkmark-circle-outline',
        color: isDark ? '#F59E0B' : '#D97706',
        route: 'Products',
      },
    ];
  }, [stats, t, isDark]);

  // Fetch stats function (for ModuleDashboardScreen compatibility)
  const fetchStats = React.useCallback(async (): Promise<ModuleStat[]> => {
    if (error) {
      const errorMessage = errorMessages.failedToLoad('products');
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
          error={error || new Error(errorMessages.failedToLoad('products'))}
          showRetry={false}
        />
      </ScreenLayout>
    );
  }

  // Define quick actions
  const quickActions: ModuleQuickAction[] = [
    {
      key: 'view-products',
      label: t('products:products', { defaultValue: 'Ürünler' }),
      icon: 'list-outline',
      color: isDark ? '#60A5FA' : '#1D4ED8',
      route: 'Products',
    },
    {
      key: 'add-product',
      label: t('products:new_product', { defaultValue: 'Yeni Ürün' }),
      icon: 'add-circle-outline',
      color: isDark ? '#34D399' : '#059669',
      route: 'ProductCreate',
    },
  ];

  return (
    <ModuleDashboardScreen
      config={{
        module: 'products',
        stats: fetchStats,
        quickActions: quickActions,
        mainStatKey: 'total-products',
      }}
    />
  );
}

