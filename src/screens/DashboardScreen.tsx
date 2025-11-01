import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';
import { useDashboard } from '../core/hooks/useDashboard';
import { DashboardHeader } from '../shared/components/dashboard/DashboardHeader';
import { StatCard } from '../shared/components/dashboard/StatCard';
import { QuickActionCard } from '../shared/components/dashboard/QuickActionCard';
import SummaryCard from '../shared/components/SummaryCard';

/**
 * DashboardScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only responsible for composing dashboard UI
 * Open/Closed: Open for extension (new dashboard types via factory), closed for modification
 * Liskov Substitution: Can be replaced with any dashboard screen implementation
 * Interface Segregation: Uses minimal, focused interfaces
 * Dependency Inversion: Depends on abstractions (hooks, services) not concrete implementations
 */
const DashboardScreen: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { data, loading, error, role, navigate } = useDashboard();

  // Layout calculations
  const layoutConfig = useMemo(() => {
    const numColumns = width > 650 ? 2 : 1;
    const cardMargin = spacing.md;
    const statCardWidth = numColumns > 1 
      ? (width - spacing.lg * 2 - cardMargin) / 2 
      : width - spacing.lg * 2;
    return { numColumns, cardMargin, statCardWidth };
  }, [width]);

  // Header pills configuration
  const headerPills = useMemo(() => [
    {
      label: t('dashboard:today_sales', { defaultValue: 'Bugünkü Satış' }),
      value: '₺3,240',
      icon: 'trending-up-outline',
      color: colors.success,
    },
    {
      label: t('dashboard:today_expenses', { defaultValue: 'Bugünkü Gider' }),
      value: '₺820',
      icon: 'wallet-outline',
      color: colors.error,
    },
  ], [t, colors]);

  if (loading) {
    return (
      <ScreenLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenLayout>
    );
  }

  if (error || !data) {
    return (
      <ScreenLayout>
        <View style={styles.errorContainer}>
          <Text style={{ color: colors.error }}>
            {error?.message || 'Failed to load dashboard data'}
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout noPadding>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        style={{ backgroundColor: colors.page }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        scrollEventThrottle={16}
      >
        <DashboardHeader
          role={role}
          showPills={true}
          pills={headerPills}
        />

        <SummaryCard
          label={data.mainStat.label}
          value={data.mainStat.value}
          icon={data.mainStat.icon}
          color={data.mainStat.color}
          onPress={() => navigate(data.mainStat.route)}
        />

        <View style={styles.statsGrid}>
          {data.secondaryStats.map((stat, index) => (
            <StatCard
              key={stat.key}
              stat={stat}
              onPress={() => navigate(stat.route)}
              width={layoutConfig.statCardWidth}
              marginRight={layoutConfig.numColumns > 1 && index % 2 === 0 ? layoutConfig.cardMargin : 0}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('dashboard:quick_actions')}
          </Text>
          <View style={styles.actionsList}>
            {data.quickActions.map((action) => (
              <QuickActionCard
                key={action.key}
                action={action}
                onPress={() => navigate(action.route)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  actionsList: {
    gap: spacing.sm,
  },
});

export default DashboardScreen;
