/**
 * ProductFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { productEntityService } from '../services/productServiceAdapter';
import DynamicForm from '../../../shared/components/DynamicForm';
import { Product, ProductCustomField } from '../services/productService';
import { productFormFields, productValidator } from '../config/productFormConfig';
import CustomFieldsManager from '../../../shared/components/CustomFieldsManager';
import Card from '../../../shared/components/Card';
import spacing from '../../../core/constants/spacing';
import globalFieldsService from '../services/globalFieldsService';
import { useProductsQuery } from '../hooks/useProductsQuery';
import CategorySelect from '../components/CategorySelect';
import CurrencySelect from '../components/CurrencySelect';
import { createEnhancedValidator, getInitialDataWithCustomFields } from '../../../shared/utils/customFieldsUtils';

interface ProductFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function ProductFormScreen({ mode }: ProductFormScreenProps = {}) {
  const route = useRoute<any>();
  const { t } = useTranslation(['stock', 'common']);
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  // Default values for create mode
  const getInitialData = (): Partial<Product> => {
    return getInitialDataWithCustomFields<Product>(formMode, {
      stock: 1, // Default stock value
      currency: 'TRY', // Default currency is TL
      isActive: true,
    });
  };

  // Global fields state
  const [globalFields, setGlobalFields] = useState<ProductCustomField[]>([]);

  // Load products to extract unique categories
  const { data: productsData } = useProductsQuery();
  const [categories, setCategories] = useState<string[]>([]);

  // Extract unique categories from products
  useEffect(() => {
    if (productsData?.items) {
      const uniqueCategories = Array.from(
        new Set(
          productsData.items
            .map((p) => p.category)
            .filter((cat): cat is string => !!cat && cat.trim() !== '')
        )
      ).sort();
      setCategories(uniqueCategories);
    }
  }, [productsData]);

  // Category options for CategorySelect
  const categoryOptions = useMemo(
    () => categories.map((cat) => ({ label: cat, value: cat })),
    [categories]
  );

  // Handle category added - add new category to list
  const handleCategoryAdded = useCallback((categoryName: string) => {
    setCategories((prev) => {
      // Add new category if it doesn't exist
      if (!prev.includes(categoryName)) {
        return [...prev, categoryName].sort();
      }
      return prev;
    });
  }, []);

  // Load global fields on mount
  useEffect(() => {
    const loadGlobalFields = async () => {
      try {
        const fields = await globalFieldsService.getAll();
        setGlobalFields(fields);
      } catch (error) {
        console.error('Failed to load global fields:', error);
      }
    };
    loadGlobalFields();
  }, []);

  // Handle global fields change
  const handleGlobalFieldsChange = async (fields: ProductCustomField[]) => {
    setGlobalFields(fields);
    try {
      await globalFieldsService.save(fields);
    } catch (error) {
      console.error('Failed to save global fields:', error);
    }
  };

  // Enhanced validator for required global custom fields
  const enhancedValidator = createEnhancedValidator<Product>(
    productValidator,
    globalFields,
    'stock'
  );

  // Get title based on mode
  const screenTitle = formMode === 'edit' 
    ? t('stock:edit_stock', { defaultValue: 'Stok düzenle' })
    : t('stock:new_stock', { defaultValue: 'Yeni Ürün Ekle' });

  return (
    <FormScreenContainer
      service={productEntityService}
      config={{
        entityName: 'stock_item',
        translationNamespace: 'stock',
        mode: formMode,
      }}
      initialData={getInitialData()}
      validator={enhancedValidator}
      title={screenTitle}
      renderForm={(formData, updateField, errors) => {
        // Use formData's customFields directly or empty array
        const customFields = (formData.customFields as ProductCustomField[]) || [];

        const handleCustomFieldsChange = (fields: ProductCustomField[]) => {
          updateField('customFields' as keyof Product, fields);
        };

        // Build form fields with custom category and currency fields
        const fieldsWithCustoms = useMemo(() => {
          return productFormFields.map((field) => {
            if (field.name === 'category') {
              return {
                ...field,
                render: (value: any, onChange: (v: any) => void) => (
                  <CategorySelect
                    value={value || ''}
                    options={categoryOptions}
                    placeholder={field.placeholderKey || 'Kategori Seçin'}
                    onChange={(val) => onChange(val)}
                    onCategoryAdded={handleCategoryAdded}
                  />
                ),
              };
            }
            if (field.name === 'currency') {
              return {
                ...field,
                render: (value: any, onChange: (v: any) => void) => (
                  <CurrencySelect
                    value={value}
                    onChange={(val) => onChange(val)}
                    placeholder="Para Birimi"
                  />
                ),
              };
            }
            return field;
          });
        }, [categoryOptions, handleCategoryAdded]);

        return (
          <View style={{ gap: spacing.md }}>
            <DynamicForm
              namespace="stock"
              columns={2}
              fields={fieldsWithCustoms}
              values={{
                ...formData,
                stock: formData.stock ?? 1, // Ensure default value is set
              }}
              onChange={(v) => {
                (Object.keys(v) as Array<keyof typeof v>).forEach((key) => {
                  updateField(key as keyof Product, v[key]);
                });
              }}
            />

            {/* Custom Fields Section */}
            <Card>
              <CustomFieldsManager<ProductCustomField>
                customFields={customFields}
                onChange={handleCustomFieldsChange}
                availableGlobalFields={globalFields}
                onGlobalFieldsChange={handleGlobalFieldsChange}
                module="stock"
              />
            </Card>
          </View>
        );
      }}
    />
  );
}

