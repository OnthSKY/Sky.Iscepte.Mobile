import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useExpenseStatsQuery } from '../hooks/useExpensesQuery';
import { ListScreenContainer } from '../../../shared/components/screens/ListScreenContainer';
import { expenseEntityService } from '../services/expenseServiceAdapter';
import Card from '../../../shared/components/Card';
import { useNavigation } from '@react-navigation/native';
import { Expense } from '../store/expenseStore';
import { ModuleStatsHeader, ModuleStat } from '../../../shared/components/dashboard/ModuleStatsHeader';
import LoadingState from '../../../shared/components/LoadingState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import spacing from '../../../core/constants/spacing';
import { formatCurrency } from '../../products/utils/currency';

/**
 * ExpenseListScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes list screen UI with stats
 * Dependency Inversion: Depends on service adapter interface
 */
export default function ExpenseListScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['expenses', 'common']);
  const { activeTheme, colors } = useTheme();
  const isDark = activeTheme === 'dark';

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useExpenseStatsQuery();

  // Transform stats to ModuleStat format (only expenses, no income)
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        key: 'total-expenses',
        label: t('expenses:total_expenses', { defaultValue: 'Toplam Gider' }),
        value: typeof stats.totalExpenses === 'number' 
          ? `₺${stats.totalExpenses.toLocaleString()}` 
          : `₺${stats.totalExpenses ?? 0}`,
        icon: 'trending-down-outline',
        color: isDark ? '#F87171' : '#DC2626',
        route: 'ExpensesList',
      },
      {
        key: 'monthly-expenses',
        label: t('expenses:monthly_expenses', { defaultValue: 'Aylık Gider' }),
        value: typeof stats.monthlyExpenses === 'number' 
          ? `₺${stats.monthlyExpenses.toLocaleString()}` 
          : `₺${stats.monthlyExpenses ?? 0}`,
        icon: 'calendar-outline',
        color: isDark ? '#FB7185' : '#E11D48',
        route: 'ExpensesList',
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
        mainStatKey="total-expenses"
        translationNamespace="expenses"
      />
    );
  }, [statsLoading, moduleStats]);

  return (
    <ScreenLayout noPadding>
      <View style={{ flex: 1, backgroundColor: colors.page, paddingHorizontal: spacing.lg }}>
        <ListScreenContainer
          service={expenseEntityService}
          config={{
            entityName: 'expense',
            translationNamespace: 'expenses',
            defaultPageSize: 10,
            filterOptions: [
              {
                key: 'source',
                label: 'expenses:source',
                type: 'select',
                options: [
                  { label: t('common:all', { defaultValue: 'Tümü' }), value: '' },
                  { label: t('expenses:product_purchase', { defaultValue: 'Ürün Alış' }), value: 'product_purchase' },
                  { label: t('expenses:employee_salary', { defaultValue: 'Maaş' }), value: 'employee_salary' },
                  { label: t('expenses:manual', { defaultValue: 'Manuel' }), value: 'manual' },
                ],
              },
              {
                key: 'expenseTypeId',
                label: 'expenses:expense_type',
                type: 'text',
              },
              {
                key: 'amountMin',
                label: 'expenses:amount_min',
                type: 'number',
              },
              {
                key: 'amountMax',
                label: 'expenses:amount_max',
                type: 'number',
              },
              {
                key: 'date',
                label: 'expenses:date',
                type: 'date',
              },
            ],
          }}
          ListHeaderComponent={statsHeader}
          renderItem={(item: Expense) => (
            <Card
              style={{ marginBottom: 12 }}
              onPress={() => navigation.navigate('ExpenseDetail', { id: item.id, title: item.title, amount: item.amount })}
            >
              <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.title}</Text>
              <Text style={{ color: '#DC2626', fontWeight: '600' }}>-{formatCurrency(item.amount || 0, item.currency || 'TRY')}</Text>
            </Card>
          )}
          keyExtractor={(item: Expense) => String(item.id)}
        />
      </View>
    </ScreenLayout>
  );
}


