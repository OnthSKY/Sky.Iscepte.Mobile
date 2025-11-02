import React from 'react';
import { View, Text } from 'react-native';
import { DetailScreenContainer } from '../../../shared/components/screens/DetailScreenContainer';
import { salesEntityService } from '../services/salesServiceAdapter';
import Card from '../../../shared/components/Card';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import { Sale } from '../store/salesStore';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../products/utils/currency';

/**
 * SalesDetailScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes detail screen UI
 * Dependency Inversion: Depends on service adapter interface
 */
export default function SalesDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation('sales');

  return (
    <DetailScreenContainer
      service={salesEntityService}
      config={{
        entityName: 'sale',
        translationNamespace: 'sales',
      }}
      renderContent={(data: Sale) => (
        <View style={{ gap: spacing.md }}>
          <Card>
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('product_name', { defaultValue: 'Product Name' })}
                </Text>
                <Text style={{ fontSize: 16 }}>{data.title || '-'}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('total_amount', { defaultValue: 'Total Amount' })}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>
                  {data.amount ? formatCurrency(data.amount, data.currency || 'TRY') : '-'}
                </Text>
              </View>
            </View>
          </Card>

          <Card>
            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: spacing.sm }}>
              {t('items', { defaultValue: 'Items' })}
            </Text>
            <View style={{ gap: spacing.sm }}>
              <Text style={{ color: colors.muted }}>No items available</Text>
            </View>
          </Card>
        </View>
      )}
    />
  );
}

