/**
 * GlobalFieldsManagementScreen - Admin screen for managing global product fields
 * 
 * Allows admin to create, edit, and delete global fields that can be used in all products
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import Select from '../../../shared/components/Select';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import { ProductCustomField } from '../services/productService';
import globalFieldsService from '../services/globalFieldsService';
import spacing from '../../../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createFormTemplateService } from '../../../shared/utils/createFormTemplateService';
import { FormTemplate } from '../../../shared/types/formTemplate';
import { useQuery } from '@tanstack/react-query';

export default function GlobalFieldsManagementScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation('stock');
  const { colors } = useTheme();
  const [globalFields, setGlobalFields] = useState<ProductCustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingField, setEditingField] = useState<ProductCustomField | null>(null);
  const [deleteField, setDeleteField] = useState<ProductCustomField | null>(null);

  // Load form templates to check usage
  const formTemplateService = useMemo(() => createFormTemplateService('stock'), []);
  const { data: templates = [] } = useQuery<FormTemplate[]>({
    queryKey: ['stock', 'form-templates', 'list'],
    queryFn: () => formTemplateService.list(),
    staleTime: 5 * 60 * 1000,
  });

  // Form state
  const [fieldKey, setFieldKey] = useState('');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'number' | 'date' | 'select' | 'boolean'>('text');
  const [fieldOptions, setFieldOptions] = useState('');

  const fieldTypes: Array<{ label: string; value: ProductCustomField['type'] }> = [
    { label: t('text', { defaultValue: 'Text' }), value: 'text' },
    { label: t('number', { defaultValue: 'Number' }), value: 'number' },
    { label: t('date', { defaultValue: 'Date' }), value: 'date' },
    { label: t('select', { defaultValue: 'Select' }), value: 'select' },
    { label: t('boolean', { defaultValue: 'Yes/No' }), value: 'boolean' },
  ];

  useEffect(() => {
    loadGlobalFields();
  }, []);

  const loadGlobalFields = async () => {
    try {
      setLoading(true);
      const fields = await globalFieldsService.getAll();
      setGlobalFields(fields);
    } catch (error) {
      console.error('Failed to load global fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveField = async () => {
    if (!fieldKey.trim() || !fieldLabel.trim()) {
      return;
    }

    // Check if field key already exists (unless editing)
    const existingField = globalFields.find(f => f.key === fieldKey.trim());
    if (existingField && (!editingField || existingField.key !== editingField.key)) {
      // Field key already exists
      return;
    }

    const options = fieldType === 'select' && fieldOptions.trim()
      ? fieldOptions.split(',').map(opt => ({
          label: opt.trim(),
          value: opt.trim(),
        }))
      : undefined;

    const newField: ProductCustomField = {
      key: fieldKey.trim(),
      label: fieldLabel.trim(),
      type: fieldType,
      value: fieldType === 'boolean' ? false : fieldType === 'number' ? 0 : '',
      options,
      isGlobal: true,
    };

    try {
      if (editingField) {
        // Update existing field
        await globalFieldsService.update(editingField.key, newField);
      } else {
        // Add new field
        await globalFieldsService.add(newField);
      }
      
      // Reset form
      setFieldKey('');
      setFieldLabel('');
      setFieldType('text');
      setFieldOptions('');
      setIsAdding(false);
      setEditingField(null);
      
      // Reload fields
      await loadGlobalFields();
    } catch (error) {
      console.error('Failed to save field:', error);
    }
  };

  const handleEditField = (field: ProductCustomField) => {
    setFieldKey(field.key);
    setFieldLabel(field.label);
    setFieldType(field.type);
    setFieldOptions(field.options?.map(o => o.label).join(', ') || '');
    setEditingField(field);
    setIsAdding(true);
  };

  // Check how many templates use this global field
  const getTemplateUsageCount = (fieldKey: string): number => {
    return templates.filter(template => {
      // Check if field exists in template's customFields
      return template.customFields?.some(cf => cf.name === fieldKey) || false;
    }).length;
  };

  // Get template names that use this field
  const getTemplateNamesUsingField = (fieldKey: string): string[] => {
    return templates
      .filter(template => template.customFields?.some(cf => cf.name === fieldKey))
      .map(template => template.name);
  };

  const handleDeleteField = async () => {
    if (!deleteField) return;

    const usageCount = getTemplateUsageCount(deleteField.key);
    
    if (usageCount > 0) {
      const templateNames = getTemplateNamesUsingField(deleteField.key);
      Alert.alert(
        t('cannot_delete_field', { defaultValue: 'Alan Silinemez' }),
        t('field_used_in_templates', { 
          defaultValue: `Bu alan ${usageCount} form şablonunda kullanılıyor:\n\n${templateNames.join('\n')}\n\nÖnce bu şablonlardan alanı kaldırmanız gerekiyor.`,
          count: usageCount,
          templates: templateNames.join(', ')
        }),
        [{ text: t('common:ok', { defaultValue: 'Tamam' }) }]
      );
      setDeleteField(null);
      return;
    }

    try {
      await globalFieldsService.remove(deleteField.key);
      setDeleteField(null);
      await loadGlobalFields();
    } catch (error) {
      console.error('Failed to delete field:', error);
    }
  };

  const handleCancel = () => {
    setFieldKey('');
    setFieldLabel('');
    setFieldType('text');
    setFieldOptions('');
    setIsAdding(false);
    setEditingField(null);
  };

  const handleBackPress = () => {
    navigation.navigate('StockDashboard');
  };

  return (
    <ScreenLayout 
      showBackButton 
      onBackPress={handleBackPress}
      title={t('manage_global_fields', { defaultValue: 'Genel Alanları Yönet' })}
      subtitle={t('manage_global_fields_desc', { defaultValue: 'Tüm ürünlerde kullanılabilecek genel alanları oluşturun, düzenleyin veya silin.' })}
      headerRight={
        !isAdding ? (
          <TouchableOpacity
            onPress={() => setIsAdding(true)}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add-outline" size={20} color="#fff" />
            <Text style={styles.addButtonText}>
              {t('add_global_field', { defaultValue: 'Genel Alan Ekle' })}
            </Text>
          </TouchableOpacity>
        ) : undefined
      }
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Add/Edit Form */}
        {isAdding && (
          <Card style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={[styles.formTitle, { color: colors.text }]}>
                {editingField 
                  ? t('edit_global_field', { defaultValue: 'Genel Alan Düzenle' })
                  : t('add_global_field', { defaultValue: 'Genel Alan Ekle' })
                }
              </Text>
            </View>

            <View style={styles.formContent}>
              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {t('field_key', { defaultValue: 'Alan Anahtarı' })} *
                  </Text>
                  <Text style={[styles.hint, { color: colors.muted }]}>
                    {t('field_key_hint', { defaultValue: 'Teknik isim (örn: color, size)' })}
                  </Text>
                  <Input
                    value={fieldKey}
                    onChangeText={setFieldKey}
                    placeholder="color, size, weight..."
                    editable={!editingField} // Key cannot be changed when editing
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
                    value={fieldLabel}
                    onChangeText={setFieldLabel}
                    placeholder={t('field_label', { defaultValue: 'Alan Etiketi' })}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {t('field_type', { defaultValue: 'Alan Tipi' })}
                  </Text>
                  <Select
                    value={fieldType}
                    options={fieldTypes.map(ft => ({ label: ft.label, value: ft.value }))}
                    onChange={(val) => {
                      setFieldType(val as ProductCustomField['type']);
                      setFieldOptions(''); // Clear options when type changes
                    }}
                  />
                </View>
                {fieldType === 'select' && (
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {t('field_options', { defaultValue: 'Seçenekler' })}
                  </Text>
                  <Input
                    value={fieldOptions}
                    onChangeText={setFieldOptions}
                    placeholder="Seçenek1, Seçenek2, Seçenek3"
                  />
                </View>
                )}
              </View>

              <View style={styles.formActions}>
                <Button
                  title={t('common:cancel', { defaultValue: 'İptal' })}
                  onPress={handleCancel}
                  style={[styles.actionButton, { backgroundColor: colors.muted }]}
                />
                <Button
                  title={editingField 
                    ? t('common:save', { defaultValue: 'Kaydet' })
                    : t('common:add', { defaultValue: 'Ekle' })
                  }
                  onPress={handleSaveField}
                  style={styles.actionButton}
                />
              </View>
            </View>
          </Card>
        )}

        {/* Global Fields List */}
        {!loading && globalFields.length === 0 && !isAdding && (
          <Card style={styles.emptyCard}>
            <Ionicons name="folder-outline" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              {t('no_global_fields', { defaultValue: 'Henüz genel alan eklenmemiş' })}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.muted }]}>
              {t('no_global_fields_desc', { defaultValue: 'Yukarıdaki butona tıklayarak genel alan ekleyebilirsiniz.' })}
            </Text>
          </Card>
        )}

        {globalFields.length > 0 && (
          <View style={styles.fieldsList}>
            {globalFields.map((field) => {
              const usageCount = getTemplateUsageCount(field.key);
              const canDelete = usageCount === 0;
              
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
                            {t('global', { defaultValue: 'Genel' })}
                          </Text>
                        </View>
                        {usageCount > 0 && (
                          <View style={[styles.usageBadge, { backgroundColor: '#F59E0B' + '20' }]}>
                            <Ionicons name="document-text-outline" size={12} color="#F59E0B" />
                            <Text style={[styles.usageBadgeText, { color: '#F59E0B' }]}>
                              {usageCount} {t('templates', { defaultValue: 'şablon' })}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.fieldKey, { color: colors.muted }]}>
                        {field.key} ({field.type})
                      </Text>
                      {field.options && field.options.length > 0 && (
                        <Text style={[styles.fieldOptions, { color: colors.muted }]}>
                          {t('options', { defaultValue: 'Seçenekler' })}: {field.options.map(o => o.label).join(', ')}
                        </Text>
                      )}
                      {usageCount > 0 && (
                        <View style={{ marginTop: spacing.xs, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs / 2 }}>
                          <Ionicons name="information-circle-outline" size={14} color="#F59E0B" />
                          <Text style={[styles.usageInfo, { color: '#F59E0B' }]}>
                            {t('used_in_templates', { 
                              defaultValue: `${usageCount} form şablonunda kullanılıyor. Silmek için önce şablonlardan kaldırın.`,
                              count: usageCount
                            })}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.fieldActions}>
                      <TouchableOpacity
                        onPress={() => handleEditField(field)}
                        style={[styles.actionIconButton, { backgroundColor: colors.primary + '20' }]}
                      >
                        <Ionicons name="pencil-outline" size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          if (canDelete) {
                            setDeleteField(field);
                          } else {
                            const templateNames = getTemplateNamesUsingField(field.key);
                            Alert.alert(
                              t('cannot_delete_field', { defaultValue: 'Alan Silinemez' }),
                              t('field_used_in_templates', { 
                                defaultValue: `Bu alan ${usageCount} form şablonunda kullanılıyor:\n\n${templateNames.join('\n')}\n\nÖnce bu şablonlardan alanı kaldırmanız gerekiyor.`,
                                count: usageCount,
                                templates: templateNames.join(', ')
                              }),
                              [{ text: t('common:ok', { defaultValue: 'Tamam' }) }]
                            );
                          }
                        }}
                        style={[
                          styles.actionIconButton, 
                          { 
                            backgroundColor: canDelete ? '#EF444420' : colors.muted + '20',
                            opacity: canDelete ? 1 : 0.5
                          }
                        ]}
                        disabled={!canDelete}
                      >
                        <Ionicons name="trash-outline" size={18} color={canDelete ? "#EF4444" : colors.muted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={deleteField !== null}
        title={t('delete_global_field_title', { defaultValue: 'Genel Alanı Sil' })}
        message={(() => {
          if (deleteField) {
            const usageCount = getTemplateUsageCount(deleteField.key);
            if (usageCount > 0) {
              const templateNames = getTemplateNamesUsingField(deleteField.key);
              return t('delete_global_field_message_with_templates', { 
                defaultValue: `Bu genel alan ${usageCount} form şablonunda kullanılıyor:\n\n${templateNames.join('\n')}\n\nBu alanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
                count: usageCount,
                templates: templateNames.join('\n')
              });
            }
          }
          return t('delete_global_field_message', { 
            defaultValue: 'Bu genel alanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz. Tüm ürünlerde bu alan kaldırılacaktır.' 
          });
        })()}
        confirmText={t('common:delete', { defaultValue: 'Sil' })}
        cancelText={t('common:cancel', { defaultValue: 'İptal' })}
        onCancel={() => setDeleteField(null)}
        onConfirm={handleDeleteField}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    marginTop: spacing.xs,
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
  formCard: {
    padding: spacing.md,
  },
  formHeader: {
    marginBottom: spacing.md,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  formContent: {
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
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: spacing.xs,
    textAlign: 'center',
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
    alignItems: 'flex-start',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
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
  fieldKey: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  fieldOptions: {
    fontSize: 12,
    marginTop: spacing.xs / 2,
  },
  fieldActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionIconButton: {
    padding: spacing.xs,
    borderRadius: 8,
  },
  usageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: 8,
  },
  usageBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  usageInfo: {
    fontSize: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
});

