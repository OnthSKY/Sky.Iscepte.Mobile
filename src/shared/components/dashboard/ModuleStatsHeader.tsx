import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import { StatCard } from './StatCard';

export interface ModuleStat {
  key: string;
  label: string;
  value: string | number;
  icon: string;
  color: string;
  route?: string;
}

interface ModuleStatsHeaderProps {
  stats: ModuleStat[];
  mainStatKey?: string;
  translationNamespace: string;
}

/**
 * ModuleStatsHeader - Responsive stats header for module list screens
 * 
 * Single Responsibility: Displays module statistics in a responsive grid
 */
export function ModuleStatsHeader({ stats, mainStatKey, translationNamespace }: ModuleStatsHeaderProps) {
  const { colors, activeTheme } = useTheme();
  const { width } = useWindowDimensions();
  const isDark = activeTheme === 'dark';

  // Responsive layout calculations
  const layoutConfig = useMemo(() => {
    // Breakpoints for stat cards:
    // Mobile (< 640px): 1 column
    // Tablet (640-980px): 2 columns
    // Desktop (980-1280px): 3 columns
    // Large Desktop (> 1280px): 4 columns
    let numColumns = 1;
    if (width > 1280) {
      numColumns = 4;
    } else if (width > 980) {
      numColumns = 3;
    } else if (width > 640) {
      numColumns = 2;
    }

    const cardMargin = spacing.md;
    const containerPadding = spacing.lg;
    const availableWidth = width - containerPadding * 2;
    const gap = spacing.md;
    const totalGaps = gap * (numColumns - 1);
    const cardWidth = (availableWidth - totalGaps) / numColumns;

    return { numColumns, cardWidth, gap, containerPadding };
  }, [width]);

  // Find main stat and secondary stats
  const { mainStat, secondaryStats } = useMemo(() => {
    if (!stats || stats.length === 0) {
      return { mainStat: null, secondaryStats: [] };
    }

    const mainStatIndex = mainStatKey 
      ? stats.findIndex(s => s.key === mainStatKey)
      : 0;
    
    const mainStatIndexValid = mainStatIndex >= 0 ? mainStatIndex : 0;
    const mainStat = stats[mainStatIndexValid];
    const secondaryStats = stats.filter((_, index) => index !== mainStatIndexValid);

    return { mainStat, secondaryStats };
  }, [stats, mainStatKey]);

  const handleNavigate = (route?: string) => {
    // Navigation is handled by parent component
    // This is just a callback placeholder
  };

  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingHorizontal: layoutConfig.containerPadding }]}>
      {/* Main Stat Card - Full Width */}
      {mainStat && (
        <View style={styles.mainStatContainer}>
          <View style={[styles.mainStatCard, { backgroundColor: mainStat.color }]}>
            <View style={styles.mainStatContent}>
              <View style={styles.mainStatIconContainer}>
                <Ionicons name={mainStat.icon as any} size={32} color="white" />
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
        <View style={[styles.statsGrid, { gap: layoutConfig.gap }]}>
          {secondaryStats.map((stat, index) => {
            const valueStr = typeof stat.value === 'number' 
              ? stat.value.toLocaleString() 
              : String(stat.value ?? '—');
            
            // Calculate margin for responsive grid
            const isLastInRow = (index + 1) % layoutConfig.numColumns === 0;
            const marginRight = isLastInRow ? 0 : layoutConfig.gap;

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
                width={layoutConfig.cardWidth}
                marginRight={marginRight}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'transparent',
  },
  mainStatContainer: {
    marginBottom: spacing.md,
  },
  mainStatCard: {
    borderRadius: 20,
    padding: spacing.xl,
    minHeight: 120,
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? { 
          boxShadow: '0px 10px 30px rgba(0,0,0,0.15)',
        }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 8,
        }),
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
    marginTop: spacing.sm,
  },
});

