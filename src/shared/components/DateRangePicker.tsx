import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../core/contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Input from './Input';
import Button from './Button';
import spacing from '../../core/constants/spacing';
import { formatDate } from '../../core/utils/dateUtils';

interface DateRangePickerProps {
  value?: { startDate?: string; endDate?: string };
  onChange?: (value: { startDate?: string; endDate?: string } | undefined) => void;
  label?: string;
  singleDateMode?: boolean; // If true, only startDate is used (single date selection)
}

/**
 * DateRangePicker Component
 * Allows selecting a date range (start-end) or a single date
 * If singleDateMode is true, only startDate is used and endDate is ignored
 */
export default function DateRangePicker({
  value,
  onChange,
  label,
  singleDateMode = false,
}: DateRangePickerProps) {
  const { t } = useTranslation('common');
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(value?.startDate || '');
  const [tempEndDate, setTempEndDate] = useState(value?.endDate || '');

  React.useEffect(() => {
    if (modalVisible) {
      setTempStartDate(value?.startDate || '');
      setTempEndDate(value?.endDate || '');
    }
  }, [modalVisible, value]);

  const handleConfirm = () => {
    if (singleDateMode) {
      // Single date mode: only use startDate
      if (tempStartDate) {
        onChange?.({ startDate: tempStartDate, endDate: tempStartDate });
      } else {
        onChange?.(undefined);
      }
    } else {
      // Date range mode
      if (tempStartDate) {
        onChange?.({ 
          startDate: tempStartDate, 
          endDate: tempEndDate || tempStartDate 
        });
      } else {
        onChange?.(undefined);
      }
    }
    setModalVisible(false);
  };

  const handleClear = () => {
    setTempStartDate('');
    setTempEndDate('');
    onChange?.(undefined);
    setModalVisible(false);
  };

  const formatDisplayValue = () => {
    if (!value?.startDate) return '';
    
    if (singleDateMode) {
      // Single date display
      try {
        const date = new Date(value.startDate);
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      } catch {
        return value.startDate;
      }
    } else {
      // Date range display
      if (value.endDate && value.endDate !== value.startDate) {
        try {
          const start = new Date(value.startDate);
          const end = new Date(value.endDate);
          const startStr = start.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
          const endStr = end.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
          return `${startStr} - ${endStr}`;
        } catch {
          return `${value.startDate} - ${value.endDate}`;
        }
      } else {
        try {
          const date = new Date(value.startDate);
          return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
          return value.startDate;
        }
      }
    }
  };

  const displayValue = formatDisplayValue();
  const hasValue = !!value?.startDate;

  return (
    <>
      <View style={{ gap: spacing.xs }}>
        {label && (
          <Text style={[styles.label, { color: colors.text }]}>
            {typeof label === 'string' && label.includes(':') 
              ? t(label, { defaultValue: label })
              : label}
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.inputContainer,
            { 
              backgroundColor: colors.surface, 
              borderColor: colors.border,
            }
          ]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons 
            name="calendar-outline" 
            size={20} 
            color={hasValue ? colors.primary : colors.muted} 
          />
          <Text 
            style={[
              styles.inputText,
              { color: hasValue ? colors.text : colors.muted }
            ]}
          >
            {displayValue || (singleDateMode 
              ? t('common:select_date', { defaultValue: 'Tarih Seçin' })
              : t('common:select_date_range', { defaultValue: 'Tarih Aralığı Seçin' }))}
          </Text>
          {hasValue && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onChange?.(undefined);
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {singleDateMode 
                  ? t('common:select_date', { defaultValue: 'Tarih Seçin' })
                  : t('common:select_date_range', { defaultValue: 'Tarih Aralığı Seçin' })}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={{ gap: spacing.md }}>
                {/* Start Date */}
                <View style={{ gap: spacing.xs }}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    {singleDateMode 
                      ? t('common:date', { defaultValue: 'Tarih' })
                      : t('common:start_date', { defaultValue: 'Başlangıç Tarihi' })}
                  </Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="date"
                      value={tempStartDate}
                      onChange={(e) => setTempStartDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: spacing.md,
                        fontSize: 16,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 8,
                        backgroundColor: colors.page,
                        color: colors.text,
                      }}
                    />
                  ) : (
                    <Input
                      value={tempStartDate}
                      onChangeText={(text) => {
                        // Format as YYYY-MM-DD
                        const cleaned = text.replace(/[^\d-]/g, '');
                        if (cleaned.length <= 10) {
                          let formatted = cleaned;
                          if (cleaned.length > 4 && cleaned[4] !== '-') {
                            formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                          }
                          if (cleaned.length > 7 && formatted[7] !== '-') {
                            formatted = formatted.slice(0, 7) + '-' + formatted.slice(7);
                          }
                          setTempStartDate(formatted);
                        }
                      }}
                      placeholder="YYYY-MM-DD"
                      keyboardType="numeric"
                    />
                  )}
                </View>

                {/* End Date - only show if not singleDateMode */}
                {!singleDateMode && (
                  <View style={{ gap: spacing.xs }}>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>
                      {t('common:end_date', { defaultValue: 'Bitiş Tarihi' })}
                    </Text>
                    {Platform.OS === 'web' ? (
                      <input
                        type="date"
                        value={tempEndDate}
                        onChange={(e) => setTempEndDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: spacing.md,
                          fontSize: 16,
                          border: `1px solid ${colors.border}`,
                          borderRadius: 8,
                          backgroundColor: colors.page,
                          color: colors.text,
                        }}
                      />
                    ) : (
                      <Input
                        value={tempEndDate}
                        onChangeText={(text) => {
                          // Format as YYYY-MM-DD
                          const cleaned = text.replace(/[^\d-]/g, '');
                          if (cleaned.length <= 10) {
                            let formatted = cleaned;
                            if (cleaned.length > 4 && cleaned[4] !== '-') {
                              formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                            }
                            if (cleaned.length > 7 && formatted[7] !== '-') {
                              formatted = formatted.slice(0, 7) + '-' + formatted.slice(7);
                            }
                            setTempEndDate(formatted);
                          }
                        }}
                        placeholder="YYYY-MM-DD (opsiyonel)"
                        keyboardType="numeric"
                      />
                    )}
                  </View>
                )}
              </View>
            </View>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              {hasValue && (
                <Button
                  title={t('common:clear', { defaultValue: 'Temizle' })}
                  onPress={handleClear}
                  style={[styles.clearButton, { borderColor: colors.border }]}
                  textStyle={{ color: colors.text }}
                />
              )}
              <Button
                title={t('common:apply', { defaultValue: 'Uygula' })}
                onPress={handleConfirm}
                style={[styles.applyButton, { backgroundColor: colors.primary }]}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
    gap: spacing.sm,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    padding: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalBody: {
    padding: spacing.lg,
    maxHeight: 400,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  applyButton: {
    flex: 1,
  },
});

