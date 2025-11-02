import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BaseEntityService } from '../services/baseEntityService.types';
import { FormScreenConfig, BaseEntity } from '../types/screen.types';
import { useNavigationHandler } from './useNavigationHandler';
import { useAsyncData } from './useAsyncData';
import { createError, errorMessages } from '../utils/errorUtils';
import { log } from '../utils/logger';
import { getNavigationFallback } from '../config/navigationConfig';

/**
 * Single Responsibility: Handles form screen logic (form state, validation, submission)
 * Dependency Inversion: Depends on service interface, not concrete implementation
 */
export function useFormScreen<T extends BaseEntity>(
  service: BaseEntityService<T>,
  config: FormScreenConfig,
  initialData?: Partial<T>,
  validator?: (data: Partial<T>) => Record<string, string>
) {
  const { t } = useTranslation([config.translationNamespace, 'common']);
  const route = useRoute<any>();
  const navigation = useNavigation();
  const navHandler = useNavigationHandler();

  const idParamKey = config.idParamKey || 'id';
  const entityId = config.mode === 'edit' ? route.params?.[idParamKey] : undefined;

  // Form state
  const [formData, setFormData] = useState<Partial<T>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load existing data for edit mode using useAsyncData
  const { data: loadedData, loading } = useAsyncData<T>(
    async () => {
      if (!entityId) {
        throw createError(errorMessages.required('ID parameter'), 'MISSING_ID');
      }
      const entity = await service.get(entityId);
      if (!entity) {
        throw createError(errorMessages.notFound(config.entityName), 'NOT_FOUND');
      }
      return entity;
    },
    [entityId, service, config.entityName],
    {
      immediate: config.mode === 'edit' && !!entityId,
      onSuccess: (data) => {
        setFormData(data);
      },
      onError: (err) => {
        log.error('Failed to load entity:', err);
      },
    }
  );

  // Validation
  const validate = useCallback((): boolean => {
    if (!validator) return true;

    const validationErrors = validator(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [formData, validator]);

  // Form handlers
  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field and related customField errors
    const fieldKey = field as string;
    setErrors((prev) => {
      const next = { ...prev };
      // Clear direct field error
      if (next[fieldKey]) {
        delete next[fieldKey];
      }
      // If updating customFields, clear all customField errors (will be re-validated on submit)
      if (fieldKey === 'customFields' && Array.isArray(value)) {
        Object.keys(next).forEach(key => {
          if (key.startsWith('customField_')) {
            // Check if this customField still exists and might still be invalid
            // We'll let validation handle this on next submit
            // For now, just clear the error so user can see updated validation
            delete next[key];
          }
        });
      }
      return next;
    });
  }, [errors]);

  const updateFormData = useCallback((data: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      if (config.mode === 'create') {
        await service.create(formData);
      } else if (config.mode === 'edit' && entityId) {
        await service.update(entityId, formData);
      }
      // Navigate back after successful submit
      const entityRouteName = config.entityName === 'stock_item' ? 'Stock' : 
                              config.entityName.charAt(0).toUpperCase() + config.entityName.slice(1);
      const fallbackRoute = getNavigationFallback(`${entityRouteName}Create`) || entityRouteName;
      if (navHandler.canNavigate(fallbackRoute)) {
        navHandler.navigate(fallbackRoute);
      }
    } catch (err) {
      const error = err instanceof Error ? err : createError(errorMessages.failedToSave(config.entityName), 'SAVE_ERROR');
      setErrors({ _general: error.message });
    } finally {
      setSubmitting(false);
    }
  }, [formData, config.mode, entityId, validate, service, navigation, navHandler, config.entityName]);

  const handleCancel = useCallback(() => {
    // Always navigate to fallback route directly to avoid tab history issues
    const entityRouteName = config.entityName === 'stock_item' ? 'Stock' : 
                            config.entityName.charAt(0).toUpperCase() + config.entityName.slice(1);
    const fallbackRoute = getNavigationFallback(`${entityRouteName}Create`) || entityRouteName;
    
    if (navHandler.canNavigate(fallbackRoute)) {
      navHandler.navigate(fallbackRoute);
    }
  }, [navHandler, config.entityName]);

  return {
    // Form state
    formData,
    errors,
    loading,
    submitting,
    isEditMode: config.mode === 'edit',

    // Handlers
    updateField,
    updateFormData,
    setFormData,
    handleSubmit,
    handleCancel,
    validate,

    // Translation
    t,
  };
}

