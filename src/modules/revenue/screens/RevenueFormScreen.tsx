/**
 * RevenueFormScreen - Unified Create/Edit Screen
 *
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useWindowDimensions, View, TouchableOpacity, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { revenueEntityService } from '../services/revenueServiceAdapter';
import DynamicForm, { DynamicField } from '../../../shared/components/DynamicForm';
import { Revenue } from '../store/revenueStore';
import RevenueTypeSelect from '../components/RevenueTypeSelect';
import expenseTypeService from '../../expenses/services/expenseTypeService';
import { ExpenseType } from '../../expenses/services/expenseTypeService';
import { useTranslation } from 'react-i18next';
import { baseRevenueFormFields, revenueValidator } from '../config/revenueFormConfig';
import { createFormTemplateService } from '../../../shared/utils/createFormTemplateService';
import { FormTemplate } from '../../../shared/types/formTemplate';
import { createEnhancedValidator } from '../../../shared/utils/formTemplateUtils';
import Select from '../../../shared/components/Select';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../core/contexts/ThemeContext';
import Card from '../../../shared/components/Card';
import spacing from '../../../core/constants/spacing';

interface RevenueFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function RevenueFormScreen({ mode }: RevenueFormScreenProps = {}) {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { t } = useTranslation('revenue');
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const columns = width < 400 ? 1 : 2;

  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  // Form template state - default to 'default' to use baseRevenueFormFields
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | number | null>('default');

  // Load form templates for revenue module
  const formTemplateService = useMemo(() => createFormTemplateService('revenue'), []);
  const { data: templates = [] } = useQuery({
    queryKey: ['revenue', 'form-templates', 'list'],
    queryFn: () => formTemplateService.list(),
    staleTime: 5 * 60 * 1000,
  });

  // Set default to 'default' (use baseRevenueFormFields) on mount
  useEffect(() => {
    if (!selectedTemplateId) {
      setSelectedTemplateId('default');
    }
  }, [selectedTemplateId]);

  // Get selected template
  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId || selectedTemplateId === 'default') {
      return null; // Use default baseRevenueFormFields when no template selected
    }
    return templates.find((t: FormTemplate) => String(t.id) === String(selectedTemplateId)) || null;
  }, [templates, selectedTemplateId]);

  const [revenueTypes, setRevenueTypes] = useState<ExpenseType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  useEffect(() => {
    loadRevenueTypes();
  }, []);

  const loadRevenueTypes = async () => {
    setLoadingTypes(true);
    try {
      const types = await expenseTypeService.list();
      setRevenueTypes(types);
    } catch (err) {
      // Failed to load revenue types - will use empty list
    } finally {
      setLoadingTypes(false);
    }
  };

  const typeOptions = useMemo(
    () => revenueTypes.map((i) => ({ label: i.name, value: String(i.id) })),
    [revenueTypes]
  );

  // Refresh revenue types list when needed
  const handleTypeAdded = useCallback(() => {
    loadRevenueTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build dynamic fields - category first, then other fields
  // Template fields are integrated here
  const revenueFields: DynamicField[] = useMemo(() => {
    const fields: DynamicField[] = [
      {
        name: 'revenueTypeId',
        labelKey: 'category',
        type: 'custom',
        render: (value, onChange) => (
          <RevenueTypeSelect
            options={typeOptions}
            value={String(value || '')}
            onChange={onChange}
            placeholder={
              loadingTypes
                ? t('loading', { defaultValue: 'Yükleniyor...' })
                : t('category', { defaultValue: 'Kategori' })
            }
            onTypeAdded={handleTypeAdded}
          />
        ),
        required: false,
      },
    ];

    // Get base fields from template or use default
    const baseFields = selectedTemplate?.baseFields?.length
      ? selectedTemplate.baseFields
      : baseRevenueFormFields;

    // Add base fields
    fields.push(...baseFields);

    // Add template custom fields
    if (selectedTemplate?.customFields && selectedTemplate.customFields.length > 0) {
      fields.push(...selectedTemplate.customFields);
    }

    return fields;
  }, [typeOptions, loadingTypes, selectedTemplate, t, handleTypeAdded]);

  // Template options for dropdown
  const templateOptions = useMemo(() => {
    const allTemplates = templates
      .filter((template: FormTemplate) => template.isActive)
      .map((template: FormTemplate) => ({
        label: template.isDefault
          ? `${template.name} (${t('revenue:default', { defaultValue: 'Varsayılan' })})`
          : template.name,
        value: String(template.id),
      }));

    // Add default option at the beginning (always available)
    return [
      {
        label: t('revenue:default_template', { defaultValue: 'Varsayılan Form' }),
        value: 'default',
      },
      ...allTemplates,
    ];
  }, [templates, t]);

  return (
    <FormScreenContainer
      service={revenueEntityService}
      config={{
        entityName: 'revenue',
        translationNamespace: 'revenue',
        mode: formMode,
      }}
      validator={(data) => {
        // Get current template fields for validation
        const baseFields = selectedTemplate?.baseFields?.length
          ? selectedTemplate.baseFields
          : baseRevenueFormFields;
        const templateFields = [...baseFields, ...(selectedTemplate?.customFields || [])];

        // Create enhanced validator with template fields
        const validatorWithTemplate = createEnhancedValidator<Revenue>(
          revenueValidator,
          [],
          'revenue',
          templateFields
        );

        return validatorWithTemplate(data);
      }}
      renderForm={(formData, updateField, _errors) => {
        // Ensure default values are set
        const formDataWithDefaults = {
          ...formData,
          source: formData.source || 'manual',
        };

        return (
          <View style={{ gap: spacing.md }}>
            {/* Template Selector - Configuration Section */}
            <Card
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: spacing.sm,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  {t('revenue:form_template', { defaultValue: 'Form Şablonu' })}
                </Text>
              </View>

              <Select
                label={t('revenue:select_template', { defaultValue: 'Şablon Seçin' })}
                value={selectedTemplateId ? String(selectedTemplateId) : 'default'}
                options={templateOptions}
                onChange={(value) => {
                  if (value === 'default') {
                    setSelectedTemplateId('default');
                  } else {
                    setSelectedTemplateId(value ? Number(value) : null);
                  }
                }}
                placeholder={t('revenue:select_template', { defaultValue: 'Şablon seçin' })}
              />
              {selectedTemplate?.description && (
                <View style={{ marginTop: spacing.sm }}>
                  <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 18 }}>
                    {selectedTemplate.description}
                  </Text>
                </View>
              )}
              {/* Link to Settings for template management */}
              <TouchableOpacity
                onPress={() => navigation.navigate('FormTemplateManagement', { module: 'revenue' })}
                style={{
                  marginTop: spacing.sm,
                  paddingVertical: spacing.xs,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}
              >
                <Ionicons name="settings-outline" size={16} color={colors.primary} />
                <Text style={{ fontSize: 13, color: colors.primary }}>
                  {t('revenue:manage_templates', {
                    defaultValue: 'Form şablonlarını yönetmek için ayarlara gidin',
                  })}
                </Text>
              </TouchableOpacity>
            </Card>

            <DynamicForm
              namespace="revenue"
              columns={columns}
              fields={revenueFields}
              values={formDataWithDefaults}
              onChange={(v) => {
                Object.keys(v).forEach((key) => {
                  updateField(key as keyof Revenue, v[key]);
                });
              }}
            />
          </View>
        );
      }}
      title={formMode === 'create' ? t('new_revenue', { defaultValue: 'New Revenue' }) : undefined}
    />
  );
}
