import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useReportStatsQuery } from '../hooks/useReportsQuery';
import { ModuleDashboardScreen, ModuleStat, ModuleQuickAction } from '../../../shared/components/ModuleDashboardScreen';
import { errorMessages, createError } from '../../../core/utils/errorUtils';
import LoadingState from '../../../shared/components/LoadingState';
import ErrorState from '../../../shared/components/ErrorState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';

/**
 * ReportsDashboardScreen - Dashboard for Reports module
 */
export default function ReportsDashboardScreen() {
  const { t } = useTranslation(['reports', 'common']);
  const { activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';
  
  // Use React Query hook for stats
  const { data: stats, isLoading, error } = useReportStatsQuery();

  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
      
    return [
      {
        key: 'total-reports',
        label: t('reports:total_reports', { defaultValue: 'Toplam Rapor' }),
        value: stats.totalReports ?? 0,
        icon: 'document-text-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
        route: 'Reports',
      },
      {
        key: 'monthly-reports',
        label: t('reports:monthly_reports', { defaultValue: 'Aylık Rapor' }),
        value: stats.monthlyReports ?? 0,
        icon: 'calendar-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'Reports',
      },
      {
        key: 'completed-reports',
        label: t('reports:completed_reports', { defaultValue: 'Tamamlanan Rapor' }),
        value: stats.completedReports ?? 0,
        icon: 'checkmark-circle-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'Reports',
      },
      {
        key: 'pending-reports',
        label: t('reports:pending_reports', { defaultValue: 'Bekleyen Rapor' }),
        value: stats.pendingReports ?? 0,
        icon: 'time-outline',
        color: isDark ? '#F59E0B' : '#D97706',
        route: 'Reports',
      },
    ];
  }, [stats, t, isDark]);

  // Fetch stats function (for ModuleDashboardScreen compatibility)
  const fetchStats = React.useCallback(async (): Promise<ModuleStat[]> => {
    if (error) {
      const errorMessage = errorMessages.failedToLoad('reports');
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
          error={error || new Error(errorMessages.failedToLoad('reports'))}
          showRetry={false}
        />
      </ScreenLayout>
    );
  }

  // Define quick actions
  const quickActions: ModuleQuickAction[] = [
    {
      key: 'view-reports',
      label: t('reports:reports', { defaultValue: 'Raporlar' }),
      icon: 'list-outline',
      color: isDark ? '#60A5FA' : '#1D4ED8',
      route: 'Reports',
    },
  ];

  return (
    <ModuleDashboardScreen
      config={{
        module: 'reports',
        stats: fetchStats,
        quickActions: quickActions,
        mainStatKey: 'total-reports',
      }}
    />
  );
}

