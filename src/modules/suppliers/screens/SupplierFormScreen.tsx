/**
 * SupplierFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React from 'react';
import { useRoute } from '@react-navigation/native';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { supplierEntityService } from '../services/supplierServiceAdapter';
import DynamicForm from '../../../shared/components/DynamicForm';
import { Supplier } from '../store/supplierStore';
import { supplierFormFields, supplierValidator } from '../config/supplierFormConfig';

interface SupplierFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function SupplierFormScreen({ mode }: SupplierFormScreenProps = {}) {
  const route = useRoute<any>();
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  return (
    <FormScreenContainer
      service={supplierEntityService}
      config={{
        entityName: 'supplier',
        translationNamespace: 'suppliers',
        mode: formMode,
      }}
      validator={supplierValidator}
      renderForm={(formData, updateField, errors) => (
        <DynamicForm
          namespace="suppliers"
          columns={2}
          fields={supplierFormFields}
          values={formData}
          onChange={(v) => {
            Object.keys(v).forEach((key) => {
              updateField(key as keyof Supplier, v[key]);
            });
          }}
        />
      )}
    />
  );
}

