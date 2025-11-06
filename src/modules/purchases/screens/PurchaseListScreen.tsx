import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { usePurchaseStatsQuery } from '../hooks/usePurchasesQuery';
import { ListScreenContainer } from '../../../shared/components/screens/ListScreenContainer';
import { purchaseEntityService } from '../services/purchaseServiceAdapter';
import Card from '../../../shared/components/Card';
import { useNavigation } from '@react-navigation/native';
import { Purchase } from '../store/purchaseStore';
import { ModuleStatsHeader, ModuleStat } from '../../../shared/components/dashboard/ModuleStatsHeader';
import LoadingState from '../../../shared/components/LoadingState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import spacing from '../../../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * PurchaseListScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes list screen UI with stats
 * Dependency Inversion: Depends on service adapter interface
 */
export default function PurchaseListScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['purchases', 'common']);
  const { activeTheme, colors } = useTheme();
  const isDark = activeTheme === 'dark';

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = usePurchaseStatsQuery();

  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        key: 'total-cost',
        label: t('purchases:total_cost', { defaultValue: 'Toplam Gider' }),
        value: typeof stats.totalCost === 'number' 
          ? `₺${stats.totalCost.toLocaleString()}` 
          : stats.totalCost ?? '₺0',
        icon: 'cash-outline',
        color: isDark ? '#EF4444' : '#DC2626',
        route: 'PurchaseList',
      },
      {
        key: 'total-purchases',
        label: t('purchases:total_purchases', { defaultValue: 'Toplam Alış' }),
        value: stats.totalPurchases ?? 0,
        icon: 'cart-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
        route: 'PurchaseList',
      },
      {
        key: 'monthly-purchases',
        label: t('purchases:monthly_purchases', { defaultValue: 'Aylık Alış' }),
        value: stats.monthlyPurchases ?? 0,
        icon: 'calendar-outline',
        color: isDark ? '#F59E0B' : '#D97706',
        route: 'PurchaseList',
      },
      {
        key: 'average-purchase',
        label: t('purchases:average_purchase_value', { defaultValue: 'Ortalama Alış' }),
        value: typeof stats.averagePurchaseValue === 'number' 
          ? `₺${stats.averagePurchaseValue.toLocaleString()}` 
          : stats.averagePurchaseValue ?? '₺0',
        icon: 'stats-chart-outline',
        color: isDark ? '#A78BFA' : '#7C3AED',
        route: 'PurchaseList',
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
        mainStatKey="total-cost"
        translationNamespace="purchases"
      />
    );
  }, [statsLoading, moduleStats]);

  // Info card about quick purchase vs normal purchase
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
            {t('purchases:purchase_operations_info', { defaultValue: 'Alış İşlemleri Hakkında' })}
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: colors.infoCardText || colors.muted, lineHeight: 18 }}>
          {t('purchases:purchase_operations_description', { 
            defaultValue: '• Hızlı Alış: Ürün seçip hızlıca alış yapabilirsiniz\n• Normal Alış: Detaylı alış formu ile işlem yapabilirsiniz\n• Her iki yöntem de stok otomatik güncellenir' 
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
          {t('purchases:quick_actions', { defaultValue: 'Hızlı İşlemler' })}
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('QuickPurchase')}
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
              {t('purchases:quick_purchase', { defaultValue: 'Hızlı Alış' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('PurchaseCreate')}
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
              {t('purchases:new_purchase', { defaultValue: 'Yeni Alış' })}
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
      title={t('purchases:purchases', { defaultValue: 'Alışlar' })}
      titleIcon="cart-outline"
    >
      <View style={{ flex: 1, backgroundColor: colors.page, paddingHorizontal: spacing.lg }}>
        <ListScreenContainer
          service={purchaseEntityService}
          config={{
            entityName: 'purchases',
            translationNamespace: 'purchases',
            defaultPageSize: 10,
            filterOptions: [
              {
                key: 'status',
                label: 'purchases:status',
                type: 'text',
              },
              {
                key: 'currency',
                label: 'purchases:currency',
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
                label: 'purchases:amount_min',
                type: 'number',
              },
              {
                key: 'amountMax',
                label: 'purchases:amount_max',
                type: 'number',
              },
              {
                key: 'date',
                label: 'purchases:date',
                type: 'date',
              },
            ],
          }}
          title={t('purchases:purchases', { defaultValue: 'Alışlar' })}
          ListHeaderComponent={
            <View>
              {statsHeader}
              {infoCard}
              {quickActionsCard}
            </View>
          }
          renderItem={(item: Purchase) => (
            <Card
              style={{ marginBottom: 12 }}
              onPress={() => navigation.navigate('PurchaseDetail', { id: item.id, title: item.title, amount: item.amount })}
            >
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>{item.title || item.productName || t('purchases:purchase', { defaultValue: 'Alış' })}</Text>
            </Card>
          )}
          keyExtractor={(item: Purchase) => String(item.id)}
        />
      </View>
    </ScreenLayout>
  );
}

