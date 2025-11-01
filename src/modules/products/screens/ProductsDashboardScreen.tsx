import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useProductStatsQuery } from '../hooks/useProductsQuery';
import { ModuleDashboardScreen, ModuleStat, ModuleQuickAction } from '../../../shared/components/ModuleDashboardScreen';
import { RelatedModule } from '../../../shared/components/dashboard/RelatedModuleCard';
import { errorMessages, createError } from '../../../core/utils/errorUtils';
import LoadingState from '../../../shared/components/LoadingState';
import ErrorState from '../../../shared/components/ErrorState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import { productEntityService } from '../services/productServiceAdapter';
import { Product } from '../services/productService';
import Card from '../../../shared/components/Card';
import Ionicons from 'react-native-vector-icons/Ionicons';
import spacing from '../../../core/constants/spacing';

/**
 * StockDashboardScreen - Dashboard for Stock module
 */
export default function ProductsDashboardScreen() {
  const { t } = useTranslation(['stock', 'common']);
  const { activeTheme, colors } = useTheme();
  const isDark = activeTheme === 'dark';
  
  // Use React Query hook for stats
  const { data: stats, isLoading, error } = useProductStatsQuery();

  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
      
    return [
      {
        key: 'total-stock-items',
        label: t('stock:total_stock_items', { defaultValue: 'Toplam Ürün' }),
        value: stats.totalStockItems ?? 0,
        icon: 'cube-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
        route: 'StockList',
      },
      {
        key: 'low-stock',
        label: t('stock:low_stock', { defaultValue: 'Düşük Stok' }),
        value: stats.lowStock ?? 0,
        icon: 'warning-outline',
        color: isDark ? '#F87171' : '#DC2626',
        route: 'StockList',
      },
      {
        key: 'total-categories',
        label: t('stock:total_categories', { defaultValue: 'Toplam Kategori' }),
        value: stats.totalCategories ?? 0,
        icon: 'apps-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'StockList',
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
      },
      {
        key: 'customers',
        label: t('customers:customers', { defaultValue: 'Müşteriler' }),
        icon: 'people-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'CustomersDashboard',
      },
    ];
  }, [t, isDark]);

  // Define quick actions - Stock management focused
  const quickActions: ModuleQuickAction[] = React.useMemo(() => [
    {
      key: 'add-product',
      label: t('stock:new_stock', { defaultValue: 'Ürün Ekle' }),
      icon: 'add-circle-outline',
      color: isDark ? '#34D399' : '#059669',
      route: 'StockCreate',
    },
    {
      key: 'stock-in',
      label: t('stock:add_stock', { defaultValue: 'Stok Artır' }),
      icon: 'arrow-up-circle-outline',
      color: isDark ? '#60A5FA' : '#1D4ED8',
      route: 'StockList', // Will navigate to list with stock increase option
    },
    {
      key: 'stock-out',
      label: t('stock:reduce_stock', { defaultValue: 'Stok Düş' }),
      icon: 'arrow-down-circle-outline',
      color: isDark ? '#F59E0B' : '#D97706',
      route: 'StockList', // Will navigate to list with stock decrease option
    },
    {
      key: 'make-sale',
      label: t('stock:make_sale', { defaultValue: 'Satış Yap' }),
      icon: 'receipt-outline',
      color: isDark ? '#A78BFA' : '#7C3AED',
      route: 'SalesCreate',
    },
    {
      key: 'view-stock-list',
      label: t('stock:view_stock_list', { defaultValue: 'Stok Listesi' }),
      icon: 'list-outline',
      color: isDark ? '#94A3B8' : '#64748B',
      route: 'StockList',
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
          error={error || new Error(errorMessages.failedToLoad('stock'))}
          showRetry={false}
        />
      </ScreenLayout>
    );
  }

  return (
    <ModuleDashboardScreen<Product>
      config={{
        module: 'stock',
        stats: fetchStats,
        quickActions: quickActions,
        mainStatKey: 'total-stock-items',
        relatedModules: relatedModules,
        listRoute: 'StockList',
        createRoute: 'StockCreate',
        description: 'stock:module_description',
        listConfig: {
          service: productEntityService,
          config: {
            entityName: 'stock_item',
            translationNamespace: 'stock',
            defaultPageSize: 10,
          },
          renderItem: (item: Product) => (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  {item.name || t('stock:stock_item', { defaultValue: 'Stok Ürünü' })}
                </Text>
                {item.isActive !== undefined && (
                  <View style={{ 
                    backgroundColor: item.isActive ? '#10B981' : '#6B7280',
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: 8
                  }}>
                    <Text style={{ fontSize: 12, color: 'white', fontWeight: '600' }}>
                      {item.isActive ? t('common:active', { defaultValue: 'Aktif' }) : t('common:inactive', { defaultValue: 'Pasif' })}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={{ gap: spacing.xs }}>
                {item.category && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="apps-outline" size={16} color={isDark ? '#94A3B8' : colors.muted} />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, color: isDark ? '#E2E8F0' : colors.muted }}>
                      {item.category}
                    </Text>
                  </View>
                )}
                
                {item.price !== undefined && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="cash-outline" size={16} color={colors.primary} />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, fontWeight: '600', color: colors.primary }}>
                      ₺{item.price.toLocaleString()}
                    </Text>
                  </View>
                )}
                
                {item.stock !== undefined && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="cube-outline" size={16} color={item.stock > 10 ? '#10B981' : item.stock > 5 ? '#F59E0B' : '#EF4444'} />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, fontWeight: '600', color: item.stock > 10 ? '#10B981' : item.stock > 5 ? '#F59E0B' : '#EF4444' }}>
                      {t('stock:stock_quantity', { defaultValue: 'Stok Miktarı' })}: {item.stock}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          ),
          keyExtractor: (item: Product) => String(item.id),
        },
      }}
    />
  );
}

