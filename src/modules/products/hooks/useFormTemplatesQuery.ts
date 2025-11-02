/**
 * Form Templates Query Hooks
 * 
 * React Query hooks for form template management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import formTemplateService from '../services/formTemplateService';
import { FormTemplate, FormTemplateConfig } from '../../../shared/types/formTemplate';
import { queryKeys } from '../../../core/services/queryClient';

/**
 * Query key factory for form templates
 */
export const formTemplateKeys = {
  all: (module: string) => [module, 'form-templates'] as const,
  lists: (module: string) => [...formTemplateKeys.all(module), 'list'] as const,
  list: (module: string) => [...formTemplateKeys.lists(module)] as const,
  details: (module: string) => [...formTemplateKeys.all(module), 'detail'] as const,
  detail: (module: string, id: string | number) => [...formTemplateKeys.details(module), id] as const,
};

const MODULE = 'stock'; // Products module uses 'stock' as the module key

/**
 * Hook to fetch all form templates for products module
 */
export function useFormTemplatesQuery() {
  return useQuery({
    queryKey: formTemplateKeys.list(MODULE),
    queryFn: () => formTemplateService.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single form template by ID
 */
export function useFormTemplateQuery(id: string | number | null | undefined) {
  return useQuery({
    queryKey: formTemplateKeys.detail(MODULE, id!),
    queryFn: () => formTemplateService.get(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new form template
 */
export function useCreateFormTemplateMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (config: FormTemplateConfig) => formTemplateService.create(config),
    onSuccess: () => {
      // Invalidate form templates list
      queryClient.invalidateQueries({ queryKey: formTemplateKeys.list(MODULE) });
    },
  });
}

/**
 * Hook to update an existing form template
 */
export function useUpdateFormTemplateMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, config }: { id: string | number; config: Partial<FormTemplateConfig> }) =>
      formTemplateService.update(id, config),
    onSuccess: (data) => {
      // Invalidate form templates list and specific template
      queryClient.invalidateQueries({ queryKey: formTemplateKeys.list(MODULE) });
      queryClient.invalidateQueries({ queryKey: formTemplateKeys.detail(MODULE, data.id) });
    },
  });
}

/**
 * Hook to delete a form template
 */
export function useDeleteFormTemplateMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string | number) => formTemplateService.remove(id),
    onSuccess: () => {
      // Invalidate form templates list
      queryClient.invalidateQueries({ queryKey: formTemplateKeys.list(MODULE) });
    },
  });
}

/**
 * Hook to clone a form template
 */
export function useCloneFormTemplateMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, newName }: { id: string | number; newName: string }) =>
      formTemplateService.clone(id, newName),
    onSuccess: () => {
      // Invalidate form templates list
      queryClient.invalidateQueries({ queryKey: formTemplateKeys.list(MODULE) });
    },
  });
}

/**
 * Hook to set a form template as default
 */
export function useSetDefaultFormTemplateMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string | number) => formTemplateService.setDefault(id),
    onSuccess: () => {
      // Invalidate form templates list to update default status
      queryClient.invalidateQueries({ queryKey: formTemplateKeys.list(MODULE) });
    },
  });
}

