import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { usePermissions } from '../../../core/hooks/usePermissions';
import { useAppStore } from '../../../store/useAppStore';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';

type Props = {
  route: {
    params: {
      id: string;
      title?: string;
      amount?: number;
    };
  };
  navigation: any;
};

export default function ExpenseDetailScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { t: tExpenses } = useTranslation('expenses');
  const role = useAppStore((s) => s.role);
  const { can } = usePermissions(role);
  const { colors } = useTheme();

  const { id, title, amount } = route.params;

  const canEdit = can('expenses:edit');
  const canDelete = can('expenses:delete');

  const handleEdit = () => {
    navigation.navigate('ExpenseEdit', { id });
  };

  const handleDelete = () => {
    // Delete logic will be added
  };

  return (
    <ScreenLayout>
      <ScrollView>
        <View style={{ gap: spacing.md }}>
          <Text style={{ fontSize: 24, fontWeight: '600' }}>{tExpenses('expense_details')}</Text>

          <Card>
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {tExpenses('type')}
                </Text>
                <Text style={{ fontSize: 16 }}>{title || '-'}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {tExpenses('amount')}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>
                  {amount ? `${amount.toFixed(2)} ₺` : '-'}
                </Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {tExpenses('date')}
                </Text>
                <Text style={{ fontSize: 16 }}>{new Date().toLocaleDateString('tr-TR')}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {tExpenses('payment_date')}
                </Text>
                <Text style={{ fontSize: 16 }}>-</Text>
              </View>
            </View>
          </Card>

          <Card>
            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: spacing.sm }}>
              {tExpenses('description')}
            </Text>
            <Text style={{ color: colors.muted }}>-</Text>
          </Card>

          {(canEdit || canDelete) && (
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              {canEdit && (
                <Button
                  title={t('edit')}
                  onPress={handleEdit}
                  style={{ flex: 1 }}
                />
              )}
              {canDelete && (
                <Button
                  title={t('delete')}
                  onPress={handleDelete}
                  style={{ flex: 1, backgroundColor: colors.error }}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

