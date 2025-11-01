import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useIncomeStatsQuery } from '../hooks/useIncomeQuery';
import { ModuleDashboardScreen, ModuleStat, ModuleQuickAction } from '../../../shared/components/ModuleDashboardScreen';
import { RelatedModule } from '../../../shared/components/dashboard/RelatedModuleCard';
import { errorMessages, createError } from '../../../core/utils/errorUtils';
import LoadingState from '../../../shared/components/LoadingState';
import ErrorState from '../../../shared/components/ErrorState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import { incomeEntityService } from '../services/incomeServiceAdapter';
import { Income } from '../store/incomeStore';
import Card from '../../../shared/components/Card';
import Ionicons from 'react-native-vector-icons/Ionicons';
import spacing from '../../../core/constants/spacing';

/**
 * IncomeDashboardScreen - Dashboard for Income module
 */
export default function IncomeDashboardScreen() {
  const { t } = useTranslation(['income', 'common']);
  const { activeTheme, colors } = useTheme();
  const isDark = activeTheme === 'dark';
  
  // Use React Query hook for stats
  const { data: stats, isLoading, error } = useIncomeStatsQuery();

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

  // Define related modules
  const relatedModules: RelatedModule[] = React.useMemo(() => {
    return [
      {
        key: 'income-types',
        label: t('income:income_types', { defaultValue: 'Gelir Türleri' }),
        icon: 'apps-outline',
        color: isDark ? '#A78BFA' : '#7C3AED',
        route: 'ExpenseTypes', // Using expense types for now
        stat: stats?.incomeTypes ?? 0,
        statLabel: t('income:income_types', { defaultValue: 'Gelir Türleri' }),
      },
    ];
  }, [stats, t, isDark]);

  // Define quick actions
  const quickActions: ModuleQuickAction[] = React.useMemo(() => [
    {
      key: 'view-income',
      label: t('income:income', { defaultValue: 'Gelirler' }),
      icon: 'list-outline',
      color: isDark ? '#10B981' : '#059669',
      route: 'IncomeList',
    },
    {
      key: 'add-income',
      label: t('income:new_income', { defaultValue: 'Yeni Gelir' }),
      icon: 'add-circle-outline',
      color: isDark ? '#34D399' : '#10B981',
      route: 'IncomeCreate',
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
          error={error || new Error(errorMessages.failedToLoad('income'))}
          showRetry={false}
        />
      </ScreenLayout>
    );
  }

  return (
    <ModuleDashboardScreen<Income>
      config={{
        module: 'income',
        stats: fetchStats,
        quickActions: quickActions,
        mainStatKey: 'total-income',
        relatedModules: relatedModules,
        listRoute: 'IncomeList',
        createRoute: 'IncomeCreate',
        description: 'income:module_description',
        listConfig: {
          service: incomeEntityService,
          config: {
            entityName: 'income',
            translationNamespace: 'income',
            defaultPageSize: 10,
          },
          renderItem: (item: Income) => (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                    {item.title || t('income:income', { defaultValue: 'Gelir' })}
                  </Text>
                  {item.isSystemGenerated && (
                    <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                      {t('income:system_generated', { defaultValue: 'Sistemden' })}
                    </Text>
                  )}
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.xs, alignItems: 'center' }}>
                  {item.status && (
                    <View style={{ 
                      backgroundColor: item.status === 'paid' ? '#10B981' : item.status === 'pending' ? '#F59E0B' : '#6B7280',
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.xs,
                      borderRadius: 8
                    }}>
                      <Text style={{ fontSize: 12, color: 'white', fontWeight: '600' }}>
                        {item.status === 'paid' ? t('income:paid', { defaultValue: 'Ödendi' }) : 
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
                      name="arrow-up-circle-outline" 
                      size={16} 
                      color="#10B981" 
                    />
                    <Text style={{ 
                      marginLeft: spacing.xs, 
                      fontSize: 14, 
                      fontWeight: '600', 
                      color: '#10B981' 
                    }}>
                      +₺{item.amount.toLocaleString()}
                    </Text>
                  </View>
                )}
                
                {item.source && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons 
                      name={
                        item.source === 'sales' ? 'pricetag-outline' :
                        'receipt-outline'
                      } 
                      size={16} 
                      color={isDark ? '#94A3B8' : colors.muted} 
                    />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, color: isDark ? '#E2E8F0' : colors.muted }}>
                      {item.source === 'sales' ? 'Satış' :
                       item.incomeTypeName || 'Manuel'}
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
          keyExtractor: (item: Income) => String(item.id),
        },
      }}
    />
  );
}

