/**
 * ExpenseFormScreen - Unified Create/Edit Screen
 *
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { View, useWindowDimensions, TouchableOpacity, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { expenseEntityService } from '../services/expenseServiceAdapter';
import DynamicForm, { DynamicField } from '../../../shared/components/DynamicForm';
import { Expense, ExpenseCustomField } from '../store/expenseStore';
import ExpenseTypeSelect from '../components/ExpenseTypeSelect';
import expenseTypeService, { ExpenseType } from '../services/expenseTypeService';
import { useTranslation } from 'react-i18next';
import { baseExpenseFormFields, expenseValidator } from '../config/expenseFormConfig';
import CustomFieldsManager from '../../../shared/components/CustomFieldsManager';
import Card from '../../../shared/components/Card';
import spacing from '../../../core/constants/spacing';
import { getInitialDataWithCustomFields } from '../../../shared/utils/customFieldsUtils';
import { createFormTemplateService } from '../../../shared/utils/createFormTemplateService';
import { FormTemplate } from '../../../shared/types/formTemplate';
import { createEnhancedValidator as createTemplateValidator } from '../../../shared/utils/formTemplateUtils';
import Select from '../../../shared/components/Select';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../core/contexts/ThemeContext';

interface ExpenseFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function ExpenseFormScreen({ mode }: ExpenseFormScreenProps = {}) {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { t } = useTranslation('expenses');
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const columns = width < 400 ? 1 : 2;

  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  // Form template state - default to 'default' to use baseExpenseFormFields
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | number | null>('default');

  // Load form templates for expenses module
  const formTemplateService = useMemo(() => createFormTemplateService('expenses'), []);
  const { data: templates = [] } = useQuery({
    queryKey: ['expenses', 'form-templates', 'list'],
    queryFn: () => formTemplateService.list(),
    staleTime: 5 * 60 * 1000,
  });

  // Set default to 'default' (use baseExpenseFormFields) on mount
  useEffect(() => {
    if (!selectedTemplateId) {
      setSelectedTemplateId('default');
    }
  }, [selectedTemplateId]);

  // Get selected template
  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId || selectedTemplateId === 'default') {
      return null; // Use default baseExpenseFormFields when no template selected
    }
    return templates.find((t: FormTemplate) => String(t.id) === String(selectedTemplateId)) || null;
  }, [templates, selectedTemplateId]);

  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  useEffect(() => {
    loadExpenseTypes();
  }, []);

  const loadExpenseTypes = async () => {
    setLoadingTypes(true);
    try {
      const response = await expenseTypeService.list();
      // Handle both cases: PaginatedData format or direct array
      let types: ExpenseType[] = [];
      if (Array.isArray(response)) {
        types = response;
      } else if (response && typeof response === 'object' && 'items' in response) {
        // PaginatedData format
        types = (response as any).items || [];
      }
      setExpenseTypes(Array.isArray(types) ? types : []);
    } catch (err) {
      // Failed to load expense types - will use empty list
      setExpenseTypes([]);
    } finally {
      setLoadingTypes(false);
    }
  };

  const getInitialData = (): Partial<Expense> => {
    return getInitialDataWithCustomFields<Expense>(formMode, {
      type: 'expense',
      source: 'manual',
    });
  };

  // Enhanced validator will be created with template fields in renderForm

  const typeOptions = useMemo(
    () => expenseTypes.map((i) => ({ label: i.name, value: String(i.id) })),
    [expenseTypes]
  );

  // Refresh expense types list when needed
  const handleTypeAdded = useCallback(() => {
    loadExpenseTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build dynamic fields - category first, then other fields (only expense type, no income)
  // Template fields are integrated here
  const expenseFields: DynamicField[] = useMemo(() => {
    const fields: DynamicField[] = [
      {
        name: 'expenseTypeId',
        labelKey: 'category',
        type: 'custom',
        render: (value, onChange) => (
          <ExpenseTypeSelect
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
      : baseExpenseFormFields;

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
          ? `${template.name} (${t('expenses:default', { defaultValue: 'Varsayılan' })})`
          : template.name,
        value: String(template.id),
      }));

    // Add default option at the beginning (always available)
    return [
      {
        label: t('expenses:default_template', { defaultValue: 'Varsayılan Form' }),
        value: 'default',
      },
      ...allTemplates,
    ];
  }, [templates, t]);

  const screenTitle =
    formMode === 'create'
      ? t('new_expense', { defaultValue: 'New Expense' })
      : t('edit_expense', { defaultValue: 'Edit Expense' });

  return (
    <FormScreenContainer
      service={expenseEntityService}
      config={{
        entityName: 'expense',
        translationNamespace: 'expenses',
        mode: formMode,
      }}
      initialData={getInitialData()}
      validator={(data) => {
        // Get current template fields for validation
        const baseFields = selectedTemplate?.baseFields?.length
          ? selectedTemplate.baseFields
          : baseExpenseFormFields;
        const templateFields = [...baseFields, ...(selectedTemplate?.customFields || [])];

        // Create enhanced validator with template fields
        const validatorWithTemplate = createTemplateValidator<Expense>(
          expenseValidator,
          [],
          'expenses',
          templateFields
        );

        return validatorWithTemplate(data);
      }}
      renderForm={(formData, updateField, _errors) => {
        const customFields = (formData.customFields as ExpenseCustomField[]) || [];

        const handleCustomFieldsChange = (fields: ExpenseCustomField[]) => {
          updateField('customFields' as keyof Expense, fields);
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
                  {t('expenses:form_template', { defaultValue: 'Form Şablonu' })}
                </Text>
              </View>

              <Select
                label={t('expenses:select_template', { defaultValue: 'Şablon Seçin' })}
                value={selectedTemplateId ? String(selectedTemplateId) : 'default'}
                options={templateOptions}
                onChange={(value) => {
                  if (value === 'default') {
                    setSelectedTemplateId('default');
                  } else {
                    setSelectedTemplateId(value ? Number(value) : null);
                  }
                }}
                placeholder={t('expenses:select_template', { defaultValue: 'Şablon seçin' })}
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
                onPress={() =>
                  navigation.navigate('FormTemplateManagement', { module: 'expenses' })
                }
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
                  {t('expenses:manage_templates', {
                    defaultValue: 'Form şablonlarını yönetmek için ayarlara gidin',
                  })}
                </Text>
              </TouchableOpacity>
            </Card>

            <DynamicForm
              namespace="expenses"
              columns={columns}
              fields={expenseFields}
              values={formData}
              onChange={(v) => {
                Object.keys(v).forEach((key) => {
                  updateField(key as keyof Expense, (v as any)[key]);
                });
              }}
            />
            <Card>
              <CustomFieldsManager<ExpenseCustomField>
                customFields={customFields}
                onChange={handleCustomFieldsChange}
                module="expenses"
              />
            </Card>
          </View>
        );
      }}
      title={screenTitle}
    />
  );
}
