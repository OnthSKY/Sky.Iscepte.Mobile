/**
 * TC Kimlik Verification Field Component
 * Collects TC No, Birth Date, and Full Name, then verifies
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';
import Input from './Input';
import { VerificationResult, TCVerificationRequest, TCVerificationResponse } from '../types/verification.types';
import { useVerificationCacheStore } from '../store/verificationCacheStore';
import { verificationService } from '../services/verificationService';
import VerificationResultIndicator from './VerificationResultIndicator';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface TCKimlikVerificationFieldProps {
  value: string;
  onChange: (value: string) => void;
  onVerificationComplete?: (result: VerificationResult) => void;
  onAutoFill?: (data: { firstName?: string; lastName?: string }) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function TCKimlikVerificationField({
  value,
  onChange,
  onVerificationComplete,
  onAutoFill,
  placeholder,
  disabled = false,
}: TCKimlikVerificationFieldProps) {
  const { t } = useTranslation(['common', 'employees']);
  const { colors } = useTheme();
  const { getCachedResult, setCachedResult, generateCacheKey } = useVerificationCacheStore();

  const [birthDate, setBirthDate] = useState('');
  const [fullName, setFullName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  // Check cache when TC, birthDate, or fullName changes
  useEffect(() => {
    if (value && value.length === 11 && birthDate && fullName.trim()) {
      const request: TCVerificationRequest = {
        tcNo: value,
        birthDate,
        fullName: fullName.trim(),
      };
      const cacheKey = generateCacheKey('tc', request);
      const cached = getCachedResult(cacheKey);
      
      if (cached) {
        setVerificationResult(cached);
        if (onVerificationComplete) {
          onVerificationComplete(cached);
        }
      } else {
        // Clear previous result if fields changed
        setVerificationResult(null);
      }
    } else {
      setVerificationResult(null);
    }
  }, [value, birthDate, fullName, getCachedResult, generateCacheKey, onVerificationComplete]);

  const handleVerify = async () => {
    if (!value || value.length !== 11 || !/^\d+$/.test(value)) {
      return;
    }

    if (!birthDate || !fullName.trim()) {
      return;
    }

    const request: TCVerificationRequest = {
      tcNo: value,
      birthDate,
      fullName: fullName.trim(),
    };

    const cacheKey = generateCacheKey('tc', request);
    const cached = getCachedResult(cacheKey);
    
    if (cached) {
      setVerificationResult(cached);
      if (onVerificationComplete) {
        onVerificationComplete(cached);
      }
      return;
    }

    try {
      setVerifying(true);
      const response = await verificationService.verifyTC(request);
      
      const result: VerificationResult = {
        type: 'tc',
        status: response.valid ? 'success' : 'failed',
        request,
        response,
        timestamp: Date.now(),
        cacheKey,
      };

      await setCachedResult(result);
      setVerificationResult(result);

      if (onVerificationComplete) {
        onVerificationComplete(result);
      }

      // Auto-fill if successful
      if (response.valid && onAutoFill && response.firstName && response.lastName) {
        onAutoFill({
          firstName: response.firstName,
          lastName: response.lastName,
        });
      }
    } catch (error: any) {
      const result: VerificationResult = {
        type: 'tc',
        status: 'failed',
        request,
        response: {
          valid: false,
          tcNo: value,
          message: error.message || t('employees:verification_error', { defaultValue: 'Doğrulama hatası' }),
        },
        timestamp: Date.now(),
        cacheKey,
      };
      
      await setCachedResult(result);
      setVerificationResult(result);
      
      if (onVerificationComplete) {
        onVerificationComplete(result);
      }
    } finally {
      setVerifying(false);
    }
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Input
        value={value}
        onChangeText={onChange}
        placeholder={placeholder || t('employees:tc_kimlik', { defaultValue: 'TC Kimlik No' })}
        keyboardType="numeric"
        maxLength={11}
        editable={!disabled}
      />

      {value && value.length === 11 && (
        <>
          <View style={styles.requiredFields}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('employees:verification_required_fields', { defaultValue: 'Doğrulama için gerekli bilgiler' })}
            </Text>
            
            <View style={styles.fieldRow}>
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {t('employees:birth_date', { defaultValue: 'Doğum Tarihi' })}
                  <Text style={{ color: colors.error }}> *</Text>
                </Text>
                <Input
                  value={birthDate}
                  onChangeText={setBirthDate}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numeric"
                  maxLength={10}
                  editable={!disabled && !verifying}
                />
              </View>
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  {t('employees:full_name', { defaultValue: 'Tam İsim' })}
                  <Text style={{ color: colors.error }}> *</Text>
                </Text>
                <Input
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={t('employees:full_name_placeholder', { defaultValue: 'Ad Soyad' })}
                  editable={!disabled && !verifying}
                />
              </View>
            </View>

            {birthDate && fullName.trim() && (
              <View style={styles.verifyButtonContainer}>
                <VerificationResultIndicator
                  result={verificationResult}
                  verifying={verifying}
                  onVerify={handleVerify}
                  disabled={disabled}
                />
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  requiredFields: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  fieldRow: {
    gap: spacing.xs,
  },
  fieldContainer: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  verifyButtonContainer: {
    marginTop: spacing.xs,
  },
});

