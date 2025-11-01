import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useEmployeeStatsQuery } from '../hooks/useEmployeesQuery';
import { ModuleDashboardScreen, ModuleStat, ModuleQuickAction } from '../../../shared/components/ModuleDashboardScreen';
import { errorMessages, createError } from '../../../core/utils/errorUtils';
import LoadingState from '../../../shared/components/LoadingState';
import ErrorState from '../../../shared/components/ErrorState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';

/**
 * EmployeesDashboardScreen - Dashboard for Employees module
 */
export default function EmployeesDashboardScreen() {
  const { t } = useTranslation(['settings', 'common']);
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';
  
  // Use React Query hook for stats
  const { data: stats, isLoading, error } = useEmployeeStatsQuery();

  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
      
    return [
      {
        key: 'total-employees',
        label: t('settings:total_employees', { defaultValue: 'Toplam Çalışan' }),
        value: stats.totalEmployees ?? 0,
        icon: 'people-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
        route: 'Employees',
      },
      {
        key: 'active-employees',
        label: t('settings:active_employees', { defaultValue: 'Aktif Çalışan' }),
        value: stats.activeEmployees ?? 0,
        icon: 'checkmark-circle-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'Employees',
      },
      {
        key: 'total-departments',
        label: t('settings:total_departments', { defaultValue: 'Toplam Departman' }),
        value: stats.totalDepartments ?? 0,
        icon: 'business-outline',
        color: isDark ? '#F59E0B' : '#D97706',
        route: 'Employees',
      },
    ];
  }, [stats, t, isDark]);

  // Fetch stats function (for ModuleDashboardScreen compatibility)
  const fetchStats = React.useCallback(async (): Promise<ModuleStat[]> => {
    if (error) {
      const errorMessage = errorMessages.failedToLoad('employees');
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
          error={error || new Error(errorMessages.failedToLoad('employees'))}
          showRetry={false}
        />
      </ScreenLayout>
    );
  }

  // Define quick actions
  const quickActions: ModuleQuickAction[] = [
    {
      key: 'view-employees',
      label: t('settings:employees', { defaultValue: 'Çalışanlar' }),
      icon: 'list-outline',
      color: isDark ? '#60A5FA' : '#1D4ED8',
      route: 'Employees',
    },
    {
      key: 'add-employee',
      label: t('settings:new_employee', { defaultValue: 'Yeni Çalışan' }),
      icon: 'add-circle-outline',
      color: isDark ? '#34D399' : '#059669',
      route: 'EmployeeCreate',
    },
  ];

  return (
    <ModuleDashboardScreen
      config={{
        module: 'settings',
        stats: fetchStats,
        quickActions: quickActions,
        mainStatKey: 'total-employees',
      }}
    />
  );
}

