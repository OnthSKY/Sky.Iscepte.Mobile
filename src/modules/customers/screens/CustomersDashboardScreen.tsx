import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useCustomerStatsQuery } from '../hooks/useCustomersQuery';
import { ModuleDashboardScreen, ModuleStat, ModuleQuickAction } from '../../../shared/components/ModuleDashboardScreen';
import { RelatedModule } from '../../../shared/components/dashboard/RelatedModuleCard';
import { errorMessages, createError } from '../../../core/utils/errorUtils';
import LoadingState from '../../../shared/components/LoadingState';
import ErrorState from '../../../shared/components/ErrorState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import { customerEntityService } from '../services/customerServiceAdapter';
import { Customer } from '../store/customerStore';
import Card from '../../../shared/components/Card';
import Ionicons from 'react-native-vector-icons/Ionicons';
import spacing from '../../../core/constants/spacing';
import { formatCurrency } from '../../products/utils/currency';

/**
 * CustomersDashboardScreen - Dashboard for Customers module
 */
export default function CustomersDashboardScreen() {
  const { t } = useTranslation(['customers', 'common']);
  const { activeTheme, colors } = useTheme();
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
        route: 'CustomersList',
      },
      {
        key: 'active-customers',
        label: t('customers:active_customers', { defaultValue: 'Aktif Müşteri' }),
        value: stats.activeCustomers ?? 0,
        icon: 'checkmark-circle-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'CustomersList',
      },
      {
        key: 'total-orders',
        label: t('customers:total_orders', { defaultValue: 'Toplam Sipariş' }),
        value: stats.totalOrders ?? 0,
        icon: 'receipt-outline',
        color: isDark ? '#F59E0B' : '#D97706',
        route: 'SalesList',
      },
    ];
  }, [stats, t, isDark]);

  // Define related modules
  const relatedModules: RelatedModule[] = React.useMemo(() => {
    return [
      {
        key: 'sales',
        label: t('sales:sales', { defaultValue: 'Satışlar' }),
        icon: 'receipt-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
        route: 'SalesDashboard',
        stat: stats?.totalOrders ?? 0,
        statLabel: t('customers:total_orders', { defaultValue: 'Toplam Sipariş' }),
      },
      {
        key: 'stock',
        label: t('stock:stock', { defaultValue: 'Stok' }),
        icon: 'cube-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'StockDashboard',
      },
    ];
  }, [stats, t, isDark]);

  // Define quick actions
  const quickActions: ModuleQuickAction[] = React.useMemo(() => [
    {
      key: 'view-customers',
      label: t('customers:customers', { defaultValue: 'Müşteriler' }),
      icon: 'list-outline',
      color: isDark ? '#60A5FA' : '#1D4ED8',
      route: 'CustomersList',
    },
    {
      key: 'add-customer',
      label: t('customers:new_customer', { defaultValue: 'Yeni Müşteri' }),
      icon: 'add-circle-outline',
      color: isDark ? '#34D399' : '#059669',
      route: 'CustomerCreate',
    },
  ], [t, isDark]);

  // Fetch stats function (for ModuleDashboardScreen compatibility)
  const fetchStats = React.useCallback((): ModuleStat[] => {
    return moduleStats;
  }, [moduleStats]);

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

  return (
    <ModuleDashboardScreen<Customer>
      config={{
        module: 'customers',
        stats: fetchStats,
        quickActions: quickActions,
        mainStatKey: 'total-customers',
        relatedModules: relatedModules,
        listRoute: 'CustomersList',
        createRoute: 'CustomerCreate',
        description: 'customers:module_description',
        listConfig: {
          service: customerEntityService,
          config: {
            entityName: 'customer',
            translationNamespace: 'customers',
            defaultPageSize: 10,
          },
          renderItem: (item: Customer) => (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  {item.name || t('customers:customer', { defaultValue: 'Müşteri' })}
                </Text>
                {item.status && (
                  <View style={{ 
                    backgroundColor: item.status === 'active' ? '#10B981' : '#6B7280',
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: 8
                  }}>
                    <Text style={{ fontSize: 12, color: 'white', fontWeight: '600' }}>
                      {item.status === 'active' ? t('common:active', { defaultValue: 'Aktif' }) : t('common:inactive', { defaultValue: 'Pasif' })}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={{ gap: spacing.xs }}>
                {item.email && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="mail-outline" size={16} color={isDark ? '#94A3B8' : colors.muted} />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, color: isDark ? '#E2E8F0' : colors.muted }}>
                      {item.email}
                    </Text>
                  </View>
                )}
                
                {item.phone && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="call-outline" size={16} color={isDark ? '#94A3B8' : colors.muted} />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, color: isDark ? '#E2E8F0' : colors.muted }}>
                      {item.phone}
                    </Text>
                  </View>
                )}
                
                {item.balance !== undefined && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="cash-outline" size={16} color={item.balance >= 0 ? '#10B981' : '#EF4444'} />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, fontWeight: '600', color: item.balance >= 0 ? '#10B981' : '#EF4444' }}>
                      {item.balance >= 0 ? '+' : ''}{formatCurrency(Math.abs(item.balance || 0), item.currency || 'TRY')}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          ),
          keyExtractor: (item: Customer) => String(item.id),
        },
      }}
    />
  );
}

