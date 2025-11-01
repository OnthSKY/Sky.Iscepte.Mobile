import React from 'react';
import { View, Text, ScrollView } from 'react-native';
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
        route: 'Sales',
      },
      {
        key: 'total-sales',
        label: t('sales:total_sales', { defaultValue: 'Toplam Satış' }),
        value: stats.totalSales ?? 0,
        icon: 'receipt-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
        route: 'Sales',
      },
      {
        key: 'monthly-sales',
        label: t('sales:monthly_sales', { defaultValue: 'Aylık Satış' }),
        value: stats.monthlySales ?? 0,
        icon: 'calendar-outline',
        color: isDark ? '#F59E0B' : '#D97706',
        route: 'Sales',
      },
      {
        key: 'average-order',
        label: t('sales:average_order_value', { defaultValue: 'Ortalama Sipariş' }),
        value: typeof stats.averageOrderValue === 'number' 
          ? `₺${stats.averageOrderValue.toLocaleString()}` 
          : stats.averageOrderValue ?? '₺0',
        icon: 'stats-chart-outline',
        color: isDark ? '#A78BFA' : '#7C3AED',
        route: 'Sales',
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
            mainStatKey="total-revenue"
            translationNamespace="sales"
          />
        )}

        {/* List Section */}
        <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
          <ListScreenContainer
            service={salesEntityService}
            config={{
              entityName: 'sale',
              translationNamespace: 'sales',
              defaultPageSize: 10,
            }}
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
      </ScrollView>
    </ScreenLayout>
  );
}


