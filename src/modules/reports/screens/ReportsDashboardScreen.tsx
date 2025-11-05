import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useAccountingSummaryQuery } from '../hooks/useReportsQuery';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../../store/useAppStore';
import { usePermissions } from '../../../core/hooks/usePermissions';
import { Role } from '../../../core/config/appConstants';
import { MODULE_CONFIGS } from '../../../core/config/moduleConfig';
import { RelatedModuleCard } from '../../../shared/components/dashboard/RelatedModuleCard';
import { formatCurrency } from '../../../core/utils/numberUtils';
import LoadingState from '../../../shared/components/LoadingState';
import ErrorState from '../../../shared/components/ErrorState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import spacing from '../../../core/constants/spacing';

type PeriodType = 'day' | 'week' | 'month' | 'year';

/**
 * ReportsDashboardScreen - Reports module dashboard
 * Features:
 * - Financial summary cards (Income, Expenses, Net)
 * - Period filter (Day, Week, Month, Year)
 * - Module-based report cards with permissions
 * - Responsive design
 * - Dark/Light theme support
 * - Multi-language support
 */
export default function ReportsDashboardScreen() {
  const { t, i18n } = useTranslation(['reports', 'common']);
  const { colors, activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const navigation = useNavigation<any>();
  const role = useAppStore((s) => s.role) as Role;
  const permissions = usePermissions(role);
  
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  
  // Fetch accounting summary based on selected period
  const { data: summary, isLoading, error } = useAccountingSummaryQuery(selectedPeriod);
  
  // Period options
  const periodOptions: { value: PeriodType; label: string }[] = useMemo(() => [
    { value: 'day', label: t('reports:period_day', { defaultValue: 'Gün' }) },
    { value: 'week', label: t('reports:period_week', { defaultValue: 'Hafta' }) },
    { value: 'month', label: t('reports:period_month', { defaultValue: 'Ay' }) },
    { value: 'year', label: t('reports:period_year', { defaultValue: 'Yıl' }) },
  ], [t]);
  
  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    if (!summary) {
      return {
        income: 0,
        expenses: 0,
        net: 0,
      };
    }
    
    const income = summary.revenue?.totalRevenue || 0;
    const expenses = summary.expenses?.totalExpenses || 0;
    const net = income - expenses;
    
    return { income, expenses, net };
  }, [summary]);
  
  // Get locale for currency formatting
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
  const currency = 'TRY';
  
  // Module cards for reports (filtered by permissions)
  const moduleCards = useMemo(() => {
    const modules = MODULE_CONFIGS.filter(module => {
      // Filter out reports and calendar modules
      if (module.key === 'reports' || module.key === 'calendar') {
        return false;
      }
      // Check if user has view permission for this module
      return permissions.can(`${module.key}:view`);
    });
    
    return modules.map(module => {
      const isDarkTheme = isDark;
      const moduleColors: { [key: string]: string } = {
        sales: isDarkTheme ? '#60A5FA' : '#1D4ED8',
        purchases: isDarkTheme ? '#34D399' : '#059669',
        customers: isDarkTheme ? '#A78BFA' : '#7C3AED',
        suppliers: isDarkTheme ? '#F87171' : '#DC2626',
        expenses: isDarkTheme ? '#FB923C' : '#EA580C',
        revenue: isDarkTheme ? '#22D3EE' : '#0891B2',
        stock: isDarkTheme ? '#FBBF24' : '#D97706',
        employees: isDarkTheme ? '#EC4899' : '#DB2777',
      };
      
      return {
        key: module.key,
        label: t(`${module.translationNamespace}:${module.translationKey}`, { 
          defaultValue: module.key.charAt(0).toUpperCase() + module.key.slice(1) 
        }),
        icon: module.icon,
        color: moduleColors[module.key] || colors.primary,
        route: module.dashboardRoute || module.routeName,
        permission: `${module.key}:view`,
      };
    });
  }, [permissions, isDark, colors.primary, t]);
  
  // Handle module card press
  const handleModulePress = (route: string, moduleKey: string) => {
    // Navigate to module-specific report screen
    try {
      // Map module keys to report screen routes
      const reportRouteMap: Record<string, string> = {
        sales: 'SalesReport',
        purchases: 'PurchasesReport',
        customers: 'CustomersReport',
        suppliers: 'SuppliersReport',
        expenses: 'ExpensesReport',
        revenue: 'RevenueReport',
        stock: 'StockReport',
        employees: 'EmployeesReport',
      };
      
      const reportRoute = reportRouteMap[moduleKey];
      if (reportRoute) {
        navigation.navigate(reportRoute as never);
      } else {
        // Fallback to dashboard if no report screen exists
        navigation.navigate(route as never);
      }
    } catch (err) {
      console.warn(`Could not navigate to report for ${moduleKey}:`, err);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <ScreenLayout title={t('reports:reports', { defaultValue: 'Raporlar' })}>
        <LoadingState />
      </ScreenLayout>
    );
  }
  
  // Error state
  if (error || !summary) {
    return (
      <ScreenLayout title={t('reports:reports', { defaultValue: 'Raporlar' })}>
        <ErrorState
          error={error || new Error(t('reports:error_loading', { defaultValue: 'Veriler yüklenirken hata oluştu' }))}
          showRetry={false}
        />
      </ScreenLayout>
    );
  }
  
  const styles = getStyles(colors, isDark, isMobile);
  
  return (
    <ScreenLayout title={t('reports:reports', { defaultValue: 'Raporlar' })}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Filter */}
        <View style={styles.periodFilterContainer}>
          <Text style={styles.periodFilterLabel}>
            {t('reports:select_period', { defaultValue: 'Dönem Seçin' })}
          </Text>
          <View style={styles.periodFilterButtons}>
            {periodOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.periodButton,
                  selectedPeriod === option.value && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(option.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === option.value && styles.periodButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Financial Summary Cards */}
        <View style={styles.financialCardsContainer}>
          {/* Income Card */}
          <View style={[styles.financialCard, styles.incomeCard]}>
            <View style={styles.financialCardHeader}>
              <Ionicons name="trending-up-outline" size={24} color="#22D3EE" />
              <Text style={styles.financialCardLabel}>
                {t('reports:income', { defaultValue: 'Gelir' })}
              </Text>
            </View>
            <Text style={[styles.financialCardValue, { color: '#22D3EE' }]}>
              {formatCurrency(financialMetrics.income, currency, locale)}
            </Text>
          </View>
          
          {/* Expenses Card */}
          <View style={[styles.financialCard, styles.expensesCard]}>
            <View style={styles.financialCardHeader}>
              <Ionicons name="trending-down-outline" size={24} color="#F87171" />
              <Text style={styles.financialCardLabel}>
                {t('reports:expenses', { defaultValue: 'Gider' })}
              </Text>
            </View>
            <Text style={[styles.financialCardValue, { color: '#F87171' }]}>
              {formatCurrency(financialMetrics.expenses, currency, locale)}
            </Text>
          </View>
          
          {/* Net Card */}
          <View style={[
            styles.financialCard,
            styles.netCard,
            financialMetrics.net >= 0 ? styles.netCardPositive : styles.netCardNegative,
          ]}>
            <View style={styles.financialCardHeader}>
              <Ionicons 
                name={financialMetrics.net >= 0 ? "checkmark-circle-outline" : "close-circle-outline"} 
                size={24} 
                color={financialMetrics.net >= 0 ? '#34D399' : '#F87171'} 
              />
              <Text style={styles.financialCardLabel}>
                {t('reports:net', { defaultValue: 'Net' })}
              </Text>
            </View>
            <Text style={[
              styles.financialCardValue,
              { color: financialMetrics.net >= 0 ? '#34D399' : '#F87171' }
            ]}>
              {formatCurrency(financialMetrics.net, currency, locale)}
            </Text>
          </View>
        </View>
        
        {/* Module Reports Section */}
        <View style={styles.moduleReportsSection}>
          <Text style={styles.sectionTitle}>
            {t('reports:module_reports', { defaultValue: 'Modül Raporları' })}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {t('reports:module_reports_description', { 
              defaultValue: 'Modül bazlı detaylı raporları görüntülemek için kartlara tıklayın' 
            })}
          </Text>
          
          {moduleCards.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color={colors.muted} />
              <Text style={styles.emptyStateText}>
                {t('reports:no_modules_available', { defaultValue: 'Görüntülenebilecek modül bulunamadı' })}
              </Text>
            </View>
          ) : (
            <View style={styles.moduleCardsContainer}>
              {moduleCards.map((module) => (
                <RelatedModuleCard
                  key={module.key}
                  module={{
                    key: module.key,
                    label: module.label,
                    icon: module.icon,
                    color: module.color,
                    route: module.route,
                  }}
                  onPress={() => handleModulePress(module.route, module.key)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const getStyles = (colors: any, isDark: boolean, isMobile: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xl,
  },
  periodFilterContainer: {
    marginBottom: spacing.lg,
  },
  periodFilterLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  periodFilterButtons: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  financialCardsContainer: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  financialCard: {
    flex: isMobile ? 1 : undefined,
    width: isMobile ? '100%' : undefined,
    minWidth: isMobile ? undefined : 150,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...(isDark ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3,
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    }),
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#22D3EE',
  },
  expensesCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F87171',
  },
  netCard: {
    borderLeftWidth: 4,
  },
  netCardPositive: {
    borderLeftColor: '#34D399',
  },
  netCardNegative: {
    borderLeftColor: '#F87171',
  },
  financialCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  financialCardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.muted,
  },
  financialCardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  moduleReportsSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: spacing.lg,
  },
  moduleCardsContainer: {
    gap: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.muted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
