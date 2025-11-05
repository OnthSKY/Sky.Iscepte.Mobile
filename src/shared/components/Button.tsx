import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent, ViewStyle, Platform, StyleProp, View } from 'react-native';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';
import { typography } from '../../core/constants/typography';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: string;
  showLockIcon?: boolean;
};

export default function Button({ title, onPress, disabled, style, icon, showLockIcon }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const displayIcon = showLockIcon && disabled ? 'lock-closed-outline' : icon;
  
  return (
    <TouchableOpacity activeOpacity={0.85} style={[styles.button, disabled && styles.disabled, style]} onPress={onPress} disabled={disabled}>
      <View style={styles.buttonContent}>
        {displayIcon && (
          <Ionicons 
            name={displayIcon} 
            size={18} 
            color="#fff" 
            style={styles.icon}
          />
        )}
        <Text style={styles.text}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 10,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      },
    }),
  },
  disabled: {
    backgroundColor: colors.muted,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  icon: {
    marginRight: 0,
  },
  text: {
    color: '#fff',
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
});


