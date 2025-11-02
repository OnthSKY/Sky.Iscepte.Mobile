/**
 * CustomFieldsManager - Generic component for managing dynamic custom fields
 * Works for any module (products, customers, etc.)
 */

import React, { useState } from 'react';
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
import { generateFieldName, normalizeFieldName, getFieldNameExample } from '../utils/fieldNameUtils';

import { BaseCustomField, CustomFieldType } from '../types/customFields';

// Re-export for backward compatibility
export type { BaseCustomField, CustomFieldType } from '../types/customFields';

type Props<T extends BaseCustomField> = {
  customFields: T[];
  onChange: (fields: T[]) => void;
  availableGlobalFields?: T[];
  onGlobalFieldsChange?: (fields: T[]) => void;
  module: string; // Module name for permission checks (e.g., 'stock', 'customers', 'sales')
  errors?: Record<string, string>; // Validation errors from form
};

export default function CustomFieldsManager<T extends BaseCustomField>({ 
  customFields, 
  onChange,
  availableGlobalFields = [],
  onGlobalFieldsChange,
  module,
  errors = {}
}: Props<T>) {
  const { t } = useTranslation('common');
  const { colors } = useTheme();
  const role = useAppStore((s) => s.role);
  const permissions = usePermissions(role);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<CustomFieldType>('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isGlobalField, setIsGlobalField] = useState(false);
  const [addStep, setAddStep] = useState<'scope' | 'form' | null>(null);

  // Permission checks
  const canManageGlobalFields = permissions.can(`${module}:custom_form`);
  const canAddSpecificFields = permissions.can(`${module}:custom_fields`);
  const canEditValues = permissions.can(`${module}:custom_value`);

  const fieldTypes: Array<{ label: string; value: CustomFieldType }> = [
    { label: t('text', { defaultValue: 'Text' }), value: 'text' },
    { label: t('number', { defaultValue: 'Number' }), value: 'number' },
    { label: t('date', { defaultValue: 'Date' }), value: 'date' },
    { label: t('select', { defaultValue: 'Select' }), value: 'select' },
    { label: t('boolean', { defaultValue: 'Yes/No' }), value: 'boolean' },
    { label: t('textarea', { defaultValue: 'Text Area' }), value: 'textarea' },
  ];

  // Check if user can add fields (either global or specific)
  const canAddFields = canManageGlobalFields || canAddSpecificFields;

  const handleStartAdding = () => {
    if (canManageGlobalFields && !canAddSpecificFields) {
      setIsGlobalField(true);
      setAddStep('form');
    } else if (!canManageGlobalFields && canAddSpecificFields) {
      setIsGlobalField(false);
      setAddStep('form');
    } else {
      setAddStep('scope');
    }
    setIsAdding(true);
  };

  const handleCancelAdding = () => {
    setIsAdding(false);
    setAddStep(null);
    setNewFieldKey('');
    setNewFieldLabel('');
    setNewFieldType('text');
    setNewFieldOptions('');
    setNewFieldRequired(false);
    setIsGlobalField(false);
  };

  const handleAddField = () => {
    // Permission check
    if (isGlobalField && !canManageGlobalFields) {
      return;
    }
    if (!isGlobalField && !canAddSpecificFields) {
      return;
    }

    if (isGlobalField) {
      if (!newFieldKey.trim() || !newFieldLabel.trim()) {
        return;
      }
    } else {
      if (!newFieldLabel.trim()) {
        return;
      }
    }

    // Check if field key already exists
    const allFields = [...customFields, ...availableGlobalFields];
    const fieldKeyToCheck = isGlobalField ? newFieldKey.trim() : (newFieldKey.trim() || newFieldLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'));
    if (allFields.find(f => f.key === fieldKeyToCheck)) {
      return;
    }

    if (isGlobalField) {
      // Global field - type and options required
      const options = newFieldType === 'select' && newFieldOptions.trim()
        ? newFieldOptions.split(',').map(opt => ({
            label: opt.trim(),
            value: opt.trim(),
          }))
        : undefined;

      const newField = {
        key: newFieldKey.trim(),
        label: newFieldLabel.trim(),
        type: newFieldType,
        value: newFieldType === 'boolean' ? false : newFieldType === 'number' ? 0 : '',
        options,
        isGlobal: true,
        required: newFieldRequired,
      } as T;

      if (onGlobalFieldsChange) {
        onGlobalFieldsChange([...availableGlobalFields, newField]);
        onChange([...customFields, { ...newField, isGlobal: true } as T]);
      }
    } else {
      // Item-specific field - only label and value, no type
      const newField = {
        key: newFieldKey.trim(),
        label: newFieldLabel.trim(),
        type: 'text',
        value: '',
        isGlobal: false,
      } as T;

      onChange([...customFields, newField]);
    }

    setNewFieldKey('');
    setNewFieldLabel('');
    setNewFieldType('text');
    setNewFieldOptions('');
    setNewFieldRequired(false);
    setIsGlobalField(false);
    setIsAdding(false);
    setAddStep(null);
  };

  const handleRemoveField = (key: string) => {
    onChange(customFields.filter(f => f.key !== key));
  };

  const handleUpdateFieldValue = (key: string, value: any) => {
    onChange(customFields.map(f => f.key === key ? { ...f, value } : f));
  };

  // Separate global and item-specific fields
  const specificFields = customFields.filter(f => !f.isGlobal);
  const globalFields = customFields.filter(f => f.isGlobal);

  return (
    <View style={styles.container}>
      <View style={styles.mainHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>
            {t('custom_fields', { defaultValue: 'Custom Fields' })}
          </Text>
          <Text style={[styles.sectionInfo, { color: colors.muted, marginTop: 4 }]}>
            {t('custom_fields_info', { defaultValue: 'Manage global and item-specific fields.' })}
          </Text>
        </View>
        {canAddFields && !isAdding && (
          <TouchableOpacity
            onPress={handleStartAdding}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add-outline" size={20} color="#fff" />
            <Text style={styles.addButtonText}>
              {t('add', { defaultValue: 'Add' })}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isAdding && (
        <Card style={styles.addFieldCard}>
          {addStep === 'scope' && (
            <View>
              <Text style={[styles.scopeTitle, { color: colors.text }]}>
                {t('select_field_scope', { defaultValue: 'Select Field Scope' })}
              </Text>
              <Text style={[styles.scopeInfo, { color: colors.muted }]}>
                {t('select_field_scope_info', { defaultValue: 'Choose whether to create a reusable global field or a field specific to this item.' })}
              </Text>

              <View style={styles.fieldScopeRow}>
                {canManageGlobalFields && (
                  <TouchableOpacity
                    onPress={() => {
                      setIsGlobalField(true);
                      setAddStep('form');
                    }}
                    style={[styles.scopeOption, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <Ionicons name="earth" size={24} color={colors.primary} />
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <Text style={[styles.scopeOptionTitle, { color: colors.text }]}>
                        {t('global_field', { defaultValue: 'Global Field' })}
                      </Text>
                      <Text style={[styles.scopeOptionDesc, { color: colors.muted }]}>
                        {t('global_field_desc', { defaultValue: 'Reusable field for all items.' })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                {canAddSpecificFields && (
                  <TouchableOpacity
                    onPress={() => {
                      setIsGlobalField(false);
                      setAddStep('form');
                    }}
                    style={[styles.scopeOption, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <Ionicons name="document-text" size={24} color={colors.primary} />
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <Text style={[styles.scopeOptionTitle, { color: colors.text }]}>
                        {t('item_specific_field', { defaultValue: 'Item-Specific Field' })}
                      </Text>
                      <Text style={[styles.scopeOptionDesc, { color: colors.muted }]}>
                        {t('item_specific_field_desc', { defaultValue: 'Field for this item only.' })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
              <Button
                      title={t('cancel', { defaultValue: 'Cancel' })}
                onPress={handleCancelAdding}
                style={{ backgroundColor: colors.muted, marginTop: spacing.md }}
              />
            </View>
          )}

          {addStep === 'form' && (
            <>
              {isGlobalField ? (
                /* Global Field Addition Form */
                <View style={styles.addFieldForm}>
                  {/* Info Box */}
                  <View style={[styles.infoBox, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '20' }]}>
                    <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                    <Text style={[styles.hint, { color: colors.muted, fontSize: 11, flex: 1 }]}>
                      {t('field_name_example', { 
                        defaultValue: `Örnek: "${getFieldNameExample()}" (Türkçe karakterler otomatik dönüştürülür: ğ→g, ö→o, ü→u, ş→s, ı→i, ç→c)` 
                      })}
                    </Text>
                  </View>
                  
                  {/* Field Label (Görünür İsmi) */}
                  <View style={{ marginTop: spacing.sm }}>
                    <Text style={[styles.label, { color: colors.text, marginBottom: spacing.xs }]}>
                      {t('field_label', { defaultValue: 'Alan Etiketi (Gösterim Adı)' })} *
                    </Text>
                    <Input
                      value={newFieldLabel}
                      onChangeText={(text) => {
                        setNewFieldLabel(text);
                        // Auto-generate field name from label
                        if (text.trim()) {
                          const generated = generateFieldName(text);
                          setNewFieldKey(generated);
                        } else {
                          setNewFieldKey('');
                        }
                      }}
                      placeholder={t('enter_field_label', { defaultValue: 'Örn: Ürün Adı' })}
                    />
                  </View>
                  
                  {/* Field Key (Alan Adı - Teknik) */}
                  <View style={{ marginTop: spacing.sm }}>
                    <Text style={[styles.label, { color: colors.text, marginBottom: spacing.xs }]}>
                      {t('field_name', { defaultValue: 'Alan Adı (Teknik)' })} *
                    </Text>
                    <Input
                      value={newFieldKey}
                      onChangeText={(text) => {
                        // Normalize on change
                        const normalized = normalizeFieldName(text);
                        setNewFieldKey(normalized);
                      }}
                      placeholder={getFieldNameExample()}
                    />
                  </View>

                  {/* Field Type */}
                  <View>
                    <Text style={[styles.label, { color: colors.text }]}>
                      {t('field_type', { defaultValue: 'Field Type' })}
                    </Text>
                    <Select
                      value={newFieldType}
                      options={fieldTypes}
                      onChange={(val) => setNewFieldType(val as CustomFieldType)}
                    />
                  </View>

                  {/* Options for select type */}
                  {newFieldType === 'select' && (
                    <View>
                      <Text style={[styles.label, { color: colors.text }]}>
                        {t('options', { defaultValue: 'Options' })} *
                      </Text>
                      <Text style={[styles.hint, { color: colors.muted }]}>
                        {t('options_hint', { defaultValue: 'Comma-separated values (e.g., Red, Green, Blue)' })}
                      </Text>
                      <Input
                        value={newFieldOptions}
                        onChangeText={setNewFieldOptions}
                        placeholder="Red, Green, Blue"
                      />
                    </View>
                  )}

                  {/* Options for boolean type */}
                  {newFieldType === 'boolean' && (
                    <View style={styles.formRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: colors.text }]}>
                          {t('yes_label', { defaultValue: 'Yes Label' })}
                        </Text>
                        <Input
                          value={newFieldOptions.split(',')[0] || 'Yes'}
                          onChangeText={(val) => {
                            const parts = newFieldOptions.split(',');
                            parts[0] = val;
                            setNewFieldOptions(parts.join(','));
                          }}
                          placeholder="Yes"
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: spacing.sm }}>
                        <Text style={[styles.label, { color: colors.text }]}>
                          {t('no_label', { defaultValue: 'No Label' })}
                        </Text>
                        <Input
                          value={newFieldOptions.split(',')[1] || 'No'}
                          onChangeText={(val) => {
                            const parts = newFieldOptions.split(',');
                            parts[1] = val;
                            setNewFieldOptions(parts.join(','));
                          }}
                          placeholder="No"
                        />
                      </View>
                    </View>
                  )}

                  {/* Required toggle for global fields */}
                  <TouchableOpacity
                    onPress={() => setNewFieldRequired(!newFieldRequired)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        { borderColor: colors.primary },
                        newFieldRequired && { backgroundColor: colors.primary }
                      ]}
                    >
                      {newFieldRequired && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>
                      {t('field_required', { defaultValue: 'Required field' })}
                    </Text>
                  </TouchableOpacity>

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
              ) : (
                /* Item-Specific Field Addition Form */
                <View style={styles.addFieldForm}>
                  {/* For Item-Specific: Only Label (Description) */}
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

                  {/* Show type and options for Item-Specific fields */}
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
              )}
            </>
          )}
        </Card>
      )}

      {/* Global Fields Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('global_fields', { defaultValue: 'Global Fields' })}
            </Text>
            <Text style={[styles.sectionInfo, { color: colors.muted }]}>
              {t('global_fields_info', { defaultValue: 'Fields available for all items. You can add or remove these fields.' })}
            </Text>
          </View>
        </View>

        {availableGlobalFields.length > 0 && (
          <View style={styles.fieldsList}>
            {availableGlobalFields.map((field) => {
              const isActive = globalFields.some(f => f.key === field.key);
              return (
                <Card key={field.key} style={styles.fieldCard}>
                  <View style={styles.fieldHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' }}>
                        <Text style={[styles.fieldLabel, { color: colors.text }]}>
                          {field.label}
                        </Text>
                        <View style={[styles.globalBadge, { backgroundColor: colors.primary + '20' }]}>
                          <Text style={[styles.globalBadgeText, { color: colors.primary }]}>
                            {t('global', { defaultValue: 'Global' })}
                          </Text>
                        </View>
                        {field.required && (
                          <View style={[styles.requiredBadge, { backgroundColor: '#EF4444' + '20' }]}>
                            <Text style={[styles.globalBadgeText, { color: '#EF4444' }]}>
                              {t('required', { defaultValue: 'Required' })}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.fieldKey, { color: colors.muted }]}>
                        {field.key} ({field.type})
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        if (isActive) {
                          onChange(customFields.filter(f => f.key !== field.key));
                        } else {
                          onChange([...customFields, { ...field, isGlobal: true } as T]);
                        }
                      }}
                      style={[
                        styles.toggleButton,
                        { 
                          backgroundColor: isActive ? colors.primary : colors.surface,
                          borderColor: colors.primary,
                          borderWidth: 1,
                        }
                      ]}
                    >
                      <Ionicons 
                        name={isActive ? "checkmark-circle" : "add-circle-outline"} 
                        size={20} 
                        color={isActive ? '#fff' : colors.primary} 
                      />
                      <Text style={[styles.toggleButtonText, { color: isActive ? '#fff' : colors.primary }]}>
                        {isActive ? t('active', { defaultValue: 'Active' }) : t('add', { defaultValue: 'Add' })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {isActive && canEditValues && (
                    <View style={styles.fieldValue}>
                      {renderFieldInput(
                        globalFields.find(f => f.key === field.key) || field,
                        (value) => {
                          const updatedFields = customFields.map(f => 
                            f.key === field.key ? { ...f, value } : f
                          );
                          onChange(updatedFields);
                        },
                        colors
                      )}
                      {errors[`customField_${field.key}`] && (
                        <Text style={{ fontSize: 12, color: colors.error, marginTop: spacing.xs }}>
                          {errors[`customField_${field.key}`]}
                        </Text>
                      )}
                    </View>
                  )}
                  {isActive && !canEditValues && (
                    <View style={styles.fieldValue}>
                      <Text style={{ color: colors.muted, fontSize: 12 }}>
                        {t('no_permission_to_edit', { defaultValue: 'No permission to edit values' })}
                      </Text>
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}
      </View>

      {/* Item-Specific Fields Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('item_specific_fields', { defaultValue: 'Item-Specific Fields' })}
            </Text>
            <Text style={[styles.sectionInfo, { color: colors.muted }]}>
              {t('item_specific_fields_info', { defaultValue: 'Fields specific to this item only. These fields will not appear on other items.' })}
            </Text>
          </View>
        </View>

        {specificFields.length > 0 && (
          <View style={styles.fieldsList}>
            {specificFields.map((field) => (
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
                  {canAddSpecificFields && (
                  <TouchableOpacity
                    onPress={() => handleRemoveField(field.key)}
                    style={[styles.removeButton, { backgroundColor: '#EF4444' }]}
                  >
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                  </TouchableOpacity>
                  )}
                </View>

                {canEditValues && (
                <View style={styles.fieldValue}>
                    {renderFieldInput(
                      field,
                      (value) => handleUpdateFieldValue(field.key, value),
                      colors
                    )}
                    {errors[`customField_${field.key}`] && (
                      <Text style={{ fontSize: 12, color: colors.error, marginTop: spacing.xs }}>
                        {errors[`customField_${field.key}`]}
                      </Text>
                    )}
                </View>
                )}
                {!canEditValues && (
                  <View style={styles.fieldValue}>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>
                      {t('no_permission_to_edit', { defaultValue: 'No permission to edit values' })}
                    </Text>
                  </View>
                )}
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
  colors: any
) {
  switch (field.type) {
    case 'text':
      return (
        <Input
          value={field.value != null ? String(field.value) : ''}
          onChangeText={onChange}
          placeholder={field.label}
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
        />
      );
    case 'date':
      return (
        <Input
          value={field.value != null ? String(field.value) : ''}
          onChangeText={onChange}
          placeholder="YYYY-MM-DD"
        />
      );
    case 'select':
      return (
        <Select
          value={field.value != null ? String(field.value) : ''}
          options={field.options || []}
          onChange={onChange}
        />
      );
    case 'boolean':
      const boolValue = field.value === true || field.value === 'true';
      return (
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <TouchableOpacity
            onPress={() => onChange(true)}
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
    default:
      return null;
  }
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

