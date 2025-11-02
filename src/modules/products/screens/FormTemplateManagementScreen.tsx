/**
 * Form Template Management Screen
 * 
 * Allows users to create, edit, clone, and manage form templates for products
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { FormTemplate } from '../../../shared/types/formTemplate';
import {
  useFormTemplatesQuery,
  useCreateFormTemplateMutation,
  useUpdateFormTemplateMutation,
  useDeleteFormTemplateMutation,
  useCloneFormTemplateMutation,
  useSetDefaultFormTemplateMutation,
} from '../hooks/useFormTemplatesQuery';
import { productFormFields } from '../config/productFormConfig';
import { DynamicField } from '../../../shared/components/DynamicForm';

export default function FormTemplateManagementScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation(['stock', 'common']);
  const { colors } = useTheme();
  const fromModule = route.params?.fromModule || 'StockModuleSettings';

  // Queries and mutations
  const { data: templates = [], isLoading, refetch } = useFormTemplatesQuery();
  const createMutation = useCreateFormTemplateMutation();
  const updateMutation = useUpdateFormTemplateMutation();
  const deleteMutation = useDeleteFormTemplateMutation();
  const cloneMutation = useCloneFormTemplateMutation();
  const setDefaultMutation = useSetDefaultFormTemplateMutation();

  // State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deleteTemplate, setDeleteTemplate] = useState<FormTemplate | null>(null);

  // Refetch on mount
  useEffect(() => {
    refetch();
  }, []);

  const handleBackPress = () => {
    if (fromModule === 'StockDashboard') {
      navigation.navigate('StockDashboard');
    } else {
      navigation.navigate('StockModuleSettings');
    }
  };

  const handleCreateNew = () => {
    setTemplateName('');
    setTemplateDescription('');
    setEditingTemplate(null);
    setIsAdding(true);
    setModalVisible(true);
  };

  const handleEdit = (template: FormTemplate) => {
    setTemplateName(template.name);
    setTemplateDescription(template.description || '');
    setEditingTemplate(template);
    setIsAdding(false);
    setModalVisible(true);
  };

  const handleClone = async (template: FormTemplate) => {
    Alert.prompt(
      t('stock:clone_template', { defaultValue: 'Şablonu Çoğalt' }),
      t('stock:enter_template_name', { defaultValue: 'Yeni şablon adını girin:' }),
      [
        { text: t('common:cancel', { defaultValue: 'İptal' }), style: 'cancel' },
        {
          text: t('common:clone', { defaultValue: 'Çoğalt' }),
          onPress: async (newName) => {
            if (!newName || newName.trim() === '') {
              Alert.alert(t('common:error', { defaultValue: 'Hata' }), t('stock:template_name_required', { defaultValue: 'Şablon adı gereklidir' }));
              return;
            }
            try {
              await cloneMutation.mutateAsync({ id: template.id, newName: newName.trim() });
            } catch (error: any) {
              Alert.alert(t('common:error', { defaultValue: 'Hata' }), error.message || t('stock:clone_failed', { defaultValue: 'Çoğaltma başarısız oldu' }));
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleDelete = (template: FormTemplate) => {
    Alert.alert(
      t('common:delete', { defaultValue: 'Sil' }),
      t('stock:delete_template_confirm', { defaultValue: 'Bu form şablonunu silmek istediğinizden emin misiniz?' }),
      [
        { text: t('common:cancel', { defaultValue: 'İptal' }), style: 'cancel' },
        {
          text: t('common:delete', { defaultValue: 'Sil' }),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(template.id);
            } catch (error: any) {
              Alert.alert(t('common:error', { defaultValue: 'Hata' }), error.message || t('stock:delete_failed', { defaultValue: 'Silme başarısız oldu' }));
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (template: FormTemplate) => {
    try {
      await setDefaultMutation.mutateAsync(template.id);
    } catch (error: any) {
      Alert.alert(t('common:error', { defaultValue: 'Hata' }), error.message || t('stock:set_default_failed', { defaultValue: 'Varsayılan şablon ayarlama başarısız oldu' }));
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName || templateName.trim() === '') {
      Alert.alert(t('common:error', { defaultValue: 'Hata' }), t('stock:template_name_required', { defaultValue: 'Şablon adı gereklidir' }));
      return;
    }

    try {
      if (isAdding) {
        // Create new template with default base fields
        await createMutation.mutateAsync({
          module: 'stock',
          name: templateName.trim(),
          description: templateDescription.trim(),
          baseFields: productFormFields, // Use default product form fields as base
          customFields: [],
          isActive: true,
          isDefault: false,
          order: templates.length + 1,
        });
      } else if (editingTemplate) {
        // Update existing template
        await updateMutation.mutateAsync({
          id: editingTemplate.id,
          config: {
            name: templateName.trim(),
            description: templateDescription.trim(),
          },
        });
      }
      setModalVisible(false);
      setTemplateName('');
      setTemplateDescription('');
      setEditingTemplate(null);
      setIsAdding(false);
    } catch (error: any) {
      Alert.alert(t('common:error', { defaultValue: 'Hata' }), error.message || t('stock:save_failed', { defaultValue: 'Kaydetme başarısız oldu' }));
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setTemplateName('');
    setTemplateDescription('');
    setEditingTemplate(null);
    setIsAdding(false);
  };

  const styles = getStyles(colors);

  return (
    <ScreenLayout
      showBackButton
      onBackPress={handleBackPress}
      title={t('stock:form_templates', { defaultValue: 'Form Şablonları' })}
      subtitle={t('stock:manage_form_templates', { defaultValue: 'Form şablonlarını yönetin ve çoğaltın' })}
      headerRight={
        !modalVisible ? (
          <TouchableOpacity
            onPress={handleCreateNew}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add-outline" size={20} color="#fff" />
            <Text style={styles.addButtonText}>
              {t('stock:new_template', { defaultValue: 'Yeni Şablon' })}
            </Text>
          </TouchableOpacity>
        ) : undefined
      }
    >
      <ScrollView contentContainerStyle={styles.container}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <Text style={[styles.description, { color: colors.muted }]}>
              {t('common:loading', { defaultValue: 'Yükleniyor...' })}
            </Text>
          </View>
        ) : templates.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="document-outline" size={64} color={colors.muted} />
            <Text style={[styles.description, { color: colors.muted, marginTop: spacing.md, textAlign: 'center' }]}>
              {t('stock:no_templates', { defaultValue: 'Henüz form şablonu oluşturulmamış' })}
            </Text>
            <Button
              title={t('stock:create_first_template', { defaultValue: 'İlk Şablonu Oluştur' })}
              onPress={handleCreateNew}
              style={{ marginTop: spacing.md }}
            />
          </View>
        ) : (
          <View style={styles.templatesList}>
            {templates.map((template) => (
              <Card key={template.id} style={styles.templateCard}>
                <View style={styles.templateHeader}>
                  <View style={styles.templateInfo}>
                    <View style={styles.templateTitleRow}>
                      <Text style={styles.templateName}>{template.name}</Text>
                      {template.isDefault && (
                        <View style={[styles.defaultBadge, { backgroundColor: colors.primary + '20' }]}>
                          <Text style={[styles.defaultBadgeText, { color: colors.primary }]}>
                            {t('stock:default', { defaultValue: 'Varsayılan' })}
                          </Text>
                        </View>
                      )}
                      {!template.isActive && (
                        <View style={[styles.inactiveBadge, { backgroundColor: colors.muted + '20' }]}>
                          <Text style={[styles.inactiveBadgeText, { color: colors.muted }]}>
                            {t('stock:inactive', { defaultValue: 'Pasif' })}
                          </Text>
                        </View>
                      )}
                    </View>
                    {template.description && (
                      <Text style={styles.templateDescription}>{template.description}</Text>
                    )}
                    <Text style={styles.templateStats}>
                      {t('stock:base_fields', { defaultValue: 'Temel Alanlar' })}: {template.baseFields?.length || 0} | {t('stock:custom_fields', { defaultValue: 'Özel Alanlar' })}: {template.customFields?.length || 0}
                    </Text>
                  </View>
                </View>
                <View style={styles.templateActions}>
                  {!template.isDefault && (
                    <TouchableOpacity
                      onPress={() => handleSetDefault(template)}
                      style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                    >
                      <Ionicons name="star-outline" size={18} color={colors.primary} />
                      <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                        {t('stock:set_default', { defaultValue: 'Varsayılan Yap' })}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => handleClone(template)}
                    style={[styles.actionButton, { backgroundColor: colors.secondary + '20' }]}
                  >
                    <Ionicons name="copy-outline" size={18} color={colors.secondary} />
                    <Text style={[styles.actionButtonText, { color: colors.secondary }]}>
                      {t('common:clone', { defaultValue: 'Çoğalt' })}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleEdit(template)}
                    style={[styles.actionButton, { backgroundColor: colors.info + '20' }]}
                  >
                    <Ionicons name="create-outline" size={18} color={colors.info} />
                    <Text style={[styles.actionButtonText, { color: colors.info }]}>
                      {t('common:edit', { defaultValue: 'Düzenle' })}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(template)}
                    style={[styles.actionButton, { backgroundColor: colors.danger + '20' }]}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    <Text style={[styles.actionButtonText, { color: colors.danger }]}>
                      {t('common:delete', { defaultValue: 'Sil' })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {isAdding
                  ? t('stock:new_template', { defaultValue: 'Yeni Şablon' })
                  : t('stock:edit_template', { defaultValue: 'Şablonu Düzenle' })}
              </Text>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons name="close-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formField}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  {t('stock:template_name', { defaultValue: 'Şablon Adı' })}
                  <Text style={{ color: colors.danger }}> *</Text>
                </Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={templateName}
                  onChangeText={setTemplateName}
                  placeholder={t('stock:enter_template_name', { defaultValue: 'Şablon adını girin' })}
                  placeholderTextColor={colors.muted}
                />
              </View>

              <View style={styles.formField}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  {t('stock:description', { defaultValue: 'Açıklama' })}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    styles.textArea,
                    { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                  ]}
                  value={templateDescription}
                  onChangeText={setTemplateDescription}
                  placeholder={t('stock:enter_description', { defaultValue: 'Açıklama girin (isteğe bağlı)' })}
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {isAdding && (
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle-outline" size={20} color={colors.info} />
                  <Text style={[styles.infoText, { color: colors.muted }]}>
                    {t('stock:template_will_include_base_fields', { defaultValue: 'Bu şablon varsayılan ürün form alanlarını içerecektir. Daha sonra özel alanlar ekleyebilirsiniz.' })}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title={t('common:cancel', { defaultValue: 'İptal' })}
                onPress={handleCancel}
                style={[styles.modalButton, { backgroundColor: colors.muted }]}
              />
              <Button
                title={t('common:save', { defaultValue: 'Kaydet' })}
                onPress={handleSaveTemplate}
                style={styles.modalButton}
                loading={createMutation.isPending || updateMutation.isPending}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      padding: spacing.lg,
      paddingBottom: spacing.xl,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    description: {
      fontSize: 14,
      color: colors.muted,
      marginBottom: spacing.lg,
      lineHeight: 20,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 8,
      gap: spacing.xs,
    },
    addButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    templatesList: {
      gap: spacing.md,
    },
    templateCard: {
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    templateHeader: {
      marginBottom: spacing.md,
    },
    templateInfo: {
      gap: spacing.xs,
    },
    templateTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    templateName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    templateDescription: {
      fontSize: 14,
      color: colors.muted,
      marginTop: spacing.xs,
    },
    templateStats: {
      fontSize: 12,
      color: colors.muted,
      marginTop: spacing.xs,
    },
    defaultBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: 4,
    },
    defaultBadgeText: {
      fontSize: 10,
      fontWeight: '600',
    },
    inactiveBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: 4,
    },
    inactiveBadgeText: {
      fontSize: 10,
      fontWeight: '600',
    },
    templateActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 6,
      gap: spacing.xs / 2,
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '500',
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
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
    },
    modalBody: {
      padding: spacing.lg,
      maxHeight: 400,
    },
    formField: {
      marginBottom: spacing.md,
    },
    formLabel: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: spacing.xs,
    },
    textInput: {
      borderWidth: 1,
      borderRadius: 8,
      padding: spacing.md,
      fontSize: 16,
    },
    textArea: {
      minHeight: 100,
      paddingTop: spacing.md,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.info + '10',
      padding: spacing.md,
      borderRadius: 8,
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    infoText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
    },
    modalFooter: {
      flexDirection: 'row',
      padding: spacing.lg,
      gap: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    modalButton: {
      flex: 1,
    },
  });

