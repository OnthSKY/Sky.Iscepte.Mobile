/**
 * CustomFieldsManager - Generic component for managing dynamic custom fields
 * Works for any module (products, customers, etc.)
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../core/contexts/ThemeContext';
import Card from './Card';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import spacing from '../../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../../store/useAppStore';
import { usePermissions } from '../../core/hooks/usePermissions';
import { useNavigation } from '@react-navigation/native';
import { Role } from '../../core/config/appConstants';
import { showPermissionAlert } from '../utils/permissionUtils';
import SignatureInput from './SignatureInput';
import ImageInput from './ImageInput';
import DateTimePicker from './DateTimePicker';
import { formatDate } from '../../core/utils/dateUtils';

import { BaseCustomField, CustomFieldType } from '../types/customFields';

// Re-export for backward compatibility
export type { BaseCustomField, CustomFieldType } from '../types/customFields';

type Props<T extends BaseCustomField> = {
  customFields: T[];
  onChange: (fields: T[]) => void;
  module: string; // Module name for permission checks (e.g., 'stock', 'customers', 'sales')
  errors?: Record<string, string>; // Validation errors from form
};

export default function CustomFieldsManager<T extends BaseCustomField>({ 
  customFields, 
  onChange,
  module,
  errors = {}
}: Props<T>) {
  const { t } = useTranslation(['common', 'packages']);
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const role = useAppStore((s) => s.role);
  const permissions = usePermissions(role);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<CustomFieldType>('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Permission checks
  const canAddSpecificFields = permissions.can(`${module}:custom_fields`);
  const canEditValues = permissions.can(`${module}:custom_value`);

  const fieldTypes: Array<{ label: string; value: CustomFieldType }> = [
    { label: t('text', { defaultValue: 'Text' }), value: 'text' },
    { label: t('number', { defaultValue: 'Number' }), value: 'number' },
    { label: t('date', { defaultValue: 'Date' }), value: 'date' },
    { label: t('select', { defaultValue: 'Select' }), value: 'select' },
    { label: t('boolean', { defaultValue: 'Yes/No' }), value: 'boolean' },
    { label: t('textarea', { defaultValue: 'Text Area' }), value: 'textarea' },
    { label: t('signature', { defaultValue: 'Signature' }), value: 'signature' },
    { label: t('image', { defaultValue: 'Image' }), value: 'image' },
  ];

  const handleStartAdding = () => {
    if (!canAddSpecificFields) {
      showPermissionAlert(role, `${module}:custom_fields`, navigation, t);
      return;
    }
    setIsAdding(true);
  };

  const handleCancelAdding = () => {
    setIsAdding(false);
    setNewFieldKey('');
    setNewFieldLabel('');
    setNewFieldType('text');
    setNewFieldOptions('');
  };

  const handleAddField = () => {
    // Permission check
    if (!canAddSpecificFields) {
      return;
    }

    if (!newFieldLabel.trim()) {
      return;
    }

    // Check if field key already exists
    const fieldKeyToCheck = newFieldKey.trim() || newFieldLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
    if (customFields.find(f => f.key === fieldKeyToCheck)) {
      return;
    }

    // Prevent adding 'signature' field in purchases module (it's already in base fields)
    if (module === 'purchases' && (fieldKeyToCheck === 'signature' || newFieldLabel.trim().toLowerCase() === t('signature', { defaultValue: 'signature' }).toLowerCase())) {
      return;
    }

    // Item-specific field
    const options = newFieldType === 'select' && newFieldOptions.trim()
      ? newFieldOptions.split(',').map(opt => ({
          label: opt.trim(),
          value: opt.trim(),
        }))
      : undefined;

    const newField = {
      key: fieldKeyToCheck,
      label: newFieldLabel.trim(),
      type: newFieldType,
      value: newFieldType === 'boolean' ? false : newFieldType === 'number' ? 0 : (newFieldType === 'signature' || newFieldType === 'image' ? '' : ''),
      options,
      isGlobal: false,
    } as T;

    onChange([...customFields, newField]);

    setNewFieldKey('');
    setNewFieldLabel('');
    setNewFieldType('text');
    setNewFieldOptions('');
    setIsAdding(false);
  };

  const handleRemoveField = (key: string) => {
    onChange(customFields.filter(f => f.key !== key));
  };

  const handleUpdateFieldValue = (key: string, value: any) => {
    onChange(customFields.map(f => f.key === key ? { ...f, value } : f));
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>
            {t('custom_fields', { defaultValue: 'Custom Fields' })}
          </Text>
          <Text style={[styles.sectionInfo, { color: colors.muted, marginTop: 4 }]}>
            {t('custom_fields_info', { defaultValue: 'Add custom fields specific to this item.' })}
          </Text>
        </View>
        {!isAdding && (
          <TouchableOpacity
            onPress={handleStartAdding}
            style={[
              styles.addButton, 
              { 
                backgroundColor: canAddSpecificFields ? colors.primary : colors.muted,
                opacity: canAddSpecificFields ? 1 : 0.6,
              }
            ]}
            disabled={!canAddSpecificFields}
          >
            <Ionicons 
              name={canAddSpecificFields ? "add-outline" : "lock-closed-outline"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.addButtonText}>
              {t('add', { defaultValue: 'Add' })}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isAdding && (
        <Card style={styles.addFieldCard}>
          <View style={styles.addFieldForm}>
            {/* Field Description */}
            <View>
              <Text style={[styles.label, { color: colors.text }]}>
                {t('field_description', { defaultValue: 'Field Description' })} *
              </Text>
              <Text style={[styles.hint, { color: colors.muted }]}>
                {t('field_description_hint', { defaultValue: 'Description for this item-specific field' })}
              </Text>
              <Input
                value={newFieldLabel}
                onChangeText={(text) => {
                  setNewFieldLabel(text);
                  const autoKey = text.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '_')
                    .replace(/^_+|_+$/g, '');
                  setNewFieldKey(autoKey || '');
                }}
                placeholder={t('field_description_placeholder', { defaultValue: 'E.g., Special Note, Additional Info...' })}
              />
            </View>

            {/* Field Type and Options */}
            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {t('field_type', { defaultValue: 'Field Type' })}
                </Text>
                <Select
                  value={newFieldType}
                  options={fieldTypes.map(ft => ({ label: ft.label, value: ft.value }))}
                  onChange={(val) => {
                    setNewFieldType(val as CustomFieldType);
                    setNewFieldOptions('');
                  }}
                />
              </View>
              {newFieldType === 'select' && (
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {t('field_options', { defaultValue: 'Options' })}
                  </Text>
                  <Input
                    value={newFieldOptions}
                    onChangeText={setNewFieldOptions}
                    placeholder="Option1, Option2, Option3"
                  />
                </View>
              )}
            </View>

            <View style={styles.formActions}>
              <Button
                title={t('cancel', { defaultValue: 'Cancel' })}
                onPress={handleCancelAdding}
                style={[styles.actionButton, { backgroundColor: colors.muted }]}
              />
              <Button
                title={t('add', { defaultValue: 'Add' })}
                onPress={handleAddField}
                style={styles.actionButton}
              />
            </View>
          </View>
        </Card>
      )}

      {/* Custom Fields Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('custom_fields', { defaultValue: 'Custom Fields' })}
            </Text>
            <Text style={[styles.sectionInfo, { color: colors.muted }]}>
              {t('item_specific_fields_info', { defaultValue: 'Fields specific to this item only. These fields will not appear on other items.' })}
            </Text>
          </View>
        </View>

        {customFields.length > 0 && (
          <View style={styles.fieldsList}>
            {customFields.map((field) => (
              <Card key={field.key} style={styles.fieldCard}>
                <View style={styles.fieldHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>
                      {field.label}
                    </Text>
                    <Text style={[styles.fieldKey, { color: colors.muted }]}>
                      {field.key}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      if (!canAddSpecificFields) {
                        showPermissionAlert(role, `${module}:custom_fields`, navigation, t);
                        return;
                      }
                      handleRemoveField(field.key);
                    }}
                    style={[
                      styles.removeButton, 
                      { 
                        backgroundColor: canAddSpecificFields ? '#EF4444' : colors.muted,
                        opacity: canAddSpecificFields ? 1 : 0.6,
                      }
                    ]}
                  >
                    <Ionicons 
                      name={canAddSpecificFields ? "trash-outline" : "lock-closed-outline"} 
                      size={18} 
                      color="#fff" 
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.fieldValue}>
                    {renderFieldInput(
                      field,
                      (value) => {
                        if (!canEditValues) {
                          showPermissionAlert(role, `${module}:custom_value`, navigation, t);
                          return;
                        }
                        handleUpdateFieldValue(field.key, value);
                      },
                      colors,
                      canEditValues,
                      field.key
                    )}
                    {errors[`customField_${field.key}`] && (
                      <Text style={{ fontSize: 12, color: colors.error, marginTop: spacing.xs }}>
                        {errors[`customField_${field.key}`]}
                      </Text>
                    )}
                    {!canEditValues && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs }}>
                        <Ionicons name="lock-closed-outline" size={14} color={colors.muted} />
                        <Text style={{ color: colors.muted, fontSize: 11 }}>
                          {t('permission_required_hint', { 
                            defaultValue: 'Bu alanı düzenlemek için {{module}}:custom_value yetkisi gereklidir',
                            module: module
                          })}
                        </Text>
                      </View>
                    )}
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function renderFieldInput(
  field: BaseCustomField,
  onChange: (value: any) => void,
  colors: any,
  editable: boolean = true,
  fieldKey?: string
) {
  switch (field.type) {
    case 'text':
      return (
        <Input
          value={field.value != null ? String(field.value) : ''}
          onChangeText={onChange}
          placeholder={field.label}
          editable={editable}
        />
      );
    case 'textarea':
      return (
        <Input
          value={field.value != null ? String(field.value) : ''}
          onChangeText={onChange}
          placeholder={field.label}
          multiline
          numberOfLines={4}
          editable={editable}
        />
      );
    case 'number':
      return (
        <Input
          value={field.value != null ? String(field.value) : ''}
          onChangeText={(val) => {
            const numVal = val ? parseFloat(val) : null;
            onChange(isNaN(numVal as number) ? 0 : numVal);
          }}
          keyboardType="numeric"
          placeholder="0"
          editable={editable}
        />
      );
    case 'date':
      return (
        <CustomDateFieldWrapper
          value={field.value != null ? String(field.value) : ''}
          onChange={onChange}
          placeholder="YYYY-MM-DD"
          label={field.label}
          editable={editable}
          fieldKey={fieldKey || field.key}
        />
      );
    case 'select':
      return (
        <Select
          value={field.value != null ? String(field.value) : ''}
          options={field.options || []}
          onChange={onChange}
          disabled={!editable}
        />
      );
    case 'boolean':
      const boolValue = field.value === true || field.value === 'true';
      return (
        <View style={{ flexDirection: 'row', gap: spacing.sm, opacity: editable ? 1 : 0.6 }}>
          <TouchableOpacity
            onPress={() => onChange(true)}
            disabled={!editable}
            style={{
              flex: 1,
              padding: spacing.sm,
              borderRadius: 8,
              backgroundColor: boolValue ? colors.primary : colors.surface,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: boolValue ? '#fff' : colors.text }}>
              {field.options?.[0]?.label || 'Yes'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onChange(false)}
            disabled={!editable}
            style={{
              flex: 1,
              padding: spacing.sm,
              borderRadius: 8,
              backgroundColor: !boolValue ? colors.muted : colors.surface,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: !boolValue ? '#fff' : colors.text }}>
              {field.options?.[1]?.label || 'No'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    case 'signature':
      return (
        <SignatureInput
          value={field.value != null ? String(field.value) : ''}
          onChange={onChange}
          placeholder={field.label}
          disabled={!editable}
        />
      );
    case 'image':
      return (
        <ImageInput
          value={field.value != null ? String(field.value) : ''}
          onChange={onChange}
          placeholder={field.label}
          disabled={!editable}
        />
      );
    default:
      return null;
  }
}

// CustomDateFieldWrapper component for custom date fields with DateTimePicker
function CustomDateFieldWrapper({
  value,
  onChange,
  placeholder,
  label,
  editable = true,
  fieldKey,
}: {
  value: string;
  onChange: (value: any) => void;
  placeholder: string;
  label: string;
  editable?: boolean;
  fieldKey: string;
}) {
  const [dateTimePickerVisible, setDateTimePickerVisible] = useState(false);
  const { colors } = useTheme();
  const todayDate = formatDate(new Date());
  
  const displayDateTime = useMemo(() => {
    if (!value) return '';
    return value;
  }, [value]);

  if (!editable) {
    return (
      <Input
        value={displayDateTime}
        editable={false}
        placeholder={placeholder}
      />
    );
  }

  return (
    <>
      <TouchableOpacity onPress={() => setDateTimePickerVisible(true)}>
        <Input
          value={displayDateTime}
          editable={false}
          pointerEvents="none"
          placeholder={placeholder || todayDate}
          style={{ backgroundColor: colors.surface, color: colors.text }}
        />
      </TouchableOpacity>
      <DateTimePicker
        visible={dateTimePickerVisible}
        onClose={() => setDateTimePickerVisible(false)}
        value={displayDateTime || todayDate}
        onConfirm={(dateTime: string) => {
          onChange(dateTime);
          setDateTimePickerVisible(false);
        }}
        label={label}
        showTime={true}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  addFieldCard: {
    padding: spacing.md,
  },
  addFieldForm: {
    gap: spacing.md,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: 11,
    marginBottom: spacing.xs,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  fieldsList: {
    gap: spacing.md,
  },
  fieldCard: {
    padding: spacing.md,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  fieldKey: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  removeButton: {
    padding: spacing.sm,
    borderRadius: 8,
  },
  fieldValue: {
    marginTop: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  sectionInfo: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  globalBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: 8,
  },
  globalBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  requiredBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: 8,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fieldScopeRow: {
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  scopeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  scopeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  scopeOptionDesc: {
    fontSize: 12,
  },
  scopeTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  scopeInfo: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

