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
 * ProductsDashboardScreen - Dashboard for Products module
 */
export default function ProductsDashboardScreen() {
  const { t } = useTranslation(['products', 'common']);
  const { activeTheme, colors } = useTheme();
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
        route: 'ProductsList',
      },
      {
        key: 'total-categories',
        label: t('products:total_categories', { defaultValue: 'Toplam Kategori' }),
        value: stats.totalCategories ?? 0,
        icon: 'apps-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'ProductsList',
      },
      {
        key: 'active-products',
        label: t('products:active_products', { defaultValue: 'Aktif Ürün' }),
        value: stats.totalActive ?? 0,
        icon: 'checkmark-circle-outline',
        color: isDark ? '#F59E0B' : '#D97706',
        route: 'ProductsList',
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

  // Define quick actions
  const quickActions: ModuleQuickAction[] = React.useMemo(() => [
    {
      key: 'view-products',
      label: t('products:products', { defaultValue: 'Ürünler' }),
      icon: 'list-outline',
      color: isDark ? '#60A5FA' : '#1D4ED8',
      route: 'ProductsList',
    },
    {
      key: 'add-product',
      label: t('products:new_product', { defaultValue: 'Yeni Ürün' }),
      icon: 'add-circle-outline',
      color: isDark ? '#34D399' : '#059669',
      route: 'ProductCreate',
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
          error={error || new Error(errorMessages.failedToLoad('products'))}
          showRetry={false}
        />
      </ScreenLayout>
    );
  }

  return (
    <ModuleDashboardScreen<Product>
      config={{
        module: 'products',
        stats: fetchStats,
        quickActions: quickActions,
        mainStatKey: 'total-products',
        relatedModules: relatedModules,
        listRoute: 'ProductsList',
        createRoute: 'ProductCreate',
        listConfig: {
          service: productEntityService,
          config: {
            entityName: 'product',
            translationNamespace: 'products',
            defaultPageSize: 10,
          },
          renderItem: (item: Product) => (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  {item.name || t('products:product', { defaultValue: 'Ürün' })}
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
                      {t('products:stock', { defaultValue: 'Stok' })}: {item.stock}
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

