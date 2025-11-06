/**
 * QuickSaleScreen - Quick sale screen for stock module
 * 
 * Allows users to quickly make a sale by selecting a product and quantity
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
import { useCreateSaleMutation } from '../../sales/hooks/useSalesQuery';
import { Product } from '../services/productService';
import notificationService from '../../../shared/services/notificationService';
import spacing from '../../../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SearchBar from '../../../shared/components/SearchBar';
import LoadingState from '../../../shared/components/LoadingState';
import { formatCurrency } from '../utils/currency';
import { Currency } from '../services/productService';
import { shouldTrackStock, canSellQuantity } from '../utils/stockValidation';

interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
  currency?: Currency;
}

export default function QuickSaleScreen() {
  const { t } = useTranslation(['stock', 'sales', 'common']);
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    route.params?.productId || null
  );
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerId, setCustomerId] = useState<string | undefined>(route.params?.customerId);

  const { data: productsData, isLoading } = useProductsQuery();
  const createSaleMutation = useCreateSaleMutation();

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

  // Auto-fill price when product is selected
  React.useEffect(() => {
    if (selectedProduct && selectedProduct.price !== undefined) {
      // Auto-fill price when product is selected (user can change it after)
      setPrice(String(selectedProduct.price));
    } else if (!selectedProduct) {
      // Clear price when no product is selected
      setPrice('');
    }
  }, [selectedProduct]);

  const totalAmount = useMemo(() => {
    return saleItems.reduce((sum, item) => sum + item.subtotal, 0);
  }, [saleItems]);

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

    // Stok kontrolü: trackStock false ise veya stock null/undefined ise kontrol yapma
    if (!canSellQuantity(selectedProduct, qty)) {
      notificationService.error(t('stock:insufficient_stock', { defaultValue: 'Yetersiz stok' }));
      return;
    }

    const itemPrice = parseFloat(price);
    if (isNaN(itemPrice) || itemPrice <= 0) {
      notificationService.error(t('sales:invalid_price', { defaultValue: 'Geçersiz fiyat' }));
      return;
    }

    const subtotal = itemPrice * qty;

    // Check if item already exists
    const existingIndex = saleItems.findIndex(item => item.productId === selectedProductId);
    if (existingIndex >= 0) {
      const newItems = [...saleItems];
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newItems[existingIndex].quantity + qty,
        subtotal: newItems[existingIndex].subtotal + subtotal,
      };
      setSaleItems(newItems);
    } else {
      setSaleItems([
        ...saleItems,
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

  const handleUpdatePrice = (index: number, newPrice: string) => {
    const itemPrice = parseFloat(newPrice);
    if (isNaN(itemPrice) || itemPrice <= 0) {
      return;
    }

    const newItems = [...saleItems];
    const item = newItems[index];
    newItems[index] = {
      ...item,
      price: itemPrice,
      subtotal: itemPrice * item.quantity,
    };
    setSaleItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, newQuantity: string) => {
    const qty = parseFloat(newQuantity);
    if (isNaN(qty) || qty <= 0) {
      return;
    }

    const newItems = [...saleItems];
    const item = newItems[index];
    const product = productsData?.items?.find((p: Product) => String(p.id) === item.productId);
    
    // Stok kontrolü: trackStock false ise veya stock null/undefined ise kontrol yapma
    if (!canSellQuantity(product, qty)) {
      notificationService.error(t('stock:insufficient_stock', { defaultValue: 'Yetersiz stok' }));
      return;
    }

    newItems[index] = {
      ...item,
      quantity: qty,
      subtotal: item.price * qty,
    };
    setSaleItems(newItems);
  };

  const handleCompleteSale = async () => {
    if (saleItems.length === 0) {
      notificationService.error(t('sales:no_items', { defaultValue: 'Lütfen en az bir ürün ekleyin' }));
      return;
    }

    try {
      // Create sale with items - use currency from first item if all same, otherwise TRY
      const firstItemCurrency = saleItems[0]?.currency || 'TRY';
      await createSaleMutation.mutateAsync({
        customerId,
        items: saleItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        })),
        amount: totalAmount,
        currency: firstItemCurrency,
        date: new Date().toISOString(),
      });

      notificationService.success(t('sales:sale_completed', { defaultValue: 'Satış tamamlandı' }));
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
            {t('stock:make_sale', { defaultValue: 'Hızlı Satış' })}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {t('sales:quick_sale_description', { defaultValue: 'Ürün seçip satış yapabilirsiniz' })}
          </Text>
        </View>

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

        {/* Quantity, Price Input and Add Button */}
        {selectedProduct && (
          <Card style={styles.card}>
            <View style={styles.addItemSection}>
              <View style={{ flex: 1, gap: spacing.sm }}>
                <View>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {t('sales:quantity', { defaultValue: 'Miktar' })}
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
                    {t('sales:price', { defaultValue: 'Fiyat' })} {selectedProduct.price && (
                      <Text style={{ color: colors.muted, fontSize: 12 }}>
                        ({t('stock:default_price', { defaultValue: 'Varsayılan' })}: {formatCurrency(selectedProduct.price, selectedProduct.currency || 'TRY')})
                      </Text>
                    )}
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

        {/* Sale Items List */}
        {saleItems.length > 0 && (
          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('sales:items', { defaultValue: 'Satış Kalemleri' })}
            </Text>
            
            {saleItems.map((item, index) => {
              const product = productsData?.items?.find((p: Product) => String(p.id) === item.productId);
              return (
                <View key={index} style={styles.saleItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.saleItemName, { color: colors.text }]}>
                      {product?.name || t('stock:stock_item', { defaultValue: 'Ürün' })}
                    </Text>
                    <Text style={[styles.saleItemMeta, { color: colors.muted }]}>
                      {item.quantity} x {formatCurrency(item.price, product?.currency || 'TRY')} = {formatCurrency(item.subtotal, product?.currency || 'TRY')}
                    </Text>
                  </View>
                  <View style={styles.saleItemActions}>
                    <Input
                      value={String(item.quantity)}
                      onChangeText={(val) => handleUpdateQuantity(index, val)}
                      keyboardType="numeric"
                      style={styles.quantityInput}
                    />
                    <Input
                      value={String(item.price)}
                      onChangeText={(val) => handleUpdatePrice(index, val)}
                      keyboardType="numeric"
                      style={styles.priceInput}
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

            {/* Total - Note: mixed currencies will show the actual currency of items */}
            <View style={[styles.totalSection, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                {t('sales:total_amount', { defaultValue: 'Toplam Tutar' })}:
              </Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>
                {formatCurrency(totalAmount, 'TRY')}
              </Text>
            </View>
          </Card>
        )}

        {/* Complete Sale Button */}
        {saleItems.length > 0 && (
          <Button
            title={t('sales:complete_sale', { defaultValue: 'Satışı Tamamla' })}
            onPress={handleCompleteSale}
            disabled={createSaleMutation.isPending}
            style={styles.completeButton}
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  addButton: {
    paddingHorizontal: spacing.lg,
  },
  saleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  saleItemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  saleItemMeta: {
    fontSize: 12,
  },
  saleItemActions: {
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
  priceInput: {
    width: 80,
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

