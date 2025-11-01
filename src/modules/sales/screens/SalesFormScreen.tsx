/**
 * SalesFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React from 'react';
import { useRoute } from '@react-navigation/native';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { salesEntityService } from '../services/salesServiceAdapter';
import DynamicForm from '../../../shared/components/DynamicForm';
import { Sale } from '../store/salesStore';
import { salesFormFields, salesValidator } from '../config/salesFormConfig';

interface SalesFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function SalesFormScreen({ mode }: SalesFormScreenProps = {}) {
  const route = useRoute<any>();
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  return (
    <FormScreenContainer
      service={salesEntityService}
      config={{
        entityName: 'sale',
        translationNamespace: 'sales',
        mode: formMode,
      }}
      validator={salesValidator}
      renderForm={(formData, updateField, errors) => (
        <DynamicForm
          namespace="sales"
          columns={2}
          fields={salesFormFields}
          values={formData}
          onChange={(v) => {
            Object.keys(v).forEach((key) => {
              updateField(key as keyof Sale, v[key]);
            });
          }}
        />
      )}
    />
  );
}

