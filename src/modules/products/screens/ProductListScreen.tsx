import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useProductStatsQuery, useProductsQuery } from '../hooks/useProductsQuery';
import { ListScreenContainer } from '../../../shared/components/screens/ListScreenContainer';
import { productEntityService } from '../services/productServiceAdapter';
import Card from '../../../shared/components/Card';
import { useNavigation } from '@react-navigation/native';
import { Product } from '../services/productService';
import { ModuleStatsHeader, ModuleStat } from '../../../shared/components/dashboard/ModuleStatsHeader';
import LoadingState from '../../../shared/components/LoadingState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import spacing from '../../../core/constants/spacing';
import StockAdjustmentModal from '../components/StockAdjustmentModal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/services/queryClient';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import httpService from '../../../shared/services/httpService';
import { formatCurrency } from '../utils/currency';

/**
 * ProductListScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes list screen UI with stats
 * Dependency Inversion: Depends on service adapter interface
 */
export default function ProductListScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['stock', 'common']);
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  
  const [adjustmentModalVisible, setAdjustmentModalVisible] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [adjustmentMode, setAdjustmentMode] = React.useState<'increase' | 'decrease'>('increase');

  // Fetch stats using React Query hook
  const { data: stats, isLoading: statsLoading } = useProductStatsQuery();

  // Fetch first page for prefetching (doesn't affect UI, just for prefetch)
  const { data: firstPageData } = useProductsQuery(undefined);

  // Prefetch first few product details when list loads
  React.useEffect(() => {
    if (firstPageData?.items && firstPageData.items.length > 0) {
      const idsToPrefetch = firstPageData.items.slice(0, 5).map(item => item.id);
      
      // Prefetch detail pages in background
      idsToPrefetch.forEach((id) => {
        queryClient.prefetchQuery({
          queryKey: queryKeys.stock.detail(id),
          queryFn: async () => {
            try {
              return await httpService.get(apiEndpoints.stock.get(id));
            } catch (error) {
              // Silently fail - prefetch errors shouldn't break the app
              throw error;
            }
          },
          staleTime: 5 * 60 * 1000, // 5 minutes
        }).catch(() => {
          // Silently handle errors - prefetch failures are non-critical
        });
      });
    }
  }, [firstPageData, queryClient]);

  // Optimistic prefetch when product is pressed
  const handleProductPress = React.useCallback((item: Product) => {
    // Start prefetch immediately (in case it wasn't prefetched before)
    queryClient.prefetchQuery({
      queryKey: queryKeys.stock.detail(item.id),
      queryFn: async () => {
        try {
          return await httpService.get(apiEndpoints.stock.get(item.id));
        } catch (error) {
          throw error;
        }
      },
      staleTime: 5 * 60 * 1000,
    }).catch(() => {
      // Silently handle - navigation will still work, just might be slower
    });

    // Navigate immediately (optimistic navigation)
    navigation.navigate('StockDetail', { id: item.id });
  }, [navigation, queryClient]);

  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        key: 'total-stock-items',
        label: t('stock:total_stock_items', { defaultValue: 'Toplam Stok Ürünü' }),
        value: stats.totalStockItems ?? 0,
        icon: 'cube-outline',
        color: colors.statPrimary,
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
      {
        key: 'low-stock',
        label: t('stock:low_stock', { defaultValue: 'Düşük Stok' }),
        value: stats.lowStock ?? 0,
        icon: 'warning-outline',
        color: colors.statError,
        route: 'StockList',
      },
    ];
  }, [stats, t, colors]);

  // Stats header component for FlatList
  const statsHeader = React.useMemo(() => {
    if (statsLoading) {
      return (
        <View style={{ padding: spacing.lg }}>
          <LoadingState />
        </View>
      );
    }
    return (
      <View style={{ marginBottom: spacing.md }}>
        <ModuleStatsHeader 
          stats={moduleStats}
          mainStatKey="total-stock-items"
          translationNamespace="stock"
        />
      </View>
    );
  }, [statsLoading, moduleStats, colors]);

  return (
    <ScreenLayout noPadding>
      <View style={{ flex: 1, backgroundColor: colors.page }}>
        <ListScreenContainer
            ListHeaderComponent={statsHeader}
            service={productEntityService}
            config={{
              entityName: 'product',
              translationNamespace: 'stock',
              defaultPageSize: 20,
              routeNames: {
                detail: 'StockDetail',
                edit: 'StockEdit',
                create: 'StockCreate',
              },
              filterOptions: [
                {
                  key: 'category',
                  label: 'stock:category',
                  type: 'text',
                },
                {
                  key: 'priceMin',
                  label: 'stock:price_min',
                  type: 'number',
                },
                {
                  key: 'priceMax',
                  label: 'stock:price_max',
                  type: 'number',
                },
                {
                  key: 'stockMin',
                  label: 'stock:stock_min',
                  type: 'number',
                },
                {
                  key: 'isActive',
                  label: 'stock:active_status',
                  type: 'select',
                  options: [
                    { label: t('common:all', { defaultValue: 'Tümü' }), value: '' },
                    { label: t('common:active', { defaultValue: 'Aktif' }), value: 'true' },
                    { label: t('common:inactive', { defaultValue: 'Pasif' }), value: 'false' },
                  ],
                },
              ],
            }}
            renderItem={(item: Product) => (
              <Card
                style={{ marginBottom: 12 }}
                onPress={() => handleProductPress(item)}
              >
                <View style={{ gap: spacing.sm }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '500', flex: 1, color: colors.text }}>{item.name}</Text>
                    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(item);
                          setAdjustmentMode('increase');
                          setAdjustmentModalVisible(true);
                        }}
                        style={{
                          backgroundColor: colors.success,
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          justifyContent: 'center',
                          alignItems: 'center',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 3,
                          elevation: 3,
                        }}
                      >
                        <Ionicons name="add" size={22} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(item);
                          setAdjustmentMode('decrease');
                          setAdjustmentModalVisible(true);
                        }}
                        style={{
                          backgroundColor: colors.warning,
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          justifyContent: 'center',
                          alignItems: 'center',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 3,
                          elevation: 3,
                        }}
                      >
                        <Ionicons name="remove" size={22} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={{ fontSize: 14, color: colors.muted }}>
                    {item.category || t('stock:uncategorized', { defaultValue: 'Kategori yok' })}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs, flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 14, color: colors.text }}>
                      {t('stock:price', { defaultValue: 'Fiyat' })}: {item.price !== undefined ? formatCurrency(item.price, item.currency || 'TRY') : '—'}
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.text }}>
                      {t('stock:stock_quantity', { defaultValue: 'Stok Miktarı' })}: {item.stock ?? '—'}
                    </Text>
                    {item.moq && (
                      <Text style={{ fontSize: 14, color: colors.primary }}>
                        {t('stock:moq', { defaultValue: 'MOQ' })}: {item.moq}
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            )}
            keyExtractor={(item: Product) => String(item.id)}
          />
      </View>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        visible={adjustmentModalVisible}
        product={selectedProduct}
        mode={adjustmentMode}
        onClose={() => {
          setAdjustmentModalVisible(false);
          setSelectedProduct(null);
        }}
        onSuccess={() => {
          // List will automatically refresh due to query invalidation
        }}
      />
    </ScreenLayout>
  );
}


