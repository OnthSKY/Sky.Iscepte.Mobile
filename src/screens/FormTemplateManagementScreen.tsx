/**
 * Centralized Form Template Management Screen
 * 
 * Single screen to manage form templates for all modules
 * Accessible from Settings
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../shared/components/Button';
import Card from '../shared/components/Card';
import { FormTemplate, FormTemplateConfig } from '../shared/types/formTemplate';
import { DynamicField } from '../shared/components/DynamicForm';
import { createFormTemplateService } from '../shared/utils/createFormTemplateService';
import { getModuleBaseFields, getSupportedModules } from '../shared/utils/moduleFormFields';
import { MODULE_CONFIGS } from '../core/config/moduleConfig';
import { usePermissions } from '../core/hooks/usePermissions';
import { useAppStore } from '../store/useAppStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BaseCustomField } from '../shared/types/customFields';
import { customFieldToDynamicField } from '../shared/utils/formTemplateUtils';
import DynamicForm from '../shared/components/DynamicForm';
import Input from '../shared/components/Input';
import Select from '../shared/components/Select';
import { generateFieldName, getFieldNameExample, normalizeFieldName } from '../shared/utils/fieldNameUtils';
import { Role } from '../core/config/appConstants';
import { showPermissionAlert as showPermissionAlertUtil } from '../shared/utils/permissionUtils';
import packages from '../mocks/packages.json';
import users from '../mocks/users.json';

export default function FormTemplateManagementScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation(['common', 'packages', 'stock', 'customers', 'suppliers', 'sales', 'purchases', 'expenses', 'revenue', 'employees']);
  const { colors } = useTheme();
  const role = useAppStore((s) => s.role);
  const user = useAppStore((s) => s.user);
  const permissions = usePermissions(role);
  const queryClient = useQueryClient();

  // Get package info for form limits
  const packageInfo = useMemo(() => {
    let packageId = (user as any)?.package || 'free';
    // For STAFF: Use owner's package
    if (role === Role.STAFF && (user as any)?.ownerId) {
      const owner: any = (users as any).find((u: any) => u.id === (user as any).ownerId);
      packageId = owner?.package || 'free';
    }
    const pkg: any = (packages as any).find((p: any) => p.id === packageId);
    return {
      maxCustomForms: pkg?.maxCustomForms || 0,
      allowedFormModules: pkg?.allowedFormModules || [],
    };
  }, [user, role]);

  // Get available modules based on permissions and package limits
  const availableModules = useMemo(() => {
    return MODULE_CONFIGS.filter(config => {
      const moduleKey = config.key;
      // Only include modules that support form templates
      if (!getSupportedModules().includes(moduleKey)) return false;
      // Check both module view permission and form template permission
      if (!permissions.can(config.requiredPermission) || !permissions.can(`${moduleKey}:custom_form`)) {
        return false;
      }
      // Check if module is allowed in package (if package has allowedFormModules restriction)
      if (packageInfo.allowedFormModules.length > 0 && !packageInfo.allowedFormModules.includes(moduleKey)) {
        return false;
      }
      return true;
    });
  }, [permissions, packageInfo]);
  
  // Selected module state - get from route params if available, otherwise use first available module
  const initialModule = route.params?.module || availableModules[0]?.key || 'stock';
  const [selectedModule, setSelectedModule] = useState<string>(initialModule);
  
  // Update selected module when route params change
  useEffect(() => {
    if (route.params?.module && availableModules.some(m => m.key === route.params.module)) {
      setSelectedModule(route.params.module);
    }
  }, [route.params?.module, availableModules]);

  // Helper function to show permission alert - uses centralized utility
  const handlePermissionAlert = (permission: string) => {
    const fullPermission = `${selectedModule}:${permission}`;
    showPermissionAlertUtil(role, fullPermission, navigation, t, selectedModule);
  };

  // Permission checks - must be after selectedModule is defined
  const canManageTemplates = permissions.can(`${selectedModule}:custom_form`);

  // Get service for selected module
  const formTemplateService = useMemo(() => {
    return createFormTemplateService(selectedModule);
  }, [selectedModule]);

  // Query keys
  const queryKeys = {
    list: (module: string) => [module, 'form-templates', 'list'] as const,
    detail: (module: string, id: string | number) => [module, 'form-templates', 'detail', id] as const,
  };

  // Queries
  const { data: templates = [], isLoading, refetch } = useQuery({
    queryKey: queryKeys.list(selectedModule),
    queryFn: () => formTemplateService.list(),
    enabled: !!selectedModule,
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (config: FormTemplateConfig) => formTemplateService.create(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list(selectedModule) });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, config }: { id: string | number; config: Partial<FormTemplateConfig> }) =>
      formTemplateService.update(id, config),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list(selectedModule) });
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(selectedModule, data.id) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => formTemplateService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list(selectedModule) });
    },
  });

  const cloneMutation = useMutation({
    mutationFn: ({ id, newName }: { id: string | number; newName: string }) =>
      formTemplateService.clone(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list(selectedModule) });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string | number) => formTemplateService.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list(selectedModule) });
    },
  });

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [selectedBaseFields, setSelectedBaseFields] = useState<string[]>([]); // Array of field names
  const [templateCustomFields, setTemplateCustomFields] = useState<DynamicField[]>([]); // Custom fields for this template
  const [selectedListFields, setSelectedListFields] = useState<string[]>([]); // Fields for list view
  const [selectedDetailFields, setSelectedDetailFields] = useState<string[]>([]); // Additional fields for detail view
  const [isAdding, setIsAdding] = useState(false);
  
  // Custom field form state
  const [isAddingCustomField, setIsAddingCustomField] = useState(false);
  const [editingCustomField, setEditingCustomField] = useState<DynamicField | null>(null);
  const [newCustomFieldName, setNewCustomFieldName] = useState('');
  const [newCustomFieldLabel, setNewCustomFieldLabel] = useState('');
  const [newCustomFieldType, setNewCustomFieldType] = useState<DynamicField['type']>('text');
  const [newCustomFieldRequired, setNewCustomFieldRequired] = useState(false);
  const [newCustomFieldOptions, setNewCustomFieldOptions] = useState('');
  

  // Get module info
  const currentModule = useMemo(() => {
    return MODULE_CONFIGS.find(m => m.key === selectedModule);
  }, [selectedModule]);

  const moduleTranslationNamespace = currentModule?.translationNamespace || 'common';
  const moduleBaseFields = useMemo(() => {
    return getModuleBaseFields(selectedModule);
  }, [selectedModule]);

  useEffect(() => {
    refetch();
  }, [selectedModule]);

  const handleBackPress = () => {
    navigation.navigate('Settings');
  };

  const handleCreateNew = async () => {
    setTemplateName('');
    setTemplateDescription('');
    setEditingTemplate(null);
    // Select all base fields by default, but locked fields are always selected
    const lockedFields = moduleBaseFields.filter(f => f.isLocked).map(f => f.name);
    const allFieldNames = moduleBaseFields.map(f => f.name);
    setSelectedBaseFields(allFieldNames);
    setTemplateCustomFields([]);
    // Default list fields: locked fields + name (if not locked) + first 2-3 fields
    setSelectedListFields(lockedFields.length > 0 ? lockedFields : ['name']);
    setSelectedDetailFields([]); // Empty initially
    setIsAdding(true);
    setModalVisible(true);
    
  };

  const handleEdit = async (template: FormTemplate) => {
    setTemplateName(template.name);
    setTemplateDescription(template.description || '');
    setEditingTemplate(template);
    // Set selected base fields from template
    setSelectedBaseFields(template.baseFields?.map(f => f.name) || []);
    // Set custom fields from template
    setTemplateCustomFields(template.customFields || []);
    // Set list and detail fields from template
    setSelectedListFields(template.listFields || []);
    setSelectedDetailFields(template.detailFields || []);
    setIsAdding(false);
    setModalVisible(true);
    
  };
  
  const handleShowPreview = () => {
    setPreviewModalVisible(true);
  };
  
  const handleAddCustomField = () => {
    if (!newCustomFieldName.trim() || !newCustomFieldLabel.trim()) {
      Alert.alert(t('common:error', { defaultValue: 'Hata' }), t('common:field_name_and_label_required', { defaultValue: 'Alan adı ve etiket gereklidir' }));
      return;
    }
    
    // Normalize field name
    const normalizedName = normalizeFieldName(newCustomFieldName.trim());
    if (!normalizedName) {
      Alert.alert(t('common:error', { defaultValue: 'Hata' }), t('common:invalid_field_name', { defaultValue: 'Geçersiz alan adı' }));
      return;
    }
    
    // Check if field name already exists
    const allFieldNames = [
      ...selectedBaseFields,
      ...templateCustomFields.map(f => f.name),
    ];
    if (editingCustomField && editingCustomField.name !== normalizedName && allFieldNames.includes(normalizedName)) {
      Alert.alert(t('common:error', { defaultValue: 'Hata' }), t('common:field_name_exists', { defaultValue: 'Bu alan adı zaten kullanılıyor' }));
      return;
    }
    if (!editingCustomField && allFieldNames.includes(normalizedName)) {
      Alert.alert(t('common:error', { defaultValue: 'Hata' }), t('common:field_name_exists', { defaultValue: 'Bu alan adı zaten kullanılıyor' }));
      return;
    }
    
    const fieldData: Partial<DynamicField> = {
      name: normalizedName,
      labelKey: newCustomFieldLabel.trim(),
      required: newCustomFieldRequired,
      type: newCustomFieldType,
      readonly: newCustomFieldType === 'tc_verification' || newCustomFieldType === 'imei_verification',
      options: newCustomFieldType === 'select' && newCustomFieldOptions.trim()
        ? newCustomFieldOptions.split(',').map(opt => ({
            label: opt.trim(),
            value: opt.trim(),
          }))
        : undefined,
    };
    
    if (editingCustomField) {
      // Edit existing field - don't change type if field is used
      if (editingCustomField.isUsed) {
        // Only update label, required, and options
        setTemplateCustomFields(prev => prev.map(f => 
          f.name === editingCustomField.name 
            ? { ...f, ...fieldData }
            : f
        ));
      } else {
        // Can update everything including type
        setTemplateCustomFields(prev => prev.map(f => 
          f.name === editingCustomField.name 
            ? { ...f, ...fieldData, type: newCustomFieldType }
            : f
        ));
      }
      setEditingCustomField(null);
    } else {
      // Add new field
      const newField: DynamicField = {
        ...fieldData,
        type: newCustomFieldType,
        isActive: true,
        isUsed: false,
      } as DynamicField;
      
      setTemplateCustomFields(prev => [...prev, newField]);
    }
    
    // Reset form
    setNewCustomFieldName('');
    setNewCustomFieldLabel('');
    setNewCustomFieldType('text');
    setNewCustomFieldRequired(false);
    setNewCustomFieldOptions('');
    setIsAddingCustomField(false);
  };
  
  const handleEditCustomField = (field: DynamicField) => {
    setEditingCustomField(field);
    setNewCustomFieldName(field.name);
    setNewCustomFieldLabel(field.labelKey);
    setNewCustomFieldType(field.type);
    setNewCustomFieldRequired(field.required || false);
    setNewCustomFieldOptions(field.options?.map(opt => opt.label).join(', ') || '');
    setIsAddingCustomField(true);
  };
  
  const handleToggleCustomFieldActive = (fieldName: string) => {
    setTemplateCustomFields(prev => prev.map(f => 
      f.name === fieldName 
        ? { ...f, isActive: !(f.isActive !== false) } // Default to true if undefined
        : f
    ));
  };
  
  const handleRemoveCustomField = (field: DynamicField) => {
    // Check if field is used - if used, only deactivate, don't delete
    if (field.isUsed) {
      Alert.alert(
        t('common:warning', { defaultValue: 'Uyarı' }),
        t('common:field_used_cannot_delete', { 
          defaultValue: 'Bu alan kullanılmış verilerde bulunduğu için silinemez. Sadece pasife alınabilir.' 
        }),
        [
          { text: t('common:cancel', { defaultValue: 'İptal' }), style: 'cancel' },
          {
            text: t('common:deactivate', { defaultValue: 'Pasife Al' }),
            onPress: () => handleToggleCustomFieldActive(field.name),
          },
        ]
      );
      return;
    }
    
    // Remove field
    setTemplateCustomFields(prev => prev.filter(f => f.name !== field.name));
  };
  
  // Get preview fields (selected base + custom)
  const previewFields = useMemo(() => {
    const baseFields = moduleBaseFields.filter(f => selectedBaseFields.includes(f.name));
    return [...baseFields, ...templateCustomFields];
  }, [moduleBaseFields, selectedBaseFields, templateCustomFields]);
  
  // Preview form values
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});

  const handleClone = async (template: FormTemplate) => {
    Alert.prompt(
      t('common:clone', { defaultValue: 'Şablonu Çoğalt' }),
      t('common:enter_template_name', { defaultValue: 'Yeni şablon adını girin:' }),
      [
        { text: t('common:cancel', { defaultValue: 'İptal' }), style: 'cancel' },
        {
          text: t('common:clone', { defaultValue: 'Çoğalt' }),
          onPress: async (newName?: string) => {
            if (!newName || newName.trim() === '') {
              Alert.alert(t('common:error', { defaultValue: 'Hata' }), t('common:template_name_required', { defaultValue: 'Şablon adı gereklidir' }));
              return;
            }
            try {
              await cloneMutation.mutateAsync({ id: template.id, newName: newName.trim() });
            } catch (error: any) {
              Alert.alert(t('common:error', { defaultValue: 'Hata' }), error.message || t('common:clone_failed', { defaultValue: 'Çoğaltma başarısız oldu' }));
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
      t('common:delete_template_confirm', { defaultValue: 'Bu form şablonunu silmek istediğinizden emin misiniz?' }),
      [
        { text: t('common:cancel', { defaultValue: 'İptal' }), style: 'cancel' },
        {
          text: t('common:delete', { defaultValue: 'Sil' }),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(template.id);
            } catch (error: any) {
              Alert.alert(t('common:error', { defaultValue: 'Hata' }), error.message || t('common:delete_failed', { defaultValue: 'Silme başarısız oldu' }));
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
      Alert.alert(t('common:error', { defaultValue: 'Hata' }), error.message || t('common:set_default_failed', { defaultValue: 'Varsayılan şablon ayarlama başarısız oldu' }));
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName || templateName.trim() === '') {
      Alert.alert(t('common:error', { defaultValue: 'Hata' }), t('common:template_name_required', { defaultValue: 'Şablon adı gereklidir' }));
      return;
    }

    if (selectedBaseFields.length === 0) {
      Alert.alert(t('common:error', { defaultValue: 'Hata' }), t('common:select_at_least_one_field', { defaultValue: 'En az bir alan seçmelisiniz' }));
      return;
    }

    // Check form template limits
    if (isAdding) {
      // Check total form count limit
      if (packageInfo.maxCustomForms > 0) {
        // Count total forms across all modules
        let totalForms = 0;
        for (const module of getSupportedModules()) {
          const moduleService = createFormTemplateService(module);
          try {
            const moduleTemplates = await moduleService.list();
            totalForms += moduleTemplates.length;
          } catch (error) {
            // Ignore errors for modules that don't have templates yet
          }
        }
        if (totalForms >= packageInfo.maxCustomForms) {
          Alert.alert(
            t('common:error', { defaultValue: 'Hata' }),
            t('packages:form_limit_reached', { 
              defaultValue: `Maksimum ${packageInfo.maxCustomForms} özel form şablonu oluşturabilirsiniz. Paketinizi yükseltmek için Paketler ekranına gidin.`,
              maxForms: packageInfo.maxCustomForms 
            }),
            [
              { text: t('common:cancel', { defaultValue: 'İptal' }), style: 'cancel' },
              { 
                text: t('packages:upgrade_package', { defaultValue: 'Paket Yükselt' }), 
                onPress: () => navigation.navigate('Packages')
              }
            ]
          );
          return;
        }
      }

      // Check module-specific limit (if module is not in allowedFormModules)
      if (packageInfo.allowedFormModules.length > 0 && !packageInfo.allowedFormModules.includes(selectedModule)) {
        Alert.alert(
          t('common:error', { defaultValue: 'Hata' }),
          t('packages:module_not_allowed', { 
            defaultValue: `Bu pakette ${selectedModule} modülü için özel form şablonu oluşturamazsınız. Paketinizi yükseltmek için Paketler ekranına gidin.`,
            module: selectedModule 
          }),
          [
            { text: t('common:cancel', { defaultValue: 'İptal' }), style: 'cancel' },
            { 
              text: t('packages:upgrade_package', { defaultValue: 'Paket Yükselt' }), 
              onPress: () => navigation.navigate('Packages')
            }
          ]
        );
        return;
      }
    }

    try {
      // Get selected base fields
      const selectedFields = moduleBaseFields.filter(f => selectedBaseFields.includes(f.name));
      
      // Get all available fields (base + custom)
      const allAvailableFields = [...selectedFields, ...templateCustomFields].map(f => f.name);
      
      // Validate list fields - must be subset of available fields
      const validListFields = selectedListFields.filter(f => allAvailableFields.includes(f));
      
      // Validate detail fields - must be subset of available fields and not in listFields
      const validDetailFields = selectedDetailFields.filter(f => 
        allAvailableFields.includes(f) && !validListFields.includes(f)
      );
      
      if (isAdding) {
        await createMutation.mutateAsync({
          module: selectedModule,
          name: templateName.trim(),
          description: templateDescription.trim(),
          baseFields: selectedFields,
          customFields: templateCustomFields,
          listFields: validListFields.length > 0 ? validListFields : undefined,
          detailFields: validDetailFields.length > 0 ? validDetailFields : undefined,
          isActive: true,
          isDefault: false,
          order: templates.length + 1,
        });
      } else if (editingTemplate) {
        await updateMutation.mutateAsync({
          id: editingTemplate.id,
          config: {
            name: templateName.trim(),
            description: templateDescription.trim(),
            baseFields: selectedFields,
            customFields: templateCustomFields,
            listFields: validListFields.length > 0 ? validListFields : undefined,
            detailFields: validDetailFields.length > 0 ? validDetailFields : undefined,
          },
        });
      }
      setModalVisible(false);
      setTemplateName('');
      setTemplateDescription('');
      setSelectedBaseFields([]);
      setTemplateCustomFields([]);
      setSelectedListFields([]);
      setSelectedDetailFields([]);
      setEditingTemplate(null);
      setIsAdding(false);
    } catch (error: any) {
      Alert.alert(t('common:error', { defaultValue: 'Hata' }), error.message || t('common:save_failed', { defaultValue: 'Kaydetme başarısız oldu' }));
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setTemplateName('');
    setTemplateDescription('');
    setSelectedBaseFields([]);
    setTemplateCustomFields([]);
    setSelectedListFields([]);
    setSelectedDetailFields([]);
    setEditingTemplate(null);
    setIsAdding(false);
  };
  
  // Get all available fields (selected base + custom)
  const allAvailableFields = useMemo(() => {
    const baseFields = moduleBaseFields.filter(f => selectedBaseFields.includes(f.name));
    return [...baseFields, ...templateCustomFields];
  }, [moduleBaseFields, selectedBaseFields, templateCustomFields]);
  
  // Get locked fields (always selected, cannot be removed)
  const lockedFields = useMemo(() => {
    return moduleBaseFields.filter(f => f.isLocked).map(f => f.name);
  }, [moduleBaseFields]);
  
  // ScrollView ref for auto-scroll when adding custom field
  const modalScrollViewRef = useRef<ScrollView>(null);
  
  // Auto-scroll to custom field form when it opens
  useEffect(() => {
    if (isAddingCustomField && modalVisible && modalScrollViewRef.current) {
      // Small delay to ensure form is rendered
      setTimeout(() => {
        modalScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [isAddingCustomField, modalVisible]);

  const styles = getStyles(colors);

  return (
    <ScreenLayout
      showBackButton
      onBackPress={handleBackPress}
      title={t('common:form_templates', { defaultValue: 'Form Şablonları' })}
      subtitle={t('common:manage_form_templates_all_modules', { defaultValue: 'Tüm modüller için form şablonlarını yönetin' })}
      headerRight={
        !modalVisible ? (
          <TouchableOpacity
            onPress={() => {
              if (!canManageTemplates) {
                handlePermissionAlert('custom_form');
                return;
              }
              handleCreateNew();
            }}
            style={[
              styles.addButton, 
              { 
                backgroundColor: canManageTemplates ? colors.primary : colors.muted,
                opacity: canManageTemplates ? 1 : 0.6,
              }
            ]}
            disabled={!canManageTemplates}
          >
            <Ionicons 
              name={canManageTemplates ? "add-outline" : "lock-closed-outline"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.addButtonText}>
              {t('common:new_template', { defaultValue: 'Yeni Şablon' })}
            </Text>
          </TouchableOpacity>
        ) : undefined
      }
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Detailed Description Section */}
        <View style={[styles.infoSection, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '20' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: colors.primary + '15',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 2,
            }}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                {t('common:form_templates_title', { defaultValue: 'Form Şablonları Nedir?' })}
              </Text>
              <Text style={[styles.infoSectionText, { color: colors.muted }]}>
                {t('common:form_templates_description', { 
                  defaultValue: 'Form şablonları, her modül için özelleştirilebilir form yapıları oluşturmanızı sağlar. Her şablonda hangi alanların görüneceğini, hangi alanların zorunlu olduğunu ve formun nasıl görüneceğini belirleyebilirsiniz.' 
                })}
              </Text>
              <View style={{ marginTop: spacing.xs, gap: spacing.xs }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs }}>
                  <Text style={{ color: colors.primary, fontSize: 12 }}>•</Text>
                  <Text style={[styles.infoBullet, { color: colors.muted }]}>
                    {t('common:form_templates_feature_1', { 
                      defaultValue: 'Modül bazında özel form yapıları oluşturun (ör: Hızlı Satış Formu, Detaylı Ürün Formu)' 
                    })}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs }}>
                  <Text style={{ color: colors.primary, fontSize: 12 }}>•</Text>
                  <Text style={[styles.infoBullet, { color: colors.muted }]}>
                    {t('common:form_templates_feature_2', { 
                      defaultValue: 'Her şablon için farklı alanlar seçin ve özel alanlar ekleyin' 
                    })}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs }}>
                  <Text style={{ color: colors.primary, fontSize: 12 }}>•</Text>
                  <Text style={[styles.infoBullet, { color: colors.muted }]}>
                    {t('common:form_templates_feature_3', { 
                      defaultValue: 'Liste ve detay sayfalarında hangi alanların görüneceğini belirleyin' 
                    })}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs }}>
                  <Text style={{ color: colors.primary, fontSize: 12 }}>•</Text>
                  <Text style={[styles.infoBullet, { color: colors.muted }]}>
                    {t('common:form_templates_feature_4', { 
                      defaultValue: 'Form ekranlarında şablon seçerek farklı form yapılarını kullanın' 
                    })}
                  </Text>
                </View>
              </View>
              <View style={{ 
                marginTop: spacing.sm, 
                padding: spacing.sm, 
                backgroundColor: colors.background, 
                borderRadius: 6,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
                <Text style={[styles.infoNote, { color: colors.text }]}>
                  <Text style={{ fontWeight: '600' }}>
                    {t('common:form_templates_note_title', { defaultValue: 'İpucu: ' })}
                  </Text>
                  {t('common:form_templates_note', { 
                    defaultValue: 'Form ekranlarında "Form Yapılandırması" bölümünden şablon seçebilir veya varsayılan formu kullanabilirsiniz. Yeni şablon oluşturmak için bu ekranda "Yeni Şablon" butonunu kullanın.' 
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Module Selection */}
        {availableModules.length > 1 && (
          <View style={styles.moduleSelector}>
            <Text style={[styles.moduleSelectorLabel, { color: colors.text }]}>
              {t('common:module', { defaultValue: 'Modül' })}:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moduleScrollView}>
              <View style={styles.moduleButtons}>
                {availableModules.map((module) => (
                  <TouchableOpacity
                    key={module.key}
                    onPress={() => setSelectedModule(module.key)}
                    style={[
                      styles.moduleButton,
                      selectedModule === module.key && [styles.moduleButtonActive, { backgroundColor: colors.primary }],
                      selectedModule !== module.key && { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <Ionicons
                      name={module.icon as any}
                      size={18}
                      color={selectedModule === module.key ? '#fff' : colors.text}
                    />
                    <Text
                      style={[
                        styles.moduleButtonText,
                        selectedModule === module.key && styles.moduleButtonTextActive,
                        { color: selectedModule === module.key ? '#fff' : colors.text },
                      ]}
                    >
                      {t(`${module.translationNamespace}:${module.translationKey}`, { defaultValue: module.key })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Templates List */}
        {isLoading ? (
          <View style={styles.centerContainer}>
            <Text style={[styles.descriptionText, { color: colors.muted }]}>
              {t('common:loading', { defaultValue: 'Yükleniyor...' })}
            </Text>
          </View>
        ) : templates.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="document-outline" size={64} color={colors.muted} />
            <Text style={[styles.descriptionText, { color: colors.muted, marginTop: spacing.md, textAlign: 'center' }]}>
              {t('common:no_templates_for_module', { defaultValue: 'Bu modül için henüz form şablonu oluşturulmamış' })}
            </Text>
            <Button
              title={t('common:create_first_template', { defaultValue: 'İlk Şablonu Oluştur' })}
              onPress={() => {
                if (!canManageTemplates) {
                  handlePermissionAlert('custom_form');
                  return;
                }
                handleCreateNew();
              }}
              style={{ marginTop: spacing.md }}
              disabled={!canManageTemplates}
            />
          </View>
        ) : (
          <View style={styles.templatesList}>
            {templates.map((template: FormTemplate) => (
              <Card key={template.id} style={styles.templateCard}>
                <View style={styles.templateHeader}>
                  <View style={styles.templateInfo}>
                    <View style={styles.templateTitleRow}>
                      <Text style={styles.templateName}>{template.name}</Text>
                      {template.isDefault && (
                        <View style={[styles.defaultBadge, { backgroundColor: colors.primary + '20' }]}>
                          <Text style={[styles.defaultBadgeText, { color: colors.primary }]}>
                            {t('common:default', { defaultValue: 'Varsayılan' })}
                          </Text>
                        </View>
                      )}
                      {!template.isActive && (
                        <View style={[styles.inactiveBadge, { backgroundColor: colors.muted + '20' }]}>
                          <Text style={[styles.inactiveBadgeText, { color: colors.muted }]}>
                            {t('common:inactive', { defaultValue: 'Pasif' })}
                          </Text>
                        </View>
                      )}
                    </View>
                    {template.description && (
                      <Text style={styles.templateDescription}>{template.description}</Text>
                    )}
                    <Text style={styles.templateStats}>
                      {t('common:base_fields', { defaultValue: 'Temel Alanlar' })}: {template.baseFields?.length || 0} | {t('common:custom_fields', { defaultValue: 'Özel Alanlar' })}: {template.customFields?.length || 0}
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
                        {t('common:set_default', { defaultValue: 'Varsayılan Yap' })}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        if (!canManageTemplates) {
                          handlePermissionAlert('custom_form');
                          return;
                        }
                        handleClone(template);
                      }}
                      style={[
                        styles.actionButton, 
                        { 
                          backgroundColor: canManageTemplates ? colors.secondary + '20' : colors.muted + '20',
                          opacity: canManageTemplates ? 1 : 0.6,
                        }
                      ]}
                      disabled={!canManageTemplates}
                    >
                      <Ionicons 
                        name={canManageTemplates ? "copy-outline" : "lock-closed-outline"} 
                        size={18} 
                        color={canManageTemplates ? colors.secondary : colors.muted} 
                      />
                      <Text style={[
                        styles.actionButtonText, 
                        { color: canManageTemplates ? colors.secondary : colors.muted }
                      ]}>
                        {t('common:clone', { defaultValue: 'Çoğalt' })}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        if (!canManageTemplates) {
                          handlePermissionAlert('custom_form');
                          return;
                        }
                        handleEdit(template);
                      }}
                      style={[
                        styles.actionButton, 
                        { 
                          backgroundColor: canManageTemplates ? colors.info + '20' : colors.muted + '20',
                          opacity: canManageTemplates ? 1 : 0.6,
                        }
                      ]}
                      disabled={!canManageTemplates}
                    >
                      <Ionicons 
                        name={canManageTemplates ? "create-outline" : "lock-closed-outline"} 
                        size={18} 
                        color={canManageTemplates ? colors.info : colors.muted} 
                      />
                      <Text style={[
                        styles.actionButtonText, 
                        { color: canManageTemplates ? colors.info : colors.muted }
                      ]}>
                        {t('common:edit', { defaultValue: 'Düzenle' })}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        if (!canManageTemplates) {
                          handlePermissionAlert('custom_form');
                          return;
                        }
                        handleDelete(template);
                      }}
                      style={[
                        styles.actionButton, 
                        { 
                          backgroundColor: canManageTemplates ? colors.error + '20' : colors.muted + '20',
                          opacity: canManageTemplates ? 1 : 0.6,
                        }
                      ]}
                      disabled={!canManageTemplates}
                    >
                      <Ionicons 
                        name={canManageTemplates ? "trash-outline" : "lock-closed-outline"} 
                        size={18} 
                        color={canManageTemplates ? colors.error : colors.muted} 
                      />
                      <Text style={[
                        styles.actionButtonText, 
                        { color: canManageTemplates ? colors.error : colors.muted }
                      ]}>
                        {t('common:delete', { defaultValue: 'Sil' })}
                      </Text>
                    </TouchableOpacity>
                  </>
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
                  ? t('common:new_template', { defaultValue: 'Yeni Şablon' })
                  : t('common:edit_template', { defaultValue: 'Şablonu Düzenle' })}
              </Text>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons name="close-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              ref={modalScrollViewRef}
              style={styles.modalBody}
              contentContainerStyle={{ paddingBottom: spacing.xl }}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.formField}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  {t('common:template_name', { defaultValue: 'Şablon Adı' })}
                  <Text style={{ color: colors.error }}> *</Text>
                </Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={templateName}
                  onChangeText={setTemplateName}
                  placeholder={t('common:enter_template_name', { defaultValue: 'Şablon adını girin' })}
                  placeholderTextColor={colors.muted}
                />
              </View>

              <View style={styles.formField}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  {t('common:description', { defaultValue: 'Açıklama' })}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    styles.textArea,
                    { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                  ]}
                  value={templateDescription}
                  onChangeText={setTemplateDescription}
                  placeholder={t('common:enter_description', { defaultValue: 'Açıklama girin (isteğe bağlı)' })}
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Base Fields Selection */}
              <View style={styles.formField}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  {t('common:base_fields', { defaultValue: 'Temel Alanlar' })}
                  <Text style={{ color: colors.error }}> *</Text>
                </Text>
                <View style={styles.fieldsContainer}>
                  {moduleBaseFields.map((field) => {
                    const isSelected = selectedBaseFields.includes(field.name);
                    const isLocked = field.isLocked === true;
                    return (
                      <TouchableOpacity
                        key={field.name}
                        onPress={() => {
                          if (isLocked) {
                            // Locked fields cannot be toggled
                            return;
                          }
                          if (isSelected) {
                            setSelectedBaseFields(prev => prev.filter(name => name !== field.name));
                            // Also remove from list/detail if it was there
                            setSelectedListFields(prev => prev.filter(name => name !== field.name));
                            setSelectedDetailFields(prev => prev.filter(name => name !== field.name));
                          } else {
                            setSelectedBaseFields(prev => [...prev, field.name]);
                          }
                        }}
                        disabled={isLocked}
                        style={[
                          styles.fieldChip,
                          {
                            backgroundColor: isSelected ? colors.primary + '20' : colors.surface,
                            borderColor: isSelected ? colors.primary : colors.border,
                            opacity: isLocked ? 0.7 : 1,
                          }
                        ]}
                      >
                        <Ionicons 
                          name={isLocked ? "lock-closed" : (isSelected ? "checkbox" : "square-outline")} 
                          size={20} 
                          color={isLocked ? colors.muted : (isSelected ? colors.primary : colors.muted)} 
                        />
                        <Text style={[
                          styles.fieldChipText,
                          { color: isSelected ? colors.primary : colors.text }
                        ]}>
                          {t(`${moduleTranslationNamespace}:${field.labelKey}`, { defaultValue: field.labelKey || field.name })}
                          {isLocked && ' 🔒'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Custom Fields Section */}
              <View style={styles.formField}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>
                    {t('common:custom_fields', { defaultValue: 'Özel Alanlar' })}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (!canManageTemplates) {
                        handlePermissionAlert('custom_form');
                        return;
                      }
                      setEditingCustomField(null);
                      setNewCustomFieldName('');
                      setNewCustomFieldLabel('');
                      setNewCustomFieldType('text');
                      setNewCustomFieldRequired(false);
                      setNewCustomFieldOptions('');
                      setIsAddingCustomField(true);
                    }}
                    style={[
                      styles.addFieldButton, 
                      { 
                        backgroundColor: canManageTemplates ? colors.primary : colors.muted,
                        opacity: canManageTemplates ? 1 : 0.6,
                      }
                    ]}
                    disabled={!canManageTemplates}
                  >
                    <Ionicons 
                      name={canManageTemplates ? "add-outline" : "lock-closed-outline"} 
                      size={18} 
                      color="#fff" 
                    />
                    <Text style={styles.addFieldButtonText}>
                      {t('common:add_field', { defaultValue: 'Alan Ekle' })}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {/* Template Custom Fields */}
                {templateCustomFields.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      {t('common:template_custom_fields', { defaultValue: 'Şablon Özel Alanları' })}
                    </Text>
                    <View style={styles.customFieldsList}>
                      {templateCustomFields.map((field) => {
                        const isActive = field.isActive !== false; // Default to true
                        const isUsed = field.isUsed === true;
                        return (
                          <View key={field.name} style={[
                            styles.customFieldItem, 
                            { 
                              backgroundColor: colors.surface, 
                              borderColor: colors.border,
                              opacity: isActive ? 1 : 0.6,
                            }
                          ]}>
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                                <Text style={[styles.customFieldName, { color: colors.text }]}>
                                  {field.labelKey || field.name}
                                  {!isActive && ` (${t('common:inactive', { defaultValue: 'Pasif' })})`}
                                  {isUsed && ` ⚠️`}
                                </Text>
                              </View>
                              <Text style={[styles.customFieldType, { color: colors.muted }]}>
                                {field.type} {field.required && '*'}
                                {isUsed && ` • ${t('common:used', { defaultValue: 'Kullanılmış' })}`}
                              </Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                              <>
                                <TouchableOpacity
                                  onPress={() => {
                                    if (!canManageTemplates) {
                                      handlePermissionAlert('custom_form');
                                      return;
                                    }
                                    handleEditCustomField(field);
                                  }}
                                  style={[
                                    styles.editButton, 
                                    { 
                                      backgroundColor: canManageTemplates ? colors.info + '20' : colors.muted + '20',
                                      opacity: canManageTemplates ? 1 : 0.6,
                                    }
                                  ]}
                                  disabled={!canManageTemplates}
                                >
                                  <Ionicons 
                                    name={canManageTemplates ? "create-outline" : "lock-closed-outline"} 
                                    size={16} 
                                    color={canManageTemplates ? colors.info : colors.muted} 
                                  />
                                </TouchableOpacity>
                                {isUsed ? (
                                  <TouchableOpacity
                                    onPress={() => {
                                      if (!canManageTemplates) {
                                        handlePermissionAlert('custom_form');
                                        return;
                                      }
                                      handleToggleCustomFieldActive(field.name);
                                    }}
                                    style={[
                                      styles.toggleButton, 
                                      { 
                                        backgroundColor: canManageTemplates 
                                          ? (isActive ? colors.warning + '20' : colors.success + '20')
                                          : colors.muted + '20',
                                        opacity: canManageTemplates ? 1 : 0.6,
                                      }
                                    ]}
                                    disabled={!canManageTemplates}
                                  >
                                    <Ionicons 
                                      name={canManageTemplates 
                                        ? (isActive ? "eye-off-outline" : "eye-outline")
                                        : "lock-closed-outline"
                                      } 
                                      size={16} 
                                      color={canManageTemplates 
                                        ? (isActive ? colors.warning : colors.success)
                                        : colors.muted
                                      } 
                                    />
                                  </TouchableOpacity>
                                ) : (
                                  <TouchableOpacity
                                    onPress={() => {
                                      if (!canManageTemplates) {
                                        handlePermissionAlert('custom_form');
                                        return;
                                      }
                                      handleRemoveCustomField(field);
                                    }}
                                    style={[
                                      styles.removeButton, 
                                      { 
                                        backgroundColor: canManageTemplates ? colors.error + '20' : colors.muted + '20',
                                        opacity: canManageTemplates ? 1 : 0.6,
                                      }
                                    ]}
                                    disabled={!canManageTemplates}
                                  >
                                    <Ionicons 
                                      name={canManageTemplates ? "trash-outline" : "lock-closed-outline"} 
                                      size={16} 
                                      color={canManageTemplates ? colors.error : colors.muted} 
                                    />
                                  </TouchableOpacity>
                                )}
                              </>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}
                
                {/* List and Detail Fields Selection */}
                {allAvailableFields.length > 0 && (
                  <View style={styles.formField}>
                    <Text style={[styles.formLabel, { color: colors.text }]}>
                      {t('common:list_display_fields', { defaultValue: 'Liste Görünüm Alanları' })}
                    </Text>
                    <View style={styles.infoBox}>
                      <Ionicons name="information-circle-outline" size={16} color={colors.info} />
                      <Text style={[styles.infoText, { color: colors.muted, fontSize: 11 }]}>
                        {t('common:list_fields_info', { 
                          defaultValue: 'Liste sayfasında gösterilecek alanları seçin. Bu alanlar aynı zamanda detay sayfasında da öncelikli olarak gösterilir.' 
                        })}
                      </Text>
                    </View>
                    <View style={styles.fieldsContainer}>
                      {allAvailableFields.map((field) => {
                        const isSelected = selectedListFields.includes(field.name);
                        const fieldDef = moduleBaseFields.find(f => f.name === field.name) || 
                                         templateCustomFields.find(f => f.name === field.name);
                        const isLocked = fieldDef?.isLocked === true;
                        return (
                          <TouchableOpacity
                            key={field.name}
                            onPress={() => {
                              if (isLocked || lockedFields.includes(field.name)) {
                                // Locked fields are always in list
                                return;
                              }
                              if (isSelected) {
                                setSelectedListFields(prev => prev.filter(name => name !== field.name));
                              } else {
                                setSelectedListFields(prev => [...prev, field.name]);
                              }
                            }}
                            disabled={isLocked || lockedFields.includes(field.name)}
                            style={[
                              styles.fieldChip,
                              {
                                backgroundColor: (isSelected || isLocked || lockedFields.includes(field.name)) ? colors.primary + '20' : colors.surface,
                                borderColor: (isSelected || isLocked || lockedFields.includes(field.name)) ? colors.primary : colors.border,
                                opacity: isLocked || lockedFields.includes(field.name) ? 0.7 : 1,
                              }
                            ]}
                          >
                            <Ionicons 
                              name={isLocked || lockedFields.includes(field.name) ? "lock-closed" : (isSelected ? "checkbox" : "square-outline")} 
                              size={18} 
                              color={(isSelected || isLocked || lockedFields.includes(field.name)) ? colors.primary : colors.muted} 
                            />
                            <Text style={[
                              styles.fieldChipText,
                              { color: (isSelected || isLocked || lockedFields.includes(field.name)) ? colors.primary : colors.text }
                            ]}>
                              {fieldDef?.labelKey || field.name}
                              {isLocked || lockedFields.includes(field.name) ? ' 🔒' : ''}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {allAvailableFields.length > 0 && (
                  <View style={styles.formField}>
                    <Text style={[styles.formLabel, { color: colors.text }]}>
                      {t('common:detail_display_fields', { defaultValue: 'Detay Sayfası Ek Alanları' })}
                    </Text>
                    <View style={styles.infoBox}>
                      <Ionicons name="information-circle-outline" size={16} color={colors.info} />
                      <Text style={[styles.infoText, { color: colors.muted, fontSize: 11 }]}>
                        {t('common:detail_fields_info', { 
                          defaultValue: 'Detay sayfasında liste alanlarından sonra gösterilecek ek alanları seçin.' 
                        })}
                      </Text>
                    </View>
                    <View style={styles.fieldsContainer}>
                      {allAvailableFields
                        .filter(field => !selectedListFields.includes(field.name)) // Exclude list fields
                        .map((field) => {
                          const isSelected = selectedDetailFields.includes(field.name);
                          const fieldDef = moduleBaseFields.find(f => f.name === field.name) || 
                                           templateCustomFields.find(f => f.name === field.name);
                          return (
                            <TouchableOpacity
                              key={field.name}
                              onPress={() => {
                                if (isSelected) {
                                  setSelectedDetailFields(prev => prev.filter(name => name !== field.name));
                                } else {
                                  setSelectedDetailFields(prev => [...prev, field.name]);
                                }
                              }}
                              style={[
                                styles.fieldChip,
                                {
                                  backgroundColor: isSelected ? colors.secondary + '20' : colors.surface,
                                  borderColor: isSelected ? colors.secondary : colors.border,
                                }
                              ]}
                            >
                              <Ionicons 
                                name={isSelected ? "checkbox" : "square-outline"} 
                                size={18} 
                                color={isSelected ? colors.secondary : colors.muted} 
                              />
                              <Text style={[
                                styles.fieldChipText,
                                { color: isSelected ? colors.secondary : colors.text }
                              ]}>
                                {fieldDef?.labelKey || field.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                    </View>
                  </View>
                )}

                {/* Add Custom Field Form */}
                {isAddingCustomField && (
                  <Card style={{ marginTop: spacing.md, padding: spacing.md }}>
                    <Text style={[styles.formLabel, { color: colors.text, marginBottom: spacing.sm }]}>
                      {editingCustomField 
                        ? t('common:edit_custom_field', { defaultValue: 'Özel Alanı Düzenle' })
                        : t('common:new_custom_field', { defaultValue: 'Yeni Özel Alan' })}
                    </Text>
                    
                    <View style={styles.infoBox}>
                      <Ionicons name="information-circle-outline" size={16} color={colors.info} />
                      <Text style={[styles.infoText, { color: colors.muted, fontSize: 11 }]}>
                        {t('common:field_name_example', { 
                          defaultValue: `Örnek: "${getFieldNameExample()}" (Türkçe karakterler otomatik dönüştürülür: ğ→g, ö→o, ü→u, ş→s, ı→i, ç→c)` 
                        })}
                      </Text>
                    </View>
                    
                    <View style={{ marginTop: spacing.sm }}>
                      <Text style={[styles.formLabel, { color: colors.text, marginBottom: spacing.xs }]}>
                        {t('common:field_label', { defaultValue: 'Alan Etiketi (Gösterim Adı)' })}
                      </Text>
                      <Input
                        value={newCustomFieldLabel}
                        onChangeText={(text) => {
                          setNewCustomFieldLabel(text);
                          // Auto-generate field name from label if not editing
                          if (!editingCustomField) {
                            const generated = generateFieldName(text);
                            setNewCustomFieldName(generated);
                          }
                        }}
                        placeholder={t('common:enter_field_label', { defaultValue: 'Örn: Ürün Adı' })}
                      />
                    </View>
                    
                    <View style={{ marginTop: spacing.sm }}>
                      <Text style={[styles.formLabel, { color: colors.text, marginBottom: spacing.xs }]}>
                        {t('common:field_name', { defaultValue: 'Alan Adı (Teknik)' })}
                      </Text>
                      <Input
                        value={newCustomFieldName}
                        onChangeText={(text) => {
                          // Normalize on change
                          const normalized = normalizeFieldName(text);
                          setNewCustomFieldName(normalized);
                        }}
                        placeholder={getFieldNameExample()}
                        editable={false} // Always readonly - system generates field name automatically
                      />
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs }}>
                        <Ionicons name="information-circle-outline" size={14} color={colors.info} />
                        <Text style={[styles.infoText, { color: colors.muted, fontSize: 11 }]}>
                          {t('common:field_name_auto_generated', { defaultValue: 'Alan adı sistem tarafından otomatik oluşturulur' })}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={{ marginTop: spacing.sm }}>
                      <Text style={[styles.formLabel, { color: colors.text, marginBottom: spacing.xs }]}>
                        {t('common:field_type', { defaultValue: 'Alan Tipi' })}
                      </Text>
                      <Select
                        value={String(newCustomFieldType)}
                        options={[
                          { label: t('common:text', { defaultValue: 'Metin' }), value: 'text' },
                          { label: t('common:number', { defaultValue: 'Sayı' }), value: 'number' },
                          { label: t('common:date', { defaultValue: 'Tarih' }), value: 'date' },
                          { label: t('common:select', { defaultValue: 'Seçim' }), value: 'select' },
                          { label: t('common:textarea', { defaultValue: 'Metin Alanı' }), value: 'textarea' },
                          { label: t('common:signature', { defaultValue: 'İmza' }), value: 'signature' },
                          { label: t('common:image', { defaultValue: 'Fotoğraf' }), value: 'image' },
                          { label: t('common:tc_verification', { defaultValue: 'TC Kimlik Doğrulama' }), value: 'tc_verification' },
                          { label: t('common:imei_verification', { defaultValue: 'IMEI Doğrulama' }), value: 'imei_verification' },
                        ]}
                        onChange={(value) => {
                          const fieldType = value as DynamicField['type'];
                          setNewCustomFieldType(fieldType);
                          
                          // Auto-set field name for verification types
                          if (fieldType === 'tc_verification') {
                            setNewCustomFieldName('tcKimlik');
                          } else if (fieldType === 'imei_verification') {
                            setNewCustomFieldName('imei');
                          }
                        }}
                        placeholder={t('common:select_field_type', { defaultValue: 'Tip seçin' })}
                        disabled={editingCustomField?.isUsed === true} // Can't change type if field is used
                      />
                      {(newCustomFieldType === 'tc_verification' || newCustomFieldType === 'imei_verification') && (
                        <View style={[styles.infoBox, { backgroundColor: colors.info + '10', borderColor: colors.info + '30', marginTop: spacing.sm }]}>
                          <Ionicons name="information-circle-outline" size={16} color={colors.info} />
                          <Text style={[styles.infoText, { color: colors.text, fontSize: 11 }]}>
                            {newCustomFieldType === 'tc_verification' 
                              ? t('common:tc_verification_info', { 
                                  defaultValue: 'Bu alan TC kimlik doğrulama özelliği ile çalışır. TC kimlik no, doğum tarihi ve tam isim ile doğrulama yapılır. Modül ayarlarından TC kimlik doğrulamasını etkinleştirmeniz gerekir.' 
                                })
                              : t('common:imei_verification_info', { 
                                  defaultValue: 'Bu alan IMEI doğrulama özelliği ile çalışır. IMEI numarası ve opsiyonel cihaz bilgileri ile doğrulama yapılır. Modül ayarlarından IMEI doğrulamasını etkinleştirmeniz gerekir.' 
                                })
                            }
                          </Text>
                        </View>
                      )}
                      {editingCustomField?.isUsed && (
                        <Text style={[styles.warningText, { color: colors.warning }]}>
                          {t('common:field_type_locked', { defaultValue: 'Bu alan kullanıldığı için tipi değiştirilemez (veri kaybı önlemek için)' })}
                        </Text>
                      )}
                    </View>
                    
                    {newCustomFieldType === 'select' && (
                      <View style={{ marginTop: spacing.sm }}>
                        <Text style={[styles.formLabel, { color: colors.text, marginBottom: spacing.xs }]}>
                          {t('common:options', { defaultValue: 'Seçenekler' })}
                        </Text>
                        <Input
                          value={newCustomFieldOptions}
                          onChangeText={setNewCustomFieldOptions}
                          placeholder={t('common:options_placeholder', { defaultValue: 'Seçenek1, Seçenek2, Seçenek3' })}
                        />
                      </View>
                    )}
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
                      <TouchableOpacity
                        onPress={() => setNewCustomFieldRequired(!newCustomFieldRequired)}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
                      >
                        <Ionicons 
                          name={newCustomFieldRequired ? "checkbox" : "square-outline"} 
                          size={20} 
                          color={newCustomFieldRequired ? colors.primary : colors.muted} 
                        />
                        <Text style={{ color: colors.text, fontSize: 14 }}>
                          {t('common:required', { defaultValue: 'Zorunlu' })}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                      <Button
                        title={t('common:cancel', { defaultValue: 'İptal' })}
                        onPress={() => {
                          setIsAddingCustomField(false);
                          setEditingCustomField(null);
                          setNewCustomFieldName('');
                          setNewCustomFieldLabel('');
                          setNewCustomFieldType('text');
                          setNewCustomFieldRequired(false);
                          setNewCustomFieldOptions('');
                        }}
                        style={{ flex: 1, backgroundColor: colors.muted }}
                      />
                      <Button
                        title={editingCustomField ? t('common:save', { defaultValue: 'Kaydet' }) : t('common:add', { defaultValue: 'Ekle' })}
                        onPress={handleAddCustomField}
                        style={{ flex: 1 }}
                      />
                    </View>
                  </Card>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title={t('common:preview', { defaultValue: 'Önizleme' })}
                onPress={handleShowPreview}
                style={[styles.modalButton, { backgroundColor: colors.info }]}
              />
              <Button
                title={t('common:cancel', { defaultValue: 'İptal' })}
                onPress={handleCancel}
                style={[styles.modalButton, { backgroundColor: colors.muted }]}
              />
              <Button
                title={t('common:save', { defaultValue: 'Kaydet' })}
                onPress={handleSaveTemplate}
                style={styles.modalButton}
                disabled={createMutation.isPending || updateMutation.isPending}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal
        visible={previewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPreviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('common:form_preview', { defaultValue: 'Form Önizleme' })}
              </Text>
              <TouchableOpacity onPress={() => setPreviewModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.previewInfo}>
                <Text style={[styles.previewInfoText, { color: colors.muted }]}>
                  {t('common:preview_info', { 
                    defaultValue: 'Bu önizleme şablonun nasıl görüneceğini gösterir. Form alanları gerçek kullanımda dinamik olarak çalışacaktır.' 
                  })}
                </Text>
              </View>
              
              <View style={styles.previewForm}>
                <DynamicForm
                  namespace={moduleTranslationNamespace}
                  columns={2}
                  fields={previewFields}
                  values={previewValues}
                  onChange={(values) => setPreviewValues(values)}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title={t('common:close', { defaultValue: 'Kapat' })}
                onPress={() => setPreviewModalVisible(false)}
                style={styles.modalButton}
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
    infoSection: {
      padding: spacing.md,
      borderRadius: 12,
      marginBottom: spacing.md,
      borderWidth: 1,
    },
    infoTitle: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    infoSectionText: {
      fontSize: 13,
      lineHeight: 20,
    },
    infoBullet: {
      fontSize: 12,
      lineHeight: 18,
      flex: 1,
    },
    infoNote: {
      fontSize: 12,
      lineHeight: 18,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
      minHeight: 300,
    },
    descriptionText: {
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
    moduleSelector: {
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    moduleSelectorLabel: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    moduleScrollView: {
      marginHorizontal: -spacing.lg,
      paddingHorizontal: spacing.lg,
    },
    moduleButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    moduleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 8,
      borderWidth: 1,
      gap: spacing.xs,
    },
    moduleButtonActive: {
      borderColor: 'transparent',
    },
    moduleButtonText: {
      fontSize: 14,
      fontWeight: '500',
    },
    moduleButtonTextActive: {
      color: '#fff',
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
    fieldsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    fieldChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 8,
      borderWidth: 1,
      gap: spacing.xs,
    },
    fieldChipText: {
      fontSize: 14,
      fontWeight: '500',
    },
    addFieldButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 8,
      gap: spacing.xs,
    },
    addFieldButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    sectionContainer: {
      marginTop: spacing.md,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: spacing.sm,
    },
    customFieldsList: {
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    customFieldItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: 8,
      borderWidth: 1,
      gap: spacing.sm,
    },
    customFieldName: {
      fontSize: 14,
      fontWeight: '600',
    },
    customFieldType: {
      fontSize: 12,
      marginTop: spacing.xs / 2,
    },
    removeButton: {
      padding: spacing.sm,
      borderRadius: 6,
    },
    editButton: {
      padding: spacing.sm,
      borderRadius: 6,
    },
    toggleButton: {
      padding: spacing.sm,
      borderRadius: 6,
    },
    warningText: {
      fontSize: 11,
      marginTop: spacing.xs,
      fontStyle: 'italic',
    },
    previewInfo: {
      backgroundColor: colors.info + '10',
      padding: spacing.md,
      borderRadius: 8,
      marginBottom: spacing.md,
    },
    previewInfoText: {
      fontSize: 12,
      lineHeight: 18,
    },
    previewForm: {
      marginTop: spacing.md,
    },
  });

