import React from 'react';
import { View, Text, ScrollView } from 'react-native';
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

  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        key: 'total-amount',
        label: t('expenses:total_amount', { defaultValue: 'Toplam Tutar' }),
        value: typeof stats.totalAmount === 'number' 
          ? `₺${stats.totalAmount.toLocaleString()}` 
          : stats.totalAmount ?? '₺0',
        icon: 'wallet-outline',
        color: isDark ? '#F59E0B' : '#D97706',
        route: 'Expenses',
      },
      {
        key: 'total-expenses',
        label: t('expenses:total_expenses', { defaultValue: 'Toplam Gider' }),
        value: stats.totalExpenses ?? 0,
        icon: 'receipt-outline',
        color: isDark ? '#F87171' : '#DC2626',
        route: 'Expenses',
      },
      {
        key: 'monthly-expenses',
        label: t('expenses:monthly_expenses', { defaultValue: 'Aylık Gider' }),
        value: stats.monthlyExpenses ?? 0,
        icon: 'calendar-outline',
        color: isDark ? '#FB7185' : '#E11D48',
        route: 'Expenses',
      },
      {
        key: 'expense-types',
        label: t('expenses:expense_types', { defaultValue: 'Gider Türleri' }),
        value: stats.expenseTypes ?? 0,
        icon: 'apps-outline',
        color: isDark ? '#A78BFA' : '#7C3AED',
        route: 'ExpenseTypes',
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
            mainStatKey="total-amount"
            translationNamespace="expenses"
          />
        )}

        {/* List Section */}
        <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
          <ListScreenContainer
            service={expenseEntityService}
            config={{
              entityName: 'expense',
              translationNamespace: 'expenses',
              defaultPageSize: 10,
            }}
            renderItem={(item: Expense) => (
              <Card
                style={{ marginBottom: 12 }}
                onPress={() => navigation.navigate('ExpenseDetail', { id: item.id, title: item.title, amount: item.amount })}
              >
                <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.title}</Text>
                <Text>{item.amount} ₺</Text>
              </Card>
            )}
            keyExtractor={(item: Expense) => String(item.id)}
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}


