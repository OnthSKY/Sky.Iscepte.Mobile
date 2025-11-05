/**
 * Verification Result Indicator Component
 * Shows green (success) or red (failed) visual indicator
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { VerificationResult } from '../types/verification.types';

interface VerificationResultIndicatorProps {
  result: VerificationResult | null;
  verifying: boolean;
  onVerify: () => void;
  disabled?: boolean;
}

export default function VerificationResultIndicator({
  result,
  verifying,
  onVerify,
  disabled = false,
}: VerificationResultIndicatorProps) {
  const { t } = useTranslation(['common', 'employees']);
  const { colors } = useTheme();

  const styles = getStyles(colors);

  if (verifying) {
    return (
      <View style={[styles.container, styles.verifyingContainer]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.text, { color: colors.text }]}>
          {t('employees:verifying', { defaultValue: 'Doğrulanıyor...' })}
        </Text>
      </View>
    );
  }

  if (result) {
    const isSuccess = result.status === 'success' || result.status === 'cached';
    const isCached = result.status === 'cached';
    
    if (isSuccess) {
      return (
        <View style={[styles.container, styles.successContainer, { backgroundColor: colors.success + '15', borderColor: colors.success }]}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={[styles.text, { color: colors.success }]}>
            {isCached 
              ? t('employees:verification_cached', { defaultValue: 'Daha önce doğrulandı ✓' })
              : t('employees:verification_success', { defaultValue: 'Doğrulama başarılı ✓' })
            }
          </Text>
        </View>
      );
    } else {
      const message = result.response?.message || t('employees:verification_failed', { defaultValue: 'Doğrulama başarısız' });
      return (
        <View style={[styles.container, styles.failedContainer, { backgroundColor: colors.error + '15', borderColor: colors.error }]}>
          <Ionicons name="close-circle" size={20} color={colors.error} />
          <View style={styles.messageContainer}>
            <Text style={[styles.text, { color: colors.error }]}>
              {t('employees:verification_failed', { defaultValue: 'Doğrulama başarısız ✗' })}
            </Text>
            {message && (
              <Text style={[styles.messageText, { color: colors.error }]}>
                {message}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={onVerify}
            disabled={disabled}
            style={[styles.retryButton, { backgroundColor: colors.error }]}
          >
            <Text style={styles.retryButtonText}>
              {t('common:retry', { defaultValue: 'Tekrar Dene' })}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  }

  // No verification yet - show verify button
  return (
    <TouchableOpacity
      onPress={onVerify}
      disabled={disabled}
      style={[styles.verifyButton, { backgroundColor: colors.primary }]}
    >
      <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
      <Text style={styles.verifyButtonText}>
        {t('employees:verify', { defaultValue: 'Doğrula' })}
      </Text>
    </TouchableOpacity>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.sm,
  },
  verifyingContainer: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  successContainer: {
    borderWidth: 1.5,
  },
  failedContainer: {
    borderWidth: 1.5,
    flexWrap: 'wrap',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  messageText: {
    fontSize: 11,
    fontWeight: '400',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    gap: spacing.xs,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  retryButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    marginLeft: spacing.xs,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});

