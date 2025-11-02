/**
 * DetailField Component
 * 
 * Single Responsibility: Displays a single field with label and value
 * Responsive: Adapts to screen size
 */

import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';
import { isSmallScreen } from '../../core/constants/breakpoints';

interface DetailFieldProps {
  label: string;
  value: string | number | undefined | null;
  formatValue?: (value: any) => string;
  icon?: string;
  onPress?: () => void;
}

export default function DetailField({ 
  label, 
  value, 
  formatValue,
  icon,
  onPress 
}: DetailFieldProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isSmall = isSmallScreen(width);
  const styles = getStyles(colors, isSmall);

  const displayValue = value !== undefined && value !== null 
    ? (formatValue ? formatValue(value) : String(value))
    : '-';

  const content = (
    <View style={styles.container}>
      <View style={[styles.row, isSmall && styles.rowStacked]}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {displayValue}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const getStyles = (colors: any, isSmall: boolean) => StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: isSmall ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isSmall ? 'flex-start' : 'center',
    gap: isSmall ? spacing.xs : 0,
  },
  rowStacked: {
    gap: spacing.xs,
  },
  label: {
    fontSize: isSmall ? 14 : 15,
    fontWeight: '500',
    color: colors.muted,
    flex: isSmall ? 0 : 1,
  },
  value: {
    fontSize: isSmall ? 15 : 16,
    fontWeight: '400',
    textAlign: isSmall ? 'left' : 'right',
    flex: isSmall ? 0 : 1,
    color: colors.text, // Ensure text color is always visible
  },
});

