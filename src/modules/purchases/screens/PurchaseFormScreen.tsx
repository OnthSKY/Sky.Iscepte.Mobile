/**
 * PurchaseFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useMemo } from 'react';
import { useRoute } from '@react-navigation/native';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { purchaseEntityService } from '../services/purchaseServiceAdapter';
import DynamicForm from '../../../shared/components/DynamicForm';
import { Purchase } from '../store/purchaseStore';
import { purchaseFormFields, purchaseValidator } from '../config/purchaseFormConfig';
import { useProductsQuery } from '../../products/hooks/useProductsQuery';

interface PurchaseFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function PurchaseFormScreen({ mode }: PurchaseFormScreenProps = {}) {
  const route = useRoute<any>();
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  // Fetch products for select fields
  const { data: productsData } = useProductsQuery();

  // Prepare form fields with dynamic options
  const fieldsWithOptions = useMemo(() => {
    const products = productsData?.items || [];

    return purchaseFormFields.map(field => {
      if (field.name === 'productId') {
        return {
          ...field,
          options: products.map((p: any) => ({
            label: `${p.name} (Stok: ${p.stock ?? 0})`,
            value: String(p.id),
          })),
        };
      }
      return field;
    });
  }, [productsData]);

  return (
    <FormScreenContainer
      service={purchaseEntityService}
      config={{
        entityName: 'purchase',
        translationNamespace: 'purchases',
        mode: formMode,
      }}
      validator={purchaseValidator}
      renderForm={(formData, updateField, errors) => {
        // Get products for price lookup (closure over component scope)
        const products = productsData?.items || [];
        
        return (
          <DynamicForm
            namespace="purchases"
            columns={2}
            fields={fieldsWithOptions}
            values={formData}
            onChange={(v) => {
              Object.keys(v).forEach((key) => {
                const newValue = v[key];
                updateField(key as keyof Purchase, newValue);
                
                // Auto-fill price when product is selected
                if (key === 'productId' && newValue) {
                  const selectedProduct = products.find((p: any) => String(p.id) === String(newValue));
                  if (selectedProduct && selectedProduct.price) {
                    // Only auto-fill if price is not already set or is 0
                    const currentPrice = formData.price || 0;
                    if (currentPrice === 0) {
                      updateField('price' as keyof Purchase, selectedProduct.price);
                      // Auto-calculate total if quantity is set
                      const currentQuantity = formData.quantity || 1;
                      if (currentQuantity > 0) {
                        const total = selectedProduct.price * currentQuantity;
                        updateField('total' as keyof Purchase, total);
                      }
                    }
                  }
                }
              });
              
              // Auto-calculate total when price or quantity changes (after all fields are updated)
              const updatedData = { ...formData, ...v };
              if (updatedData.price && updatedData.quantity) {
                const price = updatedData.price as number;
                const quantity = updatedData.quantity as number;
                const total = price * quantity;
                if (updatedData.total !== total) {
                  updateField('total' as keyof Purchase, total);
                }
              }
            }}
          />
        );
      }}
    />
  );
}

