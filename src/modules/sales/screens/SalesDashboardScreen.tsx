import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useSaleStatsQuery } from '../hooks/useSalesQuery';
import { ModuleDashboardScreen, ModuleStat, ModuleQuickAction } from '../../../shared/components/ModuleDashboardScreen';
import { RelatedModule } from '../../../shared/components/dashboard/RelatedModuleCard';
import { errorMessages, createError } from '../../../core/utils/errorUtils';
import LoadingState from '../../../shared/components/LoadingState';
import ErrorState from '../../../shared/components/ErrorState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import { salesEntityService } from '../services/salesServiceAdapter';
import { Sale } from '../store/salesStore';
import Card from '../../../shared/components/Card';
import { useNavigation } from '@react-navigation/native';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import spacing from '../../../core/constants/spacing';

/**
 * SalesDashboardScreen - Dashboard for Sales module
 */
export default function SalesDashboardScreen() {
  const { t } = useTranslation(['sales', 'common']);
  const { activeTheme, colors } = useTheme();
  const isDark = activeTheme === 'dark';
  const navigation = useNavigation<any>();
  
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
        route: 'SalesList',
      },
      {
        key: 'total-revenue',
        label: t('sales:total_revenue', { defaultValue: 'Toplam Gelir' }),
        value: typeof stats.totalRevenue === 'number' 
          ? `₺${stats.totalRevenue.toLocaleString()}` 
          : stats.totalRevenue ?? '₺0',
        icon: 'cash-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'SalesList',
      },
      {
        key: 'monthly-sales',
        label: t('sales:monthly_sales', { defaultValue: 'Aylık Satış' }),
        value: stats.monthlySales ?? 0,
        icon: 'calendar-outline',
        color: isDark ? '#F59E0B' : '#D97706',
        route: 'SalesList',
      },
      {
        key: 'average-order',
        label: t('sales:average_order_value', { defaultValue: 'Ortalama Sipariş' }),
        value: typeof stats.averageOrderValue === 'number' 
          ? `₺${stats.averageOrderValue.toLocaleString()}` 
          : stats.averageOrderValue ?? '₺0',
        icon: 'stats-chart-outline',
        color: isDark ? '#A78BFA' : '#7C3AED',
        route: 'SalesList',
      },
    ];
  }, [stats, t, isDark]);

  // Define related modules
  const relatedModules: RelatedModule[] = React.useMemo(() => {
    return [
      {
        key: 'customers',
        label: t('customers:customers', { defaultValue: 'Müşteriler' }),
        icon: 'people-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
        route: 'CustomersDashboard',
        stat: stats?.totalSales ?? 0,
        statLabel: t('sales:total_sales', { defaultValue: 'Toplam Satış' }),
      },
      {
        key: 'products',
        label: t('products:products', { defaultValue: 'Ürünler' }),
        icon: 'cube-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'ProductsDashboard',
      },
    ];
  }, [stats, t, isDark]);

  // Define quick actions
  const quickActions: ModuleQuickAction[] = React.useMemo(() => [
    {
      key: 'view-sales',
      label: t('sales:sales', { defaultValue: 'Satışlar' }),
      icon: 'list-outline',
      color: isDark ? '#60A5FA' : '#1D4ED8',
      route: 'SalesList',
    },
    {
      key: 'add-sale',
      label: t('sales:new_sale', { defaultValue: 'Yeni Satış' }),
      icon: 'add-circle-outline',
      color: isDark ? '#34D399' : '#059669',
      route: 'SalesCreate',
    },
  ], [t, isDark]);

  // Fetch stats function (for ModuleDashboardScreen compatibility)
  // Return stats directly (sync) since they're already loaded
  const fetchStats = React.useCallback((): ModuleStat[] => {
    // Stats are already loaded and computed, just return them
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
    <ModuleDashboardScreen<Sale>
      config={{
        module: 'sales',
        stats: fetchStats,
        quickActions: quickActions,
        mainStatKey: 'total-revenue',
        relatedModules: relatedModules,
        listRoute: 'SalesList',
        createRoute: 'SalesCreate',
        listConfig: {
          service: salesEntityService,
          config: {
            entityName: 'sale',
            translationNamespace: 'sales',
            defaultPageSize: 10,
          },
          renderItem: (item: Sale) => (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  {item.title || t('sales:sale', { defaultValue: 'Satış' })}
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
                    <Ionicons name="cash-outline" size={16} color={colors.primary} />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, fontWeight: '600', color: colors.primary }}>
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
                
                {item.customerName && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="person-outline" size={16} color={isDark ? '#94A3B8' : colors.muted} />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, color: isDark ? '#E2E8F0' : colors.muted }}>
                      {item.customerName}
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
          keyExtractor: (item: Sale) => String(item.id),
        },
      }}
    />
  );
}

