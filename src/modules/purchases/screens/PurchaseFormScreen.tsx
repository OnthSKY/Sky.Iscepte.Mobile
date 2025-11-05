/**
 * PurchaseFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { purchaseEntityService } from '../services/purchaseServiceAdapter';
import DynamicForm, { DynamicField } from '../../../shared/components/DynamicForm';
import { Purchase, PurchaseCustomField } from '../store/purchaseStore';
import { basePurchaseFormFields, purchaseValidator } from '../config/purchaseFormConfig';
import { useProductsQuery } from '../../products/hooks/useProductsQuery';
import { useSuppliersQuery } from '../../suppliers/hooks/useSuppliersQuery';
import PurchaseTypeSelect from '../components/PurchaseTypeSelect';
import purchaseTypeService, { PurchaseType } from '../services/purchaseTypeService';
import CustomFieldsManager from '../../../shared/components/CustomFieldsManager';
import Card from '../../../shared/components/Card';
import spacing from '../../../core/constants/spacing';
import SignatureInput from '../../../shared/components/SignatureInput';

interface PurchaseFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function PurchaseFormScreen({ mode }: PurchaseFormScreenProps = {}) {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['purchases', 'common']);
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  // Fetch products and suppliers for select fields
  const { data: productsData } = useProductsQuery();
  const { data: suppliersData } = useSuppliersQuery();

  // Purchase types state
  const [purchaseTypes, setPurchaseTypes] = useState<PurchaseType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [selectedPurchaseType, setSelectedPurchaseType] = useState<PurchaseType | null>(null);

  // Load purchase types on mount
  useEffect(() => {
    loadPurchaseTypes();
  }, []);

  const loadPurchaseTypes = async () => {
    setLoadingTypes(true);
    try {
      const response = await purchaseTypeService.list();
      // Mock service returns PaginatedData, real API might return array directly
      // Handle both cases: PaginatedData format or direct array
      let types: PurchaseType[] = [];
      if (Array.isArray(response)) {
        types = response;
      } else if (response && typeof response === 'object' && 'items' in response) {
        // PaginatedData format
        types = (response as any).items || [];
      }
      setPurchaseTypes(Array.isArray(types) ? types : []);
    } catch (err) {
      // Failed to load purchase types - will use empty list
      setPurchaseTypes([]);
    } finally {
      setLoadingTypes(false);
    }
  };


  // Handle purchase type added
  const handleTypeAdded = useCallback(() => {
    loadPurchaseTypes();
  }, []);

  // Handle purchase type selection
  const handlePurchaseTypeChange = useCallback((typeId: string) => {
    const type = purchaseTypes.find((t) => String(t.id) === typeId);
    setSelectedPurchaseType(type || null);
  }, [purchaseTypes]);

  // Prepare purchase type options
  const typeOptions = useMemo(
    () => (Array.isArray(purchaseTypes) ? purchaseTypes : []).map((t) => ({ label: t.name, value: String(t.id) })),
    [purchaseTypes]
  );

  // Build dynamic fields with purchase type selection and type-specific fields
  const purchaseFields: DynamicField[] = useMemo(() => {
    const fields: DynamicField[] = [
      {
        name: 'purchaseTypeId',
        labelKey: 'purchase_type',
        type: 'custom',
        render: (value, onChange) => (
          <PurchaseTypeSelect
            options={typeOptions}
            value={String(value || '')}
            onChange={(val) => {
              onChange?.(val);
              handlePurchaseTypeChange(val);
            }}
            placeholder={loadingTypes ? t('loading', { defaultValue: 'Yükleniyor...' }) : t('purchase_type', { defaultValue: 'Alış Tipi' })}
            onTypeAdded={handleTypeAdded}
          />
        ),
        required: false,
      },
    ];

    // Add type-specific fields if a type is selected
    if (selectedPurchaseType?.formFields && selectedPurchaseType.formFields.length > 0) {
      selectedPurchaseType.formFields.forEach((typeField) => {
        fields.push({
          name: `typeField_${typeField.key}`,
          labelKey: typeField.label,
          type: typeField.type as any,
          required: typeField.required,
          defaultValue: typeField.defaultValue,
          options: typeField.options,
        });
      });
    }

    // Add base fields
    fields.push(...basePurchaseFormFields);

    return fields;
  }, [typeOptions, loadingTypes, selectedPurchaseType, t, handleTypeAdded, handlePurchaseTypeChange]);

  // Prepare form fields with dynamic options
  const fieldsWithOptions = useMemo(() => {
    const products = productsData?.items || [];
    const suppliers = suppliersData?.items || [];

    return purchaseFields.map(field => {
      if (field.name === 'productId') {
        return {
          ...field,
          options: products.map((p: any) => ({
            label: `${p.name} (Stok: ${p.stock ?? 0})`,
            value: String(p.id),
          })),
          // productId is optional - only required if isStockPurchase is true
          required: false,
        };
      }
      if (field.name === 'supplierId') {
        return {
          ...field,
          options: suppliers.map((s: any) => ({
            label: s.name || s.email || `Tedarikçi ${s.id}`,
            value: String(s.id),
          })),
        };
      }
      // Handle signature field with custom render
      if (field.name === 'signature') {
        return {
          ...field,
          render: (value: string, onChange: (v: string) => void) => (
            <SignatureInput
              value={value}
              onChange={onChange}
              placeholder={t('signature', { defaultValue: 'İmza alanına dokunarak imzanızı çizin' })}
            />
          ),
        };
      }
      return field;
    });
  }, [productsData, suppliersData, purchaseFields, t]);

  return (
    <FormScreenContainer
      service={purchaseEntityService}
      config={{
        entityName: 'purchase',
        translationNamespace: 'purchases',
        mode: formMode,
      }}
      validator={purchaseValidator}
      initialData={formMode === 'create' ? { customFields: [], isStockPurchase: true } : undefined}
      renderForm={(formData, updateField, errors) => {
        // Get products and suppliers for lookup (closure over component scope)
        const products = productsData?.items || [];
        const suppliers = suppliersData?.items || [];
        
        // Use formData's customFields directly or empty array (same as ProductFormScreen)
        const customFields = (formData.customFields as PurchaseCustomField[]) || [];

        // Load purchase type when purchaseTypeId is available (for edit mode)
        React.useEffect(() => {
          if (formData.purchaseTypeId && purchaseTypes.length > 0 && !selectedPurchaseType) {
            const type = purchaseTypes.find((t) => String(t.id) === String(formData.purchaseTypeId));
            if (type) {
              setSelectedPurchaseType(type);
            }
          }
        }, [formData.purchaseTypeId, purchaseTypes, selectedPurchaseType]);

        const handleCustomFieldsChange = (fields: PurchaseCustomField[]) => {
          // Filter out any signature fields to prevent duplicates (signature is already in base fields)
          const filteredFields = fields.filter(f => f.key !== 'signature');
          updateField('customFields' as keyof Purchase, filteredFields);
        };

        // Prepare form values including type-specific fields
        // Type-specific fields use typeField_ prefix and are stored in a separate metadata object
        const formValues: Partial<Purchase> & Record<string, any> = { ...formData };
        if (selectedPurchaseType?.formFields) {
          selectedPurchaseType.formFields.forEach((typeField) => {
            const fieldKey = `typeField_${typeField.key}`;
            // Store type-specific field values with the typeField_ prefix
            if (!(fieldKey in formValues)) {
              formValues[fieldKey] = typeField.defaultValue;
            }
          });
        }
        
        return (
          <View style={{ gap: spacing.md }}>
            <DynamicForm
              namespace="purchases"
              columns={2}
              fields={fieldsWithOptions}
              values={formValues}
              onChange={(v) => {
                Object.keys(v).forEach((key) => {
                  const newValue = v[key];
                  
                  // Handle purchaseTypeId change
                  if (key === 'purchaseTypeId' && newValue) {
                    const selectedType = purchaseTypes.find((t) => String(t.id) === String(newValue));
                    updateField('purchaseTypeId' as keyof Purchase, newValue);
                    if (selectedType) {
                      updateField('purchaseTypeName' as keyof Purchase, selectedType.name);
                    }
                  }
                  
                  // Handle isStockPurchase change
                  if (key === 'isStockPurchase') {
                    updateField('isStockPurchase' as keyof Purchase, newValue);
                    // If switching to non-stock purchase, clear productId
                    if (!newValue && formData.productId) {
                      updateField('productId' as keyof Purchase, undefined);
                      updateField('productName' as keyof Purchase, undefined);
                    }
                  }
                  
                  // Handle type-specific fields - store them separately
                  if (key.startsWith('typeField_')) {
                    // Type-specific fields are stored with the typeField_ prefix in formValues
                    // They will be saved to the purchase's metadata or customFields on submit
                    formValues[key] = newValue;
                  } else {
                    updateField(key as keyof Purchase, newValue);
                  }
                  
                  // Auto-fill supplierName when supplier is selected
                  if (key === 'supplierId' && newValue) {
                    const selectedSupplier = suppliers.find((s: any) => String(s.id) === String(newValue));
                    if (selectedSupplier && selectedSupplier.name) {
                      updateField('supplierName' as keyof Purchase, selectedSupplier.name);
                    }
                  }
                  
                  // Handle product selection with stock check
                  // Only check stock if this is a stock purchase
                  if (key === 'productId' && newValue && formData.isStockPurchase !== false) {
                    const selectedProduct = products.find((p: any) => String(p.id) === String(newValue));
                    if (selectedProduct) {
                      // Check if product is in stock (stock > 0)
                      const productStock = selectedProduct.stock ?? 0;
                      const isInStock = productStock > 0;
                      
                      // If product is in stock and we're in create mode, offer to redirect to QuickPurchase
                      if (isInStock && formMode === 'create') {
                        // First update the productId field
                        updateField('productId' as keyof Purchase, newValue);
                        
                        // Then show alert with options
                        Alert.alert(
                          t('purchases:product_in_stock_title', { defaultValue: 'Ürün Stokta Mevcut' }),
                          t('purchases:product_in_stock_message', { 
                            productName: selectedProduct.name,
                            stock: productStock,
                            defaultValue: `"${selectedProduct.name}" ürünü stokta mevcut (Stok: ${productStock}). Stok artırmak için Hızlı Alış ekranına yönlendirilmek ister misiniz?` 
                          }),
                          [
                            {
                              text: t('purchases:continue_normal_purchase', { defaultValue: 'Normal Alış\'a Devam Et' }),
                              style: 'cancel',
                              onPress: () => {
                                // Continue with normal purchase form
                                // Auto-fill price if not set
                                if (selectedProduct.price) {
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
                            },
                            {
                              text: t('purchases:go_to_quick_purchase', { defaultValue: 'Hızlı Alış\'a Git' }),
                              onPress: () => {
                                // Navigate to QuickPurchase screen with productId
                                navigation.navigate('QuickPurchase' as never, { productId: String(selectedProduct.id) } as never);
                                // Clear the product selection to avoid confusion
                                updateField('productId' as keyof Purchase, undefined);
                              }
                            }
                          ],
                          { cancelable: true }
                        );
                        // Auto-fill price if not set (for normal purchase flow)
                        if (selectedProduct.price) {
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
                        return;
                      }
                      
                      // If product is not in stock or we're in edit mode, continue normally
                      // Auto-fill price if not set
                      if (selectedProduct.price) {
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

            {/* Custom Fields Section */}
            <Card>
              <CustomFieldsManager<PurchaseCustomField>
                customFields={customFields}
                onChange={handleCustomFieldsChange}
                module="purchases"
              />
            </Card>
          </View>
        );
      }}
    />
  );
}

