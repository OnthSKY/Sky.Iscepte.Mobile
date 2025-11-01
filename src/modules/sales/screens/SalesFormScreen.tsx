/**
 * SalesFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useMemo } from 'react';
import { useRoute } from '@react-navigation/native';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { salesEntityService } from '../services/salesServiceAdapter';
import DynamicForm from '../../../shared/components/DynamicForm';
import { Sale } from '../store/salesStore';
import { salesFormFields, salesValidator } from '../config/salesFormConfig';
import { useProductsQuery } from '../../products/hooks/useProductsQuery';
import { useCustomersQuery } from '../../customers/hooks/useCustomersQuery';

interface SalesFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function SalesFormScreen({ mode }: SalesFormScreenProps = {}) {
  const route = useRoute<any>();
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  // Fetch products and customers for select fields
  const { data: productsData } = useProductsQuery();
  const { data: customersData } = useCustomersQuery();

  // Prepare form fields with dynamic options
  const fieldsWithOptions = useMemo(() => {
    const products = productsData?.items || [];
    const customers = customersData?.items || [];

    return salesFormFields.map(field => {
      if (field.name === 'productId') {
        return {
          ...field,
          options: products.map((p: any) => ({
            label: `${p.name} (Stok: ${p.stock ?? 0})`,
            value: String(p.id),
          })),
        };
      }
      if (field.name === 'customerId') {
        return {
          ...field,
          options: customers.map((c: any) => ({
            label: c.name || c.email || `Müşteri ${c.id}`,
            value: String(c.id),
          })),
        };
      }
      return field;
    });
  }, [productsData, customersData]);

  return (
    <FormScreenContainer
      service={salesEntityService}
      config={{
        entityName: 'sale',
        translationNamespace: 'sales',
        mode: formMode,
      }}
      validator={salesValidator}
      renderForm={(formData, updateField, errors) => {
        // Get products for price lookup (closure over component scope)
        const products = productsData?.items || [];
        
        return (
          <DynamicForm
            namespace="sales"
            columns={2}
            fields={fieldsWithOptions}
            values={formData}
            onChange={(v) => {
              Object.keys(v).forEach((key) => {
                const newValue = v[key];
                updateField(key as keyof Sale, newValue);
                
                // Auto-fill price when product is selected
                if (key === 'productId' && newValue) {
                  const selectedProduct = products.find((p: any) => String(p.id) === String(newValue));
                  if (selectedProduct && selectedProduct.price) {
                    // Only auto-fill if price is not already set or is 0
                    const currentPrice = formData.price || 0;
                    if (currentPrice === 0) {
                      updateField('price' as keyof Sale, selectedProduct.price);
                      // Auto-calculate amount if quantity is set
                      const currentQuantity = formData.quantity || 1;
                      if (currentQuantity > 0) {
                        const total = selectedProduct.price * currentQuantity;
                        updateField('amount' as keyof Sale, total);
                      }
                    }
                  }
                }
              });
              
              // Auto-calculate amount when price or quantity changes (after all fields are updated)
              const updatedData = { ...formData, ...v };
              if (updatedData.price && updatedData.quantity) {
                const price = updatedData.price as number;
                const quantity = updatedData.quantity as number;
                const total = price * quantity;
                if (updatedData.amount !== total) {
                  updateField('amount' as keyof Sale, total);
                }
              }
            }}
          />
        );
      }}
    />
  );
}

