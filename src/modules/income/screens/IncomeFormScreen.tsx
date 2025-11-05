/**
 * IncomeFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, useWindowDimensions } from 'react-native';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { incomeEntityService } from '../services/incomeServiceAdapter';
import DynamicForm, { DynamicField } from '../../../shared/components/DynamicForm';
import { Income, IncomeCustomField } from '../store/incomeStore';
import IncomeTypeSelect from '../components/IncomeTypeSelect';
import expenseTypeService from '../../expenses/services/expenseTypeService';
import { ExpenseType } from '../../expenses/services/expenseTypeService';
import { useTranslation } from 'react-i18next';
import { baseIncomeFormFields, incomeValidator } from '../config/incomeFormConfig';
import CustomFieldsManager from '../../../shared/components/CustomFieldsManager';
import Card from '../../../shared/components/Card';
import spacing from '../../../core/constants/spacing';
import { createEnhancedValidator, getInitialDataWithCustomFields } from '../../../shared/utils/customFieldsUtils';

interface IncomeFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function IncomeFormScreen({ mode }: IncomeFormScreenProps = {}) {
  const route = useRoute<any>();
  const { t } = useTranslation('income');
  const { width } = useWindowDimensions();
  const columns = width < 400 ? 1 : 2;
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  const [incomeTypes, setIncomeTypes] = useState<ExpenseType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  useEffect(() => {
    loadIncomeTypes();
  }, []);

  const loadIncomeTypes = async () => {
    setLoadingTypes(true);
    try {
      const types = await expenseTypeService.list();
      setIncomeTypes(types);
    } catch (err) {
      // Failed to load income types - will use empty list
    } finally {
      setLoadingTypes(false);
    }
  };

  const getInitialData = (): Partial<Income> => {
    return getInitialDataWithCustomFields<Income>(formMode, {
      source: 'manual',
    });
  };

  const enhancedValidator = createEnhancedValidator<Income>(
    incomeValidator,
    [],
    'income'
  );

  const typeOptions = useMemo(
    () => incomeTypes.map((i) => ({ label: i.name, value: String(i.id) })),
    [incomeTypes]
  );

  // Refresh income types list when needed
  const handleTypeAdded = useCallback(() => {
    loadIncomeTypes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build dynamic fields - category first, then other fields
  const incomeFields: DynamicField[] = useMemo(() => [
    {
      name: 'incomeTypeId',
      labelKey: 'category',
      type: 'custom',
      render: (value, onChange) => (
        <IncomeTypeSelect
          options={typeOptions}
          value={String(value || '')}
          onChange={onChange}
          placeholder={loadingTypes ? t('loading', { defaultValue: 'Yükleniyor...' }) : t('category', { defaultValue: 'Kategori' })}
          onTypeAdded={handleTypeAdded}
        />
      ),
      required: false,
    },
    ...baseIncomeFormFields,
  ], [typeOptions, loadingTypes, t, handleTypeAdded]);

  const screenTitle = formMode === 'create' 
    ? t('new_income', { defaultValue: 'New Income' }) 
    : t('edit_income', { defaultValue: 'Edit Income' });

  return (
    <FormScreenContainer
      service={incomeEntityService}
      config={{
        entityName: 'income',
        translationNamespace: 'income',
        mode: formMode,
      }}
      initialData={getInitialData()}
      validator={enhancedValidator}
      renderForm={(formData, updateField, errors) => {
        const customFields = (formData.customFields as IncomeCustomField[]) || [];
        
        const handleCustomFieldsChange = (fields: IncomeCustomField[]) => {
          updateField('customFields' as keyof Income, fields);
        };
        
        return (
          <View style={{ gap: spacing.md }}>
            <DynamicForm
              namespace="income"
              columns={columns}
              fields={incomeFields}
              values={formData}
              onChange={(v) => {
                Object.keys(v).forEach((key) => {
                  updateField(key as keyof Income, (v as any)[key]);
                });
              }}
            />
            <Card>
              <CustomFieldsManager<IncomeCustomField>
                customFields={customFields}
                onChange={handleCustomFieldsChange}
                module="income"
              />
            </Card>
          </View>
        );
      }}
      title={screenTitle}
    />
  );
}

