/**
 * ProductFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React from 'react';
import { useRoute } from '@react-navigation/native';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { productEntityService } from '../services/productServiceAdapter';
import DynamicForm from '../../../shared/components/DynamicForm';
import { Product } from '../services/productService';
import { productFormFields, productValidator } from '../config/productFormConfig';

interface ProductFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function ProductFormScreen({ mode }: ProductFormScreenProps = {}) {
  const route = useRoute<any>();
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  return (
    <FormScreenContainer
      service={productEntityService}
      config={{
        entityName: 'product',
        translationNamespace: 'products',
        mode: formMode,
      }}
      validator={productValidator}
      renderForm={(formData, updateField, errors) => (
        <DynamicForm
          namespace="products"
          columns={2}
          fields={productFormFields}
          values={formData}
          onChange={(v) => {
            Object.keys(v).forEach((key) => {
              updateField(key as keyof Product, v[key]);
            });
          }}
        />
      )}
    />
  );
}

