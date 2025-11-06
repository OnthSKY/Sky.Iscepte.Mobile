/**
 * QuickPurchaseScreen - Quick purchase screen for stock module
 * 
 * Allows users to quickly make a purchase by selecting a product and quantity
 */

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import Card from '../../../shared/components/Card';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import { useProductsQuery } from '../hooks/useProductsQuery';
import { useCreatePurchaseMutation } from '../../purchases/hooks/usePurchasesQuery';
import { Product } from '../services/productService';
import notificationService from '../../../shared/services/notificationService';
import spacing from '../../../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SearchBar from '../../../shared/components/SearchBar';
import LoadingState from '../../../shared/components/LoadingState';
import { formatCurrency } from '../utils/currency';
import { Currency } from '../services/productService';

interface PurchaseItem {
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
  currency?: Currency;
}

export default function QuickPurchaseScreen() {
  const { t } = useTranslation(['stock', 'purchases', 'common']);
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    route.params?.productId || null
  );
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [supplierName, setSupplierName] = useState('');

  const { data: productsData, isLoading } = useProductsQuery();
  const createPurchaseMutation = useCreatePurchaseMutation();

  const products = useMemo(() => {
    if (!productsData?.items) return [];
    if (!searchQuery.trim()) return productsData.items;
    
    const query = searchQuery.toLowerCase();
    return productsData.items.filter((p: Product) => 
      p.name?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query) ||
      p.sku?.toLowerCase().includes(query)
    );
  }, [productsData, searchQuery]);

  const selectedProduct = useMemo(() => {
    if (!selectedProductId || !productsData?.items) return null;
    return productsData.items.find((p: Product) => String(p.id) === String(selectedProductId));
  }, [selectedProductId, productsData]);

  const totalAmount = useMemo(() => {
    return purchaseItems.reduce((sum, item) => sum + item.subtotal, 0);
  }, [purchaseItems]);

  // Auto-fill price when product is selected
  React.useEffect(() => {
    if (selectedProduct && selectedProduct.price && !price) {
      setPrice(String(selectedProduct.price));
    }
  }, [selectedProduct]);

  const handleAddItem = () => {
    if (!selectedProduct) {
      notificationService.error(t('stock:select_product', { defaultValue: 'Lütfen ürün seçin' }));
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      notificationService.error(t('stock:invalid_quantity', { defaultValue: 'Geçersiz miktar' }));
      return;
    }

    const itemPrice = parseFloat(price);
    if (isNaN(itemPrice) || itemPrice <= 0) {
      notificationService.error(t('purchases:invalid_price', { defaultValue: 'Geçersiz fiyat' }));
      return;
    }

    const subtotal = itemPrice * qty;

    // Check if item already exists
    const existingIndex = purchaseItems.findIndex(item => item.productId === selectedProductId);
    if (existingIndex >= 0) {
      const newItems = [...purchaseItems];
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newItems[existingIndex].quantity + qty,
        subtotal: newItems[existingIndex].subtotal + subtotal,
      };
      setPurchaseItems(newItems);
    } else {
      setPurchaseItems([
        ...purchaseItems,
        {
          productId: selectedProductId!,
          quantity: qty,
          price: itemPrice,
          subtotal,
          currency: selectedProduct.currency || 'TRY',
        },
      ]);
    }

    // Reset selection
    setSelectedProductId(null);
    setQuantity('1');
    setPrice('');
  };

  const handleRemoveItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, newQuantity: string) => {
    const qty = parseFloat(newQuantity);
    if (isNaN(qty) || qty <= 0) {
      return;
    }

    const newItems = [...purchaseItems];
    const item = newItems[index];
    newItems[index] = {
      ...item,
      quantity: qty,
      subtotal: item.price * qty,
    };
    setPurchaseItems(newItems);
  };

  const handleCompletePurchase = async () => {
    if (purchaseItems.length === 0) {
      notificationService.error(t('purchases:no_items', { defaultValue: 'Lütfen en az bir ürün ekleyin' }));
      return;
    }

    try {
      // Create purchase with items - use currency from first item if all same, otherwise TRY
      const firstItemCurrency = purchaseItems[0]?.currency || 'TRY';
      await createPurchaseMutation.mutateAsync({
        title: t('purchases:purchase', { defaultValue: 'Alış' }),
        supplierName: supplierName || undefined,
        items: purchaseItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        })),
        amount: totalAmount,
        total: totalAmount,
        currency: firstItemCurrency,
        date: new Date().toISOString(),
        status: 'completed',
      });

      notificationService.success(t('purchases:purchase_completed', { defaultValue: 'Alış tamamlandı' }));
      navigation.goBack();
    } catch (error: any) {
      notificationService.error(error?.message || t('common:error', { defaultValue: 'Bir hata oluştu' }));
    }
  };

  return (
    <ScreenLayout>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('purchases:quick_purchase', { defaultValue: 'Hızlı Alış' })}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {t('purchases:quick_purchase_description', { defaultValue: 'Ürün seçip alış yapabilirsiniz' })}
          </Text>
        </View>

        {/* Supplier Name (Optional) */}
        <Card style={styles.card}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('purchases:supplier_name', { defaultValue: 'Tedarikçi Adı' })} {t('common:optional', { defaultValue: '(Opsiyonel)' })}
          </Text>
          <Input
            value={supplierName}
            onChangeText={setSupplierName}
            placeholder={t('purchases:supplier_name_placeholder', { defaultValue: 'Tedarikçi adı girin...' })}
          />
        </Card>

        {/* Product Search and Selection */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('stock:select_product', { defaultValue: 'Ürün Seç' })}
          </Text>
          
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('sales:search_product', { defaultValue: 'Ürün ara...' })}
          />

          {isLoading ? (
            <LoadingState />
          ) : (
            <View style={styles.productList}>
              {products.map((item) => {
                const isSelected = selectedProductId === String(item.id);
                return (
                  <TouchableOpacity
                    key={String(item.id)}
                    onPress={() => setSelectedProductId(String(item.id))}
                    style={[
                      styles.productItem,
                      isSelected && { backgroundColor: colors.primary + '20' },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.productName, { color: colors.text }]}>
                        {item.name}
                      </Text>
                      {item.category && (
                        <Text style={[styles.productCategory, { color: colors.muted }]}>
                          {item.category}
                        </Text>
                      )}
                      <View style={styles.productMeta}>
                        <View style={[styles.stockBadge, { backgroundColor: isSelected ? colors.primary + '30' : colors.surface, borderColor: isSelected ? colors.primary : colors.border }]}>
                          <Ionicons name="cube-outline" size={14} color={isSelected ? colors.primary : colors.text} />
                          <Text style={[styles.productMetaText, { color: isSelected ? colors.primary : colors.text, fontWeight: '600' }]}>
                            {item.stock || 0}
                          </Text>
                        </View>
                        {item.price && (
                          <View style={[styles.priceBadge, { backgroundColor: isSelected ? colors.primary + '30' : colors.surface, borderColor: isSelected ? colors.primary : colors.border }]}>
                            <Ionicons name="pricetag-outline" size={14} color={isSelected ? colors.primary : colors.text} />
                            <Text style={[styles.productPrice, { color: isSelected ? colors.primary : colors.text, fontWeight: '600' }]}>
                              {formatCurrency(item.price, item.currency || 'TRY')}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Card>

        {/* Quantity and Price Input and Add Button */}
        {selectedProduct && (
          <Card style={styles.card}>
            <View style={styles.addItemSection}>
              <View style={{ flex: 1, gap: spacing.sm }}>
                <View>
                  <Text style={[styles.label, { color: colors.text }]}>
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
                  <Text style={[styles.label, { color: colors.text }]}>
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
                title={t('common:add', { defaultValue: 'Ekle' })}
                onPress={handleAddItem}
                style={styles.addButton}
              />
            </View>
          </Card>
        )}

        {/* Purchase Items List */}
        {purchaseItems.length > 0 && (
          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('purchases:purchase_items', { defaultValue: 'Alış Kalemleri' })}
            </Text>
            
            {purchaseItems.map((item, index) => {
              const product = productsData?.items?.find((p: Product) => String(p.id) === item.productId);
              return (
                <View key={index} style={styles.purchaseItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.purchaseItemName, { color: colors.text }]}>
                      {product?.name || t('stock:stock_item', { defaultValue: 'Ürün' })}
                    </Text>
                    <Text style={[styles.purchaseItemMeta, { color: colors.muted }]}>
                      {item.quantity} x {formatCurrency(item.price, product?.currency || 'TRY')} = {formatCurrency(item.subtotal, product?.currency || 'TRY')}
                    </Text>
                  </View>
                  <View style={styles.purchaseItemActions}>
                    <Input
                      value={String(item.quantity)}
                      onChangeText={(val) => handleUpdateQuantity(index, val)}
                      keyboardType="numeric"
                      style={styles.quantityInput}
                    />
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(index)}
                      style={[styles.removeButton, { backgroundColor: '#EF4444' }]}
                    >
                      <Ionicons name="trash-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Total */}
            <View style={[styles.totalSection, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                {t('purchases:total_amount', { defaultValue: 'Toplam Tutar' })}:
              </Text>
              <Text style={[styles.totalAmount, { color: '#EF4444' }]}>
                {formatCurrency(totalAmount, 'TRY')}
              </Text>
            </View>
          </Card>
        )}

        {/* Complete Purchase Button */}
        {purchaseItems.length > 0 && (
          <Button
            title={t('purchases:complete_purchase', { defaultValue: 'Alışı Tamamla' })}
            onPress={handleCompletePurchase}
            disabled={createPurchaseMutation.isPending}
            style={[styles.completeButton, { backgroundColor: '#EF4444' }]}
          />
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
  },
  card: {
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  productList: {
    maxHeight: 300,
  },
  productItem: {
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  productCategory: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  productMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
  },
  productMetaText: {
    fontSize: 13,
  },
  productPrice: {
    fontSize: 13,
  },
  addItemSection: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-end',
  },
  addButton: {
    paddingHorizontal: spacing.lg,
  },
  purchaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  purchaseItemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  purchaseItemMeta: {
    fontSize: 12,
  },
  purchaseItemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  quantityInput: {
    width: 60,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    textAlign: 'center',
  },
  removeButton: {
    padding: spacing.sm,
    borderRadius: 8,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  completeButton: {
    marginTop: spacing.md,
  },
});

