import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../core/contexts/ThemeContext';

/**
 * RelatedModuleCard - Card for navigating to related modules
 * Single Responsibility: Renders a related module navigation card
 */

export interface RelatedModule {
  key: string;
  label: string;
  icon: string;
  color: string;
  route: string;
  stat?: string | number;
  statLabel?: string;
}

interface RelatedModuleCardProps {
  module: RelatedModule;
  onPress: () => void;
}

export const RelatedModuleCard: React.FC<RelatedModuleCardProps> = ({ module, onPress }) => {
  const { colors, activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.surface : colors.card,
          borderColor: colors.border,
        },
        isDark ? styles.cardDarkShadow : styles.cardLightShadow,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${module.color}15` }]}>
        <Ionicons name={module.icon as any} size={24} color={module.color} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.text }]}>{module.label}</Text>
        {module.stat !== undefined && (
          <Text style={[styles.stat, { color: colors.muted }]}>
            {module.statLabel ? `${module.statLabel}: ` : ''}
            {typeof module.stat === 'number' ? module.stat.toLocaleString() : module.stat}
          </Text>
        )}
      </View>
      <Ionicons name="arrow-forward-circle-outline" size={24} color={module.color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 12,
  },
  cardLightShadow: Platform.select({
    web: {
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
  }),
  cardDarkShadow: Platform.select({
    web: {
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3,
    },
  }),
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stat: {
    fontSize: 13,
    fontWeight: '500',
  },
});

