import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useEmployeeStatsQuery } from '../hooks/useEmployeesQuery';
import { ModuleDashboardScreen, ModuleStat, ModuleQuickAction } from '../../../shared/components/ModuleDashboardScreen';
import { RelatedModule } from '../../../shared/components/dashboard/RelatedModuleCard';
import { errorMessages, createError } from '../../../core/utils/errorUtils';
import LoadingState from '../../../shared/components/LoadingState';
import ErrorState from '../../../shared/components/ErrorState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import { employeeEntityService } from '../services/employeeServiceAdapter';
import { Employee } from '../store/employeeStore';
import Card from '../../../shared/components/Card';
import Ionicons from 'react-native-vector-icons/Ionicons';
import spacing from '../../../core/constants/spacing';

/**
 * EmployeesDashboardScreen - Dashboard for Employees module
 */
export default function EmployeesDashboardScreen() {
  const { t } = useTranslation(['employees', 'settings', 'common']);
  const { activeTheme, colors } = useTheme();
  const isDark = activeTheme === 'dark';
  
  // Use React Query hook for stats
  const { data: stats, isLoading, error } = useEmployeeStatsQuery();

  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
      
    return [
      {
        key: 'total-employees',
        label: t('employees:total_employees', { defaultValue: 'Toplam Çalışan' }),
        value: stats.totalEmployees ?? 0,
        icon: 'people-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
        route: 'EmployeesList',
      },
      {
        key: 'active-employees',
        label: t('employees:active_employees', { defaultValue: 'Aktif Çalışan' }),
        value: stats.activeEmployees ?? 0,
        icon: 'checkmark-circle-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'EmployeesList',
      },
      {
        key: 'total-departments',
        label: t('employees:total_departments', { defaultValue: 'Toplam Departman' }),
        value: stats.totalDepartments ?? 0,
        icon: 'business-outline',
        color: isDark ? '#F59E0B' : '#D97706',
        route: 'EmployeesList',
      },
    ];
  }, [stats, t, isDark]);

  // Define related modules - Employees can be linked to Sales, Expenses
  const relatedModules: RelatedModule[] = React.useMemo(() => {
    return [
      {
        key: 'sales',
        label: t('sales:sales', { defaultValue: 'Satışlar' }),
        icon: 'receipt-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
        route: 'SalesDashboard',
      },
      {
        key: 'expenses',
        label: t('expenses:expenses', { defaultValue: 'Gelir / Giderler' }),
        icon: 'wallet-outline',
        color: isDark ? '#F87171' : '#DC2626',
        route: 'ExpensesDashboard',
      },
    ];
  }, [t, isDark]);

  // Define quick actions
  const quickActions: ModuleQuickAction[] = React.useMemo(() => [
    {
      key: 'view-employees',
      label: t('employees:employees', { defaultValue: 'Çalışanlar' }),
      icon: 'list-outline',
      color: isDark ? '#60A5FA' : '#1D4ED8',
      route: 'EmployeesList',
    },
    {
      key: 'add-employee',
      label: t('employees:new_employee', { defaultValue: 'Yeni Çalışan' }),
      icon: 'add-circle-outline',
      color: isDark ? '#34D399' : '#059669',
      route: 'EmployeeCreate',
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
          error={error || new Error(errorMessages.failedToLoad('employees'))}
          showRetry={false}
        />
      </ScreenLayout>
    );
  }

  return (
    <ModuleDashboardScreen<Employee>
      config={{
        module: 'employees',
        stats: fetchStats,
        quickActions: quickActions,
        mainStatKey: 'total-employees',
        relatedModules: relatedModules,
        listRoute: 'EmployeesList',
        createRoute: 'EmployeeCreate',
        listConfig: {
          service: employeeEntityService,
          config: {
            entityName: 'employee',
            translationNamespace: 'employees',
            defaultPageSize: 10,
          },
          renderItem: (item: Employee) => (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  {item.name || t('employees:employee', { defaultValue: 'Çalışan' })}
                </Text>
                {item.status && (
                  <View style={{ 
                    backgroundColor: item.status === 'active' ? '#10B981' : '#6B7280',
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: 8
                  }}>
                    <Text style={{ fontSize: 12, color: 'white', fontWeight: '600' }}>
                      {item.status === 'active' ? t('common:active', { defaultValue: 'Aktif' }) : t('common:inactive', { defaultValue: 'Pasif' })}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={{ gap: spacing.xs }}>
                {item.role && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="briefcase-outline" size={16} color={isDark ? '#94A3B8' : colors.muted} />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, color: isDark ? '#E2E8F0' : colors.muted }}>
                      {item.role}
                    </Text>
                  </View>
                )}
                
                {item.department && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="business-outline" size={16} color={isDark ? '#94A3B8' : colors.muted} />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, color: isDark ? '#E2E8F0' : colors.muted }}>
                      {item.department}
                    </Text>
                  </View>
                )}
                
                {item.email && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="mail-outline" size={16} color={isDark ? '#94A3B8' : colors.muted} />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, color: isDark ? '#E2E8F0' : colors.muted }}>
                      {item.email}
                    </Text>
                  </View>
                )}
                
                {item.salary && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="cash-outline" size={16} color={colors.primary} />
                    <Text style={{ marginLeft: spacing.xs, fontSize: 14, fontWeight: '600', color: colors.primary }}>
                      ₺{item.salary.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          ),
          keyExtractor: (item: Employee) => String(item.id),
        },
      }}
    />
  );
}

