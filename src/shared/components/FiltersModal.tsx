import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal as RNModal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../core/contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Input from './Input';
import Button from './Button';
import spacing from '../../core/constants/spacing';
import { FilterOption } from '../../core/types/screen.types';

type Props = {
  visible: boolean;
  onClose: () => void;
  value?: Record<string, any>;
  onChange?: (filters: Record<string, any> | undefined) => void;
  filterOptions?: FilterOption[];
  translationNamespace?: string;
};

export default function FiltersModal({
  visible,
  onClose,
  value = {},
  onChange,
  filterOptions = [],
  translationNamespace = 'common',
}: Props) {
  const { t } = useTranslation(translationNamespace);
  const { colors } = useTheme();
  const [tempFilters, setTempFilters] = useState<Record<string, any>>(value);

  React.useEffect(() => {
    if (visible) {
      setTempFilters(value);
    }
  }, [visible, value]);

  const updateFilter = (key: string, newValue: any) => {
    const next = { ...tempFilters };
    if (newValue === '' || newValue === null || newValue === undefined) {
      delete next[key];
    } else {
      next[key] = newValue;
    }
    setTempFilters(next);
  };

  const handleApply = () => {
    onChange?.(Object.keys(tempFilters).length ? tempFilters : undefined);
    onClose();
  };

  const handleClear = () => {
    setTempFilters({});
    onChange?.(undefined);
    onClose();
  };

  const activeFilterCount = Object.keys(tempFilters).length;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('common:filters', { defaultValue: 'Filtreler' })}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ gap: spacing.md }}>
              {filterOptions.map((option) => {
                switch (option.type) {
                  case 'select':
                    return (
                      <SelectFilterField
                        key={option.key}
                        option={option}
                        value={tempFilters[option.key]}
                        onChange={(val) => updateFilter(option.key, val)}
                        colors={colors}
                        t={t}
                      />
                    );

                  case 'date':
                    return (
                      <FilterField
                        key={option.key}
                        label={t(option.label, { defaultValue: option.label })}
                        value={tempFilters[option.key] || ''}
                        onChangeText={(text) => updateFilter(option.key, text)}
                        placeholder={t('common:date_format', { defaultValue: 'YYYY-MM-DD' })}
                        keyboardType="default"
                        colors={colors}
                      />
                    );

                  case 'number':
                    return (
                      <FilterField
                        key={option.key}
                        label={t(option.label, { defaultValue: option.label })}
                        value={tempFilters[option.key] !== undefined ? String(tempFilters[option.key]) : ''}
                        onChangeText={(text) => {
                          const numValue = text === '' ? undefined : Number(text);
                          updateFilter(option.key, isNaN(numValue as number) ? undefined : numValue);
                        }}
                        placeholder={t('common:enter_number', { defaultValue: 'Sayı giriniz' })}
                        keyboardType="numeric"
                        colors={colors}
                      />
                    );

                  case 'text':
                  default:
                    return (
                      <FilterField
                        key={option.key}
                        label={t(option.label, { defaultValue: option.label })}
                        value={tempFilters[option.key] || ''}
                        onChangeText={(text) => updateFilter(option.key, text)}
                        placeholder={t('common:enter_value', { defaultValue: 'Değer giriniz' })}
                        keyboardType="default"
                        colors={colors}
                      />
                    );
                }
              })}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            {activeFilterCount > 0 && (
              <Button
                title={t('common:clear', { defaultValue: 'Temizle' })}
                onPress={handleClear}
                style={[styles.clearButton, { borderColor: colors.border }]}
                textStyle={{ color: colors.text }}
              />
            )}
            <Button
              title={t('common:apply', { defaultValue: 'Uygula' })}
              onPress={handleApply}
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
            />
          </View>
        </View>
      </View>
    </RNModal>
  );
}

function FilterField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType: 'default' | 'numeric';
  colors: any;
}) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function SelectFilterField({
  option,
  value,
  onChange,
  colors,
  t,
}: {
  option: FilterOption;
  value: any;
  onChange: (val: any) => void;
  colors: any;
  t: (key: string, options?: any) => string;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedOption = option.options?.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : t('common:select', { defaultValue: 'Seçiniz' });

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>
        {t(option.label, { defaultValue: option.label })}
      </Text>
      <TouchableOpacity
        style={[styles.selectButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={selectedOption ? [styles.selectText, { color: colors.text }] : [styles.selectPlaceholder, { color: colors.muted }]}>
          {displayText}
        </Text>
        <Ionicons name="chevron-down-outline" size={20} color={colors.muted} />
      </TouchableOpacity>

      <RNModal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.selectModalContent, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
            <Text style={[styles.selectModalTitle, { color: colors.text }]}>
              {t(option.label, { defaultValue: option.label })}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {option.options?.map((item) => (
                <TouchableOpacity
                  key={String(item.value)}
                  style={[
                    styles.selectModalOption,
                    value === item.value && [styles.selectModalOptionSelected, { backgroundColor: colors.primary + '20' }],
                    { borderBottomColor: colors.border }
                  ]}
                  onPress={() => {
                    onChange(item.value === value ? undefined : item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.selectModalOptionText, { color: colors.text }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </RNModal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    maxHeight: 400,
    padding: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  clearButton: {
    flex: 1,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  applyButton: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  selectText: {
    fontSize: 16,
    flex: 1,
  },
  selectPlaceholder: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectModalContent: {
    borderRadius: 12,
    padding: spacing.lg,
    width: '80%',
    maxHeight: '70%',
  },
  selectModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  selectModalOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  selectModalOptionSelected: {
    borderRadius: 8,
  },
  selectModalOptionText: {
    fontSize: 16,
  },
});

