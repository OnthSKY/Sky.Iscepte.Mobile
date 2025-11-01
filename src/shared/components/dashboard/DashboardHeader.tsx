import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useNavigationHandler } from '../../../core/hooks/useNavigationHandler';
import DashboardTopBar from '../DashboardTopBar';
import spacing from '../../../core/constants/spacing';
import { Role } from '../../../core/config/permissions';

/**
 * Single Responsibility: Renders dashboard header with gradient
 * Open/Closed: Extensible with different header configurations
 */

interface DashboardHeaderProps {
  role: Role;
  showPills?: boolean;
  pills?: Array<{ 
    label: string; 
    value: string; 
    icon: string; 
    color: string;
    route?: string;
    onPress?: () => void;
  }>;
}

/**
 * DashboardHeader component
 * SRP: Only responsible for rendering dashboard header UI
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  role,
  showPills = false,
  pills = [],
}) => {
  const { colors, activeTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = activeTheme === 'dark';
  const { navigate } = useNavigationHandler();
  
  const headerGradientColors = isDark
    ? ['#0F172A', '#1E3A8A']
    : ['#1D4ED8', '#3B82F6'];

  return (
    <LinearGradient
      colors={headerGradientColors as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, { paddingTop: insets.top + spacing.sm, paddingBottom: spacing.lg }]}
    >
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: isDark ? '#00000010' : '#FFFFFF10' }]} />
      
      <View style={styles.header}>
        <DashboardTopBar variant={role} />
      </View>

      {showPills && pills.length > 0 && (
        <>
          <View style={styles.pillsRow}>
            {pills.map((pill, index) => {
              const handlePress = () => {
                if (pill.onPress) {
                  pill.onPress();
                } else if (pill.route) {
                  navigate(pill.route);
                }
              };
              const PillComponent = pill.onPress || pill.route ? TouchableOpacity : View;
              return (
                <PillComponent
                  key={index}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: colors.card || colors.surface,
                      borderColor: colors.border,
                    },
                    (pill.onPress || pill.route) && styles.pillClickable,
                  ]}
                  onPress={handlePress}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, { color: colors.muted }]}>{pill.label}</Text>
                  <Text style={[styles.pillValue, { color: pill.color }]}>{pill.value}</Text>
                </PillComponent>
              );
            })}
          </View>
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
        </>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  pillClickable: {
    cursor: 'pointer',
  },
  pillText: {
    fontSize: 12,
  },
  pillValue: {
    fontSize: 12,
    fontWeight: '700',
  },
});

