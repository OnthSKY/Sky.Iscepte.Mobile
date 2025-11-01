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
  const { t } = useTranslation(['products', 'common']);
  const { activeTheme, colors } = useTheme();
  const isDark = activeTheme === 'dark';

  // Fetch stats using React Query hook
  const { data: stats, isLoading: statsLoading } = useProductStatsQuery();

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
            mainStatKey="total-products"
            translationNamespace="products"
          />
        )}

        {/* List Section */}
        <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
          <ListScreenContainer
            service={productEntityService}
            config={{
              entityName: 'product',
              translationNamespace: 'products',
              defaultPageSize: 20,
            }}
            renderItem={(item: Product) => (
              <Card
                style={{ marginBottom: 12 }}
                onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
              >
                <View style={{ gap: spacing.sm }}>
                  <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.name}</Text>
                  <Text style={{ fontSize: 14, color: colors.muted }}>
                    {item.category || t('products:uncategorized', { defaultValue: 'Kategori yok' })}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs }}>
                    <Text style={{ fontSize: 14, color: colors.text }}>
                      {t('products:price', { defaultValue: 'Fiyat' })}: {item.price ?? '—'}
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.text }}>
                      {t('products:stock', { defaultValue: 'Stok' })}: {item.stock ?? '—'}
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


