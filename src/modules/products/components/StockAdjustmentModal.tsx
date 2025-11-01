/**
 * StockAdjustmentModal - Modal for adjusting stock quantity
 * 
 * Allows users to increase or decrease stock quantity for a product
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import Modal from '../../../shared/components/Modal';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import { Product } from '../services/productService';
import { useUpdateProductMutation } from '../hooks/useProductsQuery';
import notificationService from '../../../shared/services/notificationService';
import spacing from '../../../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
  visible: boolean;
  product: Product | null;
  mode: 'increase' | 'decrease';
  onClose: () => void;
  onSuccess?: () => void;
};

export default function StockAdjustmentModal({ visible, product, mode, onClose, onSuccess }: Props) {
  const { t } = useTranslation(['stock', 'common']);
  const { colors } = useTheme();
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const updateMutation = useUpdateProductMutation(product?.id);

  React.useEffect(() => {
    if (visible) {
      setQuantity('');
      setNotes('');
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!product) return;
    
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      notificationService.error(t('stock:invalid_quantity', { defaultValue: 'Geçersiz miktar' }));
      return;
    }

    const currentStock = product.stock || 0;
    let newStock: number;

    if (mode === 'increase') {
      newStock = currentStock + qty;
    } else {
      if (qty > currentStock) {
        notificationService.error(t('stock:insufficient_stock', { defaultValue: 'Yetersiz stok' }));
        return;
      }
      newStock = currentStock - qty;
    }

    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        id: product.id,
        data: { stock: newStock },
      });
      
      notificationService.success(
        mode === 'increase' 
          ? t('stock:stock_increased', { defaultValue: 'Stok artırıldı' })
          : t('stock:stock_decreased', { defaultValue: 'Stok azaltıldı' })
      );
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      notificationService.error(error?.message || t('common:error', { defaultValue: 'Bir hata oluştu' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  const currentStock = product.stock || 0;
  const qty = parseFloat(quantity) || 0;
  const previewStock = mode === 'increase' 
    ? currentStock + qty 
    : Math.max(0, currentStock - qty);

  return (
    <Modal visible={visible} onRequestClose={onClose} containerStyle={{ width: '90%', maxWidth: 400 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {mode === 'increase' 
              ? t('stock:add_stock', { defaultValue: 'Stok Artır' })
              : t('stock:reduce_stock', { defaultValue: 'Stok Azalt' })}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Product Info */}
          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
            {product.category && (
              <Text style={[styles.productCategory, { color: colors.muted }]}>
                {product.category}
              </Text>
            )}
            <View style={styles.stockInfo}>
              <Text style={[styles.stockLabel, { color: colors.muted }]}>
                {t('stock:current_stock', { defaultValue: 'Mevcut Stok' })}:
              </Text>
              <Text style={[styles.stockValue, { color: colors.text }]}>{currentStock}</Text>
            </View>
          </View>

          {/* Quantity Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {mode === 'increase' 
                ? t('stock:increase_by', { defaultValue: 'Artırılacak Miktar' })
                : t('stock:decrease_by', { defaultValue: 'Azaltılacak Miktar' })}
            </Text>
            <Input
              value={quantity}
              onChangeText={setQuantity}
              placeholder="0"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          {/* Preview */}
          {quantity && !isNaN(qty) && qty > 0 && (
            <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.previewLabel, { color: colors.muted }]}>
                {t('stock:new_stock_quantity', { defaultValue: 'Yeni Stok Miktarı' })}:
              </Text>
              <Text style={[styles.previewValue, { color: colors.primary }]}>
                {previewStock}
              </Text>
            </View>
          )}

          {/* Notes (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('stock:notes', { defaultValue: 'Notlar' })} {t('common:optional', { defaultValue: '(Opsiyonel)' })}
            </Text>
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder={t('stock:notes_placeholder', { defaultValue: 'Not ekleyin...' })}
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title={t('common:cancel', { defaultValue: 'İptal' })}
            onPress={onClose}
            style={[styles.cancelButton, { backgroundColor: colors.muted }]}
          />
          <Button
            title={mode === 'increase' 
              ? t('stock:increase_stock', { defaultValue: 'Artır' })
              : t('stock:decrease_stock', { defaultValue: 'Azalt' })}
            onPress={handleSubmit}
            disabled={isSubmitting || !quantity || parseFloat(quantity) <= 0}
            style={[
              styles.submitButton,
              { backgroundColor: mode === 'increase' ? '#10B981' : '#F59E0B' }
            ]}
          />
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    gap: spacing.md,
  },
  infoCard: {
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.xs,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
  },
  productCategory: {
    fontSize: 14,
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  stockLabel: {
    fontSize: 14,
  },
  stockValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    marginTop: spacing.xs,
  },
  textArea: {
    minHeight: 80,
    marginTop: spacing.xs,
  },
  previewCard: {
    padding: spacing.md,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
  },
  previewValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

