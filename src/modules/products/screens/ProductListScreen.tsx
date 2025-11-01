import React, { useEffect, useState } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ListScreenContainer } from '../../../shared/components/screens/ListScreenContainer';
import { productEntityService } from '../services/productServiceAdapter';
import Card from '../../../shared/components/Card';
import { useNavigation } from '@react-navigation/native';
import { Product, productService, ProductStats } from '../services/productService';
import { useTheme } from '../../../core/contexts/ThemeContext';
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
  const { colors, activeTheme } = useTheme();
  const { width } = useWindowDimensions();
  const [stats, setStats] = useState<ProductStats | null>(null);

  const isDark = activeTheme === 'dark';
  const numColumns = width > 900 ? 3 : width > 650 ? 2 : 1;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await productService.stats();
        if (mounted) setStats(s);
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const renderStatsHeader = () => (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        <SummaryCard
          color={isDark ? '#60A5FA' : '#1D4ED8'}
          label={t('products:total_products', { defaultValue: 'Toplam ürün' })}
          value={String(stats?.totalProducts ?? '—')}
          widthPercent={numColumns === 1 ? '100%' : numColumns === 2 ? '48%' : '31%'}
        />
        <SummaryCard
          color={isDark ? '#34D399' : '#059669'}
          label={t('products:total_categories', { defaultValue: 'Toplam kategori' })}
          value={String(stats?.totalCategories ?? '—')}
          widthPercent={numColumns === 1 ? '100%' : numColumns === 2 ? '48%' : '31%'}
        />
        <SummaryCard
          color={isDark ? '#F59E0B' : '#D97706'}
          label={t('products:active_products', { defaultValue: 'Aktif ürün' })}
          value={String(stats?.totalActive ?? '—')}
          widthPercent={numColumns === 1 ? '100%' : numColumns === 2 ? '48%' : '31%'}
        />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {renderStatsHeader()}
      <View style={{ flex: 1 }}>
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
    </View>
  );
}

function SummaryCard({ color, label, value, widthPercent }: { color: string; label: string; value: string; widthPercent: string }) {
  const { colors } = useTheme();
  const widthStyle = widthPercent.includes('%') 
    ? { width: widthPercent as any } 
    : widthPercent === '100%' 
      ? { flex: 1, minWidth: '100%' as any }
      : { flex: 1 };
  return (
    <View style={[{ flexGrow: 1, backgroundColor: colors.surface, borderRadius: 16, padding: spacing.md, borderWidth: 1, borderColor: colors.border }, widthStyle]}>
      <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 6 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{value}</Text>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: `${color}20`, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="cube-outline" size={16} color={color} />
        </View>
      </View>
    </View>
  );
}


