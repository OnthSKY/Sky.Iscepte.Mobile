/**
 * ProductFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { productEntityService } from '../services/productServiceAdapter';
import DynamicForm from '../../../shared/components/DynamicForm';
import { Product, ProductCustomField } from '../services/productService';
import { productFormFields, productValidator } from '../config/productFormConfig';
import CustomFieldsManager from '../../../shared/components/CustomFieldsManager';
import Card from '../../../shared/components/Card';
import spacing from '../../../core/constants/spacing';
import globalFieldsService from '../services/globalFieldsService';
import { useProductsQuery } from '../hooks/useProductsQuery';
import CategorySelect from '../components/CategorySelect';
import CurrencySelect from '../components/CurrencySelect';
import { createEnhancedValidator, getInitialDataWithCustomFields } from '../../../shared/utils/customFieldsUtils';
import { createFormTemplateService } from '../../../shared/utils/createFormTemplateService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FormTemplate } from '../../../shared/types/formTemplate';
import Select from '../../../shared/components/Select';
import { customFieldToDynamicField } from '../../../shared/utils/formTemplateUtils';

interface ProductFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function ProductFormScreen({ mode }: ProductFormScreenProps = {}) {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['stock', 'common']);
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  // Default values for create mode
  const getInitialData = (): Partial<Product> => {
    return getInitialDataWithCustomFields<Product>(formMode, {
      stock: 1, // Default stock value
      currency: 'TRY', // Default currency is TL
      isActive: true,
    });
  };

  // Global fields state
  const [globalFields, setGlobalFields] = useState<ProductCustomField[]>([]);

  // Form template state - default to 'default' to use productFormFields
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | number | null>('default');
  
  // Load form templates for stock module
  const formTemplateService = useMemo(() => createFormTemplateService('stock'), []);
  const { data: templates = [] } = useQuery({
    queryKey: ['stock', 'form-templates', 'list'],
    queryFn: () => formTemplateService.list(),
    staleTime: 5 * 60 * 1000,
  });

  // Get default template or first template
  const defaultTemplate = useMemo(() => {
    const defaultT = templates.find((t: FormTemplate) => t.isDefault && t.isActive);
    return defaultT || (templates.length > 0 ? templates[0] : null);
  }, [templates]);

  // Set default to 'default' (use productFormFields) on mount
  useEffect(() => {
    if (!selectedTemplateId) {
      setSelectedTemplateId('default');
    }
  }, [selectedTemplateId]);

  // Get selected template
  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId || selectedTemplateId === 'default') {
      return null; // Use default productFormFields when no template selected
    }
    return templates.find((t: FormTemplate) => String(t.id) === String(selectedTemplateId)) || null;
  }, [templates, selectedTemplateId]);

  // Load products to extract unique categories
  const { data: productsData } = useProductsQuery();
  const [categories, setCategories] = useState<string[]>([]);

  // Extract unique categories from products
  useEffect(() => {
    if (productsData?.items) {
      const uniqueCategories = Array.from(
        new Set(
          productsData.items
            .map((p) => p.category)
            .filter((cat): cat is string => !!cat && cat.trim() !== '')
        )
      ).sort();
      setCategories(uniqueCategories);
    }
  }, [productsData]);

  // Category options for CategorySelect
  const categoryOptions = useMemo(
    () => categories.map((cat) => ({ label: cat, value: cat })),
    [categories]
  );

  // Handle category added - add new category to list
  const handleCategoryAdded = useCallback((categoryName: string) => {
    setCategories((prev) => {
      // Add new category if it doesn't exist
      if (!prev.includes(categoryName)) {
        return [...prev, categoryName].sort();
      }
      return prev;
    });
  }, []);

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
  const handleGlobalFieldsChange = async (fields: ProductCustomField[]) => {
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
            const updatedTemplate = await formTemplateService.update(selectedTemplateId, {
              customFields: updatedCustomFields,
            });
            
            // Invalidate and refetch templates to get the updated one
            queryClient.invalidateQueries({ queryKey: ['stock', 'form-templates', 'list'] });
            
            // Optionally, show a toast or notification
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

  // Enhanced validator for required global custom fields
  const enhancedValidator = createEnhancedValidator<Product>(
    productValidator,
    globalFields,
    'stock'
  );

  // Get title based on mode
  const screenTitle = formMode === 'edit' 
    ? t('stock:edit_stock', { defaultValue: 'Stok düzenle' })
    : t('stock:new_stock', { defaultValue: 'Yeni Ürün Ekle' });

  return (
    <FormScreenContainer
      service={productEntityService}
      config={{
        entityName: 'stock_item',
        translationNamespace: 'stock',
        mode: formMode,
      }}
      initialData={getInitialData()}
      validator={(data) => {
        // Get current template fields for validation
        const baseFields = selectedTemplate?.baseFields?.length 
          ? selectedTemplate.baseFields 
          : productFormFields;
        const templateFields = [
          ...baseFields,
          ...(selectedTemplate?.customFields || [])
        ];
        
        // Create enhanced validator with template fields
        const validatorWithTemplate = createEnhancedValidator<Product>(
          productValidator,
          globalFields,
          'stock',
          templateFields
        );
        
        return validatorWithTemplate(data);
      }}
      title={screenTitle}
      renderForm={(formData, updateField, errors) => {
        // Use formData's customFields directly or empty array
        const customFields = (formData.customFields as ProductCustomField[]) || [];

        const handleCustomFieldsChange = (fields: ProductCustomField[]) => {
          updateField('customFields' as keyof Product, fields);
        };

        // Get fields from template or default fields
        // Always show base fields - if template has baseFields use those, otherwise use default productFormFields
        // Add template customFields on top of base fields
        const baseFields = selectedTemplate?.baseFields?.length 
          ? selectedTemplate.baseFields 
          : productFormFields;
        const templateFields = [
          ...baseFields,
          ...(selectedTemplate?.customFields || [])
        ];

        // Build form fields with custom category and currency fields
        const fieldsWithCustoms = useMemo(() => {
          return templateFields.map((field) => {
            if (field.name === 'category') {
              return {
                ...field,
                render: (value: any, onChange: (v: any) => void) => (
                  <CategorySelect
                    value={value || ''}
                    options={categoryOptions}
                    placeholder={field.placeholderKey || 'Kategori Seçin'}
                    onChange={(val) => onChange(val)}
                    onCategoryAdded={handleCategoryAdded}
                  />
                ),
              };
            }
            if (field.name === 'currency') {
              return {
                ...field,
                render: (value: any, onChange: (v: any) => void) => (
                  <CurrencySelect
                    value={value}
                    onChange={(val) => onChange(val)}
                    placeholder="Para Birimi"
                  />
                ),
              };
            }
            return field;
          });
        }, [templateFields, categoryOptions, handleCategoryAdded]);

        // Template options for dropdown
        // Always include default/base option - show all active templates (including default ones)
        const templateOptions = useMemo(() => {
          const allTemplates = templates
            .filter((template: FormTemplate) => template.isActive)
            .map((template: FormTemplate) => ({
              label: template.isDefault ? `${template.name} (${t('stock:default', { defaultValue: 'Varsayılan' })})` : template.name,
              value: String(template.id),
            }));
          
          // Add default option at the beginning (always available)
          return [
            { 
              label: t('stock:default_template', { defaultValue: 'Varsayılan Form' }), 
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
                    {t('stock:form_configuration', { defaultValue: 'Form Yapılandırması' })}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                    {t('stock:form_configuration_info', { defaultValue: 'Form şablonunu seçin veya varsayılanı kullanın' })}
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
                placeholder={t('stock:select_template', { defaultValue: 'Şablon seçin' })}
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
                  {t('stock:manage_templates', { defaultValue: 'Form şablonlarını yönetmek için ayarlara gidin' })}
                </Text>
                <Ionicons name="chevron-forward-outline" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <DynamicForm
              namespace="stock"
              columns={2}
              fields={fieldsWithCustoms}
              values={{
                ...formData,
                stock: formData.stock ?? 1, // Ensure default value is set
              }}
              onChange={(v) => {
                (Object.keys(v) as Array<keyof typeof v>).forEach((key) => {
                  updateField(key as keyof Product, v[key]);
                });
              }}
            />

            {/* Custom Fields Section */}
            <Card>
              <CustomFieldsManager<ProductCustomField>
                customFields={customFields}
                onChange={handleCustomFieldsChange}
                availableGlobalFields={globalFields}
                onGlobalFieldsChange={handleGlobalFieldsChange}
                module="stock"
                errors={errors}
              />
            </Card>
          </View>
        );
      }}
    />
  );
}

