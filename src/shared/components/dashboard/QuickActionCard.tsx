import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { QuickAction } from '../../../core/hooks/useDashboardData';

/**
 * Single Responsibility: Renders a single quick action card
 * Interface Segregation: Only receives what it needs
 */

interface QuickActionCardProps {
  action: QuickAction;
  onPress: () => void;
}

/**
 * QuickActionCard component
 * SRP: Only responsible for rendering a quick action card UI
 */
export const QuickActionCard: React.FC<QuickActionCardProps> = ({ action, onPress }) => {
  const { colors, activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        isDark ? styles.cardDarkShadow : styles.cardLightShadow,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${action.color}20` }]}>
        <Ionicons name={action.icon as any} size={22} color={action.color} />
      </View>
      <Text style={[styles.label, { color: colors.text }]}>{action.label}</Text>
      <Ionicons name="chevron-forward-outline" size={20} color={colors.muted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  cardLightShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  cardDarkShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
});

