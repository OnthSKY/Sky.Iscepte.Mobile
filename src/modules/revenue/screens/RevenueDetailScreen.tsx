import React from 'react';
import { View, Text } from 'react-native';
import { DetailScreenContainer } from '../../../shared/components/screens/DetailScreenContainer';
import { revenueEntityService } from '../services/revenueServiceAdapter';
import Card from '../../../shared/components/Card';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import { Revenue } from '../store/revenueStore';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../products/utils/currency';

/**
 * RevenueDetailScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes detail screen UI
 * Dependency Inversion: Depends on service adapter interface
 */
export default function RevenueDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation('revenue');

  return (
    <DetailScreenContainer
      service={revenueEntityService}
      config={{
        entityName: 'revenue',
        translationNamespace: 'revenue',
      }}
      renderContent={(data: Revenue) => (
        <View style={{ gap: spacing.md }}>
          <Card>
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('title', { defaultValue: 'Title' })}
                </Text>
                <Text style={{ fontSize: 16 }}>{data.title || '-'}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('amount', { defaultValue: 'Amount' })}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#10B981' }}>
                  {data.amount ? `+${formatCurrency(data.amount, data.currency || 'TRY')}` : '-'}
                </Text>
              </View>
            </View>
          </Card>

          <Card>
            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: spacing.sm }}>
              {t('description', { defaultValue: 'Description' })}
            </Text>
            <Text style={{ color: colors.muted }}>{data.description || '-'}</Text>
          </Card>
        </View>
      )}
    />
  );
}

