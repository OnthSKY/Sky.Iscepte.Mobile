import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';
import { StatCard } from './dashboard/StatCard';
import { QuickActionCard } from './dashboard/QuickActionCard';
import ScreenLayout from '../layouts/ScreenLayout';
import { useAsyncData } from '../../core/hooks/useAsyncData';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import { errorMessages } from '../../core/utils/errorUtils';

export interface ModuleStat {
  key: string;
  label: string;
  value: string | number;
  icon: string;
  color: string;
  route?: string;
}

export interface ModuleQuickAction {
  key: string;
  label: string;
  icon: string;
  color: string;
  route: string;
}

export interface ModuleDashboardConfig {
  module: string;
  stats: () => Promise<ModuleStat[]>;
  quickActions: ModuleQuickAction[];
  mainStatKey?: string; // Which stat to show as main (large) card
}

interface ModuleDashboardScreenProps {
  config: ModuleDashboardConfig;
}

/**
 * ModuleDashboardScreen - Reusable dashboard for each module
 * 
 * Single Responsibility: Only responsible for composing module dashboard UI
 * Open/Closed: Open for extension (different modules via config), closed for modification
 */
export const ModuleDashboardScreen: React.FC<ModuleDashboardScreenProps> = ({ config }) => {
  const { t } = useTranslation([config.module, 'common']);
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();

  // Fetch stats
  const { data: stats, loading, error } = useAsyncData(
    async () => {
      const statsData = await config.stats();
      return statsData;
    },
    [config.module]
  );

  // Layout calculations
  const layoutConfig = useMemo(() => {
    const numColumns = width > 650 ? 2 : 1;
    const cardMargin = spacing.md;
    const statCardWidth = numColumns > 1 
      ? (width - spacing.lg * 2 - cardMargin) / 2 
      : width - spacing.lg * 2;
    return { numColumns, cardMargin, statCardWidth };
  }, [width]);

  // Find main stat and secondary stats
  const { mainStat, secondaryStats } = useMemo(() => {
    if (!stats || stats.length === 0) {
      return { mainStat: null, secondaryStats: [] };
    }

    const mainStatIndex = config.mainStatKey 
      ? stats.findIndex(s => s.key === config.mainStatKey)
      : 0;
    
    const mainStatIndexValid = mainStatIndex >= 0 ? mainStatIndex : 0;
    const mainStat = stats[mainStatIndexValid];
    const secondaryStats = stats.filter((_, index) => index !== mainStatIndexValid);

    return { mainStat, secondaryStats };
  }, [stats, config.mainStatKey]);

  const handleNavigate = (route?: string) => {
    if (route) {
      navigation.navigate(route);
    }
  };

  if (loading) {
    return (
      <ScreenLayout>
        <LoadingState />
      </ScreenLayout>
    );
  }

  if (error || !stats) {
    const errorMessage = error 
      ? errorMessages.failedToLoad(t(`${config.module}:module`, { defaultValue: 'Module data' }))
      : errorMessages.failedToLoad();
    
    return (
      <ScreenLayout>
        <ErrorState
          error={error || new Error(errorMessage)}
          showRetry={false}
        />
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
        {/* Main Stat Card */}
        {mainStat && (
          <View style={styles.mainStatContainer}>
            <View style={[styles.mainStatCard, { backgroundColor: mainStat.color }]}>
              <View style={styles.mainStatContent}>
                <View style={styles.mainStatIconContainer}>
                  <Text style={styles.mainStatIcon}>📊</Text>
                </View>
                <View style={styles.mainStatText}>
                  <Text style={styles.mainStatLabel}>{mainStat.label}</Text>
                  <Text style={styles.mainStatValue}>
                    {typeof mainStat.value === 'number' 
                      ? mainStat.value.toLocaleString() 
                      : mainStat.value}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Secondary Stats Grid */}
        {secondaryStats.length > 0 && (
          <View style={styles.statsGrid}>
            {secondaryStats.map((stat, index) => {
              const valueStr = typeof stat.value === 'number' 
                ? stat.value.toLocaleString() 
                : String(stat.value ?? '—');
              return (
                <StatCard
                  key={stat.key}
                  stat={{
                    key: stat.key,
                    label: stat.label,
                    value: valueStr,
                    icon: stat.icon,
                    color: stat.color,
                    route: stat.route || '',
                  }}
                  onPress={() => handleNavigate(stat.route)}
                  width={layoutConfig.statCardWidth}
                  marginRight={layoutConfig.numColumns > 1 && index % 2 === 0 ? layoutConfig.cardMargin : 0}
                />
              );
            })}
          </View>
        )}

        {/* Quick Actions */}
        {config.quickActions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t(`${config.module}:quick_actions`, { defaultValue: 'Hızlı İşlemler' })}
            </Text>
            <View style={styles.actionsList}>
              {config.quickActions.map((action) => (
                <QuickActionCard
                  key={action.key}
                  action={{
                    key: action.key,
                    label: action.label,
                    icon: action.icon,
                    color: action.color,
                    route: action.route,
                  }}
                  onPress={() => handleNavigate(action.route)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  mainStatContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  mainStatCard: {
    borderRadius: 20,
    padding: spacing.xl,
    minHeight: 120,
    justifyContent: 'center',
  },
  mainStatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainStatIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  mainStatIcon: {
    fontSize: 32,
  },
  mainStatText: {
    flex: 1,
  },
  mainStatLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  mainStatValue: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  section: {
    marginTop: spacing.xl,
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

export default ModuleDashboardScreen;

