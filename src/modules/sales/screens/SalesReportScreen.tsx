import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import ModuleReportScreen, { ModuleReportData } from '../../../shared/components/screens/ModuleReportScreen';
import { apiEndpoints } from '../../../core/config/apiEndpoints';
import { FilterOption } from '../../../core/types/screen.types';
import Card from '../../../shared/components/Card';
import spacing from '../../../core/constants/spacing';
import { formatCurrency } from '../../products/utils/currency';
import Ionicons from 'react-native-vector-icons/Ionicons';
import httpService from '../../../shared/services/httpService';

/**
 * Sales Report Screen
 * Displays sales reports with period filters, date range, employee filter, and module-specific filters
 */
export default function SalesReportScreen() {
  const { t } = useTranslation(['sales', 'common', 'reports']);
  const { colors, activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  // Module-specific filter options
  const filterOptions: FilterOption[] = [
    {
      key: 'status',
      label: 'sales:status',
      type: 'select',
      options: [
        { label: t('common:all', { defaultValue: 'Tümü' }), value: '' },
        { label: t('common:completed', { defaultValue: 'Tamamlandı' }), value: 'completed' },
        { label: t('common:pending', { defaultValue: 'Beklemede' }), value: 'pending' },
        { label: t('common:cancelled', { defaultValue: 'İptal' }), value: 'cancelled' },
      ],
    },
    {
      key: 'customerId',
      label: 'sales:customer',
      type: 'text',
    },
    {
      key: 'minAmount',
      label: 'sales:min_amount',
      type: 'number',
    },
    {
      key: 'maxAmount',
      label: 'sales:max_amount',
      type: 'number',
    },
  ];

  // Fetch report data
  const fetchReport = async (data: ModuleReportData) => {
    // Build query params
    const params = new URLSearchParams();
    params.append('period', data.period);
    
    if (data.dateRange?.startDate) {
      params.append('startDate', data.dateRange.startDate);
    }
    if (data.dateRange?.endDate && data.dateRange.endDate !== data.dateRange.startDate) {
      params.append('endDate', data.dateRange.endDate);
    }
    if (data.employeeId) {
      params.append('employeeId', String(data.employeeId));
    }
    
    // Add module-specific filters
    if (data.moduleFilters) {
      Object.entries(data.moduleFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const url = `${apiEndpoints.sales.report}?${params.toString()}`;
    
    // Use httpService to fetch report data
    return httpService.get<any>(url);
  };

  // Render report content
  const renderReportContent = (reportData: any, isLoading: boolean, error: any) => {
    if (!reportData) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color={colors.muted} />
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            {t('reports:select_filters', { defaultValue: 'Raporu görmek için filtreleri seçin' })}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.reportContent}>
        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <Card style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <View style={styles.summaryCardHeader}>
              <Ionicons name="receipt-outline" size={24} color={colors.primary} />
              <Text style={[styles.summaryCardLabel, { color: colors.muted }]}>
                {t('sales:total_sales', { defaultValue: 'Toplam Satış' })}
              </Text>
            </View>
            <Text style={[styles.summaryCardValue, { color: colors.text }]}>
              {reportData.totalSales || 0}
            </Text>
          </Card>

          <Card style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <View style={styles.summaryCardHeader}>
              <Ionicons name="cash-outline" size={24} color="#34D399" />
              <Text style={[styles.summaryCardLabel, { color: colors.muted }]}>
                {t('sales:total_revenue', { defaultValue: 'Toplam Gelir' })}
              </Text>
            </View>
            <Text style={[styles.summaryCardValue, { color: colors.text }]}>
              {formatCurrency(reportData.totalRevenue || 0, reportData.currency || 'TRY')}
            </Text>
          </Card>

          <Card style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <View style={styles.summaryCardHeader}>
              <Ionicons name="stats-chart-outline" size={24} color="#F59E0B" />
              <Text style={[styles.summaryCardLabel, { color: colors.muted }]}>
                {t('sales:average_order_value', { defaultValue: 'Ortalama Sipariş' })}
              </Text>
            </View>
            <Text style={[styles.summaryCardValue, { color: colors.text }]}>
              {formatCurrency(reportData.averageOrderValue || 0, reportData.currency || 'TRY')}
            </Text>
          </Card>
        </View>

        {/* Additional report data can be displayed here */}
        {reportData.details && (
          <View style={styles.detailsSection}>
            <Text style={[styles.detailsTitle, { color: colors.text }]}>
              {t('reports:details', { defaultValue: 'Detaylar' })}
            </Text>
            {/* Render details here */}
          </View>
        )}
      </View>
    );
  };

  return (
    <ModuleReportScreen
      module="sales"
      moduleName={t('sales:sales', { defaultValue: 'Satışlar' })}
      translationNamespace="sales"
      onFetchReport={fetchReport}
      filterOptions={filterOptions}
      showEmployeeFilter={true}
      renderReportContent={renderReportContent}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: 16,
    textAlign: 'center',
  },
  reportContent: {
    gap: spacing.lg,
  },
  summaryCards: {
    gap: spacing.md,
  },
  summaryCard: {
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCardLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryCardValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  detailsSection: {
    marginTop: spacing.md,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
});

