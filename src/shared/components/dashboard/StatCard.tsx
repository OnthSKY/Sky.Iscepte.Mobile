import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { DashboardStat } from '../../../core/hooks/useDashboardData';

/**
 * Single Responsibility: Renders a single stat card
 * Interface Segregation: Only receives what it needs (stat data + handlers)
 */

interface StatCardProps {
  stat: DashboardStat;
  onPress: () => void;
  width?: number;
  marginRight?: number;
  style?: any;
  hideByDefault?: boolean;
}

/**
 * StatCard component
 * SRP: Only responsible for rendering a stat card UI
 */
export const StatCard: React.FC<StatCardProps> = ({
  stat,
  onPress,
  width,
  marginRight = 0,
  style,
  hideByDefault = false,
}) => {
  const { colors, activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';
  const [isVisible, setIsVisible] = useState(!hideByDefault);
  
  const maskedValue = '••••';
  const displayValue = isVisible ? stat.value : maskedValue;

  const handlePress = () => {
    if (hideByDefault) {
      setIsVisible(!isVisible);
    }
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          width,
          marginRight,
        },
        isDark ? styles.cardDarkShadow : styles.cardLightShadow,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: `${stat.color}20` }]}>
          <Ionicons name={stat.icon as any} size={22} color={stat.color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: colors.muted }]}>{stat.label}</Text>
          <View style={styles.valueRow}>
            <Text style={[styles.value, { color: colors.text }]}>{displayValue}</Text>
            {hideByDefault && (
              <Ionicons 
                name={isVisible ? 'eye-off-outline' : 'eye-outline'} 
                size={16} 
                color={colors.muted} 
                style={{ marginLeft: 8 }} 
              />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardLightShadow: Platform.select({
    web: {
      boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.05)',
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 15,
      elevation: 2,
    },
  }),
  cardDarkShadow: Platform.select({
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

