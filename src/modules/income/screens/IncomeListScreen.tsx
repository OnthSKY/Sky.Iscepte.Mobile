import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useIncomeStatsQuery } from '../hooks/useIncomeQuery';
import { ListScreenContainer } from '../../../shared/components/screens/ListScreenContainer';
import { incomeEntityService } from '../services/incomeServiceAdapter';
import Card from '../../../shared/components/Card';
import { useNavigation } from '@react-navigation/native';
import { Income } from '../store/incomeStore';
import { ModuleStatsHeader, ModuleStat } from '../../../shared/components/dashboard/ModuleStatsHeader';
import LoadingState from '../../../shared/components/LoadingState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import spacing from '../../../core/constants/spacing';
import { formatCurrency } from '../../products/utils/currency';

/**
 * IncomeListScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes list screen UI with stats
 * Dependency Inversion: Depends on service adapter interface
 */
export default function IncomeListScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['income', 'common']);
  const { activeTheme, colors } = useTheme();
  const isDark = activeTheme === 'dark';

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useIncomeStatsQuery();

  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        key: 'total-income',
        label: t('income:total_income', { defaultValue: 'Toplam Gelir' }),
        value: typeof stats.totalIncome === 'number' 
          ? `₺${stats.totalIncome.toLocaleString()}` 
          : `₺${stats.totalIncome ?? 0}`,
        icon: 'trending-up-outline',
        color: isDark ? '#10B981' : '#059669',
        route: 'IncomeList',
      },
      {
        key: 'monthly-income',
        label: t('income:monthly_income', { defaultValue: 'Aylık Gelir' }),
        value: typeof stats.monthlyIncome === 'number' 
          ? `₺${stats.monthlyIncome.toLocaleString()}` 
          : `₺${stats.monthlyIncome ?? 0}`,
        icon: 'calendar-outline',
        color: isDark ? '#34D399' : '#10B981',
        route: 'IncomeList',
      },
      {
        key: 'total-transactions',
        label: t('income:total_transactions', { defaultValue: 'Toplam İşlem' }),
        value: stats.totalTransactions ?? 0,
        icon: 'receipt-outline',
        color: isDark ? '#A78BFA' : '#7C3AED',
        route: 'IncomeList',
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
            mainStatKey="total-income"
            translationNamespace="income"
          />
        )}

        {/* List Section */}
        <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
          <ListScreenContainer
            service={incomeEntityService}
            config={{
              entityName: 'income',
              translationNamespace: 'income',
              defaultPageSize: 10,
              filterOptions: [
                {
                  key: 'source',
                  label: 'income:source',
                  type: 'select',
                  options: [
                    { label: t('common:all', { defaultValue: 'Tümü' }), value: '' },
                    { label: t('income:sales', { defaultValue: 'Satış' }), value: 'sales' },
                    { label: t('income:manual', { defaultValue: 'Manuel' }), value: 'manual' },
                  ],
                },
                {
                  key: 'amountMin',
                  label: 'income:amount_min',
                  type: 'number',
                },
                {
                  key: 'amountMax',
                  label: 'income:amount_max',
                  type: 'number',
                },
                {
                  key: 'date',
                  label: 'income:date',
                  type: 'date',
                },
              ],
            }}
            renderItem={(item: Income) => (
              <Card
                style={{ marginBottom: 12 }}
                onPress={() => navigation.navigate('IncomeDetail', { id: item.id, title: item.title, amount: item.amount })}
              >
                <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.title}</Text>
                <Text style={{ color: '#10B981', fontWeight: '600' }}>+{formatCurrency(item.amount || 0, item.currency || 'TRY')}</Text>
              </Card>
            )}
            keyExtractor={(item: Income) => String(item.id)}
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

