import React from 'react';
import { View, StyleSheet, ViewProps, TouchableOpacity, GestureResponderEvent, Text } from 'react-native';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';

type Props = ViewProps & {
  onPress?: (event: GestureResponderEvent) => void;
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
};

export default function Card({ style, onPress, children, title, subtitle, headerRight, ...rest }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  if (onPress) {
    return (
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} {...rest}>
        {title ? (
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
            </View>
            {headerRight ? <View style={{ marginLeft: spacing.md }}>{headerRight}</View> : null}
          </View>
        ) : null}
        <View style={styles.body}>{children}</View>
      </TouchableOpacity>
    );
  }
  return (
    <View style={[styles.card, style]} {...rest}>
      {title ? (
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
          </View>
          {headerRight ? <View style={{ marginLeft: spacing.md }}>{headerRight}</View> : null}
        </View>
      ) : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  subtitle: { marginTop: 2, fontSize: 13, color: colors.muted },
  body: { gap: spacing.md },
});


