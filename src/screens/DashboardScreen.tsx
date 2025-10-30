import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';

const DashboardScreen = () => {
  const { t } = useTranslation(['dashboard', 'sales', 'customers', 'expenses', 'reports', 'common']);
  const navigation = useNavigation<any>();
  const { colors, activeTheme } = useTheme();
  const { width } = useWindowDimensions();

  const isDark = activeTheme === 'dark';
  const numColumns = width > 1280 ? 6 : width > 1024 ? 5 : width > 820 ? 4 : width > 560 ? 3 : 2;
  const cardWidth = (width - spacing.lg * 2 - spacing.md * (numColumns - 1)) / numColumns;

  const [section, setSection] = useState<'overview' | 'actions' | 'activity'>('overview');
  const sections = [
    { key: 'overview' as const, label: t('dashboard:overview', { defaultValue: 'Overview' }), icon: 'grid-outline' },
    { key: 'actions' as const, label: t('dashboard:quick_actions', { defaultValue: 'Quick Actions' }), icon: 'flash-outline' },
    { key: 'activity' as const, label: t('dashboard:recent_activity', { defaultValue: 'Recent Activity' }), icon: 'time-outline' },
  ];

  const stats = [
    { 
      key: 'sales', 
      label: t('dashboard:total_sales'), 
      value: '₺125,430', 
      icon: 'trending-up-outline', 
      color: '#10B981',
      route: 'Sales'
    },
    { 
      key: 'customers', 
      label: t('dashboard:total_customers'), 
      value: '1,247', 
      icon: 'people-outline', 
      color: '#3B82F6',
      route: 'Customers'
    },
    { 
      key: 'expenses', 
      label: t('dashboard:total_expenses'), 
      value: '₺45,230', 
      icon: 'wallet-outline', 
      color: '#EF4444',
      route: 'Expenses'
    },
    { 
      key: 'profit', 
      label: t('dashboard:net_profit'), 
      value: '₺80,200', 
      icon: 'cash-outline', 
      color: '#8B5CF6',
      route: 'Reports'
    },
  ];

  const quickActions = [
    { 
      key: 'new-sale', 
      label: t('sales:new_sale'), 
      icon: 'add-circle-outline', 
      color: '#10B981',
      route: 'SalesCreate'
    },
    { 
      key: 'new-customer', 
      label: t('customers:new_customer'), 
      icon: 'person-add-outline', 
      color: '#3B82F6',
      route: 'CustomerCreate'
    },
    { 
      key: 'new-expense', 
      label: t('expenses:new_expense'), 
      icon: 'add-circle-outline', 
      color: '#EF4444',
      route: 'ExpenseCreate'
    },
    { 
      key: 'reports', 
      label: t('reports:reports'), 
      icon: 'stats-chart-outline', 
      color: '#8B5CF6',
      route: 'Reports'
    },
  ];

  const handleNavigation = (route: string) => {
    const routeNames: string[] | undefined = (navigation.getState() as any)?.routeNames;
    if (routeNames?.includes(route)) {
      navigation.navigate(route as never);
      return;
    }
    const fallbackMap: Record<string, string> = {
      SalesCreate: 'Sales',
      SalesEdit: 'Sales',
      CustomerCreate: 'Customers',
      CustomerEdit: 'Customers',
      ExpenseCreate: 'Expenses',
      ExpenseEdit: 'Expenses',
    };
    const fallback = fallbackMap[route];
    if (fallback && routeNames?.includes(fallback)) {
      navigation.navigate(fallback as never);
    } else {
      console.warn(`Route "${route}" not available on the current navigator.`);
    }
  };

  const renderOverview = () => (
    <View>
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <TouchableOpacity
            key={stat.key}
            style={[
              styles.statCard,
              Platform.OS === 'web' ? { boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' } : Platform.OS === 'android' ? { elevation: 2 } : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
              { backgroundColor: colors.surface, width: cardWidth },
            ]}
            onPress={() => handleNavigation(stat.route)}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconWrap, { backgroundColor: `${stat.color}20` }]}> 
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>{stat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderActions = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('dashboard:quick_actions')}</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.key}
            style={[
              styles.actionCard,
              Platform.OS === 'web' ? { boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' } : Platform.OS === 'android' ? { elevation: 2 } : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
              { backgroundColor: colors.surface, width: cardWidth },
            ]}
            onPress={() => handleNavigation(action.route)}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: `${action.color}20` }]}> 
              <Ionicons name={action.icon as any} size={28} color={action.color} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderActivity = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('dashboard:recent_activity')}</Text>
      <View style={[
        styles.activityCard,
        Platform.OS === 'web' ? { boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' } : Platform.OS === 'android' ? { elevation: 2 } : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
        { backgroundColor: colors.surface }
      ]}>
        <Text style={[styles.emptyText, { color: colors.muted }]}>{t('dashboard:no_recent_activity')}</Text>
      </View>
    </View>
  );

  return (
    <ScreenLayout>
      <View style={[styles.header]}>
        <Text style={[styles.title, { color: colors.text }]}>{t('dashboard:welcome')}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>{t('dashboard:description')}</Text>
      </View>

      <View style={[styles.segmentControl, { backgroundColor: colors.page }]}> 
        {sections.map((s) => {
          const active = section === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              style={[styles.segmentButton, active && [{ backgroundColor: colors.surface }, Platform.OS === 'web' ? { boxShadow: '0px 1px 4px rgba(0,0,0,0.08)' } : { elevation: 2 }]]}
              onPress={() => setSection(s.key)}
              accessibilityRole="button"
              accessibilityLabel={s.label}
            >
              <Ionicons name={s.icon as any} size={16} color={active ? colors.primary : colors.muted} />
              <Text style={[styles.segmentButtonText, { color: active ? colors.primary : colors.muted }]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} style={[styles.container, { backgroundColor: colors.page }]} showsVerticalScrollIndicator={false}>
        {section === 'overview' && renderOverview()}
        {section === 'actions' && renderActions()}
        {section === 'activity' && renderActivity()}
        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
  },
  segmentControl: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  segmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  segmentButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    justifyContent: 'flex-start',
  },
  statCard: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    marginRight: spacing.md,
  },
  statIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionCard: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    marginRight: spacing.md,
    alignItems: 'center',
  },
  actionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityCard: {
    borderRadius: 12,
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default DashboardScreen;
