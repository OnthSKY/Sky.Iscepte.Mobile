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
import { useAppStore } from '../../../store/useAppStore';
import { usePermissions } from '../../../core/hooks/usePermissions';
import { useNavigation } from '@react-navigation/native';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

/**
 * StockDashboardScreen - Dashboard for Stock module
 */
export default function ProductsDashboardScreen() {
  const { t } = useTranslation(['stock', 'common', 'settings']);
  const { colors } = useTheme();
  const role = useAppStore((s) => s.role);
  const permissions = usePermissions(role);
  const navigation = useNavigation<any>();
  
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
        color: colors.statPrimary,
        route: 'StockList',
      },
      {
        key: 'low-stock',
        label: t('stock:low_stock', { defaultValue: 'Düşük Stok' }),
        value: stats.lowStock ?? 0,
        icon: 'warning-outline',
        color: colors.statError,
        route: 'StockList',
      },
      {
        key: 'total-categories',
        label: t('stock:total_categories', { defaultValue: 'Toplam Kategori' }),
        value: stats.totalCategories ?? 0,
        icon: 'apps-outline',
        color: colors.statSuccess,
        route: 'StockList',
      },
    ];
  }, [stats, t, colors]);

  // Define related modules
  const relatedModules: RelatedModule[] = React.useMemo(() => {
    return [
      {
        key: 'sales',
        label: t('sales:sales', { defaultValue: 'Satışlar' }),
        icon: 'receipt-outline',
        color: colors.statPrimary,
        route: 'SalesDashboard',
      },
      {
        key: 'customers',
        label: t('customers:customers', { defaultValue: 'Müşteriler' }),
        icon: 'people-outline',
        color: colors.statSuccess,
        route: 'CustomersDashboard',
      },
    ];
  }, [t, colors]);

  // Define quick actions - Stock management focused
  // Logical order: Create → Quick Operations → Management → View
  const quickActions: ModuleQuickAction[] = React.useMemo(() => {
    const actions: ModuleQuickAction[] = [
      // 1. Primary Actions - Create new items
      {
        key: 'add-product',
        label: t('stock:new_stock', { defaultValue: 'Ürün Ekle' }),
        icon: 'add-circle-outline',
        color: colors.statSuccess,
        route: 'StockCreate',
      },
      {
        key: 'category-management',
        label: t('stock:category_management', { defaultValue: 'Kategori Yönetimi' }),
        icon: 'apps-outline',
        color: colors.statPrimary,
        route: 'CategoryManagement',
      },
      // 2. Quick Operations - Fast sales/purchases
      {
        key: 'quick-sale',
        label: t('stock:quick_sale', { defaultValue: 'Hızlı Satış' }),
        icon: 'receipt-outline',
        color: colors.statPurple,
        route: 'QuickSale',
      },
      {
        key: 'quick-purchase',
        label: t('stock:quick_purchase', { defaultValue: 'Hızlı Alış' }),
        icon: 'cart-outline',
        color: colors.statSuccess,
        route: 'QuickPurchase',
      },
      // 3. Stock Management - Increase/Decrease
      {
        key: 'stock-in',
        label: t('stock:add_stock', { defaultValue: 'Stok Artır' }),
        icon: 'arrow-up-circle-outline',
        color: colors.statPrimary,
        route: 'StockList',
      },
      {
        key: 'stock-out',
        label: t('stock:reduce_stock', { defaultValue: 'Stok Düş' }),
        icon: 'arrow-down-circle-outline',
        color: colors.statWarning,
        route: 'StockList',
      },
      // 4. Configuration & Management - Categories and Custom Fields
      {
        key: 'manage-global-fields',
        label: t('stock:manage_global_fields', { defaultValue: 'Genel Alanları Yönet' }),
        icon: 'grid-outline',
        color: colors.statPrimary,
        route: 'GlobalFieldsManagement',
      },
      {
        key: 'stock-alert-settings',
        label: t('settings:stock_alerts', { defaultValue: 'Stok Uyarı Ayarları' }),
        icon: 'notifications-outline',
        color: colors.statWarning,
        route: 'LowStockAlertSettings',
        action: () => navigation.navigate('LowStockAlertSettings', { fromModule: 'Stock' }),
      },
      // 5. View - List all items
      {
        key: 'view-stock-list',
        label: t('stock:view_stock_list', { defaultValue: 'Stok Listesi' }),
        icon: 'list-outline',
        color: colors.statMuted,
        route: 'StockList',
      },
    ];

    // Filter out "Manage Global Fields" if user doesn't have permission
    return actions.filter((action) => {
      if (action.key === 'manage-global-fields') {
        return permissions.can('stock:manage_global_fields');
      }
      return true;
    });
  }, [t, colors, permissions]);

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
        compactStats: true, // Show all stats in single row
        listConfig: {
          service: productEntityService,
          config: {
            entityName: 'stock_item',
            translationNamespace: 'stock',
            defaultPageSize: 10,
            routeNames: {
              detail: 'StockDetail',
              edit: 'StockEdit',
              create: 'StockCreate',
            },
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
                    <Ionicons name="apps-outline" size={16} color={colors.statMuted} />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, color: colors.muted }}>
                      {item.category}
                    </Text>
                  </View>
                )}
                
                {item.price !== undefined && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="cash-outline" size={16} color={colors.primary} />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, fontWeight: '600', color: colors.primary }}>
                      {formatCurrency(item.price, item.currency || 'TRY')}
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

