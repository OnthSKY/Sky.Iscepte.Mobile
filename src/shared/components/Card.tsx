import React from 'react';
import { View, StyleSheet, ViewProps, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';

type Props = ViewProps & {
  onPress?: (event: GestureResponderEvent) => void;
};

export default function Card({ style, onPress, children, ...rest }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  if (onPress) {
    return (
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} {...rest}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]} {...rest}>{children}</View>;
}

const getStyles = (colors: any) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});


