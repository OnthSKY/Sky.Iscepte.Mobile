/**
 * useFormTemplate Hook
 * 
 * Provides access to form templates for a given module
 * Returns the default template or first available template
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createFormTemplateService } from '../utils/createFormTemplateService';
import { FormTemplate } from '../types/formTemplate';

/**
 * Hook to get form templates for a module
 * @param module Module key (e.g., 'stock', 'customers')
 * @returns Object with templates array, defaultTemplate, and loading state
 */
export function useFormTemplate(module: string) {
  const formTemplateService = useMemo(() => createFormTemplateService(module), [module]);
  
  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: [module, 'form-templates', 'list'],
    queryFn: () => formTemplateService.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get default template or first active template
  const defaultTemplate = useMemo(() => {
    const defaultT = templates.find((t: FormTemplate) => t.isDefault && t.isActive);
    return defaultT || (templates.length > 0 && templates.find((t: FormTemplate) => t.isActive)) || null;
  }, [templates]);

  return {
    templates: templates as FormTemplate[],
    defaultTemplate,
    isLoading,
    error,
  };
}

/**
 * Hook to get a specific form template by ID
 * @param module Module key (e.g., 'stock', 'customers')
 * @param templateId Template ID (optional)
 * @returns Template object or null
 */
export function useFormTemplateById(module: string, templateId: string | number | null | undefined) {
  const { templates, defaultTemplate } = useFormTemplate(module);
  
  const template = useMemo(() => {
    if (!templateId) return defaultTemplate;
    return templates.find((t: FormTemplate) => String(t.id) === String(templateId)) || defaultTemplate;
  }, [templateId, templates, defaultTemplate]);

  return template;
}

