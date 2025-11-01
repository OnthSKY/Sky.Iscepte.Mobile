import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useExpenseStatsQuery } from '../hooks/useExpensesQuery';
import { ModuleDashboardScreen, ModuleStat, ModuleQuickAction } from '../../../shared/components/ModuleDashboardScreen';
import { errorMessages, createError } from '../../../core/utils/errorUtils';
import LoadingState from '../../../shared/components/LoadingState';
import ErrorState from '../../../shared/components/ErrorState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';

/**
 * ExpensesDashboardScreen - Dashboard for Expenses module
 */
export default function ExpensesDashboardScreen() {
  const { t } = useTranslation(['expenses', 'common']);
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';
  
  // Use React Query hook for stats
  const { data: stats, isLoading, error } = useExpenseStatsQuery();

  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
      
    return [
      {
        key: 'total-expenses',
        label: t('expenses:total_expenses', { defaultValue: 'Toplam Gider' }),
        value: stats.totalExpenses ?? 0,
        icon: 'receipt-outline',
        color: isDark ? '#F87171' : '#DC2626',
        route: 'Expenses',
      },
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

  // Fetch stats function (for ModuleDashboardScreen compatibility)
  const fetchStats = React.useCallback(async (): Promise<ModuleStat[]> => {
    if (error) {
      const errorMessage = errorMessages.failedToLoad('expenses');
      throw createError(errorMessage, 'DASHBOARD_STATS_ERROR');
    }
    return moduleStats;
  }, [error, moduleStats]);

  // Show loading state
  if (isLoading) {
    return (
      <ScreenLayout>
        <LoadingState />
      </ScreenLayout>
    );
  }

  // Show error state
  if (error || !stats) {
    return (
      <ScreenLayout>
        <ErrorState
          error={error || new Error(errorMessages.failedToLoad('expenses'))}
          showRetry={false}
        />
      </ScreenLayout>
    );
  }

  // Define quick actions
  const quickActions: ModuleQuickAction[] = [
    {
      key: 'view-expenses',
      label: t('expenses:expenses', { defaultValue: 'Giderler' }),
      icon: 'list-outline',
      color: isDark ? '#F87171' : '#DC2626',
      route: 'Expenses',
    },
    {
      key: 'add-expense',
      label: t('expenses:new_expense', { defaultValue: 'Yeni Gider' }),
      icon: 'add-circle-outline',
      color: isDark ? '#F59E0B' : '#D97706',
      route: 'ExpenseCreate',
    },
    {
      key: 'expense-types',
      label: t('expenses:expense_types', { defaultValue: 'Gider Türleri' }),
      icon: 'apps-outline',
      color: isDark ? '#A78BFA' : '#7C3AED',
      route: 'ExpenseTypes',
    },
  ];

  return (
    <ModuleDashboardScreen
      config={{
        module: 'expenses',
        stats: fetchStats,
        quickActions: quickActions,
        mainStatKey: 'total-amount',
      }}
    />
  );
}

