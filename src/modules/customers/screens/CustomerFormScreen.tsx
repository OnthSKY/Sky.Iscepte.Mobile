/**
 * CustomerFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
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

interface CustomerFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function CustomerFormScreen({ mode }: CustomerFormScreenProps = {}) {
  const route = useRoute<any>();
  const { t } = useTranslation(['customers', 'common']);
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  // Global fields state
  const [globalFields, setGlobalFields] = useState<CustomerCustomField[]>([]);

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
    setGlobalFields(fields);
    try {
      await globalFieldsService.save(fields);
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

  // Enhanced validator for required global custom fields
  const enhancedValidator = createEnhancedValidator<Customer>(
    customerValidator,
    globalFields,
    'customers'
  );

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
      validator={enhancedValidator}
      title={screenTitle}
      renderForm={(formData, updateField, errors) => {
        // Use formData's customFields directly or empty array
        const customFields = (formData.customFields as CustomerCustomField[]) || [];

        const handleCustomFieldsChange = (fields: CustomerCustomField[]) => {
          updateField('customFields' as keyof Customer, fields);
        };

        return (
          <View style={{ gap: spacing.md }}>
            <DynamicForm
              namespace="customers"
              columns={2}
              fields={customerFormFields}
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
              />
            </Card>
          </View>
        );
      }}
    />
  );
}

