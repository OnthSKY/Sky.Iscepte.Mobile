import React from 'react';
import { View, Text } from 'react-native';
import { DetailScreenContainer } from '../../../shared/components/screens/DetailScreenContainer';
import { incomeEntityService } from '../services/incomeServiceAdapter';
import Card from '../../../shared/components/Card';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import { Income } from '../store/incomeStore';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../products/utils/currency';

/**
 * IncomeDetailScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes detail screen UI
 * Dependency Inversion: Depends on service adapter interface
 */
export default function IncomeDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation('income');

  return (
    <DetailScreenContainer
      service={incomeEntityService}
      config={{
        entityName: 'income',
        translationNamespace: 'income',
      }}
      renderContent={(data: Income) => (
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

