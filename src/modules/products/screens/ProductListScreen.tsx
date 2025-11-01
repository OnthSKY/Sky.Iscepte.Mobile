import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useProductStatsQuery } from '../hooks/useProductsQuery';
import { ListScreenContainer } from '../../../shared/components/screens/ListScreenContainer';
import { productEntityService } from '../services/productServiceAdapter';
import Card from '../../../shared/components/Card';
import { useNavigation } from '@react-navigation/native';
import { Product } from '../services/productService';
import { ModuleStatsHeader, ModuleStat } from '../../../shared/components/dashboard/ModuleStatsHeader';
import LoadingState from '../../../shared/components/LoadingState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import spacing from '../../../core/constants/spacing';

/**
 * ProductListScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes list screen UI with stats
 * Dependency Inversion: Depends on service adapter interface
 */
export default function ProductListScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['stock', 'common']);
  const { activeTheme, colors } = useTheme();
  const isDark = activeTheme === 'dark';

  // Fetch stats using React Query hook
  const { data: stats, isLoading: statsLoading } = useProductStatsQuery();

  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        key: 'total-stock-items',
        label: t('stock:total_stock_items', { defaultValue: 'Toplam Stok Ürünü' }),
        value: stats.totalStockItems ?? 0,
        icon: 'cube-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
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
      {
        key: 'low-stock',
        label: t('stock:low_stock', { defaultValue: 'Düşük Stok' }),
        value: stats.lowStock ?? 0,
        icon: 'warning-outline',
        color: isDark ? '#F87171' : '#DC2626',
        route: 'StockList',
      },
    ];
  }, [stats, t, isDark]);

  return (
    <ScreenLayout noPadding>
      <ScrollView 
        style={{ flex: 1, backgroundColor: colors.page }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        {/* Stats Header */}
        {statsLoading ? (
          <View style={{ padding: spacing.lg }}>
            <LoadingState />
          </View>
        ) : (
          <ModuleStatsHeader 
            stats={moduleStats}
            mainStatKey="total-stock-items"
            translationNamespace="stock"
          />
        )}

        {/* List Section */}
        <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
          <ListScreenContainer
            service={productEntityService}
            config={{
              entityName: 'product',
              translationNamespace: 'stock',
              defaultPageSize: 20,
            }}
            renderItem={(item: Product) => (
              <Card
                style={{ marginBottom: 12 }}
                onPress={() => navigation.navigate('StockDetail', { id: item.id })}
              >
                <View style={{ gap: spacing.sm }}>
                  <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.name}</Text>
                  <Text style={{ fontSize: 14, color: colors.muted }}>
                    {item.category || t('stock:uncategorized', { defaultValue: 'Kategori yok' })}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs }}>
                    <Text style={{ fontSize: 14, color: colors.text }}>
                      {t('stock:price', { defaultValue: 'Fiyat' })}: {item.price ?? '—'}
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.text }}>
                      {t('stock:stock_quantity', { defaultValue: 'Stok Miktarı' })}: {item.stock ?? '—'}
                    </Text>
                  </View>
                </View>
              </Card>
            )}
            keyExtractor={(item: Product) => String(item.id)}
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}


