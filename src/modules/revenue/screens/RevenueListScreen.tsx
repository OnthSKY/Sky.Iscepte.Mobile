import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useRevenueStatsQuery } from '../hooks/useRevenueQuery';
import { ListScreenContainer } from '../../../shared/components/screens/ListScreenContainer';
import { revenueEntityService } from '../services/revenueServiceAdapter';
import Card from '../../../shared/components/Card';
import { useNavigation } from '@react-navigation/native';
import { Revenue } from '../store/revenueStore';
import { ModuleStatsHeader, ModuleStat } from '../../../shared/components/dashboard/ModuleStatsHeader';
import LoadingState from '../../../shared/components/LoadingState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import spacing from '../../../core/constants/spacing';

/**
 * RevenueListScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes list screen UI with stats
 * Dependency Inversion: Depends on service adapter interface
 */
export default function RevenueListScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['revenue', 'common']);
  const { activeTheme, colors } = useTheme();
  const isDark = activeTheme === 'dark';

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useRevenueStatsQuery();

  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        key: 'total-revenue',
        label: t('revenue:total_revenue', { defaultValue: 'Toplam Gelir' }),
        value: typeof stats.totalRevenue === 'number' 
          ? `₺${stats.totalRevenue.toLocaleString()}` 
          : `₺${stats.totalRevenue ?? 0}`,
        icon: 'trending-up-outline',
        color: isDark ? '#10B981' : '#059669',
        route: 'RevenueList',
      },
      {
        key: 'monthly-revenue',
        label: t('revenue:monthly_revenue', { defaultValue: 'Aylık Gelir' }),
        value: typeof stats.monthlyRevenue === 'number' 
          ? `₺${stats.monthlyRevenue.toLocaleString()}` 
          : `₺${stats.monthlyRevenue ?? 0}`,
        icon: 'calendar-outline',
        color: isDark ? '#34D399' : '#10B981',
        route: 'RevenueList',
      },
      {
        key: 'total-transactions',
        label: t('revenue:total_transactions', { defaultValue: 'Toplam İşlem' }),
        value: stats.totalTransactions ?? 0,
        icon: 'receipt-outline',
        color: isDark ? '#A78BFA' : '#7C3AED',
        route: 'RevenueList',
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
            translationNamespace="revenue"
          />
        )}

        {/* List Section */}
        <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
          <ListScreenContainer
            service={revenueEntityService}
            config={{
              entityName: 'revenue',
              translationNamespace: 'revenue',
              defaultPageSize: 10,
            }}
            renderItem={(item: Revenue) => (
              <Card
                style={{ marginBottom: 12 }}
                onPress={() => navigation.navigate('RevenueDetail', { id: item.id, title: item.title, amount: item.amount })}
              >
                <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.title}</Text>
                <Text style={{ color: '#10B981', fontWeight: '600' }}>+{item.amount} ₺</Text>
              </Card>
            )}
            keyExtractor={(item: Revenue) => String(item.id)}
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

