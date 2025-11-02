/**
 * ProductDetailScreen - Modular and Responsive
 * 
 * Single Responsibility: Composes product detail UI using modular components
 * Performance: Uses React Query for caching
 * Responsive: Adapts to screen size
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useProductQuery } from '../hooks/useProductsQuery';
import DetailSection from '../../../shared/components/DetailSection';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import LoadingState from '../../../shared/components/LoadingState';
import ErrorState from '../../../shared/components/ErrorState';
import Button from '../../../shared/components/Button';
import { usePermissions } from '../../../core/hooks/usePermissions';
import { useAppStore } from '../../../store/useAppStore';
import ProductHistoryModal from '../components/ProductHistoryModal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ProductCustomField } from '../services/productService';
import { isSmallScreen } from '../../../core/constants/breakpoints';
import { formatCurrency as formatCurrencyHelper } from '../utils/currency';

export default function ProductDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation(['products', 'stock', 'common']);
  const route = useRoute<any>();
  const navigation = useNavigation();
  const role = useAppStore((s) => s.role);
  const { can } = usePermissions(role);
  const { width } = useWindowDimensions();
  const isSmall = isSmallScreen(width);

  const productId = route.params?.id;
  const [historyModalVisible, setHistoryModalVisible] = React.useState(false);

  // Use React Query for caching and better performance
  const { data, isLoading, error, refetch } = useProductQuery(productId);

  // Permission checks
  const canEdit = can('product:edit');
  const canDelete = can('product:delete');

  const handleEdit = () => {
    if (!productId) return;
    navigation.navigate('StockEdit' as never, { id: productId });
  };

  const handleDelete = async () => {
    if (!productId || !data) return;
    // Delete logic would be handled by mutation hook
    // For now, just navigate back
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  if (isLoading) {
    return (
      <ScreenLayout title={t('stock:product_details', { defaultValue: 'Ürün Detayı' })} showBackButton>
        <LoadingState />
      </ScreenLayout>
    );
  }

  if (error || !data) {
    return (
      <ScreenLayout title={t('stock:product_details', { defaultValue: 'Ürün Detayı' })} showBackButton>
        <ErrorState
          error={error || new Error('Ürün bulunamadı')}
          onRetry={() => refetch()}
          showRetry={true}
        />
      </ScreenLayout>
    );
  }

  const styles = getStyles(colors, isSmall);

  // Format currency helper
  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '-';
    return formatCurrencyHelper(value, data.currency || 'TRY');
  };

  // Format custom field value
  const formatCustomFieldValue = (field: ProductCustomField) => {
    if (field.value === undefined || field.value === null || field.value === '') return '-';
    
    switch (field.type) {
      case 'boolean':
        return field.value ? t('common:yes', { defaultValue: 'Evet' }) : t('common:no', { defaultValue: 'Hayır' });
      case 'number':
        return String(field.value);
      case 'date':
        try {
          const date = new Date(field.value);
          return new Intl.DateTimeFormat('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }).format(date);
        } catch {
          return String(field.value);
        }
      case 'select':
        const option = field.options?.find(opt => opt.value === field.value);
        return option?.label || String(field.value);
      default:
        return String(field.value);
    }
  };

  // Basic Info Fields
  const basicFields = [
    {
      label: t('stock:name', { defaultValue: 'Ad' }),
      value: data.name,
    },
    {
      label: t('stock:sku', { defaultValue: 'SKU' }),
      value: data.sku,
    },
    {
      label: t('stock:category', { defaultValue: 'Kategori' }),
      value: data.category,
    },
    {
      label: t('stock:price', { defaultValue: 'Fiyat' }),
      value: data.price ? formatCurrency(data.price) : undefined,
    },
    {
      label: t('stock:stock_quantity', { defaultValue: 'Stok Miktarı' }),
      value: data.stock,
    },
    data.moq && {
      label: t('stock:moq', { defaultValue: 'MOQ' }),
      value: data.moq,
    },
    {
      label: t('stock:status', { defaultValue: 'Durum' }),
      value: data.isActive !== undefined 
        ? (data.isActive ? t('common:active', { defaultValue: 'Aktif' }) : t('common:inactive', { defaultValue: 'Pasif' }))
        : undefined,
    },
  ].filter(Boolean);

  // Custom Fields
  const customFields = data.customFields || [];

  // Render custom fields section
  const renderCustomFields = () => {
    if (!customFields || customFields.length === 0) return null;

    const customFieldsData = customFields.map((field) => ({
      label: field.label,
      value: formatCustomFieldValue(field),
    }));

    return (
      <DetailSection
        title={t('stock:custom_fields', { defaultValue: 'Ek Alanlar' })}
        fields={customFieldsData}
        gridColumns={isSmall ? 1 : 2}
      />
    );
  };

  const renderFooter = () => {
    return (
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => setHistoryModalVisible(true)}
          style={[styles.historyButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="time-outline" size={20} color={colors.text} />
          <Text style={[styles.historyButtonText, { color: colors.text }]}>
            {t('stock:show_details', { defaultValue: 'Detaylarını Göster' })}
          </Text>
        </TouchableOpacity>
        
        {(canEdit || canDelete) && (
          <View style={styles.actionButtons}>
            {canEdit && (
              <Button
                title={t('common:edit', { defaultValue: 'Düzenle' })}
                onPress={handleEdit}
                style={{ flex: 1 }}
              />
            )}
            {canDelete && (
              <Button
                title={t('common:delete', { defaultValue: 'Sil' })}
                onPress={handleDelete}
                style={{ flex: 1, backgroundColor: colors.error }}
              />
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <ScreenLayout 
        title={t('stock:product_details', { defaultValue: 'Ürün Detayı' })} 
        showBackButton
        footer={renderFooter()}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information */}
          <DetailSection
            title={t('stock:basic_information', { defaultValue: 'Temel Bilgiler' })}
            fields={basicFields}
            gridColumns={isSmall ? 1 : 2}
          />

          {/* Custom Fields */}
          {renderCustomFields()}
        </ScrollView>
      </ScreenLayout>

      {/* History Modal */}
      <ProductHistoryModal
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        productId={productId}
      />
    </>
  );
}

const getStyles = (colors: any, isSmall: boolean) => StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  footer: {
    gap: spacing.md,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
