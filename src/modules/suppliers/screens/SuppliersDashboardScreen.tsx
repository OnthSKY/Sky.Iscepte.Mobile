import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useSupplierStatsQuery } from '../hooks/useSuppliersQuery';
import { ModuleDashboardScreen, ModuleStat, ModuleQuickAction } from '../../../shared/components/ModuleDashboardScreen';
import { RelatedModule } from '../../../shared/components/dashboard/RelatedModuleCard';
import { errorMessages, createError } from '../../../core/utils/errorUtils';
import LoadingState from '../../../shared/components/LoadingState';
import ErrorState from '../../../shared/components/ErrorState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import { supplierEntityService } from '../services/supplierServiceAdapter';
import { Supplier } from '../store/supplierStore';
import Card from '../../../shared/components/Card';
import Ionicons from 'react-native-vector-icons/Ionicons';
import spacing from '../../../core/constants/spacing';
import { formatCurrency } from '../../products/utils/currency';

/**
 * SuppliersDashboardScreen - Dashboard for Suppliers module
 */
export default function SuppliersDashboardScreen() {
  const { t } = useTranslation(['suppliers', 'common']);
  const { activeTheme, colors } = useTheme();
  const isDark = activeTheme === 'dark';
  
  // Use React Query hook for stats
  const { data: stats, isLoading, error } = useSupplierStatsQuery();

  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        key: 'total-suppliers',
        label: t('suppliers:total_suppliers', { defaultValue: 'Toplam Tedarikçi' }),
        value: stats.totalSuppliers ?? 0,
        icon: 'people-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
        route: 'SuppliersList',
      },
      {
        key: 'active-suppliers',
        label: t('suppliers:active_suppliers', { defaultValue: 'Aktif Tedarikçi' }),
        value: stats.activeSuppliers ?? 0,
        icon: 'checkmark-circle-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'SuppliersList',
      },
      {
        key: 'total-orders',
        label: t('suppliers:total_orders', { defaultValue: 'Toplam Sipariş' }),
        value: stats.totalOrders ?? 0,
        icon: 'receipt-outline',
        color: isDark ? '#F59E0B' : '#D97706',
        route: 'PurchaseList',
      },
    ];
  }, [stats, t, isDark]);

  // Define related modules
  const relatedModules: RelatedModule[] = React.useMemo(() => {
    return [
      {
        key: 'purchases',
        label: t('purchases:purchases', { defaultValue: 'Alışlar' }),
        icon: 'receipt-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
        route: 'PurchasesDashboard',
        stat: stats?.totalOrders ?? 0,
        statLabel: t('suppliers:total_orders', { defaultValue: 'Toplam Sipariş' }),
      },
      {
        key: 'expenses',
        label: t('expenses:expenses', { defaultValue: 'Giderler' }),
        icon: 'cash-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'ExpensesDashboard',
      },
    ];
  }, [stats, t, isDark]);

  // Define quick actions
  const quickActions: ModuleQuickAction[] = React.useMemo(() => [
    {
      key: 'view-suppliers',
      label: t('suppliers:suppliers', { defaultValue: 'Tedarikçiler' }),
      icon: 'list-outline',
      color: isDark ? '#60A5FA' : '#1D4ED8',
      route: 'SuppliersList',
    },
    {
      key: 'add-supplier',
      label: t('suppliers:new_supplier', { defaultValue: 'Yeni Tedarikçi' }),
      icon: 'add-circle-outline',
      color: isDark ? '#34D399' : '#059669',
      route: 'SupplierCreate',
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
          error={error || new Error(errorMessages.failedToLoad('suppliers'))}
          showRetry={false}
        />
      </ScreenLayout>
    );
  }

  return (
    <ModuleDashboardScreen<Supplier>
      config={{
        module: 'suppliers',
        stats: fetchStats,
        quickActions: quickActions,
        mainStatKey: 'total-suppliers',
        relatedModules: relatedModules,
        listRoute: 'SuppliersList',
        createRoute: 'SupplierCreate',
        description: 'suppliers:module_description',
        listConfig: {
          service: supplierEntityService,
          config: {
            entityName: 'supplier',
            translationNamespace: 'suppliers',
            defaultPageSize: 10,
          },
          renderItem: (item: Supplier) => (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  {item.name || t('suppliers:supplier', { defaultValue: 'Tedarikçi' })}
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
          keyExtractor: (item: Supplier) => String(item.id),
        },
      }}
    />
  );
}

