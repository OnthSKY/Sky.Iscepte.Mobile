import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useRevenueStatsQuery } from '../hooks/useRevenueQuery';
import { ModuleDashboardScreen, ModuleStat, ModuleQuickAction } from '../../../shared/components/ModuleDashboardScreen';
import { RelatedModule } from '../../../shared/components/dashboard/RelatedModuleCard';
import { errorMessages, createError } from '../../../core/utils/errorUtils';
import LoadingState from '../../../shared/components/LoadingState';
import ErrorState from '../../../shared/components/ErrorState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import { revenueEntityService } from '../services/revenueServiceAdapter';
import { Revenue } from '../store/revenueStore';
import Card from '../../../shared/components/Card';
import Ionicons from 'react-native-vector-icons/Ionicons';
import spacing from '../../../core/constants/spacing';

/**
 * RevenueDashboardScreen - Dashboard for Revenue module
 */
export default function RevenueDashboardScreen() {
  const { t } = useTranslation(['revenue', 'common']);
  const { activeTheme, colors } = useTheme();
  const isDark = activeTheme === 'dark';
  
  // Use React Query hook for stats
  const { data: stats, isLoading, error } = useRevenueStatsQuery();

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

  // Define related modules
  const relatedModules: RelatedModule[] = React.useMemo(() => {
    return [
      {
        key: 'revenue-types',
        label: t('revenue:revenue_types', { defaultValue: 'Gelir Türleri' }),
        icon: 'apps-outline',
        color: isDark ? '#A78BFA' : '#7C3AED',
        route: 'ExpenseTypes', // Using expense types for now
        stat: stats?.revenueTypes ?? 0,
        statLabel: t('revenue:revenue_types', { defaultValue: 'Gelir Türleri' }),
      },
    ];
  }, [stats, t, isDark]);

  // Define quick actions
  const quickActions: ModuleQuickAction[] = React.useMemo(() => [
    {
      key: 'view-revenue',
      label: t('revenue:revenue', { defaultValue: 'Gelirler' }),
      icon: 'list-outline',
      color: isDark ? '#10B981' : '#059669',
      route: 'RevenueList',
    },
    {
      key: 'add-revenue',
      label: t('revenue:new_revenue', { defaultValue: 'Yeni Gelir' }),
      icon: 'add-circle-outline',
      color: isDark ? '#34D399' : '#10B981',
      route: 'RevenueCreate',
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
          error={error || new Error(errorMessages.failedToLoad('revenue'))}
          showRetry={false}
        />
      </ScreenLayout>
    );
  }

  return (
    <ModuleDashboardScreen<Revenue>
      config={{
        module: 'revenue',
        stats: fetchStats,
        quickActions: quickActions,
        mainStatKey: 'total-revenue',
        relatedModules: relatedModules,
        listRoute: 'RevenueList',
        createRoute: 'RevenueCreate',
        description: 'revenue:module_description',
        listConfig: {
          service: revenueEntityService,
          config: {
            entityName: 'revenue',
            translationNamespace: 'revenue',
            defaultPageSize: 10,
          },
          renderItem: (item: Revenue) => (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                    {item.title || t('revenue:revenue', { defaultValue: 'Gelir' })}
                  </Text>
                  {item.isSystemGenerated && (
                    <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                      {t('revenue:system_generated', { defaultValue: 'Sistemden' })}
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
                        {item.status === 'paid' ? t('revenue:paid', { defaultValue: 'Ödendi' }) : 
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
                       item.revenueTypeName || 'Manuel'}
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
          keyExtractor: (item: Revenue) => String(item.id),
        },
      }}
    />
  );
}

