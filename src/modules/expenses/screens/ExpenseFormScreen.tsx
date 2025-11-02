/**
 * ExpenseFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, useWindowDimensions } from 'react-native';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { expenseEntityService } from '../services/expenseServiceAdapter';
import DynamicForm, { DynamicField } from '../../../shared/components/DynamicForm';
import { Expense, ExpenseCustomField } from '../store/expenseStore';
import ExpenseTypeSelect from '../components/ExpenseTypeSelect';
import expenseTypeService, { ExpenseType } from '../services/expenseTypeService';
import { useTranslation } from 'react-i18next';
import { baseExpenseFormFields, expenseValidator } from '../config/expenseFormConfig';
import CustomFieldsManager from '../../../shared/components/CustomFieldsManager';
import Card from '../../../shared/components/Card';
import spacing from '../../../core/constants/spacing';
import globalFieldsService from '../services/globalFieldsService';
import { createEnhancedValidator, getInitialDataWithCustomFields } from '../../../shared/utils/customFieldsUtils';

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
  const [globalFields, setGlobalFields] = useState<ExpenseCustomField[]>([]);

  useEffect(() => {
    loadExpenseTypes();
    loadGlobalFields();
  }, []);

  const loadGlobalFields = async () => {
    try {
      const fields = await globalFieldsService.getAll();
      setGlobalFields(fields);
    } catch (error) {
      console.error('Failed to load global fields:', error);
    }
  };

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

  const handleGlobalFieldsChange = async (fields: ExpenseCustomField[]) => {
    setGlobalFields(fields);
    try {
      await globalFieldsService.save(fields);
    } catch (error) {
      console.error('Failed to save global fields:', error);
    }
  };

  const getInitialData = (): Partial<Expense> => {
    return getInitialDataWithCustomFields<Expense>(formMode, {
      type: 'expense',
      source: 'manual',
    });
  };

  const enhancedValidator = createEnhancedValidator<Expense>(
    expenseValidator,
    globalFields,
    'expenses'
  );

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

  const screenTitle = formMode === 'create' 
    ? t('new_expense', { defaultValue: 'New Expense' }) 
    : t('edit_expense', { defaultValue: 'Edit Expense' });

  return (
    <FormScreenContainer
      service={expenseEntityService}
      config={{
        entityName: 'expense',
        translationNamespace: 'expenses',
        mode: formMode,
      }}
      initialData={getInitialData()}
      validator={enhancedValidator}
      renderForm={(formData, updateField, errors) => {
        const customFields = (formData.customFields as ExpenseCustomField[]) || [];
        
        const handleCustomFieldsChange = (fields: ExpenseCustomField[]) => {
          updateField('customFields' as keyof Expense, fields);
        };
        
        return (
          <View style={{ gap: spacing.md }}>
            <DynamicForm
              namespace="expenses"
              columns={columns}
              fields={expenseFields}
              values={formData}
              onChange={(v) => {
                Object.keys(v).forEach((key) => {
                  updateField(key as keyof Expense, (v as any)[key]);
                });
              }}
            />
            <Card>
              <CustomFieldsManager<ExpenseCustomField>
                customFields={customFields}
                onChange={handleCustomFieldsChange}
                availableGlobalFields={globalFields}
                onGlobalFieldsChange={handleGlobalFieldsChange}
                module="expenses"
              />
            </Card>
          </View>
        );
      }}
      title={screenTitle}
    />
  );
}

