import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { usePermissions } from '../../../core/hooks/usePermissions';
import { useAppStore } from '../../../store/useAppStore';
import colors from '../../../core/constants/colors';
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

export default function SalesDetailScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { t: tSales } = useTranslation('sales');
  const role = useAppStore((s) => s.role);
  const { can } = usePermissions(role);

  const { id, title, amount } = route.params;

  const canEdit = can('sales:edit');
  const canDelete = can('sales:delete');

  const handleEdit = () => {
    navigation.navigate('SalesEdit', { id });
  };

  const handleDelete = () => {
    // Delete logic will be added
  };

  return (
    <ScreenLayout>
      <ScrollView>
        <View style={{ gap: spacing.md }}>
          <Text style={{ fontSize: 24, fontWeight: '600' }}>{tSales('sale_details')}</Text>

          <Card>
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {tSales('product_name')}
                </Text>
                <Text style={{ fontSize: 16 }}>{title || '-'}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {tSales('customer')}
                </Text>
                <Text style={{ fontSize: 16 }}>-</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {tSales('total_amount')}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>
                  {amount ? `${amount.toFixed(2)} ₺` : '-'}
                </Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {tSales('payment_method')}
                </Text>
                <Text style={{ fontSize: 16 }}>-</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {tSales('date')}
                </Text>
                <Text style={{ fontSize: 16 }}>{new Date().toLocaleDateString('tr-TR')}</Text>
              </View>
            </View>
          </Card>

          <Card>
            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: spacing.sm }}>
              {tSales('items')}
            </Text>
            <View style={{ gap: spacing.sm }}>
              {/* Items list will be added when item data is available */}
              <Text style={{ color: colors.muted }}>{t('no_results')}</Text>
            </View>
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
                  style={{ flex: 1, backgroundColor: '#ef4444' }}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

