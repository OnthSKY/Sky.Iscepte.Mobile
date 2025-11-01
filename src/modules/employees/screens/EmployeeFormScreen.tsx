/**
 * EmployeeFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React from 'react';
import { useRoute } from '@react-navigation/native';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { employeeEntityService } from '../services/employeeServiceAdapter';
import DynamicForm from '../../../shared/components/DynamicForm';
import { Employee } from '../store/employeeStore';
import { employeeFormFields, employeeValidator } from '../config/employeeFormConfig';

interface EmployeeFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function EmployeeFormScreen({ mode }: EmployeeFormScreenProps = {}) {
  const route = useRoute<any>();
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  return (
    <FormScreenContainer
      service={employeeEntityService}
      config={{
        entityName: 'employee',
        translationNamespace: 'employees',
        mode: formMode,
      }}
      validator={employeeValidator}
      renderForm={(formData, updateField, errors) => (
        <DynamicForm
          namespace="employees"
          columns={2}
          fields={employeeFormFields}
          values={formData}
          onChange={(v) => {
            Object.keys(v).forEach((key) => {
              updateField(key as keyof Employee, v[key]);
            });
          }}
        />
      )}
    />
  );
}

