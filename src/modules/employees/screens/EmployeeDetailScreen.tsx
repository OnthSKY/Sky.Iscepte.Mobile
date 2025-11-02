import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DetailScreenContainer } from '../../../shared/components/screens/DetailScreenContainer';
import { employeeEntityService } from '../services/employeeServiceAdapter';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import { Employee } from '../store/employeeStore';
import { useTranslation } from 'react-i18next';

/**
 * EmployeeDetailScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes detail screen UI
 * Dependency Inversion: Depends on service adapter interface
 */
export default function EmployeeDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation(['employees', 'settings', 'common']);
  const navigation = useNavigation<any>();

  const renderRow = (label: string, value: string | number | undefined) => (
    <>
      <View style={{ height: 1, backgroundColor: colors.border }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
          {label}
        </Text>
        <Text style={{ fontSize: 16, color: colors.text }}>{value || '-'}</Text>
      </View>
    </>
  );

  return (
    <DetailScreenContainer
      service={employeeEntityService}
      config={{
        entityName: 'employee',
        translationNamespace: 'employees',
      }}
      renderContent={(data: Employee) => (
        <View style={{ gap: spacing.md }}>
          {/* Basic Information */}
          <Card>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: spacing.md, color: colors.text }}>
              {t('basic_information', { defaultValue: 'Basic Information' })}
            </Text>
            <View style={{ gap: spacing.sm }}>
              {renderRow(
                t('first_name', { defaultValue: 'First Name' }),
                data.firstName
              )}
              {renderRow(
                t('last_name', { defaultValue: 'Last Name' }),
                data.lastName
              )}
              {renderRow(
                t('common:email', { defaultValue: 'Email' }),
                data.email
              )}
              {renderRow(
                t('common:phone', { defaultValue: 'Phone' }),
                data.phone
              )}
              {renderRow(
                t('position', { defaultValue: 'Position' }),
                data.position
              )}
              {renderRow(
                t('hire_date', { defaultValue: 'Hire Date' }),
                data.hireDate
              )}
              {renderRow(
                t('salary', { defaultValue: 'Salary' }),
                data.salary ? `${data.salary.toLocaleString()} ₺` : undefined
              )}
            </View>
          </Card>

          {/* User Account Information */}
          {data.username && (
            <Card>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: spacing.md, color: colors.text }}>
                {t('user_account', { defaultValue: 'User Account' })}
              </Text>
              <View style={{ gap: spacing.sm }}>
                {renderRow(
                  t('username', { defaultValue: 'Username' }),
                  data.username
                )}
                {renderRow(
                  t('user_role', { defaultValue: 'User Role' }),
                  data.userRole
                )}
              </View>
              {data.userRole && (
                <Button
                  title={t('manage_permissions', { defaultValue: 'Manage Permissions' })}
                  onPress={() => navigation.navigate('EmployeePermissions', {
                    employeeId: data.id,
                    employeeName: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
                  })}
                  style={{ marginTop: spacing.md }}
                />
              )}
            </Card>
          )}
        </View>
      )}
    />
  );
}

