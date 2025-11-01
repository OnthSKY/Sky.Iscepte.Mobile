import React from 'react';
import { TextInput, StyleSheet, TextInputProps, Platform } from 'react-native';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';

export default function Input(props: TextInputProps) {
  const [focused, setFocused] = React.useState(false);
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      style={[styles.input, focused && styles.inputFocused, props.multiline ? styles.multiline : null, props.style]}
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
      {...props}
    />
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 44,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputFocused: {
    borderColor: colors.primary,
    ...Platform.select({
      web: {
        boxShadow: `0px 0px 6px ${colors.primary}14`,
      },
      default: {
        shadowColor: colors.primary,
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
    }),
  },
  multiline: { minHeight: 100 },
});


