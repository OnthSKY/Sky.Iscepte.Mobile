/**
 * ErrorState Component
 * 
 * Single Responsibility: Displays error state UI
 * Open/Closed: Can be extended with custom error messages and actions
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../core/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getErrorMessage, errorMessages } from '../../core/utils/errorUtils';
import Button from './Button';

export interface ErrorStateProps {
  /**
   * Error object or message string
   */
  error: Error | string | unknown;
  
  /**
   * Optional title for the error
   */
  title?: string;
  
  /**
   * Optional retry function
   */
  onRetry?: () => void;
  
  /**
   * Optional custom message
   */
  message?: string;
  
  /**
   * Whether to show retry button
   * @default true (if onRetry is provided)
   */
  showRetry?: boolean;
}

/**
 * Reusable error state component
 */
export default function ErrorState({
  error,
  title,
  onRetry,
  message,
  showRetry,
}: ErrorStateProps) {
  const { colors } = useTheme();
  const { t } = useTranslation('common');

  const errorMessage = message || getErrorMessage(error);
  const displayTitle = title || t('error_occurred', { defaultValue: 'An error occurred' });
  const shouldShowRetry = showRetry !== false && !!onRetry;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>
        {displayTitle}
      </Text>
      
      <Text style={[styles.message, { color: colors.muted }]}>
        {errorMessage}
      </Text>

      {shouldShowRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.retryButtonText}>
            {t('retry', { defaultValue: 'Retry' })}
          </Text>
        </TouchableOpacity>
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
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

