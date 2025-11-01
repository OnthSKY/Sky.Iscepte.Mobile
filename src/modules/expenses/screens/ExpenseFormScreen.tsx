/**
 * ExpenseFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { expenseEntityService } from '../services/expenseServiceAdapter';
import DynamicForm, { DynamicField } from '../../../shared/components/DynamicForm';
import { Expense } from '../store/expenseStore';
import Select from '../../../shared/components/Select';
import expenseTypeService from '../services/expenseTypeService';
import { ExpenseType } from '../services/expenseTypeService';
import { useTranslation } from 'react-i18next';
import { baseExpenseFormFields, expenseValidator } from '../config/expenseFormConfig';

interface ExpenseFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function ExpenseFormScreen({ mode }: ExpenseFormScreenProps = {}) {
  const route = useRoute<any>();
  const { t } = useTranslation('expenses');
  const { width } = useWindowDimensions();
  const columns = width < 400 ? 1 : 2;
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  useEffect(() => {
    loadExpenseTypes();
  }, []);

  const loadExpenseTypes = async () => {
    setLoadingTypes(true);
    try {
      const types = await expenseTypeService.list();
      setExpenseTypes(types);
    } catch (err) {
      console.error('Failed to load expense types:', err);
    } finally {
      setLoadingTypes(false);
    }
  };

  const typeOptions = useMemo(
    () => expenseTypes.map((i) => ({ label: i.name, value: String(i.id) })),
    [expenseTypes]
  );

  // Build dynamic fields with expense type selector
  const expenseFields: DynamicField[] = useMemo(() => [
    {
      name: 'type',
      labelKey: 'type',
      type: 'custom',
      render: (value, onChange) => (
        <Select
          options={typeOptions}
          value={String(value || '')}
          onChange={onChange}
          placeholder={loadingTypes ? t('loading', { defaultValue: 'Loading...' }) : undefined}
        />
      ),
      required: true,
    },
    ...baseExpenseFormFields,
  ], [typeOptions, loadingTypes, t]);

  return (
    <FormScreenContainer
      service={expenseEntityService}
      config={{
        entityName: 'expense',
        translationNamespace: 'expenses',
        mode: formMode,
      }}
      validator={expenseValidator}
      renderForm={(formData, updateField, errors) => (
        <DynamicForm
          namespace="expenses"
          columns={columns}
          fields={expenseFields}
          values={formData}
          onChange={(v) => {
            Object.keys(v).forEach((key) => {
              updateField(key as keyof Expense, v[key]);
            });
          }}
        />
      )}
      title={formMode === 'create' ? t('new_expense', { defaultValue: 'New Expense' }) : undefined}
    />
  );
}

