/**
 * CustomerFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React from 'react';
import { useRoute } from '@react-navigation/native';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { customerEntityService } from '../services/customerServiceAdapter';
import DynamicForm from '../../../shared/components/DynamicForm';
import { Customer } from '../store/customerStore';
import { customerFormFields, customerValidator } from '../config/customerFormConfig';

interface CustomerFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function CustomerFormScreen({ mode }: CustomerFormScreenProps = {}) {
  const route = useRoute<any>();
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  return (
    <FormScreenContainer
      service={customerEntityService}
      config={{
        entityName: 'customer',
        translationNamespace: 'customers',
        mode: formMode,
      }}
      validator={customerValidator}
      renderForm={(formData, updateField, errors) => (
        <DynamicForm
          namespace="customers"
          columns={2}
          fields={customerFormFields}
          values={formData}
          onChange={(v) => {
            Object.keys(v).forEach((key) => {
              updateField(key as keyof Customer, v[key]);
            });
          }}
        />
      )}
    />
  );
}

