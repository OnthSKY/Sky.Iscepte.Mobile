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
      name?: string;
    };
  };
  navigation: any;
};

export default function CustomerDetailScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { t: tCustomers } = useTranslation('customers');
  const role = useAppStore((s) => s.role);
  const { can } = usePermissions(role);

  const { id, name } = route.params;

  const canEdit = can('customers:edit');
  const canDelete = can('customers:delete');

  const handleEdit = () => {
    navigation.navigate('CustomerEdit', { id });
  };

  const handleDelete = () => {
    // Delete logic will be added
  };

  return (
    <ScreenLayout>
      <ScrollView>
        <View style={{ gap: spacing.md }}>
          <Text style={{ fontSize: 24, fontWeight: '600' }}>{tCustomers('customer_details')}</Text>

          <Card>
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {tCustomers('name')}
                </Text>
                <Text style={{ fontSize: 16 }}>{name || '-'}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {tCustomers('phone')}
                </Text>
                <Text style={{ fontSize: 16 }}>-</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {tCustomers('email')}
                </Text>
                <Text style={{ fontSize: 16 }}>-</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {tCustomers('debt_limit')}
                </Text>
                <Text style={{ fontSize: 16 }}>-</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {tCustomers('group')}
                </Text>
                <Text style={{ fontSize: 16 }}>-</Text>
              </View>
            </View>
          </Card>

          <Card>
            <View style={{ gap: spacing.sm }}>
              <Text style={{ fontSize: 18, fontWeight: '500' }}>{tCustomers('debt')}</Text>
              <Text style={{ fontSize: 20, fontWeight: '600', color: '#ef4444' }}>0.00 ₺</Text>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <Text style={{ fontSize: 18, fontWeight: '500' }}>{tCustomers('credit')}</Text>
              <Text style={{ fontSize: 20, fontWeight: '600', color: '#10b981' }}>0.00 ₺</Text>
            </View>
          </Card>

          <Card>
            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: spacing.sm }}>
              {tCustomers('transactions')}
            </Text>
            <View style={{ gap: spacing.sm }}>
              {/* Transactions list will be added */}
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

