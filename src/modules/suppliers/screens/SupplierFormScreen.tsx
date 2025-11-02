/**
 * SupplierFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { supplierEntityService } from '../services/supplierServiceAdapter';
import DynamicForm from '../../../shared/components/DynamicForm';
import { Supplier, SupplierCustomField } from '../store/supplierStore';
import { supplierFormFields, supplierValidator } from '../config/supplierFormConfig';
import CustomFieldsManager from '../../../shared/components/CustomFieldsManager';
import Card from '../../../shared/components/Card';
import spacing from '../../../core/constants/spacing';
import globalFieldsService from '../services/globalFieldsService';
import { createEnhancedValidator, getInitialDataWithCustomFields } from '../../../shared/utils/customFieldsUtils';

interface SupplierFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function SupplierFormScreen({ mode }: SupplierFormScreenProps = {}) {
  const route = useRoute<any>();
  const { t } = useTranslation(['suppliers', 'common']);
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  // Global fields state
  const [globalFields, setGlobalFields] = useState<SupplierCustomField[]>([]);

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
  const handleGlobalFieldsChange = async (fields: SupplierCustomField[]) => {
    setGlobalFields(fields);
    try {
      await globalFieldsService.save(fields);
    } catch (error) {
      console.error('Failed to save global fields:', error);
    }
  };

  // Default values for create mode
  const getInitialData = (): Partial<Supplier> => {
    return getInitialDataWithCustomFields<Supplier>(formMode, {
      isActive: true,
    });
  };

  // Enhanced validator for required global custom fields
  const enhancedValidator = createEnhancedValidator<Supplier>(
    supplierValidator,
    globalFields,
    'suppliers'
  );

  // Get title based on mode
  const screenTitle = formMode === 'edit' 
    ? t('suppliers:edit_supplier')
    : t('suppliers:new_supplier');

  return (
    <FormScreenContainer
      service={supplierEntityService}
      config={{
        entityName: 'supplier',
        translationNamespace: 'suppliers',
        mode: formMode,
      }}
      initialData={getInitialData()}
      validator={enhancedValidator}
      title={screenTitle}
      renderForm={(formData, updateField, errors) => {
        const customFields = (formData.customFields as SupplierCustomField[]) || [];

        const handleCustomFieldsChange = (fields: SupplierCustomField[]) => {
          updateField('customFields' as keyof Supplier, fields);
        };

        return (
          <View style={{ gap: spacing.md }}>
            <DynamicForm
              namespace="suppliers"
              columns={2}
              fields={supplierFormFields}
              values={formData}
              onChange={(v) => {
                Object.keys(v).forEach((key) => {
                  updateField(key as keyof Supplier, (v as any)[key]);
                });
              }}
            />

            <Card>
              <CustomFieldsManager<SupplierCustomField>
                customFields={customFields}
                onChange={handleCustomFieldsChange}
                availableGlobalFields={globalFields}
                onGlobalFieldsChange={handleGlobalFieldsChange}
                module="suppliers"
              />
            </Card>
          </View>
        );
      }}
    />
  );
}

