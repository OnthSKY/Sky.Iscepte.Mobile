/**
 * CustomFieldsManager - Component for managing dynamic custom fields for products
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import Card from '../../../shared/components/Card';
import Input from '../../../shared/components/Input';
import Select from '../../../shared/components/Select';
import Button from '../../../shared/components/Button';
import { ProductCustomField } from '../services/productService';
import spacing from '../../../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../../../store/useAppStore';
import { usePermissions } from '../../../core/hooks/usePermissions';

type Props = {
  customFields: ProductCustomField[];
  onChange: (fields: ProductCustomField[]) => void;
  availableGlobalFields?: ProductCustomField[]; // Genel alanlar listesi
  onGlobalFieldsChange?: (fields: ProductCustomField[]) => void; // Genel alanları güncellemek için
};

export default function CustomFieldsManager({ 
  customFields, 
  onChange,
  availableGlobalFields = [],
  onGlobalFieldsChange
}: Props) {
  const { t } = useTranslation('stock');
  const { colors } = useTheme();
  const role = useAppStore((s) => s.role);
  const permissions = usePermissions(role);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'date' | 'select' | 'boolean'>('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isGlobalField, setIsGlobalField] = useState(false); // Genel alan mı ürüne özel mi?

  // Permission checks
  const canManageGlobalFields = permissions.can('stock:manage_global_fields');
  const canAddProductCustomFields = permissions.can('stock:add_product_custom_fields');

  const fieldTypes: Array<{ label: string; value: ProductCustomField['type'] }> = [
    { label: t('text', { defaultValue: 'Text' }), value: 'text' },
    { label: t('number', { defaultValue: 'Number' }), value: 'number' },
    { label: t('date', { defaultValue: 'Date' }), value: 'date' },
    { label: t('select', { defaultValue: 'Select' }), value: 'select' },
    { label: t('boolean', { defaultValue: 'Yes/No' }), value: 'boolean' },
  ];

  const handleAddField = () => {
    // Permission check
    if (isGlobalField && !canManageGlobalFields) {
      return;
    }
    if (!isGlobalField && !canAddProductCustomFields) {
      return;
    }

    // Ürüne özel için sadece label yeterli
    if (isGlobalField) {
      if (!newFieldKey.trim() || !newFieldLabel.trim()) {
        return;
      }
    } else {
      if (!newFieldLabel.trim()) {
        return;
      }
    }

    // Check if field key already exists (hem genel hem de özel alanlarda)
    const allFields = [...customFields, ...availableGlobalFields];
    const fieldKeyToCheck = isGlobalField ? newFieldKey.trim() : (newFieldKey.trim() || newFieldLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'));
    if (allFields.find(f => f.key === fieldKeyToCheck)) {
      return;
    }

    if (isGlobalField) {
      // Genel alan - tip ve seçenekler gerekli
      const options = newFieldType === 'select' && newFieldOptions.trim()
        ? newFieldOptions.split(',').map(opt => ({
            label: opt.trim(),
            value: opt.trim(),
          }))
        : undefined;

      const newField: ProductCustomField = {
        key: newFieldKey.trim(),
        label: newFieldLabel.trim(),
        type: newFieldType,
        value: newFieldType === 'boolean' ? false : newFieldType === 'number' ? 0 : '',
        options,
        isGlobal: true,
      };

      if (onGlobalFieldsChange) {
        // Genel alan ekle - tüm ürünlerde kullanılabilir
        onGlobalFieldsChange([...availableGlobalFields, newField]);
        // Bu ürün için de genel alanı kullanıma ekle
        onChange([...customFields, { ...newField, isGlobal: true }]);
      }
    } else {
      // Ürüne özel alan - sadece label ve value, tip yok
      const newField: ProductCustomField = {
        key: newFieldKey.trim(),
        label: newFieldLabel.trim(),
        type: 'text', // Default tip, ama gösterilmiyor
        value: '', // Boş başla
        isGlobal: false,
      };

      onChange([...customFields, newField]);
    }

    setNewFieldKey('');
    setNewFieldLabel('');
    setNewFieldType('text');
    setNewFieldOptions('');
    setIsGlobalField(false);
    setIsAdding(false);
  };

  const handleRemoveField = (key: string) => {
    onChange(customFields.filter(f => f.key !== key));
  };

  const handleUpdateFieldValue = (key: string, value: any) => {
    onChange(customFields.map(f => f.key === key ? { ...f, value } : f));
  };

  // Ürüne özel ve genel alanları ayır
  const productSpecificFields = customFields.filter(f => !f.isGlobal);
  const globalFields = customFields.filter(f => f.isGlobal);

  return (
    <View style={styles.container}>
      {/* Genel Alanlar Bölümü */}
      {availableGlobalFields.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('global_fields', { defaultValue: 'Genel Alanlar' })}
              </Text>
              <Text style={[styles.sectionInfo, { color: colors.muted }]}>
                {t('global_fields_info', { defaultValue: 'Tüm ürünlerde kullanılabilen alanlar. Bu alanları ekleyebilir veya kaldırabilirsiniz.' })}
              </Text>
            </View>
          </View>
          
          <View style={styles.fieldsList}>
            {availableGlobalFields.map((field) => {
              const isActive = globalFields.some(f => f.key === field.key);
              return (
                <Card key={field.key} style={styles.fieldCard}>
                  <View style={styles.fieldHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                        <Text style={[styles.fieldLabel, { color: colors.text }]}>
                          {field.label}
                        </Text>
                        <View style={[styles.globalBadge, { backgroundColor: colors.primary + '20' }]}>
                          <Text style={[styles.globalBadgeText, { color: colors.primary }]}>
                            {t('global', { defaultValue: 'Genel' })}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.fieldKey, { color: colors.muted }]}>
                        {field.key} ({field.type})
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        if (isActive) {
                          // Genel alanı bu üründen kaldır
                          onChange(customFields.filter(f => f.key !== field.key));
                        } else {
                          // Genel alanı bu ürüne ekle
                          onChange([...customFields, { ...field, isGlobal: true }]);
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
                        {isActive ? t('active', { defaultValue: 'Aktif' }) : t('add', { defaultValue: 'Ekle' })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {isActive && (
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
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        </View>
      )}

      {/* Ürüne Özel Alanlar Bölümü */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('product_specific_fields', { defaultValue: 'Bu Ürüne Özel Alanlar' })}
            </Text>
            <Text style={[styles.sectionInfo, { color: colors.muted }]}>
              {t('product_specific_fields_info', { defaultValue: 'Sadece bu ürün için geçerli olan alanlar. Bu alanlar diğer ürünlerde görünmez.' })}
            </Text>
          </View>
          {!isAdding && (
            <TouchableOpacity
              onPress={() => setIsAdding(true)}
              style={[styles.addButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="add-outline" size={20} color="#fff" />
              <Text style={styles.addButtonText}>
                {t('add_custom_field', { defaultValue: 'Özel Alan Ekle' })}
              </Text>
            </TouchableOpacity>
          )}
        </View>

      {isAdding && (
        <Card style={styles.addFieldCard}>
          <View style={styles.addFieldForm}>
            {/* Genel Alan veya Ürüne Özel Seçimi - Önce seçim yapılsın */}
            <View style={styles.fieldScopeRow}>
              {canManageGlobalFields && (
                <TouchableOpacity
                  onPress={() => setIsGlobalField(true)}
                  style={[
                    styles.scopeOption,
                    {
                      backgroundColor: isGlobalField ? colors.primary : colors.surface,
                      borderColor: colors.primary,
                      borderWidth: 1,
                    }
                  ]}
                >
                  <Ionicons 
                    name={isGlobalField ? "checkmark-circle" : "globe-outline"} 
                    size={20} 
                    color={isGlobalField ? '#fff' : colors.primary} 
                  />
                  <View style={{ marginLeft: spacing.xs }}>
                    <Text style={[styles.scopeOptionTitle, { color: isGlobalField ? '#fff' : colors.text }]}>
                      {t('global_field', { defaultValue: 'Genel Alan' })}
                    </Text>
                    <Text style={[styles.scopeOptionDesc, { color: isGlobalField ? '#fff' : colors.muted }]}>
                      {t('global_field_desc', { defaultValue: 'Tüm ürünlerde kullanılabilir' })}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              
              {canAddProductCustomFields && (
                <TouchableOpacity
                  onPress={() => setIsGlobalField(false)}
                  style={[
                    styles.scopeOption,
                    {
                      backgroundColor: !isGlobalField ? colors.primary : colors.surface,
                      borderColor: colors.primary,
                      borderWidth: 1,
                    }
                  ]}
                >
                  <Ionicons 
                    name={!isGlobalField ? "checkmark-circle" : "cube-outline"} 
                    size={20} 
                    color={!isGlobalField ? '#fff' : colors.primary} 
                  />
                  <View style={{ marginLeft: spacing.xs }}>
                    <Text style={[styles.scopeOptionTitle, { color: !isGlobalField ? '#fff' : colors.text }]}>
                      {t('product_specific_field', { defaultValue: 'Ürüne Özel' })}
                    </Text>
                    <Text style={[styles.scopeOptionDesc, { color: !isGlobalField ? '#fff' : colors.muted }]}>
                      {t('product_specific_field_desc', { defaultValue: 'Sadece bu ürün için' })}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Genel Alan için: Anahtar ve Etiket */}
            {isGlobalField && (
              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {t('field_key', { defaultValue: 'Alan Anahtarı' })} *
                  </Text>
                  <Text style={[styles.hint, { color: colors.muted }]}>
                    {t('field_key_hint', { defaultValue: 'Teknik isim (örn: color, size)' })}
                  </Text>
                  <Input
                    value={newFieldKey}
                    onChangeText={setNewFieldKey}
                    placeholder="color, size, weight..."
                  />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {t('field_label', { defaultValue: 'Alan Etiketi' })} *
                  </Text>
                  <Text style={[styles.hint, { color: colors.muted }]}>
                    {t('field_label_hint', { defaultValue: 'Görünen isim (örn: Renk, Boyut)' })}
                  </Text>
                  <Input
                    value={newFieldLabel}
                    onChangeText={setNewFieldLabel}
                    placeholder={t('field_label', { defaultValue: 'Alan Etiketi' })}
                  />
                </View>
              </View>
            )}

            {/* Ürüne Özel için: Sadece Etiket (Açıklama) */}
            {!isGlobalField && (
              <View>
                <Text style={[styles.label, { color: colors.text }]}>
                  {t('field_description', { defaultValue: 'Alan Açıklaması' })} *
                </Text>
                <Text style={[styles.hint, { color: colors.muted }]}>
                  {t('field_description_hint', { defaultValue: 'Bu ürüne özel alanın açıklaması (örn: Özel Not, Ek Bilgi)' })}
                </Text>
                <Input
                  value={newFieldLabel}
                  onChangeText={(text) => {
                    setNewFieldLabel(text);
                    // Otomatik olarak key oluştur (label'dan)
                    const autoKey = text.toLowerCase()
                      .replace(/[^a-z0-9]+/g, '_')
                      .replace(/^_+|_+$/g, '');
                    setNewFieldKey(autoKey || '');
                  }}
                  placeholder={t('field_description_placeholder', { defaultValue: 'Örn: Özel Not, Ek Bilgi...' })}
                />
              </View>
            )}

            {/* Genel alan için tip ve seçenekler gösteriliyor */}
            {isGlobalField && (
              <>
                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.text }]}>
                      {t('field_type', { defaultValue: 'Alan Tipi' })}
                    </Text>
                    <Select
                      value={newFieldType}
                      options={fieldTypes.map(ft => ({ label: ft.label, value: ft.value }))}
                      onChange={(val) => {
                        setNewFieldType(val as ProductCustomField['type']);
                        setNewFieldOptions(''); // Clear options when type changes
                      }}
                    />
                  </View>
                  {newFieldType === 'select' && (
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                      <Text style={[styles.label, { color: colors.text }]}>
                        {t('field_options', { defaultValue: 'Seçenekler' })}
                      </Text>
                      <Input
                        value={newFieldOptions}
                        onChangeText={setNewFieldOptions}
                        placeholder="Seçenek1, Seçenek2, Seçenek3"
                      />
                    </View>
                  )}
                </View>
              </>
            )}

            <View style={styles.formActions}>
              <Button
                title={t('common:cancel', { defaultValue: 'İptal' })}
                onPress={() => {
                  setIsAdding(false);
                  setNewFieldKey('');
                  setNewFieldLabel('');
                  setNewFieldType('text');
                  setNewFieldOptions('');
                  setIsGlobalField(false);
                }}
                style={[styles.actionButton, { backgroundColor: colors.muted }]}
              />
              <Button
                title={t('common:add', { defaultValue: 'Ekle' })}
                onPress={handleAddField}
                style={styles.actionButton}
              />
            </View>
          </View>
        </Card>
      )}

        {productSpecificFields.length > 0 && (
          <View style={styles.fieldsList}>
            {productSpecificFields.map((field) => (
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
                    onPress={() => handleRemoveField(field.key)}
                    style={[styles.removeButton, { backgroundColor: '#EF4444' }]}
                  >
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.fieldValue}>
                  {/* Ürüne özel alanlar için sadece text input */}
                  <Input
                    value={field.value != null ? String(field.value) : ''}
                    onChangeText={(value) => handleUpdateFieldValue(field.key, value)}
                    placeholder={field.label}
                  />
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
  field: ProductCustomField,
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
              {field.options?.[0]?.label || 'Evet'}
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
              {field.options?.[1]?.label || 'Hayır'}
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
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  hint: {
    fontSize: 11,
    marginBottom: spacing.xs,
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
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
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
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  scopeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
  },
  scopeOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  scopeOptionDesc: {
    fontSize: 11,
  },
});

