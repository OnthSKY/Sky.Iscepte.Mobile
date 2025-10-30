import React from 'react';
import { KeyboardAvoidingView, Platform, View, StyleSheet } from 'react-native';
import spacing from '../../core/constants/spacing';

type Props = { children?: React.ReactNode };

export default function AuthLayout({ children }: Props) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
      <View style={styles.card}>{children}</View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  card: { borderRadius: 12, padding: spacing.xl },
});


