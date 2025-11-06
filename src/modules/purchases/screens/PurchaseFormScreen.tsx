/**
 * PurchaseFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Alert, ScrollView, Switch, Text, TouchableOpacity, Platform, Modal as RNModal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { purchaseEntityService } from '../services/purchaseServiceAdapter';
import DynamicForm, { DynamicField } from '../../../shared/components/DynamicForm';
import { Purchase, PurchaseCustomField, PurchaseItem, Currency } from '../store/purchaseStore';
import { basePurchaseFormFields, purchaseValidator } from '../config/purchaseFormConfig';
import { useProductsQuery } from '../../products/hooks/useProductsQuery';
import { useSuppliersQuery } from '../../suppliers/hooks/useSuppliersQuery';
import PurchaseTypeSelect from '../components/PurchaseTypeSelect';
import purchaseTypeService, { PurchaseType } from '../services/purchaseTypeService';
import CustomFieldsManager from '../../../shared/components/CustomFieldsManager';
import Card from '../../../shared/components/Card';
import spacing from '../../../core/constants/spacing';
import SignatureInput from '../../../shared/components/SignatureInput';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import SearchBar from '../../../shared/components/SearchBar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CurrencySelect from '../../products/components/CurrencySelect';
import { formatCurrency } from '../../products/utils/currency';
import { Product } from '../../products/services/productService';
import notificationService from '../../../shared/services/notificationService';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { formatDate } from '../../../core/utils/dateUtils';
import { Form, FormField, FormRow } from '../../../shared/components/Form';
import DateTimePicker from '../../../shared/components/DateTimePicker';

interface PurchaseFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function PurchaseFormScreen({ mode }: PurchaseFormScreenProps = {}) {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['purchases', 'common']);
  const { colors } = useTheme();
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  // State for datetime picker
  const [dateTimePickerVisible, setDateTimePickerVisible] = useState(false);

  // State for bulk purchase mode
  const [isBulkPurchase, setIsBulkPurchase] = useState(false);
  const [bulkPurchaseItems, setBulkPurchaseItems] = useState<PurchaseItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [expandedItemIndex, setExpandedItemIndex] = useState<number | null>(null); // For custom fields expansion
  const [productModalVisible, setProductModalVisible] = useState(false); // For full screen product selection modal
  const [modalSearchQuery, setModalSearchQuery] = useState(''); // Search query for modal

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

        // Filter products for search
        const filteredProducts = useMemo(() => {
          if (!productSearchQuery.trim()) return products;
          const query = productSearchQuery.toLowerCase();
          return products.filter((p: Product) => 
            p.name?.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query) ||
            p.sku?.toLowerCase().includes(query)
          );
        }, [products, productSearchQuery]);

        const selectedProduct = useMemo(() => {
          if (!selectedProductId) return null;
          return products.find((p: Product) => String(p.id) === String(selectedProductId));
        }, [selectedProductId, products]);

        // Auto-fill price when product is selected (bulk mode)
        useEffect(() => {
          if (selectedProduct && selectedProduct.price !== undefined && isBulkPurchase) {
            setPrice(String(selectedProduct.price));
          } else if (!selectedProduct && isBulkPurchase) {
            setPrice('');
          }
        }, [selectedProduct, isBulkPurchase]);

        // Calculate total for bulk purchase
        const bulkTotal = useMemo(() => {
          return bulkPurchaseItems.reduce((sum, item) => sum + item.subtotal, 0);
        }, [bulkPurchaseItems]);

        // Parse date and time from formData.date (format: "YYYY-MM-DD HH:mm" or "YYYY-MM-DD")
        const todayDate = formatDate(new Date());
        const currentDate = formData.date || '';
        const displayDate = currentDate || (formMode === 'create' ? todayDate : '');
        
        // Format display value for datetime picker
        const displayDateTime = useMemo(() => {
          if (!displayDate) return formMode === 'create' ? todayDate : '';
          return displayDate;
        }, [displayDate, formMode, todayDate]);

        // Handle bulk purchase item add
        const handleAddBulkItem = () => {
          if (!selectedProduct) {
            notificationService.error(t('purchases:select_product', { defaultValue: 'Lütfen ürün seçin' }));
            return;
          }

          const qty = parseFloat(quantity);
          if (isNaN(qty) || qty <= 0) {
            notificationService.error(t('purchases:invalid_quantity', { defaultValue: 'Geçersiz miktar' }));
            return;
          }

          const itemPrice = parseFloat(price);
          if (isNaN(itemPrice) || itemPrice <= 0) {
            notificationService.error(t('purchases:invalid_price', { defaultValue: 'Geçersiz fiyat' }));
            return;
          }

          const subtotal = itemPrice * qty;

          // Get selected currency from form or use product currency or default to TRY
          const selectedCurrency = formData.currency || selectedProduct.currency || 'TRY';
          
          // Default isStockPurchase to true for bulk items
          const itemIsStockPurchase = true; // Default to stock purchase
          
          // Check if item already exists
          const existingIndex = bulkPurchaseItems.findIndex(item => item.productId === selectedProductId);
          if (existingIndex >= 0) {
            const newItems = [...bulkPurchaseItems];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + qty,
              subtotal: newItems[existingIndex].subtotal + subtotal,
            };
            setBulkPurchaseItems(newItems);
          } else {
            setBulkPurchaseItems([
              ...bulkPurchaseItems,
              {
                productId: selectedProductId!,
                productName: selectedProduct.name,
                quantity: qty,
                price: itemPrice,
                subtotal,
                currency: selectedCurrency,
                isStockPurchase: itemIsStockPurchase,
              },
            ]);
          }

          // Reset selection
          setSelectedProductId(null);
          setQuantity('1');
          setPrice('');
        };

        const handleRemoveBulkItem = (index: number) => {
          setBulkPurchaseItems(bulkPurchaseItems.filter((_, i) => i !== index));
        };

        const handleUpdateBulkQuantity = (index: number, newQuantity: string) => {
          const qty = parseFloat(newQuantity);
          if (isNaN(qty) || qty <= 0) return;

          const newItems = [...bulkPurchaseItems];
          const item = newItems[index];
          newItems[index] = {
            ...item,
            quantity: qty,
            subtotal: item.price * qty,
          };
          setBulkPurchaseItems(newItems);
        };

        const handleUpdateBulkPrice = (index: number, newPrice: string) => {
          const itemPrice = parseFloat(newPrice);
          if (isNaN(itemPrice) || itemPrice <= 0) return;

          const newItems = [...bulkPurchaseItems];
          const item = newItems[index];
          newItems[index] = {
            ...item,
            price: itemPrice,
            subtotal: itemPrice * item.quantity,
          };
          setBulkPurchaseItems(newItems);
        };

        const handleToggleBulkItemStockPurchase = (index: number, value: boolean) => {
          const newItems = [...bulkPurchaseItems];
          newItems[index] = {
            ...newItems[index],
            isStockPurchase: value,
          };
          setBulkPurchaseItems(newItems);
        };

        // Update form data when bulk purchase items change
        useEffect(() => {
          if (isBulkPurchase && bulkPurchaseItems.length > 0) {
            const total = bulkPurchaseItems.reduce((sum, item) => sum + item.subtotal, 0);
            updateField('amount' as keyof Purchase, total);
            updateField('total' as keyof Purchase, total);
            // Only update currency if not already set
            if (!formData.currency) {
              updateField('currency' as keyof Purchase, bulkPurchaseItems[0]?.currency || 'TRY');
            }
            updateField('items' as keyof Purchase, bulkPurchaseItems);
          } else if (isBulkPurchase && bulkPurchaseItems.length === 0) {
            updateField('items' as keyof Purchase, []);
            updateField('amount' as keyof Purchase, 0);
            updateField('total' as keyof Purchase, 0);
          }
        }, [bulkPurchaseItems, isBulkPurchase]);
        
        return (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={{ gap: spacing.md }}>
              {/* Bulk Purchase Toggle */}
              {formMode === 'create' && (
                <Card>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                      {t('purchases:bulk_purchase', { defaultValue: 'Toplu Alış' })}
                    </Text>
                    <Switch
                      value={isBulkPurchase}
                      onValueChange={(value) => {
                        setIsBulkPurchase(value);
                        if (!value) {
                          setBulkPurchaseItems([]);
                          setSelectedProductId(null);
                          setQuantity('1');
                          setPrice('');
                        }
                      }}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={isBulkPurchase ? '#fff' : colors.muted}
                    />
                  </View>
                </Card>
              )}

              {!isBulkPurchase ? (
                <>
                  {/* Single Product Form */}
                  <Form>
                  <DynamicForm
                    namespace="purchases"
                    columns={2}
                    fields={fieldsWithOptions.filter(f => f.name !== 'date')} // Exclude date field - rendered separately
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

            {/* Date and Time Section (Single Purchase) */}
            <FormRow columns={1}>
              <FormField label={t('purchases:date')} required>
                <TouchableOpacity onPress={() => setDateTimePickerVisible(true)}>
                  <Input
                    value={displayDateTime}
                    editable={false}
                    pointerEvents="none"
                    placeholder={formMode === 'create' ? todayDate : "YYYY-MM-DD"}
                    style={{ backgroundColor: colors.surface, color: colors.text }}
                  />
                </TouchableOpacity>
              </FormField>
            </FormRow>
            
            {/* DateTime Picker Modal */}
            <DateTimePicker
              visible={dateTimePickerVisible}
              onClose={() => setDateTimePickerVisible(false)}
              value={displayDateTime}
              onConfirm={(dateTime: string) => {
                updateField('date' as keyof Purchase, dateTime);
                setDateTimePickerVisible(false);
              }}
              label={t('purchases:date')}
              showTime={true}
            />

            {/* Custom Fields Section */}
            <Card>
              <CustomFieldsManager<PurchaseCustomField>
                customFields={customFields}
                onChange={handleCustomFieldsChange}
                module="purchases"
              />
            </Card>
            </Form>
            </>
          ) : (
            <>
              {/* Bulk Purchase Form */}
              <Card>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.md }}>
                  {t('purchases:supplier', { defaultValue: 'Tedarikçi' })}
                </Text>
                <DynamicForm
                  namespace="purchases"
                  columns={1}
                  fields={fieldsWithOptions.filter(f => f.name === 'supplierId')}
                  values={formData}
                  onChange={(v) => {
                    Object.keys(v).forEach((key) => {
                      updateField(key as keyof Purchase, (v as any)[key]);
                    });
                  }}
                />
                
                {/* Currency Selection */}
                <View style={{ marginTop: spacing.md }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: spacing.xs }}>
                    {t('purchases:currency', { defaultValue: 'Para Birimi' })}
                  </Text>
                  <CurrencySelect
                    value={formData.currency || 'TRY'}
                    onChange={(currency: Currency) => {
                      updateField('currency' as keyof Purchase, currency);
                      // Update all items currency if they don't have one set
                      if (bulkPurchaseItems.length > 0) {
                        const updatedItems = bulkPurchaseItems.map(item => ({
                          ...item,
                          currency: item.currency || currency,
                        }));
                        setBulkPurchaseItems(updatedItems);
                      }
                    }}
                    placeholder={t('purchases:currency', { defaultValue: 'Para Birimi Seçiniz' })}
                  />
                </View>
              </Card>

              {/* Product Search and Selection */}
              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                    {t('purchases:select_product', { defaultValue: 'Ürün Seç' })}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setModalSearchQuery('');
                      setProductModalVisible(true);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: 8,
                      backgroundColor: colors.primary,
                    }}
                  >
                    <Ionicons name="expand-outline" size={18} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>
                      {t('purchases:full_screen', { defaultValue: 'Tam Ekran' })}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <SearchBar
                  value={productSearchQuery}
                  onChangeText={setProductSearchQuery}
                  placeholder={t('purchases:search_product', { defaultValue: 'Ürün ara...' })}
                />

                <ScrollView 
                  style={{ maxHeight: 200 }} 
                  contentContainerStyle={{ paddingVertical: spacing.xs }}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={true}
                  bounces={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((item) => {
                      const isSelected = selectedProductId === String(item.id);
                      return (
                        <TouchableOpacity
                          key={String(item.id)}
                          onPress={() => setSelectedProductId(String(item.id))}
                          style={{
                            padding: spacing.md,
                            borderRadius: 12,
                            marginBottom: spacing.sm,
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: isSelected ? colors.primary + '20' : colors.surface,
                            borderWidth: 1,
                            borderColor: isSelected ? colors.primary : colors.border,
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text, marginBottom: spacing.xs }}>
                              {item.name}
                            </Text>
                            {item.category && (
                              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: spacing.xs }}>
                                {item.category}
                              </Text>
                            )}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text style={{ fontSize: 12, color: colors.muted }}>
                                {t('purchases:stock', { defaultValue: 'Stok' })}: {item.stock || 0}
                              </Text>
                              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                                {item.price ? formatCurrency(item.price, item.currency || 'TRY') : '0'}
                              </Text>
                            </View>
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <View style={{ padding: spacing.md, alignItems: 'center' }}>
                      <Text style={{ color: colors.muted, fontSize: 14 }}>
                        {t('purchases:no_products_found', { defaultValue: 'Ürün bulunamadı' })}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </Card>

              {/* Full Screen Product Selection Modal */}
              <RNModal
                visible={productModalVisible}
                animationType="slide"
                onRequestClose={() => setProductModalVisible(false)}
              >
                <View style={{ flex: 1, backgroundColor: colors.background }}>
                  {/* Modal Header */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    backgroundColor: colors.surface,
                  }}>
                    <TouchableOpacity
                      onPress={() => setProductModalVisible(false)}
                      style={{ padding: spacing.sm, marginRight: spacing.md }}
                    >
                      <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, flex: 1 }}>
                      {t('purchases:select_product', { defaultValue: 'Ürün Seç' })}
                    </Text>
                  </View>

                  {/* Search Bar */}
                  <View style={{ padding: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <SearchBar
                      value={modalSearchQuery}
                      onChangeText={setModalSearchQuery}
                      placeholder={t('purchases:search_product', { defaultValue: 'Ürün ara...' })}
                    />
                  </View>

                  {/* Product List */}
                  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md }}>
                    {(() => {
                      const modalFilteredProducts = modalSearchQuery.trim()
                        ? products.filter((p: Product) =>
                            p.name?.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
                            p.category?.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
                            p.sku?.toLowerCase().includes(modalSearchQuery.toLowerCase())
                          )
                        : products;

                      return modalFilteredProducts.map((item: Product) => {
                        const isSelected = selectedProductId === String(item.id);
                        return (
                          <TouchableOpacity
                            key={String(item.id)}
                            onPress={() => {
                              setSelectedProductId(String(item.id));
                              setProductModalVisible(false);
                              // Auto-fill price if available
                              if (item.price) {
                                setPrice(String(item.price));
                              }
                            }}
                            style={{
                              padding: spacing.md,
                              borderRadius: 12,
                              marginBottom: spacing.sm,
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: isSelected ? colors.primary + '20' : colors.surface,
                              borderWidth: 1,
                              borderColor: isSelected ? colors.primary : colors.border,
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text, marginBottom: spacing.xs }}>
                                {item.name}
                              </Text>
                              {item.category && (
                                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: spacing.xs }}>
                                  {item.category}
                                </Text>
                              )}
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 12, color: colors.muted }}>
                                  {t('purchases:stock', { defaultValue: 'Stok' })}: {item.stock || 0}
                                </Text>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                                  {item.price ? formatCurrency(item.price, item.currency || 'TRY') : '0'}
                                </Text>
                              </View>
                            </View>
                            {isSelected && (
                              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                            )}
                          </TouchableOpacity>
                        );
                      });
                    })()}
                  </ScrollView>
                </View>
              </RNModal>

              {/* Quantity, Price Input and Add Button */}
              {selectedProduct && (
                <Card>
                  <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-end' }}>
                    <View style={{ flex: 1, gap: spacing.sm }}>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: spacing.xs }}>
                          {t('purchases:quantity', { defaultValue: 'Miktar' })}
                        </Text>
                        <Input
                          value={quantity}
                          onChangeText={setQuantity}
                          placeholder="1"
                          keyboardType="numeric"
                        />
                      </View>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: spacing.xs }}>
                          {t('purchases:price', { defaultValue: 'Fiyat' })}
                        </Text>
                        <Input
                          value={price}
                          onChangeText={setPrice}
                          placeholder={selectedProduct.price ? String(selectedProduct.price) : "0"}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                    <Button
                      title={t('purchases:add', { defaultValue: 'Ekle' })}
                      onPress={handleAddBulkItem}
                      style={{ paddingHorizontal: spacing.lg }}
                    />
                  </View>
                </Card>
              )}

              {/* Bulk Purchase Items List */}
              {bulkPurchaseItems.length > 0 && (
                <Card>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.md }}>
                    {t('purchases:items', { defaultValue: 'Alış Kalemleri' })}
                  </Text>
                  
                  <ScrollView 
                    style={{ maxHeight: 400 }} 
                    contentContainerStyle={{ paddingVertical: spacing.xs }}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {bulkPurchaseItems.map((item, index) => {
                      const product = products.find((p: Product) => String(p.id) === item.productId);
                      const isExpanded = expandedItemIndex === index;
                      const itemCustomFields = item.customFields || [];
                      
                      const handleItemCustomFieldsChange = (fields: PurchaseCustomField[]) => {
                        const updatedItems = [...bulkPurchaseItems];
                        updatedItems[index] = {
                          ...updatedItems[index],
                          customFields: fields,
                        };
                        setBulkPurchaseItems(updatedItems);
                      };
                      
                      return (
                        <View key={index} style={{ 
                          marginBottom: spacing.md,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                          paddingBottom: spacing.md,
                        }}>
                          <View style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            paddingVertical: spacing.sm,
                          }}>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: spacing.xs }}>
                                {product?.name || item.productName || t('purchases:product', { defaultValue: 'Ürün' })}
                              </Text>
                              <Text style={{ fontSize: 12, color: colors.muted }}>
                                {item.quantity} x {formatCurrency(item.price, product?.currency || 'TRY')} = {formatCurrency(item.subtotal, product?.currency || 'TRY')}
                              </Text>
                              {/* Stock Purchase Toggle for each item */}
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs }}>
                                <Text style={{ fontSize: 12, color: colors.text, marginRight: spacing.xs }}>
                                  {t('purchases:stock_purchase', { defaultValue: 'Stok Artışı' })}
                                </Text>
                                <Switch
                                  value={item.isStockPurchase !== false}
                                  onValueChange={(value) => handleToggleBulkItemStockPurchase(index, value)}
                                  trackColor={{ false: colors.border, true: colors.primary }}
                                  thumbColor={item.isStockPurchase !== false ? '#fff' : colors.muted}
                                />
                              </View>
                            </View>
                            <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
                              <Input
                                value={String(item.quantity)}
                                onChangeText={(val) => handleUpdateBulkQuantity(index, val)}
                                keyboardType="numeric"
                                style={{ width: 60, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, textAlign: 'center' }}
                              />
                              <Input
                                value={String(item.price)}
                                onChangeText={(val) => handleUpdateBulkPrice(index, val)}
                                keyboardType="numeric"
                                style={{ width: 80, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, textAlign: 'center' }}
                              />
                              <TouchableOpacity
                                onPress={() => setExpandedItemIndex(isExpanded ? null : index)}
                                style={{ padding: spacing.sm, borderRadius: 8, backgroundColor: colors.primary }}
                              >
                                <Ionicons name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#fff" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => handleRemoveBulkItem(index)}
                                style={{ padding: spacing.sm, borderRadius: 8, backgroundColor: '#EF4444' }}
                              >
                                <Ionicons name="trash-outline" size={20} color="#fff" />
                              </TouchableOpacity>
                            </View>
                          </View>
                          
                          {/* Custom Fields Section for Item */}
                          {isExpanded && (
                            <View style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
                              <CustomFieldsManager<PurchaseCustomField>
                                customFields={itemCustomFields}
                                onChange={handleItemCustomFieldsChange}
                                module="purchases"
                              />
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </ScrollView>

                  {/* Total */}
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: spacing.md,
                    paddingTop: spacing.md,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                      {t('purchases:total_amount', { defaultValue: 'Toplam Tutar' })}:
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.primary }}>
                      {formatCurrency(bulkTotal, formData.currency || 'TRY')}
                    </Text>
                  </View>
                </Card>
              )}

              {/* Date and Time Section for Bulk Purchase */}
              <FormRow columns={1}>
                <FormField label={t('purchases:date')} required>
                  <TouchableOpacity onPress={() => setDateTimePickerVisible(true)}>
                    <Input
                      value={displayDateTime}
                      editable={false}
                      pointerEvents="none"
                      placeholder={formMode === 'create' ? todayDate : "YYYY-MM-DD"}
                      style={{ backgroundColor: colors.surface, color: colors.text }}
                    />
                  </TouchableOpacity>
                </FormField>
              </FormRow>

              {/* DateTime Picker Modal */}
              <DateTimePicker
                visible={dateTimePickerVisible}
                onClose={() => setDateTimePickerVisible(false)}
                value={displayDateTime}
                onConfirm={(dateTime: string) => {
                  updateField('date' as keyof Purchase, dateTime);
                  setDateTimePickerVisible(false);
                }}
                label={t('purchases:date')}
                showTime={true}
              />

              {/* Notes Field */}
              <FormRow columns={1}>
                <FormField label={t('purchases:notes')}>
                  <Input
                    value={formData.title || ''}
                    onChangeText={(text) => updateField('title' as keyof Purchase, text)}
                    multiline
                    numberOfLines={6}
                    style={{ 
                      textAlignVertical: 'top',
                      minHeight: 120,
                      fontSize: 16,
                      fontWeight: '400',
                      borderWidth: 2,
                      borderColor: colors.primary + '40',
                      paddingTop: 16,
                      paddingBottom: 16,
                      paddingHorizontal: 16,
                      color: colors.text,
                    }}
                    placeholder={t('purchases:notes')}
                  />
                </FormField>
              </FormRow>

              {/* Custom Fields Section */}
              <Card>
                <CustomFieldsManager<PurchaseCustomField>
                  customFields={customFields}
                  onChange={handleCustomFieldsChange}
                  module="purchases"
                />
              </Card>
            </>
          )}
            
            </View>
          </ScrollView>
        );
      }}
    />
  );
}

