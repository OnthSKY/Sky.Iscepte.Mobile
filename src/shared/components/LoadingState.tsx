/**
 * LoadingState Component
 * 
 * Single Responsibility: Displays loading state UI
 * Open/Closed: Can be extended with custom loading indicators
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../core/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

export interface LoadingStateProps {
  /**
   * Optional message to display while loading
   */
  message?: string;
  
  /**
   * Size of the loading indicator
   * @default 'large'
   */
  size?: 'small' | 'large';
  
  /**
   * Whether to show message
   * @default true
   */
  showMessage?: boolean;
}

/**
 * Reusable loading state component
 */
export default function LoadingState({
  message,
  size = 'large',
  showMessage = true,
}: LoadingStateProps) {
  const { colors } = useTheme();
  const { t } = useTranslation('common');

  const displayMessage = message || t('loading', { defaultValue: 'Loading...' });

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary} />
      {showMessage && (
        <Text style={[styles.message, { color: colors.muted, marginTop: 12 }]}>
          {displayMessage}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
  },
});

