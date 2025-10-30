import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent, ViewStyle } from 'react-native';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';
import { typography } from '../../core/constants/typography';

type Props = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export default function Button({ title, onPress, disabled, style }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <TouchableOpacity activeOpacity={0.85} style={[styles.button, disabled && styles.disabled, style]} onPress={onPress} disabled={disabled}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  disabled: {
    backgroundColor: colors.muted,
  },
  text: {
    color: '#fff',
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
});


