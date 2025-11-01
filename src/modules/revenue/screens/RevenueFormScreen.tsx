/**
 * RevenueFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRoute } from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { revenueEntityService } from '../services/revenueServiceAdapter';
import DynamicForm, { DynamicField } from '../../../shared/components/DynamicForm';
import { Revenue } from '../store/revenueStore';
import RevenueTypeSelect from '../components/RevenueTypeSelect';
import expenseTypeService from '../../expenses/services/expenseTypeService';
import { ExpenseType } from '../../expenses/services/expenseTypeService';
import { useTranslation } from 'react-i18next';
import { baseRevenueFormFields, revenueValidator } from '../config/revenueFormConfig';

interface RevenueFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function RevenueFormScreen({ mode }: RevenueFormScreenProps = {}) {
  const route = useRoute<any>();
  const { t } = useTranslation('revenue');
  const { width } = useWindowDimensions();
  const columns = width < 400 ? 1 : 2;
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  const [revenueTypes, setRevenueTypes] = useState<ExpenseType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  useEffect(() => {
    loadRevenueTypes();
  }, []);

  const loadRevenueTypes = async () => {
    setLoadingTypes(true);
    try {
      const types = await expenseTypeService.list();
      setRevenueTypes(types);
    } catch (err) {
      // Failed to load revenue types - will use empty list
    } finally {
      setLoadingTypes(false);
    }
  };

  const typeOptions = useMemo(
    () => revenueTypes.map((i) => ({ label: i.name, value: String(i.id) })),
    [revenueTypes]
  );

  // Refresh revenue types list when needed
  const handleTypeAdded = useCallback(() => {
    loadRevenueTypes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build dynamic fields - category first, then other fields
  const revenueFields: DynamicField[] = useMemo(() => [
    {
      name: 'revenueTypeId',
      labelKey: 'category',
      type: 'custom',
      render: (value, onChange) => (
        <RevenueTypeSelect
          options={typeOptions}
          value={String(value || '')}
          onChange={onChange}
          placeholder={loadingTypes ? t('loading', { defaultValue: 'Yükleniyor...' }) : t('category', { defaultValue: 'Kategori' })}
          onTypeAdded={handleTypeAdded}
        />
      ),
      required: false,
    },
    ...baseRevenueFormFields,
  ], [typeOptions, loadingTypes, t, handleTypeAdded]);

  return (
    <FormScreenContainer
      service={revenueEntityService}
      config={{
        entityName: 'revenue',
        translationNamespace: 'revenue',
        mode: formMode,
      }}
      validator={revenueValidator}
      renderForm={(formData, updateField, errors) => {
        // Ensure default values are set
        const formDataWithDefaults = {
          ...formData,
          source: formData.source || 'manual',
        };
        
        return (
          <DynamicForm
            namespace="revenue"
            columns={columns}
            fields={revenueFields}
            values={formDataWithDefaults}
            onChange={(v) => {
              Object.keys(v).forEach((key) => {
                updateField(key as keyof Revenue, v[key]);
              });
            }}
          />
        );
      }}
      title={formMode === 'create' ? t('new_revenue', { defaultValue: 'New Revenue' }) : undefined}
    />
  );
}

