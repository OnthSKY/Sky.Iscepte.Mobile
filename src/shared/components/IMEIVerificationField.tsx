/**
 * IMEI Verification Field Component
 * Collects IMEI and optional fields, then verifies
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';
import Input from './Input';
import { VerificationResult, IMEIVerificationRequest, IMEIVerificationResponse } from '../types/verification.types';
import { useVerificationCacheStore } from '../store/verificationCacheStore';
import { verificationService } from '../services/verificationService';
import VerificationResultIndicator from './VerificationResultIndicator';

interface IMEIVerificationFieldProps {
  value: string;
  onChange: (value: string) => void;
  onVerificationComplete?: (result: VerificationResult) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function IMEIVerificationField({
  value,
  onChange,
  onVerificationComplete,
  placeholder,
  disabled = false,
}: IMEIVerificationFieldProps) {
  const { t } = useTranslation(['common', 'employees']);
  const { colors } = useTheme();
  const { getCachedResult, setCachedResult, generateCacheKey } = useVerificationCacheStore();

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  // Check cache when IMEI changes
  useEffect(() => {
    if (value && value.length === 15) {
      const request: IMEIVerificationRequest = {
        imei: value,
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
      };
      const cacheKey = generateCacheKey('imei', request);
      const cached = getCachedResult(cacheKey);
      
      if (cached) {
        setVerificationResult(cached);
        if (onVerificationComplete) {
          onVerificationComplete(cached);
        }
      } else {
        setVerificationResult(null);
      }
    } else {
      setVerificationResult(null);
    }
  }, [value, brand, model, serialNumber, getCachedResult, generateCacheKey, onVerificationComplete]);

  const handleVerify = async () => {
    if (!value || value.length !== 15 || !/^\d+$/.test(value)) {
      return;
    }

    const request: IMEIVerificationRequest = {
      imei: value,
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      serialNumber: serialNumber.trim() || undefined,
    };

    const cacheKey = generateCacheKey('imei', request);
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
      const response = await verificationService.verifyIMEI(request);
      
      const result: VerificationResult = {
        type: 'imei',
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
    } catch (error: any) {
      const result: VerificationResult = {
        type: 'imei',
        status: 'failed',
        request,
        response: {
          valid: false,
          imei: value,
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
        placeholder={placeholder || t('employees:imei', { defaultValue: 'IMEI' })}
        keyboardType="numeric"
        maxLength={15}
        editable={!disabled}
      />

      {value && value.length === 15 && (
        <View style={styles.optionalFields}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('employees:optional_verification_fields', { defaultValue: 'Opsiyonel doğrulama bilgileri' })}
          </Text>
          
          <View style={styles.fieldRow}>
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                {t('employees:brand', { defaultValue: 'Marka' })}
              </Text>
              <Input
                value={brand}
                onChangeText={setBrand}
                placeholder={t('employees:brand_placeholder', { defaultValue: 'Örn: Samsung' })}
                editable={!disabled && !verifying}
              />
            </View>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                {t('employees:model', { defaultValue: 'Model' })}
              </Text>
              <Input
                value={model}
                onChangeText={setModel}
                placeholder={t('employees:model_placeholder', { defaultValue: 'Örn: Galaxy S21' })}
                editable={!disabled && !verifying}
              />
            </View>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                {t('employees:serial_number', { defaultValue: 'Seri No' })}
              </Text>
              <Input
                value={serialNumber}
                onChangeText={setSerialNumber}
                placeholder={t('employees:serial_number_placeholder', { defaultValue: 'Seri numarası' })}
                editable={!disabled && !verifying}
              />
            </View>
          </View>

          <View style={styles.verifyButtonContainer}>
            <VerificationResultIndicator
              result={verificationResult}
              verifying={verifying}
              onVerify={handleVerify}
              disabled={disabled}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  optionalFields: {
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

