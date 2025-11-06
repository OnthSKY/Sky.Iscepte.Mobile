/**
 * SalesFormScreen - Unified Create/Edit Screen
 * 
 * Single Responsibility: Only composes form screen UI
 * Dependency Inversion: Depends on service adapter interface
 * Open/Closed: Can handle both create and edit modes via props
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View, Text, Platform, Switch, ScrollView, Modal as RNModal } from 'react-native';
import { FormScreenContainer } from '../../../shared/components/screens/FormScreenContainer';
import { salesEntityService } from '../services/salesServiceAdapter';
import DynamicForm from '../../../shared/components/DynamicForm';
import { Sale, SalesCustomField, SaleItem } from '../store/salesStore';
import { salesFormFields, salesValidator } from '../config/salesFormConfig';
import { useProductsQuery } from '../../products/hooks/useProductsQuery';
import { useCustomersQuery } from '../../customers/hooks/useCustomersQuery';
import Input from '../../../shared/components/Input';
import { Form, FormField, FormRow } from '../../../shared/components/Form';
import { formatDate } from '../../../core/utils/dateUtils';
import { useTheme } from '../../../core/contexts/ThemeContext';
import Modal from '../../../shared/components/Modal';
import spacing from '../../../core/constants/spacing';
import CustomFieldsManager from '../../../shared/components/CustomFieldsManager';
import Card from '../../../shared/components/Card';
import { createEnhancedValidator, getInitialDataWithCustomFields } from '../../../shared/utils/customFieldsUtils';
import Button from '../../../shared/components/Button';
import SearchBar from '../../../shared/components/SearchBar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatCurrency } from '../../products/utils/currency';
import { Product } from '../../products/services/productService';
import notificationService from '../../../shared/services/notificationService';
import CurrencySelect from '../../products/components/CurrencySelect';
import { Currency } from '../store/salesStore';
import DateTimePicker from '../../../shared/components/DateTimePicker';

interface SalesFormScreenProps {
  mode?: 'create' | 'edit';
}

export default function SalesFormScreen({ mode }: SalesFormScreenProps = {}) {
  const route = useRoute<any>();
  const { t } = useTranslation('sales');
  const { colors } = useTheme();
  
  // State for datetime picker
  const [dateTimePickerVisible, setDateTimePickerVisible] = useState(false);
  
  // State for bulk sale mode
  const [isBulkSale, setIsBulkSale] = useState(false);
  const [bulkSaleItems, setBulkSaleItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [expandedItemIndex, setExpandedItemIndex] = useState<number | null>(null); // For custom fields expansion
  const [productModalVisible, setProductModalVisible] = useState(false); // For full screen product selection modal
  const [modalSearchQuery, setModalSearchQuery] = useState(''); // Search query for modal
  
  // Determine mode from route if not provided as prop
  const formMode = mode || (route.params?.id ? 'edit' : 'create');

  // Default values for create mode
  const getInitialData = (): Partial<Sale> => {
    return getInitialDataWithCustomFields<Sale>(formMode, {
      date: formatDate(new Date()),
      currency: 'TRY',
    });
  };

  // Enhanced validator for template fields
  const enhancedValidator = createEnhancedValidator<Sale>(
    salesValidator,
    [],
    'sales'
  );

  // Fetch products and customers for select fields
  const { data: productsData } = useProductsQuery();
  const { data: customersData } = useCustomersQuery();

  // Prepare form fields with dynamic options (excluding date and notes fields which are rendered separately)
  const fieldsWithOptions = useMemo(() => {
    const products = productsData?.items || [];
    const customers = customersData?.items || [];

    return salesFormFields
      .filter(field => field.name !== 'date') // Exclude date - rendered separately with time
      .map(field => {
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
      initialData={getInitialData()}
      validator={enhancedValidator}
      renderForm={(formData, updateField, errors) => {
        // Get products for price lookup (closure over component scope)
        const products = productsData?.items || [];
        
        // Use formData's customFields directly or empty array
        const customFields = (formData.customFields as SalesCustomField[]) || [];

        const handleCustomFieldsChange = (fields: SalesCustomField[]) => {
          updateField('customFields' as keyof Sale, fields);
        };
        
        // Parse date and time from formData.date (format: "YYYY-MM-DD HH:mm" or "YYYY-MM-DD")
        // For create mode, default to today's date for display if not set
        const todayDate = formatDate(new Date());
        const currentDate = formData.date || '';
        const displayDate = currentDate || (formMode === 'create' ? todayDate : '');
        
        // Format display value for datetime picker
        const displayDateTime = useMemo(() => {
          if (!displayDate) return formMode === 'create' ? todayDate : '';
          return displayDate;
        }, [displayDate, formMode, todayDate]);

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
          if (selectedProduct && selectedProduct.price !== undefined && isBulkSale) {
            setPrice(String(selectedProduct.price));
          } else if (!selectedProduct && isBulkSale) {
            setPrice('');
          }
        }, [selectedProduct, isBulkSale]);

        // Calculate total for bulk sale
        const bulkTotal = useMemo(() => {
          return bulkSaleItems.reduce((sum, item) => sum + item.subtotal, 0);
        }, [bulkSaleItems]);

        // Sync bulkSaleItems to formData.items when items change
        useEffect(() => {
          if (isBulkSale && bulkSaleItems.length > 0) {
            updateField('items' as keyof Sale, bulkSaleItems);
            updateField('total' as keyof Sale, bulkTotal);
          } else if (isBulkSale && bulkSaleItems.length === 0) {
            updateField('items' as keyof Sale, []);
            updateField('total' as keyof Sale, 0);
          }
        }, [bulkSaleItems, bulkTotal, isBulkSale]);

        // Handle bulk sale item add
        const handleAddBulkItem = () => {
          if (!selectedProduct) {
            notificationService.error(t('select_product', { defaultValue: 'Lütfen ürün seçin' }));
            return;
          }

          const qty = parseFloat(quantity);
          if (isNaN(qty) || qty <= 0) {
            notificationService.error(t('invalid_quantity', { defaultValue: 'Geçersiz miktar' }));
            return;
          }

          const stock = selectedProduct.stock || 0;
          if (qty > stock) {
            notificationService.error(t('insufficient_stock', { defaultValue: 'Yetersiz stok' }));
            return;
          }

          const itemPrice = parseFloat(price);
          if (isNaN(itemPrice) || itemPrice <= 0) {
            notificationService.error(t('invalid_price', { defaultValue: 'Geçersiz fiyat' }));
            return;
          }

          const subtotal = itemPrice * qty;

          // Get selected currency from form or use product currency or default to TRY
          const selectedCurrency = formData.currency || selectedProduct.currency || 'TRY';
          
          // Check if item already exists
          const existingIndex = bulkSaleItems.findIndex(item => item.productId === selectedProductId);
          if (existingIndex >= 0) {
            const newItems = [...bulkSaleItems];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + qty,
              subtotal: newItems[existingIndex].subtotal + subtotal,
            };
            setBulkSaleItems(newItems);
          } else {
            setBulkSaleItems([
              ...bulkSaleItems,
              {
                productId: selectedProductId!,
                productName: selectedProduct.name,
                quantity: qty,
                price: itemPrice,
                subtotal,
                currency: selectedCurrency,
              },
            ]);
          }

          // Reset selection
          setSelectedProductId(null);
          setQuantity('1');
          setPrice('');
        };

        const handleRemoveBulkItem = (index: number) => {
          setBulkSaleItems(bulkSaleItems.filter((_, i) => i !== index));
        };

        const handleUpdateBulkQuantity = (index: number, newQuantity: string) => {
          const qty = parseFloat(newQuantity);
          if (isNaN(qty) || qty <= 0) return;

          const newItems = [...bulkSaleItems];
          const item = newItems[index];
          const product = products.find((p: Product) => String(p.id) === item.productId);
          
          if (product && qty > (product.stock || 0)) {
            notificationService.error(t('insufficient_stock', { defaultValue: 'Yetersiz stok' }));
            return;
          }

          newItems[index] = {
            ...item,
            quantity: qty,
            subtotal: item.price * qty,
          };
          setBulkSaleItems(newItems);
        };

        const handleUpdateBulkPrice = (index: number, newPrice: string) => {
          const itemPrice = parseFloat(newPrice);
          if (isNaN(itemPrice) || itemPrice <= 0) return;

          const newItems = [...bulkSaleItems];
          const item = newItems[index];
          newItems[index] = {
            ...item,
            price: itemPrice,
            subtotal: itemPrice * item.quantity,
          };
          setBulkSaleItems(newItems);
        };

        // Update form data when bulk sale items change
        useEffect(() => {
          if (isBulkSale && bulkSaleItems.length > 0) {
            const total = bulkSaleItems.reduce((sum, item) => sum + item.subtotal, 0);
            updateField('amount' as keyof Sale, total);
            updateField('total' as keyof Sale, total);
            // Only update currency if not already set
            if (!formData.currency) {
              updateField('currency' as keyof Sale, bulkSaleItems[0]?.currency || 'TRY');
            }
            updateField('items' as keyof Sale, bulkSaleItems);
          } else if (isBulkSale && bulkSaleItems.length === 0) {
            updateField('items' as keyof Sale, []);
            updateField('amount' as keyof Sale, 0);
            updateField('total' as keyof Sale, 0);
          }
        }, [bulkSaleItems, isBulkSale]);
        
        return (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={{ gap: spacing.md }}>
              {/* Bulk Sale Toggle */}
              {formMode === 'create' && (
                <Card>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                      {t('bulk_sale', { defaultValue: 'Toplu Satış' })}
                    </Text>
                    <Switch
                      value={isBulkSale}
                      onValueChange={(value) => {
                        setIsBulkSale(value);
                        if (!value) {
                          setBulkSaleItems([]);
                          setSelectedProductId(null);
                          setQuantity('1');
                          setPrice('');
                        }
                      }}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={isBulkSale ? '#fff' : colors.muted}
                    />
                  </View>
                </Card>
              )}

              {!isBulkSale ? (
                <>
                  {/* Single Product Form */}
                  <Form>
                  <DynamicForm
                    namespace="sales"
                    columns={2}
                    fields={fieldsWithOptions}
                    values={formData}
                    onChange={(v) => {
                      Object.keys(v).forEach((key) => {
                        const newValue = (v as any)[key];
                        updateField(key as keyof Sale, newValue);
                        
                        // Auto-fill price when product is selected
                        if (key === 'productId' && newValue) {
                          const selectedProduct = products.find((p: any) => String(p.id) === String(newValue));
                          if (selectedProduct && selectedProduct.price) {
                            // Only auto-fill if price is not already set or is 0
                            const currentPrice = formData.price || 0;
                            if (currentPrice === 0) {
                              updateField('price' as keyof Sale, selectedProduct.price);
                              // Auto-set currency from product if not set
                              if (!formData.currency && selectedProduct.currency) {
                                updateField('currency' as keyof Sale, selectedProduct.currency);
                              }
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
            
            {/* Currency Selection */}
            <FormRow columns={1}>
              <FormField label={t('currency')}>
                <CurrencySelect
                  value={formData.currency || 'TRY'}
                  onChange={(currency: Currency) => {
                    updateField('currency' as keyof Sale, currency);
                  }}
                  placeholder={t('currency', { defaultValue: 'Para Birimi Seçiniz' })}
                />
              </FormField>
            </FormRow>
            
            {/* Date and Time Section */}
            <FormRow columns={1}>
              <FormField label={t('date')} required>
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
                updateField('date' as keyof Sale, dateTime);
                setDateTimePickerVisible(false);
              }}
              label={t('date')}
              showTime={true}
            />
            
            {/* Notes Field - Full Width and More Prominent */}
            <FormRow columns={1}>
              <FormField label={t('notes')}>
                <Input
                  value={formData.title || ''}
                  onChangeText={(text) => updateField('title' as keyof Sale, text)}
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
                    color: colors.text, // Explicit color for dark theme
                  }}
                  placeholder={t('notes')}
                />
              </FormField>
            </FormRow>
            
            </Form>
            </>
          ) : (
            <>
              {/* Bulk Sale Form */}
              <Card>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.md }}>
                  {t('customer', { defaultValue: 'Müşteri' })}
                </Text>
                <DynamicForm
                  namespace="sales"
                  columns={1}
                  fields={fieldsWithOptions.filter(f => f.name === 'customerId')}
                  values={formData}
                  onChange={(v) => {
                    Object.keys(v).forEach((key) => {
                      updateField(key as keyof Sale, (v as any)[key]);
                    });
                  }}
                />
                
                {/* Currency Selection */}
                <View style={{ marginTop: spacing.md }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: spacing.xs }}>
                    {t('currency', { defaultValue: 'Para Birimi' })}
                  </Text>
                  <CurrencySelect
                    value={formData.currency || 'TRY'}
                    onChange={(currency: Currency) => {
                      updateField('currency' as keyof Sale, currency);
                      // Update all items currency if they don't have one set
                      if (bulkSaleItems.length > 0) {
                        const updatedItems = bulkSaleItems.map(item => ({
                          ...item,
                          currency: item.currency || currency,
                        }));
                        setBulkSaleItems(updatedItems);
                      }
                    }}
                    placeholder={t('currency', { defaultValue: 'Para Birimi Seçiniz' })}
                  />
                </View>
              </Card>

              {/* Product Search and Selection */}
              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                    {t('select_product', { defaultValue: 'Ürün Seç' })}
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
                      {t('full_screen', { defaultValue: 'Tam Ekran' })}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <SearchBar
                  value={productSearchQuery}
                  onChangeText={setProductSearchQuery}
                  placeholder={t('search_product', { defaultValue: 'Ürün ara...' })}
                />

                <ScrollView 
                  style={{ maxHeight: 500 }} 
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
                          onPress={() => {
                            setSelectedProductId(String(item.id));
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
                                {t('stock', { defaultValue: 'Stok' })}: {item.stock || 0}
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
                        {t('no_products_found', { defaultValue: 'Ürün bulunamadı' })}
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
                      {t('select_product', { defaultValue: 'Ürün Seç' })}
                    </Text>
                  </View>

                  {/* Search Bar */}
                  <View style={{ padding: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <SearchBar
                      value={modalSearchQuery}
                      onChangeText={setModalSearchQuery}
                      placeholder={t('search_product', { defaultValue: 'Ürün ara...' })}
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
                                  {t('stock', { defaultValue: 'Stok' })}: {item.stock || 0}
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
                          {t('quantity', { defaultValue: 'Miktar' })}
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
                          {t('price', { defaultValue: 'Fiyat' })}
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
                      title={t('add', { defaultValue: 'Ekle' })}
                      onPress={handleAddBulkItem}
                      style={{ paddingHorizontal: spacing.lg }}
                    />
                  </View>
                </Card>
              )}

              {/* Bulk Sale Items List */}
              {bulkSaleItems.length > 0 && (
                <Card>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.md }}>
                    {t('items', { defaultValue: 'Satış Kalemleri' })}
                  </Text>
                  
                  <ScrollView 
                    style={{ maxHeight: 400 }} 
                    contentContainerStyle={{ paddingVertical: spacing.xs }}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {bulkSaleItems.map((item, index) => {
                      const product = products.find((p: Product) => String(p.id) === item.productId);
                      const isExpanded = expandedItemIndex === index;
                      const itemCustomFields = item.customFields || [];
                      
                      const handleItemCustomFieldsChange = (fields: SalesCustomField[]) => {
                        const updatedItems = [...bulkSaleItems];
                        updatedItems[index] = {
                          ...updatedItems[index],
                          customFields: fields,
                        };
                        setBulkSaleItems(updatedItems);
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
                                {product?.name || item.productName || t('product', { defaultValue: 'Ürün' })}
                              </Text>
                              <Text style={{ fontSize: 12, color: colors.muted }}>
                                {item.quantity} x {formatCurrency(item.price, product?.currency || 'TRY')} = {formatCurrency(item.subtotal, product?.currency || 'TRY')}
                              </Text>
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
                              <CustomFieldsManager<SalesCustomField>
                                customFields={itemCustomFields}
                                onChange={handleItemCustomFieldsChange}
                                module="sales"
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
                      {t('total_amount', { defaultValue: 'Toplam Tutar' })}:
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.primary }}>
                      {formatCurrency(bulkTotal, formData.currency || 'TRY')}
                    </Text>
                  </View>
                </Card>
              )}

              {/* Date and Time Section for Bulk Sale */}
              <FormRow columns={1}>
                <FormField label={t('date')} required>
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
                  updateField('date' as keyof Sale, dateTime);
                  setDateTimePickerVisible(false);
                }}
                label={t('date')}
                showTime={true}
              />

              {/* Debt Collection Date */}
              <FormRow columns={1}>
                <FormField label={t('debt_collection_date', { defaultValue: 'Borç Alınacak Tarih' })}>
                  <Input
                    value={formData.debtCollectionDate || ''}
                    onChangeText={(text) => updateField('debtCollectionDate' as keyof Sale, text)}
                    placeholder="YYYY-MM-DD"
                    keyboardType="default"
                  />
                </FormField>
              </FormRow>

              {/* Notes Field */}
              <FormRow columns={1}>
                <FormField label={t('notes')}>
                  <Input
                    value={formData.title || ''}
                    onChangeText={(text) => updateField('title' as keyof Sale, text)}
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
                    placeholder={t('notes')}
                  />
                </FormField>
              </FormRow>
            </>
          )}
            
            {/* Custom Fields Section */}
            <Card>
              <CustomFieldsManager<SalesCustomField>
                customFields={customFields}
                onChange={handleCustomFieldsChange}
                module="sales"
              />
            </Card>
          </View>
        </ScrollView>
        );
      }}
    />
  );
}

