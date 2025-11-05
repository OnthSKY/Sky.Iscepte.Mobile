import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';
import { getColumnsForStats } from '../core/constants/breakpoints';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import Calendar from '../shared/components/Calendar';
import { useAsyncData } from '../core/hooks/useAsyncData';
import LoadingState from '../shared/components/LoadingState';
import ErrorState from '../shared/components/ErrorState';
import EmptyState from '../shared/components/EmptyState';
import Card from '../shared/components/Card';
import { salesEntityService } from '../modules/sales/services/salesServiceAdapter';
import { expenseEntityService } from '../modules/expenses/services/expenseServiceAdapter';
import { revenueEntityService } from '../modules/revenue/services/revenueServiceAdapter';
import { purchaseEntityService } from '../modules/purchases/services/purchaseServiceAdapter';
import { Sale } from '../modules/sales/store/salesStore';
import { Expense } from '../modules/expenses/store/expenseStore';
import { Revenue } from '../modules/revenue/store/revenueStore';
import { Purchase } from '../modules/purchases/store/purchaseStore';
import { formatCurrency } from '../modules/products/utils/currency';
import { isSameDay } from '../core/utils/dateUtils';

interface DailyTransaction {
  id: string;
  type: 'sale' | 'expense' | 'revenue' | 'purchase';
  title: string;
  amount: number;
  currency: string;
  date: string;
  module: string;
  data: Sale | Expense | Revenue | Purchase;
}

export default function CalendarScreen() {
  const { t, i18n } = useTranslation(['calendar', 'common', 'sales', 'expenses', 'revenue', 'purchases']);
  const { colors, activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Fetch all daily data from all modules
  const { data: dailyData, loading: dailyLoading, error: dailyError } = useAsyncData(
    async () => {
      const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      
      const transactions: DailyTransaction[] = [];

      // Fetch sales - get all and filter by date
      try {
        const salesResponse = await salesEntityService.list({
          page: 1,
          pageSize: 1000,
          orderColumn: 'CreatedAt',
          orderDirection: 'DESC',
          searchValue: '',
          filters: {},
        });
        
        salesResponse.items.forEach((sale: Sale) => {
          const itemDate = sale.date || (sale as any).createdAt || (sale as any).CreatedAt;
          if (itemDate) {
            const itemDateObj = new Date(itemDate);
            if (isSameDay(itemDateObj, selectedDate)) {
              transactions.push({
                id: `sale-${sale.id}`,
                type: 'sale',
                title: sale.title || sale.productName || t('sales:sale', { defaultValue: 'Satış' }),
                amount: sale.amount || sale.total || 0,
                currency: sale.currency || 'TRY',
                date: itemDate,
                module: 'sales',
                data: sale,
              });
            }
          }
        });
      } catch (error) {
        // Silently fail
      }

      // Fetch expenses - get all and filter by date
      try {
        const expensesResponse = await expenseEntityService.list({
          page: 1,
          pageSize: 1000,
          orderColumn: 'CreatedAt',
          orderDirection: 'DESC',
          searchValue: '',
          filters: {},
        });
        
        expensesResponse.items.forEach((expense: Expense) => {
          const itemDate = expense.date || (expense as any).createdAt || (expense as any).CreatedAt;
          if (itemDate) {
            const itemDateObj = new Date(itemDate);
            if (isSameDay(itemDateObj, selectedDate)) {
              transactions.push({
                id: `expense-${expense.id}`,
                type: 'expense',
                title: expense.title || t('expenses:expense', { defaultValue: 'Gider' }),
                amount: expense.amount || 0,
                currency: expense.currency || 'TRY',
                date: itemDate,
                module: 'expenses',
                data: expense,
              });
            }
          }
        });
      } catch (error) {
        // Silently fail
      }

      // Fetch revenue - get all and filter by date
      try {
        const revenueResponse = await revenueEntityService.list({
          page: 1,
          pageSize: 1000,
          orderColumn: 'CreatedAt',
          orderDirection: 'DESC',
          searchValue: '',
          filters: {},
        });
        
        revenueResponse.items.forEach((revenue: Revenue) => {
          const itemDate = revenue.date || (revenue as any).createdAt || (revenue as any).CreatedAt;
          if (itemDate) {
            const itemDateObj = new Date(itemDate);
            if (isSameDay(itemDateObj, selectedDate)) {
              transactions.push({
                id: `revenue-${revenue.id}`,
                type: 'revenue',
                title: revenue.title || t('revenue:revenue', { defaultValue: 'Gelir' }),
                amount: revenue.amount || 0,
                currency: revenue.currency || 'TRY',
                date: itemDate,
                module: 'revenue',
                data: revenue,
              });
            }
          }
        });
      } catch (error) {
        // Silently fail
      }

      // Fetch purchases - get all and filter by date
      try {
        const purchasesResponse = await purchaseEntityService.list({
          page: 1,
          pageSize: 1000,
          orderColumn: 'CreatedAt',
          orderDirection: 'DESC',
          searchValue: '',
          filters: {},
        });
        
        purchasesResponse.items.forEach((purchase: Purchase) => {
          const itemDate = purchase.date || (purchase as any).createdAt || (purchase as any).CreatedAt;
          if (itemDate) {
            const itemDateObj = new Date(itemDate);
            if (isSameDay(itemDateObj, selectedDate)) {
              transactions.push({
                id: `purchase-${purchase.id}`,
                type: 'purchase',
                title: purchase.title || purchase.productName || t('purchases:purchase', { defaultValue: 'Alış' }),
                amount: purchase.amount || purchase.total || 0,
                currency: purchase.currency || 'TRY',
                date: itemDate,
                module: 'purchases',
                data: purchase,
              });
            }
          }
        });
      } catch (error) {
        // Silently fail
      }

      // Sort by date (most recent first)
      return transactions.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });
    },
    [selectedDate, t]
  );

  // Calculate summary stats
  const summary = useMemo(() => {
    if (!dailyData) return { revenue: 0, expenses: 0, net: 0 };

    let totalRevenue = 0;
    let totalExpenses = 0;

    dailyData.forEach((transaction) => {
      const amount = transaction.amount || 0;
      if (transaction.type === 'sale' || transaction.type === 'revenue') {
        totalRevenue += amount;
      } else if (transaction.type === 'expense' || transaction.type === 'purchase') {
        totalExpenses += amount;
      }
    });

    return {
      revenue: totalRevenue,
      expenses: totalExpenses,
      net: totalRevenue - totalExpenses,
    };
  }, [dailyData]);

  // Layout calculations
  const layoutConfig = useMemo(() => {
    const numColumns = getColumnsForStats(width);
    const cardMargin = spacing.md;
    const statCardWidth = numColumns > 1 
      ? (width - spacing.lg * 2 - cardMargin) / numColumns
      : width - spacing.lg * 2;
    return { numColumns, cardMargin, statCardWidth };
  }, [width]);

  const handleTransactionPress = (transaction: DailyTransaction) => {
    const routeMap: Record<string, string> = {
      sale: 'SalesDetail',
      expense: 'ExpenseDetail',
      revenue: 'RevenueDetail',
      purchase: 'PurchaseDetail',
    };
    
    const routeName = routeMap[transaction.type];
    if (routeName) {
      navigation.navigate(routeName, { id: transaction.data.id });
    }
  };

  const renderTransactionCard = (transaction: DailyTransaction) => {
    const isIncome = transaction.type === 'sale' || transaction.type === 'revenue';
    const iconMap = {
      sale: 'pricetag-outline',
      expense: 'wallet-outline',
      revenue: 'trending-up-outline',
      purchase: 'cart-outline',
    };
    const colorMap = {
      sale: isDark ? '#34D399' : '#059669',
      expense: isDark ? '#F87171' : '#DC2626',
      revenue: isDark ? '#60A5FA' : '#1D4ED8',
      purchase: isDark ? '#F59E0B' : '#D97706',
    };

    return (
      <TouchableOpacity
        key={transaction.id}
        onPress={() => handleTransactionPress(transaction)}
        activeOpacity={0.7}
      >
        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.transactionHeader}>
            <View style={[styles.transactionIconWrap, { backgroundColor: `${colorMap[transaction.type]}20` }]}>
              <Ionicons name={iconMap[transaction.type] as any} size={24} color={colorMap[transaction.type]} />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={[styles.transactionTitle, { color: colors.text }]} numberOfLines={1}>
                {transaction.title}
              </Text>
              <Text style={[styles.transactionModule, { color: colors.muted }]}>
                {t(`calendar:${transaction.module}`, { defaultValue: transaction.module })}
              </Text>
            </View>
            <View style={styles.transactionAmount}>
              <Text 
                style={[
                  styles.transactionAmountText, 
                  { 
                    color: isIncome ? (isDark ? '#34D399' : '#059669') : (isDark ? '#F87171' : '#DC2626'),
                    fontWeight: '700',
                  }
                ]}
              >
                {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenLayout noPadding>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        style={{ backgroundColor: colors.page }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        {/* Calendar Section */}
        <View style={[styles.calendarSection, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: spacing.md }]}>
            {t('calendar:module_name', { defaultValue: 'Takvim' })}
          </Text>
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            markedDates={{}}
          />
        </View>

        {/* Summary Cards */}
        {!dailyLoading && (
          <View style={[styles.summarySection, { paddingHorizontal: spacing.lg, paddingTop: spacing.xl }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: spacing.md }]}>
              {t('calendar:daily_report', { defaultValue: 'Günlük Rapor' })}
            </Text>
            
            {/* Summary Row - Revenue and Expenses side by side */}
            <View style={styles.summaryRow}>
              {/* Total Revenue */}
              <View style={[
                styles.summaryCard,
                { 
                  backgroundColor: isDark ? '#1D4ED8' : '#2563EB',
                  width: layoutConfig.numColumns > 1 ? layoutConfig.statCardWidth : width - spacing.lg * 2,
                  marginRight: layoutConfig.numColumns > 1 ? layoutConfig.cardMargin : 0,
                  marginBottom: layoutConfig.numColumns > 1 ? 0 : spacing.md,
                },
                isDark ? styles.cardDarkShadow : styles.cardLightShadow,
              ]}>
                <View style={styles.summaryCardContent}>
                  <Ionicons name="trending-up-outline" size={28} color="white" />
                  <View style={styles.summaryCardText}>
                    <Text style={styles.summaryCardLabel}>
                      {t('calendar:total_revenue', { defaultValue: 'Toplam Ciro' })}
                    </Text>
                    <Text style={styles.summaryCardValue}>
                      {formatCurrency(summary.revenue, 'TRY')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Total Expenses */}
              {layoutConfig.numColumns > 1 && (
                <View style={[
                  styles.summaryCard,
                  { 
                    backgroundColor: isDark ? '#DC2626' : '#EF4444',
                    width: layoutConfig.statCardWidth,
                  },
                  isDark ? styles.cardDarkShadow : styles.cardLightShadow,
                ]}>
                  <View style={styles.summaryCardContent}>
                    <Ionicons name="wallet-outline" size={28} color="white" />
                    <View style={styles.summaryCardText}>
                      <Text style={styles.summaryCardLabel}>
                        {t('calendar:total_expenses', { defaultValue: 'Toplam Gider' })}
                      </Text>
                      <Text style={styles.summaryCardValue}>
                        {formatCurrency(summary.expenses, 'TRY')}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Expenses card for mobile (if single column) */}
            {layoutConfig.numColumns === 1 && (
              <View style={[
                styles.summaryCard,
                { 
                  backgroundColor: isDark ? '#DC2626' : '#EF4444',
                  width: width - spacing.lg * 2,
                  marginBottom: spacing.md,
                },
                isDark ? styles.cardDarkShadow : styles.cardLightShadow,
              ]}>
                <View style={styles.summaryCardContent}>
                  <Ionicons name="wallet-outline" size={28} color="white" />
                  <View style={styles.summaryCardText}>
                    <Text style={styles.summaryCardLabel}>
                      {t('calendar:total_expenses', { defaultValue: 'Toplam Gider' })}
                    </Text>
                    <Text style={styles.summaryCardValue}>
                      {formatCurrency(summary.expenses, 'TRY')}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Net Profit - Full Width */}
            <View style={[
              styles.summaryCard,
              { 
                backgroundColor: summary.net >= 0 
                  ? (isDark ? '#059669' : '#10B981')
                  : (isDark ? '#DC2626' : '#EF4444'),
                width: width - spacing.lg * 2,
              },
              isDark ? styles.cardDarkShadow : styles.cardLightShadow,
            ]}>
              <View style={styles.summaryCardContent}>
                <Ionicons 
                  name={summary.net >= 0 ? "arrow-up-circle-outline" : "arrow-down-circle-outline"} 
                  size={32} 
                  color="white" 
                />
                <View style={styles.summaryCardText}>
                  <Text style={styles.summaryCardLabel}>
                    {t('calendar:net_profit', { defaultValue: 'Net Kar' })}
                  </Text>
                  <Text style={[styles.summaryCardValue, { fontSize: 28 }]}>
                    {formatCurrency(summary.net, 'TRY')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Transactions List */}
        <View style={[styles.transactionsSection, { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: spacing.md }]}>
            {t('calendar:transactions', { defaultValue: 'İşlemler' })}
          </Text>

          {dailyLoading ? (
            <View style={styles.loadingContainer}>
              <LoadingState />
            </View>
          ) : dailyError ? (
            <View style={styles.errorContainer}>
              <ErrorState
                error={dailyError}
                showRetry={false}
              />
            </View>
          ) : dailyData && dailyData.length > 0 ? (
            <View>
              {dailyData.map((transaction) => renderTransactionCard(transaction))}
            </View>
          ) : (
            <EmptyState
              title={t('calendar:no_transactions', { defaultValue: 'Bu tarih için işlem bulunmamaktadır' })}
              subtitle={t('common:select_date', { defaultValue: 'Tarih Seçin' })}
            />
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  calendarSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  summarySection: {
    marginBottom: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryCard: {
    borderRadius: 16,
    padding: spacing.lg,
    minHeight: 100,
    justifyContent: 'center',
  },
  summaryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryCardText: {
    flex: 1,
  },
  summaryCardLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  summaryCardValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardLightShadow: {
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
      },
    }),
  },
  cardDarkShadow: {
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
      },
    }),
  },
  transactionsSection: {
    marginBottom: spacing.xl,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
  },
  errorContainer: {
    paddingVertical: spacing.xl,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  transactionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  transactionModule: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 18,
    fontWeight: '700',
  },
});

