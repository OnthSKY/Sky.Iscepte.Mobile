import React from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import spacing from '../../core/constants/spacing';
import { useTheme } from '../../core/contexts/ThemeContext';
import { FilterOption } from '../../core/types/screen.types';

type Props = {
  value?: Record<string, any>;
  onChange?: (filters: Record<string, any> | undefined) => void;
  filterOptions?: FilterOption[];
  translationNamespace?: string;
};

export default function FiltersEditor({ 
  value, 
  onChange, 
  filterOptions,
  translationNamespace = 'common'
}: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation(translationNamespace);
  const filters = React.useMemo(() => ({ ...(value || {}) }), [value]);

  // If filterOptions provided, use dynamic filters
  if (filterOptions && filterOptions.length > 0) {
    return <DynamicFiltersEditor 
      value={filters} 
      onChange={onChange}
      filterOptions={filterOptions}
      colors={colors}
      t={t}
    />;
  }

  // Fallback to legacy manual key-value editor
  return <ManualFiltersEditor 
    value={filters} 
    onChange={onChange}
    colors={colors}
    placeholderKey={t('common:filter_field', { defaultValue: 'Alan' })}
    placeholderValue={t('common:filter_value', { defaultValue: 'Değer' })}
  />;
}

/**
 * Dynamic Filters Editor - Renders filters based on config
 */
function DynamicFiltersEditor({ 
  value, 
  onChange, 
  filterOptions,
  colors,
  t
}: {
  value: Record<string, any>;
  onChange?: (filters: Record<string, any> | undefined) => void;
  filterOptions: FilterOption[];
  colors: any;
  t: (key: string, options?: any) => string;
}) {
  const updateFilter = (key: string, newValue: any) => {
    const next = { ...value };
    if (newValue === '' || newValue === null || newValue === undefined) {
      delete next[key];
    } else {
      next[key] = newValue;
    }
    onChange?.(Object.keys(next).length ? next : undefined);
  };

  const removeFilter = (key: string) => {
    const next = { ...value };
    delete next[key];
    onChange?.(Object.keys(next).length ? next : undefined);
  };

  const styles = getStyles(colors);

  return (
    <View style={{ gap: spacing.md }}>
      {/* Active Filters */}
      {Object.keys(value).length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {Object.entries(value).map(([key, val]) => {
            const filterOption = filterOptions.find(opt => opt.key === key);
            const label = filterOption?.label || key;
            const displayValue = filterOption?.type === 'select' 
              ? filterOption.options?.find(opt => opt.value === val)?.label || val
              : String(val);
            
            return (
              <TouchableOpacity
                key={key}
                onPress={() => removeFilter(key)}
                style={styles.filterChip}
              >
                <Text style={styles.filterChipText}>
                  {t(label, { defaultValue: label })}: {displayValue} ×
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            onPress={() => onChange?.(undefined)}
            style={[styles.filterChip, { backgroundColor: colors.error + '20' }]}
          >
            <Text style={[styles.filterChipText, { color: colors.error }]}>
              {t('common:clear_all', { defaultValue: 'Tümünü Temizle' })}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Inputs */}
      <View style={{ gap: spacing.sm }}>
        {filterOptions.map((option) => {
          const currentValue = value[option.key];

          switch (option.type) {
            case 'select':
              return (
                <SelectFilter
                  key={option.key}
                  option={option}
                  value={currentValue}
                  onChange={(val) => updateFilter(option.key, val)}
                  colors={colors}
                  t={t}
                />
              );

            case 'date':
              return (
                <View key={option.key} style={{ gap: spacing.xs }}>
                  <Text style={styles.filterLabel}>
                    {t(option.label, { defaultValue: option.label })}
                  </Text>
                  <TextInput
                    value={currentValue || ''}
                    onChangeText={(text) => updateFilter(option.key, text)}
                    placeholder={t('common:date_format', { defaultValue: 'YYYY-MM-DD' })}
                    style={styles.filterInput}
                    placeholderTextColor={colors.muted}
                    keyboardType="default"
                  />
                </View>
              );

            case 'number':
              return (
                <View key={option.key} style={{ gap: spacing.xs }}>
                  <Text style={styles.filterLabel}>
                    {t(option.label, { defaultValue: option.label })}
                  </Text>
                  <TextInput
                    value={currentValue !== undefined ? String(currentValue) : ''}
                    onChangeText={(text) => {
                      const numValue = text === '' ? undefined : Number(text);
                      updateFilter(option.key, isNaN(numValue as number) ? undefined : numValue);
                    }}
                    placeholder={t('common:enter_number', { defaultValue: 'Sayı giriniz' })}
                    style={styles.filterInput}
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                  />
                </View>
              );

            case 'text':
            default:
              return (
                <View key={option.key} style={{ gap: spacing.xs }}>
                  <Text style={styles.filterLabel}>
                    {t(option.label, { defaultValue: option.label })}
                  </Text>
                  <TextInput
                    value={currentValue || ''}
                    onChangeText={(text) => updateFilter(option.key, text)}
                    placeholder={t('common:enter_value', { defaultValue: 'Değer giriniz' })}
                    style={styles.filterInput}
                    placeholderTextColor={colors.muted}
                  />
                </View>
              );
          }
        })}
      </View>
    </View>
  );
}

/**
 * Select Filter Component - Modal dropdown for select type filters
 */
function SelectFilter({
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
  const [modalVisible, setModalVisible] = React.useState(false);
  const styles = getStyles(colors);
  const selectedOption = option.options?.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : t('common:select', { defaultValue: 'Seçiniz' });

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={styles.filterLabel}>
        {t(option.label, { defaultValue: option.label })}
      </Text>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={selectedOption ? styles.selectText : styles.selectPlaceholder}>
          {displayText}
        </Text>
        <Text style={styles.selectArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
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
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>
              {t(option.label, { defaultValue: option.label })}
            </Text>
            <FlatList
              data={option.options || []}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    value === item.value && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    onChange(item.value === value ? undefined : item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ListFooterComponent={
                <TouchableOpacity
                  style={[styles.modalOption, { borderBottomWidth: 0 }]}
                  onPress={() => {
                    onChange(undefined);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, { color: colors.muted }]}>
                    {t('common:clear', { defaultValue: 'Temizle' })}
                  </Text>
                </TouchableOpacity>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

/**
 * Manual Filters Editor - Legacy key-value editor
 */
function ManualFiltersEditor({ 
  value, 
  onChange, 
  colors,
  placeholderKey,
  placeholderValue
}: {
  value: Record<string, any>;
  onChange?: (filters: Record<string, any> | undefined) => void;
  colors: any;
  placeholderKey: string;
  placeholderValue: string;
}) {
  const [keyText, setKeyText] = React.useState('');
  const [valText, setValText] = React.useState('');
  const filters = React.useMemo(() => ({ ...value }), [value]);
  const styles = getStyles(colors);

  const add = () => {
    if (!keyText) return;
    const next = { ...filters };
    next[keyText] = valText;
    onChange?.(next);
    setKeyText('');
    setValText('');
  };

  const remove = (k: string) => {
    const next = { ...filters };
    delete next[k];
    onChange?.(Object.keys(next).length ? next : undefined);
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <TextInput
          value={keyText}
          onChangeText={setKeyText}
          placeholder={placeholderKey}
          style={styles.filterInput}
          placeholderTextColor={colors.muted}
        />
        <TextInput
          value={valText}
          onChangeText={setValText}
          placeholder={placeholderValue}
          style={styles.filterInput}
          placeholderTextColor={colors.muted}
        />
        <TouchableOpacity 
          onPress={add} 
          style={styles.addButton}
        >
          <Text style={{ color: colors.primary, fontWeight: '500' }}>
            {placeholderKey.includes('Alan') ? 'Ekle' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {Object.entries(filters).map(([k, v]) => (
          <TouchableOpacity 
            key={k} 
            onPress={() => remove(k)} 
            style={styles.filterChip}
          >
            <Text style={styles.filterChipText}>{k}: {String(v)} ×</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  filterInput: {
    flex: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  filterChip: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  filterChipText: {
    color: colors.text,
    fontSize: 14,
  },
  addButton: {
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButton: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    color: colors.text,
    flex: 1,
  },
  selectPlaceholder: {
    color: colors.muted,
    flex: 1,
  },
  selectArrow: {
    color: colors.muted,
    fontSize: 16,
    marginLeft: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionText: {
    color: colors.text,
    fontSize: 16,
  },
  modalOptionSelected: {
    backgroundColor: colors.primary + '20',
  },
});
