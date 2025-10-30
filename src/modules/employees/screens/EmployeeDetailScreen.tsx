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
      role?: string;
    };
  };
  navigation: any;
};

export default function EmployeeDetailScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { t: tSettings } = useTranslation('settings');
  const role = useAppStore((s) => s.role);
  const { can } = usePermissions(role);

  const { id, name, role: empRole } = route.params;

  const canEdit = can('employees:edit');
  const canDelete = can('employees:delete');

  const handleEdit = () => {
    navigation.navigate('EmployeeEdit', { id });
  };

  const handleDelete = () => {
    // Delete logic will be added
  };

  return (
    <ScreenLayout>
      <ScrollView>
        <View style={{ gap: spacing.md }}>
          <Text style={{ fontSize: 24, fontWeight: '600' }}>
            {tSettings('employee_details')}
          </Text>

          <Card>
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('name')}
                </Text>
                <Text style={{ fontSize: 16 }}>{name || '-'}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {tSettings('role')}
                </Text>
                <Text style={{ fontSize: 16 }}>{empRole || '-'}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('email')}
                </Text>
                <Text style={{ fontSize: 16 }}>-</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('phone')}
                </Text>
                <Text style={{ fontSize: 16 }}>-</Text>
              </View>
            </View>
          </Card>

          <Card>
            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: spacing.sm }}>
              {tSettings('permissions')}
            </Text>
            <View style={{ gap: spacing.sm }}>
              {/* Permissions list will be added */}
              <Text style={{ color: colors.muted }}>No permissions available</Text>
            </View>
          </Card>

          <Card>
            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: spacing.sm }}>
              {tSettings('performance')}
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

