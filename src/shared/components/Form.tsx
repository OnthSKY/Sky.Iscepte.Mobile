import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';

type FormProps = {
  children: React.ReactNode;
  gap?: number;
};

export function Form({ children, gap = spacing.md }: FormProps) {
  const { colors } = useTheme();
  return <View style={{ gap, backgroundColor: 'transparent' }}>{children}</View>;
}

type FormSectionProps = {
  title?: string;
  children: React.ReactNode;
  gap?: number;
};

export function FormSection({ title, children, gap = spacing.md }: FormSectionProps) {
  const { colors } = useTheme();
  return (
    <View style={{ gap }}>
      {title ? (
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.muted }}>{title}</Text>
      ) : null}
      <View style={{ gap }}>{children}</View>
    </View>
  );
}

type FormRowProps = {
  children: React.ReactNode[] | React.ReactNode;
  columns?: 1 | 2 | 3;
  gap?: number;
};

export function FormRow({ children, columns = 2, gap = spacing.md }: FormRowProps) {
  // Stack on small screens, columns on larger
  const { width } = useWindowDimensions();
  const isNarrow = width < 420;
  const childArray = React.Children.toArray(children);

  if (isNarrow || columns === 1) {
    return <View style={{ gap }}>{childArray}</View>;
  }

  const itemStyle = { flex: 1, minWidth: 0 } as const;
  return (
    <View style={{ flexDirection: 'row', gap }}>
      {childArray.map((child, idx) => (
        <View key={idx} style={itemStyle}>
          {child}
        </View>
      ))}
    </View>
  );
}

type FieldProps = {
  label?: string;
  required?: boolean;
  children: React.ReactNode;
};

export function FormField({ label, required, children }: FieldProps) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.xs }}>
      {label ? (
        <Text style={{ color: colors.text, fontWeight: '500' }}>
          {label}
          {required ? <Text style={{ color: colors.error }}> *</Text> : null}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export default Form;


