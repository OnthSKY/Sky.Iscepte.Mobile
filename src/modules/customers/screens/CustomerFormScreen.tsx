/**
 * CustomerFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { customerEntityService } from '../services/customerServiceAdapter';
import DynamicForm from '../../../shared/components/DynamicForm';
import { Customer, CustomerCustomField } from '../services/customerService';
import { customerFormFields, customerValidator } from '../config/customerFormConfig';
import CustomFieldsManager from '../../../shared/components/CustomFieldsManager';
import Card from '../../../shared/components/Card';
import spacing from '../../../core/constants/spacing';
import globalFieldsService from '../services/globalFieldsService';
import { createEnhancedValidator, getInitialDataWithCustomFields } from '../../../shared/utils/customFieldsUtils';
import { createFormTemplateService } from '../../../shared/utils/createFormTemplateService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FormTemplate } from '../../../shared/types/formTemplate';
import Select from '../../../shared/components/Select';
import { customFieldToDynamicField } from '../../../shared/utils/formTemplateUtils';

interface CustomerFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function CustomerFormScreen({ mode }: CustomerFormScreenProps = {}) {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['customers', 'common']);
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  // Global fields state
  const [globalFields, setGlobalFields] = useState<CustomerCustomField[]>([]);

  // Form template state - default to 'default' to use customerFormFields
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | number | null>('default');
  
  // Load form templates for customers module
  const formTemplateService = useMemo(() => createFormTemplateService('customers'), []);
  const { data: templates = [] } = useQuery({
    queryKey: ['customers', 'form-templates', 'list'],
    queryFn: () => formTemplateService.list(),
    staleTime: 5 * 60 * 1000,
  });

  // Set default to 'default' (use customerFormFields) on mount
  useEffect(() => {
    if (!selectedTemplateId) {
      setSelectedTemplateId('default');
    }
  }, [selectedTemplateId]);

  // Get selected template
  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId || selectedTemplateId === 'default') {
      return null; // Use default customerFormFields when no template selected
    }
    return templates.find((t: FormTemplate) => String(t.id) === String(selectedTemplateId)) || null;
  }, [templates, selectedTemplateId]);

  // Load global fields on mount
  useEffect(() => {
    const loadGlobalFields = async () => {
      try {
        const fields = await globalFieldsService.getAll();
        setGlobalFields(fields);
      } catch (error) {
        console.error('Failed to load global fields:', error);
      }
    };
    loadGlobalFields();
  }, []);

  // Handle global fields change
  const handleGlobalFieldsChange = async (fields: CustomerCustomField[]) => {
    const previousGlobalFields = globalFields;
    setGlobalFields(fields);
    try {
      await globalFieldsService.save(fields);
      
      // If a template is selected, check if a new global field was added and add it to the template
      if (selectedTemplate && selectedTemplateId) {
        // Find newly added global fields (those in new list but not in previous list)
        const newGlobalFields = fields.filter(newField => 
          !previousGlobalFields.some(prevField => prevField.key === newField.key)
        );
        
        if (newGlobalFields.length > 0) {
          // Convert new global fields to DynamicField format
          const newTemplateFields = newGlobalFields.map(customField => 
            customFieldToDynamicField(customField)
          );
          
          // Get current template custom fields
          const currentCustomFields = selectedTemplate.customFields || [];
          
          // Add new fields to template (avoid duplicates)
          const updatedCustomFields = [...currentCustomFields];
          newTemplateFields.forEach(newField => {
            if (!updatedCustomFields.some(f => f.name === newField.name)) {
              updatedCustomFields.push(newField);
            }
          });
          
          // Update the template with new custom fields
          try {
            await formTemplateService.update(selectedTemplateId, {
              customFields: updatedCustomFields,
            });
            
            // Invalidate and refetch templates to get the updated one
            queryClient.invalidateQueries({ queryKey: ['customers', 'form-templates', 'list'] });
            
            console.log('Global field(s) added to selected template:', newGlobalFields.map(f => f.label).join(', '));
          } catch (error) {
            console.error('Failed to update template with new global fields:', error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to save global fields:', error);
    }
  };

  // Default values for create mode
  const getInitialData = (): Partial<Customer> => {
    return getInitialDataWithCustomFields<Customer>(formMode, {
      isActive: true,
    });
  };

  // Base validator - will be enhanced with template fields in renderForm

  // Get title based on mode
  const screenTitle = formMode === 'edit' 
    ? t('customers:edit_customer', { defaultValue: 'Müşteri Düzenle' })
    : t('customers:new_customer', { defaultValue: 'Yeni Müşteri' });

  return (
    <FormScreenContainer
      service={customerEntityService}
      config={{
        entityName: 'customer',
        translationNamespace: 'customers',
        mode: formMode,
      }}
      initialData={getInitialData()}
      validator={(data) => {
        // Get current template fields for validation
        const baseFields = selectedTemplate?.baseFields?.length 
          ? selectedTemplate.baseFields 
          : customerFormFields;
        const templateFields = [
          ...baseFields,
          ...(selectedTemplate?.customFields || [])
        ];
        
        // Create enhanced validator with template fields
        const validatorWithTemplate = createEnhancedValidator<Customer>(
          customerValidator,
          globalFields,
          'customers',
          templateFields
        );
        
        return validatorWithTemplate(data);
      }}
      title={screenTitle}
      renderForm={(formData, updateField, errors) => {
        // Use formData's customFields directly or empty array
        const customFields = (formData.customFields as CustomerCustomField[]) || [];

        const handleCustomFieldsChange = (fields: CustomerCustomField[]) => {
          updateField('customFields' as keyof Customer, fields);
        };

        // Get fields from template or default fields
        // Always show base fields - if template has baseFields use those, otherwise use default customerFormFields
        // Add template customFields on top of base fields
        const baseFields = selectedTemplate?.baseFields?.length 
          ? selectedTemplate.baseFields 
          : customerFormFields;
        const templateFields = [
          ...baseFields,
          ...(selectedTemplate?.customFields || [])
        ];

        // Template options for dropdown
        // Always include default/base option - show all active templates (including default ones)
        const templateOptions = useMemo(() => {
          const allTemplates = templates
            .filter((template: FormTemplate) => template.isActive)
            .map((template: FormTemplate) => ({
              label: template.isDefault ? `${template.name} (${t('customers:default', { defaultValue: 'Varsayılan' })})` : template.name,
              value: String(template.id),
            }));
          
          // Add default option at the beginning (always available)
          return [
            { 
              label: t('customers:default_template', { defaultValue: 'Varsayılan Form' }), 
              value: 'default' 
            },
            ...allTemplates,
          ];
        }, [templates, t]);

        return (
          <View style={{ gap: spacing.md }}>
            {/* Template Selector - Configuration Section */}
            <View style={{ 
              backgroundColor: colors.background, 
              borderWidth: 1, 
              borderColor: colors.border,
              borderRadius: 8,
              padding: spacing.md,
              borderStyle: 'solid',
              borderLeftWidth: 3,
              borderLeftColor: colors.primary,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                <View style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  backgroundColor: colors.primary + '10',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Ionicons name="construct-outline" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
                    {t('customers:form_configuration', { defaultValue: 'Form Yapılandırması' })}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                    {t('customers:form_configuration_info', { defaultValue: 'Form şablonunu seçin veya varsayılanı kullanın' })}
                  </Text>
                </View>
              </View>
              <Select
                value={selectedTemplateId ? String(selectedTemplateId) : 'default'}
                options={templateOptions}
                onChange={(value) => {
                  if (value === 'default') {
                    setSelectedTemplateId('default');
                  } else {
                    setSelectedTemplateId(value ? Number(value) : null);
                  }
                }}
                placeholder={t('customers:select_template', { defaultValue: 'Şablon seçin' })}
              />
              {selectedTemplate?.description && (
                <View style={{ marginTop: spacing.xs }}>
                  <Text style={{ fontSize: 11, color: colors.muted, fontStyle: 'italic' }}>
                    {selectedTemplate.description}
                  </Text>
                </View>
              )}
              
              {/* Link to Settings for template management */}
              <TouchableOpacity
                onPress={() => navigation.navigate('FormTemplateManagement')}
                style={{ 
                  marginTop: spacing.sm, 
                  padding: spacing.sm, 
                  borderRadius: 6,
                  backgroundColor: colors.primary + '08',
                  borderWidth: 1,
                  borderColor: colors.primary + '20',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}
              >
                <Ionicons name="settings-outline" size={14} color={colors.primary} />
                <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '500' }}>
                  {t('customers:manage_templates', { defaultValue: 'Form şablonlarını yönetmek için ayarlara gidin' })}
                </Text>
                <Ionicons name="chevron-forward-outline" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <DynamicForm
              namespace="customers"
              columns={2}
              fields={templateFields}
              values={formData}
              onChange={(v) => {
                Object.keys(v).forEach((key) => {
                  updateField(key as keyof Customer, (v as any)[key]);
                });
              }}
            />

            {/* Custom Fields Section */}
            <Card>
                  <CustomFieldsManager<CustomerCustomField>
                    customFields={customFields}
                    onChange={handleCustomFieldsChange}
                    availableGlobalFields={globalFields}
                    onGlobalFieldsChange={handleGlobalFieldsChange}
                    module="customers"
                    errors={errors}
                  />
            </Card>
          </View>
        );
      }}
    />
  );
}

