import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';
import { lightColors } from '../../core/constants/colors';

type SummaryCardProps = {
  label: string;
  value: string;
  icon: string;
  color?: string;
  onPress?: () => void;
};

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, icon, color = lightColors.primary, onPress }) => {
  const { colors, activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: color },
        isDark ? styles.cardDarkShadow : styles.cardLightShadow,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={28} color={'white'} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward-outline" size={24} color={'white'} style={{ opacity: 0.7 }} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    justifyContent: 'center',
    minHeight: 100,
  },
  cardLightShadow: Platform.select({
    web: {
      boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)',
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 5,
    },
  }),
  cardDarkShadow: Platform.select({
    web: {
      boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 15,
      elevation: 6,
    },
  }),
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 99,
    padding: 14,
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.9,
  },
  value: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 4,
  },
  chevronContainer: {
    marginLeft: 'auto',
  },
});

export default SummaryCard;
