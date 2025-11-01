import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { usePurchaseStatsQuery } from '../hooks/usePurchasesQuery';
import { ModuleDashboardScreen, ModuleStat, ModuleQuickAction } from '../../../shared/components/ModuleDashboardScreen';
import { RelatedModule } from '../../../shared/components/dashboard/RelatedModuleCard';
import LoadingState from '../../../shared/components/LoadingState';
import ErrorState from '../../../shared/components/ErrorState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import { purchaseEntityService } from '../services/purchaseServiceAdapter';
import { Purchase } from '../store/purchaseStore';
import Card from '../../../shared/components/Card';
import { useNavigation } from '@react-navigation/native';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import spacing from '../../../core/constants/spacing';

/**
 * PurchasesDashboardScreen - Dashboard for Purchases module
 */
export default function PurchasesDashboardScreen() {
  const { t } = useTranslation(['purchases', 'common']);
  const { activeTheme, colors } = useTheme();
  const isDark = activeTheme === 'dark';
  const navigation = useNavigation<any>();
  
  // Use React Query hook for stats
  const { data: stats, isLoading, error } = usePurchaseStatsQuery();
  
  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        key: 'total-purchases',
        label: t('purchases:total_purchases', { defaultValue: 'Toplam Alış' }),
        value: stats.totalPurchases ?? 0,
        icon: 'cart-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
        route: 'PurchaseList',
      },
      {
        key: 'total-cost',
        label: t('purchases:total_cost', { defaultValue: 'Toplam Gider' }),
        value: typeof stats.totalCost === 'number' 
          ? `₺${stats.totalCost.toLocaleString()}` 
          : stats.totalCost ?? '₺0',
        icon: 'cash-outline',
        color: isDark ? '#EF4444' : '#DC2626',
        route: 'PurchaseList',
      },
      {
        key: 'monthly-purchases',
        label: t('purchases:monthly_purchases', { defaultValue: 'Aylık Alış' }),
        value: stats.monthlyPurchases ?? 0,
        icon: 'calendar-outline',
        color: isDark ? '#F59E0B' : '#D97706',
        route: 'PurchaseList',
      },
      {
        key: 'average-purchase',
        label: t('purchases:average_purchase_value', { defaultValue: 'Ortalama Alış' }),
        value: typeof stats.averagePurchaseValue === 'number' 
          ? `₺${stats.averagePurchaseValue.toLocaleString()}` 
          : stats.averagePurchaseValue ?? '₺0',
        icon: 'stats-chart-outline',
        color: isDark ? '#A78BFA' : '#7C3AED',
        route: 'PurchaseList',
      },
    ];
  }, [stats, t, isDark]);

  // Define related modules
  const relatedModules: RelatedModule[] = React.useMemo(() => {
    return [
      {
        key: 'stock',
        label: t('stock:stock', { defaultValue: 'Stok' }),
        icon: 'cube-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'StockDashboard',
      },
      {
        key: 'expenses',
        label: t('expenses:expenses', { defaultValue: 'Giderler' }),
        icon: 'receipt-outline',
        color: isDark ? '#EF4444' : '#DC2626',
        route: 'ExpensesDashboard',
      },
    ];
  }, [t, isDark]);

  // Define quick actions
  const quickActions: ModuleQuickAction[] = React.useMemo(() => [
    {
      key: 'view-purchases',
      label: t('purchases:purchases', { defaultValue: 'Alışlar' }),
      icon: 'list-outline',
      color: isDark ? '#60A5FA' : '#1D4ED8',
      route: 'PurchaseList',
    },
    {
      key: 'add-purchase',
      label: t('purchases:new_purchase', { defaultValue: 'Yeni Alış' }),
      icon: 'add-circle-outline',
      color: isDark ? '#34D399' : '#059669',
      route: 'PurchaseCreate',
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

  // Show error state only if there's an actual error
  if (error) {
    return (
      <ScreenLayout>
        <ErrorState
          error={error}
          showRetry={false}
        />
      </ScreenLayout>
    );
  }

  return (
    <ModuleDashboardScreen<Purchase>
      config={{
        module: 'purchases',
        stats: fetchStats,
        quickActions: quickActions,
        mainStatKey: 'total-cost',
        relatedModules: relatedModules,
        listRoute: 'PurchaseList',
        createRoute: 'PurchaseCreate',
        listConfig: {
          service: purchaseEntityService,
          config: {
            entityName: 'purchase',
            translationNamespace: 'purchases',
            defaultPageSize: 10,
          },
          renderItem: (item: Purchase) => (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  {item.title || item.productName || t('purchases:purchase', { defaultValue: 'Alış' })}
                </Text>
                {item.status && (
                  <View style={{ 
                    backgroundColor: item.status === 'completed' ? '#10B981' : item.status === 'pending' ? '#F59E0B' : '#6B7280',
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: 8
                  }}>
                    <Text style={{ fontSize: 12, color: 'white', fontWeight: '600' }}>
                      {item.status === 'completed' ? t('common:completed', { defaultValue: 'Tamamlandı' }) : 
                       item.status === 'pending' ? t('common:pending', { defaultValue: 'Beklemede' }) : item.status}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={{ gap: spacing.xs }}>
                {(item.amount || item.total) && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="cash-outline" size={16} color={isDark ? '#EF4444' : '#DC2626'} />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, fontWeight: '600', color: isDark ? '#EF4444' : '#DC2626' }}>
                      ₺{(item.amount || item.total || 0).toLocaleString()}
                    </Text>
                  </View>
                )}
                
                {item.date && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="calendar-outline" size={16} color={isDark ? '#94A3B8' : colors.muted} />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, color: isDark ? '#E2E8F0' : colors.muted }}>
                      {new Date(item.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </Text>
                  </View>
                )}
                
                {item.supplierName && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="business-outline" size={16} color={isDark ? '#94A3B8' : colors.muted} />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, color: isDark ? '#E2E8F0' : colors.muted }}>
                      {item.supplierName}
                    </Text>
                  </View>
                )}
                
                {item.productName && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="cube-outline" size={16} color={isDark ? '#94A3B8' : colors.muted} />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, color: isDark ? '#E2E8F0' : colors.muted }}>
                      {item.productName}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          ),
          keyExtractor: (item: Purchase) => String(item.id),
        },
      }}
    />
  );
}

