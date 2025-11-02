/**
 * Form Template Form Helper
 * Reusable component for form template selection in form screens
 */

import React, { useMemo, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../core/contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { createFormTemplateService } from './createFormTemplateService';
import { FormTemplate } from '../types/formTemplate';
import Select from '../components/Select';
import spacing from '../../core/constants/spacing';
import { DynamicField } from '../components/DynamicForm';

interface FormTemplateSelectorProps {
  module: string;
  selectedTemplateId: string | number | null;
  onTemplateChange: (templateId: string | number | null) => void;
  translationNamespace?: string;
}

/**
 * Form Template Selector Component
 * Displays template selection UI in configuration style
 */
export function FormTemplateSelector({
  module,
  selectedTemplateId,
  onTemplateChange,
  translationNamespace,
}: FormTemplateSelectorProps) {
  const { colors } = useTheme();
  const { t } = useTranslation([translationNamespace || module, 'common']);
  
  // Load form templates for module
  const formTemplateService = useMemo(() => createFormTemplateService(module), [module]);
  const { data: templates = [] } = useQuery({
    queryKey: [module, 'form-templates', 'list'],
    queryFn: () => formTemplateService.list(),
    staleTime: 5 * 60 * 1000,
  });

  // Template options for dropdown
  const templateOptions = useMemo(() => {
    const allTemplates = templates
      .filter((template: FormTemplate) => template.isActive)
      .map((template: FormTemplate) => ({
        label: template.isDefault ? `${template.name} (${t(`${translationNamespace || module}:default`, { defaultValue: 'Varsayılan' })})` : template.name,
        value: String(template.id),
      }));
    
    // Add default option at the beginning (always available)
    return [
      { 
        label: t(`${translationNamespace || module}:default_template`, { defaultValue: 'Varsayılan Form' }), 
        value: 'default' 
      },
      ...allTemplates,
    ];
  }, [templates, t, module, translationNamespace]);

  return (
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
            {t(`${translationNamespace || module}:form_configuration`, { defaultValue: 'Form Yapılandırması' })}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
            {t(`${translationNamespace || module}:form_configuration_info`, { defaultValue: 'Form şablonunu seçin veya varsayılanı kullanın' })}
          </Text>
        </View>
      </View>
      <Select
        value={selectedTemplateId ? String(selectedTemplateId) : 'default'}
        options={templateOptions}
        onChange={(value) => {
          if (value === 'default') {
            onTemplateChange('default');
          } else {
            onTemplateChange(value ? Number(value) : null);
          }
        }}
        placeholder={t(`${translationNamespace || module}:select_template`, { defaultValue: 'Şablon seçin' })}
      />
      {templates.find((t: FormTemplate) => String(t.id) === String(selectedTemplateId))?.description && (
        <View style={{ marginTop: spacing.xs }}>
          <Text style={{ fontSize: 11, color: colors.muted, fontStyle: 'italic' }}>
            {templates.find((t: FormTemplate) => String(t.id) === String(selectedTemplateId))?.description}
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Hook to use form template in form screens
 */
export function useFormTemplateFields(
  module: string,
  selectedTemplateId: string | number | null,
  defaultFields: DynamicField[]
) {
  // Load form templates for module
  const formTemplateService = useMemo(() => createFormTemplateService(module), [module]);
  const { data: templates = [] } = useQuery({
    queryKey: [module, 'form-templates', 'list'],
    queryFn: () => formTemplateService.list(),
    staleTime: 5 * 60 * 1000,
  });

  // Get selected template
  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId || selectedTemplateId === 'default') {
      return null; // Use default fields when no template selected
    }
    return templates.find((t: FormTemplate) => String(t.id) === String(selectedTemplateId)) || null;
  }, [templates, selectedTemplateId]);

  // Get fields from template or default fields
  const templateFields = useMemo(() => {
    // Always show base fields - if template has baseFields use those, otherwise use default fields
    // Add template customFields on top of base fields
    const baseFields = selectedTemplate?.baseFields?.length 
      ? selectedTemplate.baseFields 
      : defaultFields;
    return [
      ...baseFields,
      ...(selectedTemplate?.customFields || [])
    ];
  }, [selectedTemplate, defaultFields]);

  return {
    selectedTemplate,
    templateFields,
    templates,
  };
}

