import React from 'react';
import { View, Text } from 'react-native';
import { DetailScreenContainer } from '../../../shared/components/screens/DetailScreenContainer';
import { productEntityService } from '../services/productServiceAdapter';
import Card from '../../../shared/components/Card';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import { Product } from '../services/productService';
import { useTranslation } from 'react-i18next';

/**
 * ProductDetailScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes detail screen UI
 * Dependency Inversion: Depends on service adapter interface
 */
export default function ProductDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation('products');

  return (
    <DetailScreenContainer
      service={productEntityService}
      config={{
        entityName: 'product',
        translationNamespace: 'products',
      }}
      renderContent={(data: Product) => (
        <View style={{ gap: spacing.md }}>
          <Card>
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('name', { defaultValue: 'Name' })}
                </Text>
                <Text style={{ fontSize: 16 }}>{data.name || '-'}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('category', { defaultValue: 'Category' })}
                </Text>
                <Text style={{ fontSize: 16 }}>{data.category || '-'}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('price', { defaultValue: 'Price' })}
                </Text>
                <Text style={{ fontSize: 16 }}>{data.price || '-'}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('stock', { defaultValue: 'Stock' })}
                </Text>
                <Text style={{ fontSize: 16 }}>{data.stock || '-'}</Text>
              </View>
            </View>
          </Card>
        </View>
      )}
    />
  );
}


