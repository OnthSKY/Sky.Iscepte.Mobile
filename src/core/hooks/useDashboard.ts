import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import { useDashboardData } from './useDashboardData';
import { useNavigationHandler } from './useNavigationHandler';
import { DashboardServiceFactory, ThemeColors } from '../services/dashboardService';
import { Role } from '../config/appConstants';

/**
 * Main dashboard hook that combines all dashboard concerns
 * SRP: Orchestrates dashboard-related hooks and services
 * Dependency Inversion: Depends on abstractions (services, handlers)
 */
export function useDashboard() {
  const role = useAppStore((s) => s.role) as Role;
  const { colors } = useTheme();
  const { t } = useTranslation(['dashboard', 'sales', 'customers', 'expenses', 'reports', 'common']);
  
  // Convert theme colors to service-compatible format
  const themeColors: ThemeColors = useMemo(() => ({
    primary: colors.primary,
    success: colors.success,
    error: colors.error,
    info: colors.info || colors.primary,
    muted: colors.muted,
    text: colors.text,
    background: colors.background,
    surface: colors.surface,
    border: colors.border,
  }), [colors]);
  
  // Create service based on role (Factory pattern)
  const service = useMemo(
    () => DashboardServiceFactory.create(role, themeColors),
    [role, themeColors]
  );

  // Color getter function
  const getColor = useMemo(() => (key: 'primary' | 'success' | 'error' | 'info') => {
    switch (key) {
      case 'primary': return colors.primary;
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'info': return colors.info || colors.primary;
      default: return colors.primary;
    }
  }, [colors]);

  // Translation function
  const translate = useMemo(() => (key: string, defaultValue?: string) => {
    return t(key, { defaultValue }) || defaultValue || key;
  }, [t]);

  // Fetch dashboard data
  const { data, loading, error } = useDashboardData(service, translate, getColor);

  // Navigation handler with fallbacks
  const navigationHandler = useNavigationHandler({
    SalesCreate: 'Sales',
    SalesEdit: 'Sales',
    CustomerCreate: 'Customers',
    CustomerEdit: 'Customers',
    ExpenseCreate: 'Expenses',
    ExpenseEdit: 'Expenses',
  });

  return {
    data,
    loading,
    error,
    role,
    navigate: navigationHandler.navigate,
    canNavigate: navigationHandler.canNavigate,
  };
}

