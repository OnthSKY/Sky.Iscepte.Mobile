import React from 'react';
import { View, Text } from 'react-native';
import { DetailScreenContainer } from '../../../shared/components/screens/DetailScreenContainer';
import { purchaseEntityService } from '../services/purchaseServiceAdapter';
import Card from '../../../shared/components/Card';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import { Purchase } from '../store/purchaseStore';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../products/utils/currency';

/**
 * PurchaseDetailScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes detail screen UI
 * Dependency Inversion: Depends on service adapter interface
 */
export default function PurchaseDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation('purchases');

  return (
    <DetailScreenContainer
      service={purchaseEntityService}
      config={{
        entityName: 'purchase',
        translationNamespace: 'purchases',
      }}
      renderContent={(data: Purchase) => (
        <View style={{ gap: spacing.md }}>
          <Card>
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('product_name', { defaultValue: 'Product Name' })}
                </Text>
                <Text style={{ fontSize: 16 }}>{data.productName || data.title || '-'}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('supplier', { defaultValue: 'Supplier' })}
                </Text>
                <Text style={{ fontSize: 16 }}>{data.supplierName || '-'}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('quantity', { defaultValue: 'Quantity' })}
                </Text>
                <Text style={{ fontSize: 16 }}>{data.quantity ?? '-'}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('price', { defaultValue: 'Price' })}
                </Text>
                <Text style={{ fontSize: 16 }}>{data.price ? formatCurrency(data.price, data.currency || 'TRY') : '-'}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('total_amount', { defaultValue: 'Total Amount' })}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>
                  {data.total || data.amount ? formatCurrency(data.total || data.amount || 0, data.currency || 'TRY') : '-'}
                </Text>
              </View>
            </View>
          </Card>

          {data.date && (
            <Card>
              <View style={{ gap: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                    {t('date', { defaultValue: 'Date' })}
                  </Text>
                  <Text style={{ fontSize: 16 }}>
                    {new Date(data.date).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            </Card>
          )}
        </View>
      )}
    />
  );
}

