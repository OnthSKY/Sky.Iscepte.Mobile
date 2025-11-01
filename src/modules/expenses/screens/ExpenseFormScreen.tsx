/**
 * ExpenseFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRoute } from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { expenseEntityService } from '../services/expenseServiceAdapter';
import DynamicForm, { DynamicField } from '../../../shared/components/DynamicForm';
import { Expense } from '../store/expenseStore';
import ExpenseTypeSelect from '../components/ExpenseTypeSelect';
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
      // Failed to load expense types - will use empty list
    } finally {
      setLoadingTypes(false);
    }
  };

  const typeOptions = useMemo(
    () => expenseTypes.map((i) => ({ label: i.name, value: String(i.id) })),
    [expenseTypes]
  );

  // Refresh expense types list when needed
  const handleTypeAdded = useCallback(() => {
    loadExpenseTypes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build dynamic fields - category first, then other fields (only expense type, no income)
  const expenseFields: DynamicField[] = useMemo(() => [
    {
      name: 'expenseTypeId',
      labelKey: 'category',
      type: 'custom',
      render: (value, onChange) => (
        <ExpenseTypeSelect
          options={typeOptions}
          value={String(value || '')}
          onChange={onChange}
          placeholder={loadingTypes ? t('loading', { defaultValue: 'Yükleniyor...' }) : t('category', { defaultValue: 'Kategori' })}
          onTypeAdded={handleTypeAdded}
        />
      ),
      required: false,
    },
    ...baseExpenseFormFields,
  ], [typeOptions, loadingTypes, t, handleTypeAdded]);

  return (
    <FormScreenContainer
      service={expenseEntityService}
      config={{
        entityName: 'expense',
        translationNamespace: 'expenses',
        mode: formMode,
      }}
      validator={expenseValidator}
      renderForm={(formData, updateField, errors) => {
        // Ensure default values are set (only expense, no type selection)
        const formDataWithDefaults = {
          ...formData,
          type: 'expense', // Always expense for this module
          source: formData.source || 'manual',
        };
        
        return (
          <DynamicForm
            namespace="expenses"
            columns={columns}
            fields={expenseFields}
            values={formDataWithDefaults}
            onChange={(v) => {
              Object.keys(v).forEach((key) => {
                updateField(key as keyof Expense, v[key]);
              });
            }}
          />
        );
      }}
      title={formMode === 'create' ? t('new_expense', { defaultValue: 'New Expense' }) : undefined}
    />
  );
}

