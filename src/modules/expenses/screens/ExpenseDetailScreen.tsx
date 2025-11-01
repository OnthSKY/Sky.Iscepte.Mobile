import React from 'react';
import { View, Text } from 'react-native';
import { DetailScreenContainer } from '../../../shared/components/screens/DetailScreenContainer';
import { expenseEntityService } from '../services/expenseServiceAdapter';
import Card from '../../../shared/components/Card';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import { Expense } from '../store/expenseStore';
import { useTranslation } from 'react-i18next';

/**
 * ExpenseDetailScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes detail screen UI
 * Dependency Inversion: Depends on service adapter interface
 */
export default function ExpenseDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation('expenses');

  return (
    <DetailScreenContainer
      service={expenseEntityService}
      config={{
        entityName: 'expense',
        translationNamespace: 'expenses',
      }}
      renderContent={(data: Expense) => (
        <View style={{ gap: spacing.md }}>
          <Card>
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('type', { defaultValue: 'Type' })}
                </Text>
                <Text style={{ fontSize: 16 }}>{data.title || '-'}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('amount', { defaultValue: 'Amount' })}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>
                  {data.amount ? `${data.amount.toFixed(2)} ₺` : '-'}
                </Text>
              </View>
            </View>
          </Card>

          <Card>
            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: spacing.sm }}>
              {t('description', { defaultValue: 'Description' })}
            </Text>
            <Text style={{ color: colors.muted }}>-</Text>
          </Card>
        </View>
      )}
    />
  );
}


