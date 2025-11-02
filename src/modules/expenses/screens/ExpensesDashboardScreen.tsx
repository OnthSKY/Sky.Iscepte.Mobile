import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useExpenseStatsQuery } from '../hooks/useExpensesQuery';
import { ModuleDashboardScreen, ModuleStat, ModuleQuickAction } from '../../../shared/components/ModuleDashboardScreen';
import { RelatedModule } from '../../../shared/components/dashboard/RelatedModuleCard';
import { errorMessages, createError } from '../../../core/utils/errorUtils';
import LoadingState from '../../../shared/components/LoadingState';
import ErrorState from '../../../shared/components/ErrorState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import { expenseEntityService } from '../services/expenseServiceAdapter';
import { Expense } from '../store/expenseStore';
import Card from '../../../shared/components/Card';
import Ionicons from 'react-native-vector-icons/Ionicons';
import spacing from '../../../core/constants/spacing';
import { formatCurrency } from '../../products/utils/currency';

/**
 * ExpensesDashboardScreen - Dashboard for Expenses module
 */
export default function ExpensesDashboardScreen() {
  const { t } = useTranslation(['expenses', 'common']);
  const { activeTheme, colors } = useTheme();
  const isDark = activeTheme === 'dark';
  
  // Use React Query hook for stats
  const { data: stats, isLoading, error } = useExpenseStatsQuery();

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
      {
        key: 'total-transactions',
        label: t('expenses:total_transactions', { defaultValue: 'Toplam İşlem' }),
        value: stats.totalTransactions ?? 0,
        icon: 'receipt-outline',
        color: isDark ? '#A78BFA' : '#7C3AED',
        route: 'ExpensesList',
      },
    ];
  }, [stats, t, isDark]);

  // Define related modules
  const relatedModules: RelatedModule[] = React.useMemo(() => {
    return [
      {
        key: 'expense-types',
        label: t('expenses:expense_types', { defaultValue: 'Gider Türleri' }),
        icon: 'apps-outline',
        color: isDark ? '#A78BFA' : '#7C3AED',
        route: 'ExpenseTypes',
        stat: stats?.expenseTypes ?? 0,
        statLabel: t('expenses:expense_types', { defaultValue: 'Gider Türleri' }),
      },
    ];
  }, [stats, t, isDark]);

  // Define quick actions
  const quickActions: ModuleQuickAction[] = React.useMemo(() => [
    {
      key: 'view-expenses',
      label: t('expenses:expenses', { defaultValue: 'Giderler' }),
      icon: 'list-outline',
      color: isDark ? '#F87171' : '#DC2626',
      route: 'ExpensesList',
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
  ], [t, isDark]);

  // Fetch stats function (for ModuleDashboardScreen compatibility)
  const fetchStats = React.useCallback((): ModuleStat[] => {
    return moduleStats;
  }, [moduleStats]);

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

  return (
    <ModuleDashboardScreen<Expense>
      config={{
        module: 'expenses',
        stats: fetchStats,
        quickActions: quickActions,
        mainStatKey: 'total-expenses',
        relatedModules: relatedModules,
        listRoute: 'ExpensesList',
        createRoute: 'ExpenseCreate',
        description: 'expenses:module_description',
        listConfig: {
          service: expenseEntityService,
          config: {
            entityName: 'expense',
            translationNamespace: 'expenses',
            defaultPageSize: 10,
          },
          renderItem: (item: Expense) => (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                    {item.title || t('expenses:expense', { defaultValue: 'Gider' })}
                  </Text>
                  {item.isSystemGenerated && (
                    <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                      {t('expenses:system_generated', { defaultValue: 'Sistemden' })}
                    </Text>
                  )}
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
                  {/* Type badge removed - always expense */}
                  {item.status && (
                    <View style={{ 
                      backgroundColor: item.status === 'paid' ? '#10B981' : item.status === 'pending' ? '#F59E0B' : '#6B7280',
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.xs,
                      borderRadius: 8
                    }}>
                      <Text style={{ fontSize: 12, color: 'white', fontWeight: '600' }}>
                        {item.status === 'paid' ? t('expenses:paid', { defaultValue: 'Ödendi' }) : 
                         item.status === 'pending' ? t('common:pending', { defaultValue: 'Beklemede' }) : item.status}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={{ gap: spacing.xs }}>
                {item.amount && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons 
                      name="arrow-down-circle-outline" 
                      size={16} 
                      color={colors.error || '#DC2626'} 
                    />
                    <Text style={{ 
                      marginLeft: spacing.xs, 
                      fontSize: 14, 
                      fontWeight: '600', 
                      color: colors.error || '#DC2626'
                    }}>
                      -{formatCurrency(item.amount, item.currency || 'TRY')}
                    </Text>
                  </View>
                )}
                
                {item.source && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons 
                      name={
                        item.source === 'product_purchase' ? 'cube-outline' :
                        item.source === 'employee_salary' ? 'person-outline' :
                        'receipt-outline'
                      } 
                      size={16} 
                      color={isDark ? '#94A3B8' : colors.muted} 
                    />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, color: isDark ? '#E2E8F0' : colors.muted }}>
                      {item.source === 'product_purchase' ? 'Ürün Alışı' :
                       item.source === 'employee_salary' ? 'Maaş' :
                       item.expenseTypeName || 'Manuel'}
                    </Text>
                  </View>
                )}
                
                {item.date && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="calendar-outline" size={16} color={isDark ? '#94A3B8' : colors.muted} />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, color: isDark ? '#E2E8F0' : colors.muted }}>
                      {new Date(item.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          ),
          keyExtractor: (item: Expense) => String(item.id),
        },
      }}
    />
  );
}

