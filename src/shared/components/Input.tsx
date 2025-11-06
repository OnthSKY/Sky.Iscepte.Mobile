import React, { memo, useCallback } from 'react';
import { TextInput, StyleSheet, TextInputProps, Platform } from 'react-native';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';

const Input = memo<TextInputProps>(function Input(props) {
  const [focused, setFocused] = React.useState(false);
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const isEditable = props.editable !== false;
  
  const handleFocus = useCallback((e: any) => {
    if (isEditable) {
      setFocused(true);
    }
    props.onFocus?.(e);
  }, [isEditable, props.onFocus]);
  
  const handleBlur = useCallback((e: any) => {
    setFocused(false);
    props.onBlur?.(e);
  }, [props.onBlur]);
  
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      style={[
        styles.input, 
        focused && isEditable && styles.inputFocused, 
        !isEditable && styles.inputDisabled,
        props.multiline ? styles.multiline : null, 
        props.style
      ]}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  );
});

export default Input;

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
  inputDisabled: {
    backgroundColor: colors.background, // Use background color for disabled state
    borderColor: colors.border,
    color: colors.muted,
    opacity: 0.6,
  },
  multiline: { minHeight: 100 },
});


