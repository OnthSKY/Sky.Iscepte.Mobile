import React from 'react';
import { View, Text, TouchableOpacity, TextInput, useWindowDimensions, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import PaginatedList from '../../../shared/components/PaginatedList';
import { productService, Product, ProductStats } from '../services/productService';

export default function ProductListScreen() {
  const { t } = useTranslation(['products', 'common']);
  const { colors, activeTheme } = useTheme();
  const { width } = useWindowDimensions();

  const [search, setSearch] = React.useState('');
  const [stats, setStats] = React.useState<ProductStats | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const isDark = activeTheme === 'dark';
  const numColumns = width > 900 ? 3 : width > 650 ? 2 : 1;

  React.useEffect(() => {
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
  }, [refreshKey]);

  const renderHeader = () => (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 2, borderColor: colors.border, borderRadius: 16, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
        <Ionicons name="search" size={16} color={colors.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('common:search', { defaultValue: 'Ara...' })}
          placeholderTextColor={colors.muted}
          style={{ flex: 1, color: colors.text, minHeight: 40 }}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>

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

  const fetchPage = ({ page, pageSize }: { page: number; pageSize: number }) => {
    return productService.list({ page, pageSize, searchValue: search });
  };

  const keyExtractor = (item: Product) => item.id;

  const onDelete = async (item: Product) => {
    if (item.hasSales) {
      Alert.alert(
        t('products:cannot_delete_title', { defaultValue: 'Silinemez' }),
        t('products:cannot_delete_message', { defaultValue: 'Satışı olan ürünü silemezsiniz.' }) as any
      );
      return;
    }
    try {
      await productService.remove(item.id);
      setRefreshKey((x) => x + 1);
    } catch (e) {
      Alert.alert(t('common:error', { defaultValue: 'Hata' }), t('common:try_again', { defaultValue: 'Lütfen tekrar deneyin.' }) as any);
    }
  };

  const renderItem = (item: Product) => (
    <View
      style={{
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        padding: spacing.md,
        borderRadius: 14,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, paddingRight: spacing.md }}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }} numberOfLines={1}>{item.name}</Text>
          <Text style={{ color: colors.muted, marginTop: 4 }} numberOfLines={1}>
            {(item.category || t('products:uncategorized', { defaultValue: 'Kategori yok' })) as string}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
            <Text style={{ color: colors.text }}>{t('products:price', { defaultValue: 'Fiyat' })}: {item.price ?? '—'}</Text>
            <Text style={{ color: colors.text }}>{t('products:stock', { defaultValue: 'Stok' })}: {item.stock ?? '—'}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <TouchableOpacity style={{ padding: 8 }}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 8 }} onPress={() => onDelete(item)} disabled={!!item.hasSales}>
            <Ionicons name="trash-outline" size={20} color={item.hasSales ? colors.muted : '#EF4444'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenLayout title={t('products:products', { defaultValue: 'Ürünler' })}>
      <PaginatedList<Product>
        pageSize={20}
        query={{ search }}
        fetchPage={fetchPage as any}
        renderItem={renderItem as any}
        keyExtractor={keyExtractor as any}
        ListHeaderComponent={renderHeader}
      />
    </ScreenLayout>
  );
}

function SummaryCard({ color, label, value, widthPercent }: { color: string; label: string; value: string; widthPercent: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexGrow: 1, width: widthPercent, backgroundColor: colors.surface, borderRadius: 16, padding: spacing.md, borderWidth: 1, borderColor: colors.border }}>
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


