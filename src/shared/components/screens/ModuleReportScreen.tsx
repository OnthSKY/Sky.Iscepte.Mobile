import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useWindowDimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenLayout from '../../layouts/ScreenLayout';
import DateRangePicker from '../DateRangePicker';
import FiltersModal from '../FiltersModal';
import spacing from '../../../core/constants/spacing';
import { FilterOption } from '../../../core/types/screen.types';
import LoadingState from '../LoadingState';
import ErrorState from '../ErrorState';
import { useEmployeesQuery } from '../../../modules/employees/hooks/useEmployeesQuery';

export type PeriodType = 'day' | 'week' | 'month' | 'year';

export interface ModuleReportData {
  period: PeriodType;
  dateRange?: { startDate?: string; endDate?: string };
  employeeId?: string | number;
  moduleFilters?: Record<string, any>;
}

export interface ModuleReportScreenProps {
  module: string;
  moduleName: string;
  translationNamespace: string;
  onFetchReport: (data: ModuleReportData) => Promise<any>;
  filterOptions?: FilterOption[]; // Module-specific filters
  showEmployeeFilter?: boolean; // Show employee filter (default: true)
  renderReportContent?: (reportData: any, isLoading: boolean, error: any) => React.ReactNode;
}

/**
 * Generic Module Report Screen
 * 
 * Features:
 * - Period cards (Day, Week, Month, Year)
 * - Date range filter (single date or date range)
 * - Employee filter
 * - Module-specific filters
 * - Report data display
 */
export default function ModuleReportScreen({
  module,
  moduleName,
  translationNamespace,
  onFetchReport,
  filterOptions = [],
  showEmployeeFilter = true,
  renderReportContent,
}: ModuleReportScreenProps) {
  const { t, i18n } = useTranslation([translationNamespace, 'common', 'reports']);
  const { colors, activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  // State
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string } | undefined>();
  const [employeeId, setEmployeeId] = useState<string | number | undefined>();
  const [moduleFilters, setModuleFilters] = useState<Record<string, any>>({});
  const [filtersModalVisible, setFiltersModalVisible] = useState(false);
  
  // Report data state
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // Fetch employees if employee filter is enabled
  const { data: employeesData } = showEmployeeFilter ? useEmployeesQuery() : { data: null };

  // Employee options
  const employeeOptions = useMemo(() => {
    if (!showEmployeeFilter || !employeesData?.items) return [];
    return [
      { label: t('common:all', { defaultValue: 'Tümü' }), value: '' },
      ...employeesData.items.map((emp: any) => ({
        label: emp.name || emp.fullName || `${emp.id}`,
        value: String(emp.id),
      })),
    ];
  }, [employeesData, showEmployeeFilter, t]);

  // Period options
  const periodOptions = useMemo(() => [
    { value: 'day' as PeriodType, label: t('reports:period_day', { defaultValue: 'Gün' }) },
    { value: 'week' as PeriodType, label: t('reports:period_week', { defaultValue: 'Hafta' }) },
    { value: 'month' as PeriodType, label: t('reports:period_month', { defaultValue: 'Ay' }) },
    { value: 'year' as PeriodType, label: t('reports:period_year', { defaultValue: 'Yıl' }) },
  ], [t]);

  // Build filter options for FiltersModal
  const allFilterOptions = useMemo<FilterOption[]>(() => {
    const filters: FilterOption[] = [];
    
    // Employee filter
    if (showEmployeeFilter && employeeOptions.length > 0) {
      filters.push({
        key: 'employeeId',
        label: 'common:employee',
        type: 'select',
        options: employeeOptions,
      });
    }

    // Module-specific filters
    filters.push(...filterOptions);

    return filters;
  }, [showEmployeeFilter, employeeOptions, filterOptions]);

  // Fetch report data
  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data: ModuleReportData = {
        period: selectedPeriod,
        dateRange,
        employeeId: employeeId || undefined,
        moduleFilters,
      };
      const result = await onFetchReport(data);
      setReportData(result);
    } catch (err) {
      setError(err);
      console.error('Error fetching report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch report when filters change
  useEffect(() => {
    fetchReport();
  }, [selectedPeriod, dateRange, employeeId, moduleFilters]);

  // Handle period change
  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
    // Clear date range when period changes (optional)
    // setDateRange(undefined);
  };

  // Handle filter change from FiltersModal
  const handleFiltersChange = (filters: Record<string, any> | undefined) => {
    if (!filters) {
      setModuleFilters({});
      if (showEmployeeFilter) {
        setEmployeeId(undefined);
      }
      return;
    }

    // Extract employeeId if present
    if (showEmployeeFilter && 'employeeId' in filters) {
      setEmployeeId(filters.employeeId || undefined);
      const { employeeId: _, ...rest } = filters;
      setModuleFilters(rest);
    } else {
      setModuleFilters(filters);
    }
  };

  // Get current filters for FiltersModal
  const currentFilters = useMemo(() => {
    const filters: Record<string, any> = { ...moduleFilters };
    if (showEmployeeFilter && employeeId) {
      filters.employeeId = String(employeeId);
    }
    return filters;
  }, [moduleFilters, employeeId, showEmployeeFilter]);

  // Get selected employee name
  const selectedEmployeeName = useMemo(() => {
    if (!showEmployeeFilter || !employeeId) return null;
    const employee = employeesData?.items?.find((emp: any) => String(emp.id) === String(employeeId));
    return employee?.name || employee?.fullName || null;
  }, [employeeId, employeesData, showEmployeeFilter]);

  const styles = getStyles(colors, isDark, isMobile);

  return (
    <ScreenLayout title={t(`${translationNamespace}:reports`, { defaultValue: moduleName + ' Raporları' })}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Cards */}
        <View style={styles.periodCardsContainer}>
          {periodOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.periodCard,
                selectedPeriod === option.value && styles.periodCardActive,
                { backgroundColor: colors.surface, borderColor: colors.border }
              ]}
              onPress={() => handlePeriodChange(option.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.periodCardText,
                  { color: colors.text },
                  selectedPeriod === option.value && styles.periodCardTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filters Section */}
        <View style={styles.filtersSection}>
          <View style={styles.filtersHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('reports:filters', { defaultValue: 'Filtreler' })}
            </Text>
            {(Object.keys(currentFilters).length > 0 || dateRange?.startDate) && (
              <TouchableOpacity
                onPress={() => {
                  setDateRange(undefined);
                  handleFiltersChange(undefined);
                }}
                style={styles.clearAllButton}
              >
                <Ionicons name="close-circle" size={18} color={colors.primary} />
                <Text style={[styles.clearAllText, { color: colors.primary }]}>
                  {t('common:clear_all', { defaultValue: 'Tümünü Temizle' })}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filtersContent}>
            {/* Date Range Picker */}
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              label="reports:date_range"
              singleDateMode={false} // Allow date range
            />

            {/* Employee Filter - Show as button if filter is active */}
            {showEmployeeFilter && (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border,
                  },
                  employeeId && { borderColor: colors.primary, borderWidth: 2 }
                ]}
                onPress={() => setFiltersModalVisible(true)}
              >
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={employeeId ? colors.primary : colors.muted} 
                />
                <Text 
                  style={[
                    styles.filterButtonText,
                    { color: employeeId ? colors.text : colors.muted }
                  ]}
                >
                  {selectedEmployeeName || t('common:select_employee', { defaultValue: 'Personel Seçin' })}
                </Text>
                {employeeId && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setEmployeeId(undefined);
                    }}
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.muted} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            )}

            {/* Module-specific Filters Button */}
            {filterOptions.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border,
                  },
                  Object.keys(moduleFilters).length > 0 && { borderColor: colors.primary, borderWidth: 2 }
                ]}
                onPress={() => setFiltersModalVisible(true)}
              >
                <Ionicons 
                  name="options-outline" 
                  size={20} 
                  color={Object.keys(moduleFilters).length > 0 ? colors.primary : colors.muted} 
                />
                <Text 
                  style={[
                    styles.filterButtonText,
                    { color: Object.keys(moduleFilters).length > 0 ? colors.text : colors.muted }
                  ]}
                >
                  {t('common:more_filters', { defaultValue: 'Daha Fazla Filtre' })}
                  {Object.keys(moduleFilters).length > 0 && ` (${Object.keys(moduleFilters).length})`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Report Content */}
        <View style={styles.reportSection}>
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} showRetry={true} onRetry={fetchReport} />
          ) : renderReportContent ? (
            renderReportContent(reportData, isLoading, error)
          ) : (
            <View style={styles.defaultReportContent}>
              <Text style={[styles.defaultReportText, { color: colors.muted }]}>
                {t('reports:no_data', { defaultValue: 'Rapor verisi bulunamadı' })}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Filters Modal */}
      <FiltersModal
        visible={filtersModalVisible}
        onClose={() => setFiltersModalVisible(false)}
        value={currentFilters}
        onChange={handleFiltersChange}
        filterOptions={allFilterOptions}
        translationNamespace={translationNamespace}
      />
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
  periodCardsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.page,
  },
  periodCard: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  periodCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodCardText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  periodCardTextActive: {
    color: '#ffffff',
  },
  filtersSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.page,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filtersContent: {
    gap: spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
    gap: spacing.sm,
  },
  filterButtonText: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    padding: spacing.xs,
  },
  reportSection: {
    padding: spacing.lg,
    minHeight: 200,
  },
  defaultReportContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  defaultReportText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

