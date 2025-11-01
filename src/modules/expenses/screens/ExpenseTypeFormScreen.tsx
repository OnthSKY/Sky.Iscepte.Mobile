/**
 * ExpenseTypeFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React from 'react';
import { useRoute } from '@react-navigation/native';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { expenseTypeEntityService } from '../services/expenseTypeServiceAdapter';
import DynamicForm from '../../../shared/components/DynamicForm';
import { ExpenseType } from '../services/expenseTypeService';
import { expenseTypeFormFields, expenseTypeValidator } from '../config/expenseTypeFormConfig';

interface ExpenseTypeFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function ExpenseTypeFormScreen({ mode }: ExpenseTypeFormScreenProps = {}) {
  const route = useRoute<any>();
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id || route.params?.expenseType?.id ? 'edit' : 'create');

  return (
    <FormScreenContainer
      service={expenseTypeEntityService}
      config={{
        entityName: 'expenseType',
        translationNamespace: 'expenses',
        mode: formMode,
        idParamKey: 'expenseTypeId',
      }}
      validator={expenseTypeValidator}
      renderForm={(formData, updateField, errors) => (
        <DynamicForm
          namespace="expenses"
          columns={1}
          fields={expenseTypeFormFields}
          values={formData}
          onChange={(v) => {
            Object.keys(v).forEach((key) => {
              updateField(key as keyof ExpenseType, v[key]);
            });
          }}
        />
      )}
    />
  );
}

