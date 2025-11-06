import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useSaleStatsQuery } from '../hooks/useSalesQuery';
import { ListScreenContainer } from '../../../shared/components/screens/ListScreenContainer';
import { salesEntityService } from '../services/salesServiceAdapter';
import Card from '../../../shared/components/Card';
import { useNavigation } from '@react-navigation/native';
import { Sale } from '../store/salesStore';
import { ModuleStatsHeader, ModuleStat } from '../../../shared/components/dashboard/ModuleStatsHeader';
import LoadingState from '../../../shared/components/LoadingState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import spacing from '../../../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * SalesListScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes list screen UI with stats
 * Dependency Inversion: Depends on service adapter interface
 */
export default function SalesListScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['sales', 'common']);
  const { activeTheme, colors } = useTheme();
  const isDark = activeTheme === 'dark';

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useSaleStatsQuery();

  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
    
    return [
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
        key: 'total-sales',
        label: t('sales:total_sales', { defaultValue: 'Toplam Satış' }),
        value: stats.totalSales ?? 0,
        icon: 'receipt-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
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

  // Stats header component for ListHeaderComponent
  const statsHeader = React.useMemo(() => {
    if (statsLoading) {
      return (
        <View style={{ padding: spacing.lg }}>
          <LoadingState />
        </View>
      );
    }
    return (
      <ModuleStatsHeader 
        stats={moduleStats}
        mainStatKey="total-revenue"
        translationNamespace="sales"
      />
    );
  }, [statsLoading, moduleStats]);

  // Info card about quick sale vs normal sale
  const infoCard = React.useMemo(() => (
    <View style={{ paddingTop: spacing.md, paddingBottom: spacing.sm }}>
      <View style={{ 
        backgroundColor: colors.infoCardBackground || colors.surface, 
        borderColor: colors.infoCardBorder || colors.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: spacing.md,
        gap: spacing.sm,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Ionicons name="information-circle-outline" size={20} color={colors.infoCardIcon || colors.primary} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.infoCardText || colors.text }}>
            {t('sales:sale_operations_info', { defaultValue: 'Satış İşlemleri Hakkında' })}
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: colors.infoCardText || colors.muted, lineHeight: 18 }}>
          {t('sales:sale_operations_description', { 
            defaultValue: '• Hızlı Satış: Ürün seçip hızlıca satış yapabilirsiniz\n• Normal Satış: Detaylı satış formu ile işlem yapabilirsiniz\n• Her iki yöntem de stok otomatik güncellenir' 
          })}
        </Text>
      </View>
    </View>
  ), [colors, t]);

  // Quick actions card
  const quickActionsCard = React.useMemo(() => (
    <View style={{ paddingBottom: spacing.sm }}>
      <View style={{ 
        backgroundColor: colors.surface, 
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: spacing.md,
        gap: spacing.sm,
      }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.xs }}>
          {t('sales:quick_actions', { defaultValue: 'Hızlı İşlemler' })}
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('QuickSale')}
            style={{ 
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              borderRadius: 8,
              backgroundColor: colors.primary,
            }}
          >
            <Ionicons name="flash-outline" size={18} color="#fff" />
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff' }}>
              {t('stock:quick_sale', { defaultValue: 'Hızlı Satış' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('SalesCreate')}
            style={{ 
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              borderRadius: 8,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.text} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
              {t('sales:new_sale', { defaultValue: 'Yeni Satış' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('StockList')}
            style={{ 
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              borderRadius: 8,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Ionicons name="cube-outline" size={18} color={colors.text} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
              {t('stock:stock', { defaultValue: 'Stok' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ), [colors, t, navigation]);

  return (
    <ScreenLayout 
      noPadding
      title={t('sales:sales', { defaultValue: 'Satışlar' })}
      titleIcon="receipt-outline"
    >
      <View style={{ flex: 1, backgroundColor: colors.page, paddingHorizontal: spacing.lg }}>
        <ListScreenContainer
          service={salesEntityService}
          config={{
            entityName: 'sales',
            translationNamespace: 'sales',
            defaultPageSize: 10,
            filterOptions: [
              {
                key: 'status',
                label: 'sales:status',
                type: 'text',
              },
              {
                key: 'currency',
                label: 'sales:currency',
                type: 'select',
                options: [
                  { label: t('common:all', { defaultValue: 'Tümü' }), value: '' },
                  { label: 'TRY', value: 'TRY' },
                  { label: 'USD', value: 'USD' },
                  { label: 'EUR', value: 'EUR' },
                ],
              },
              {
                key: 'amountMin',
                label: 'sales:amount_min',
                type: 'number',
              },
              {
                key: 'amountMax',
                label: 'sales:amount_max',
                type: 'number',
              },
              {
                key: 'date',
                label: 'sales:date',
                type: 'date',
              },
            ],
          }}
          title={t('sales:sales', { defaultValue: 'Satışlar' })}
          ListHeaderComponent={
            <View>
              {statsHeader}
              {infoCard}
              {quickActionsCard}
            </View>
          }
          renderItem={(item: Sale) => (
            <Card
              style={{ marginBottom: 12 }}
              onPress={() => navigation.navigate('SalesDetail', { id: item.id, title: item.title, amount: item.amount })}
            >
              <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.title || t('sales:sale', { defaultValue: 'Satış' })}</Text>
            </Card>
          )}
          keyExtractor={(item: Sale) => String(item.id)}
        />
      </View>
    </ScreenLayout>
  );
}


