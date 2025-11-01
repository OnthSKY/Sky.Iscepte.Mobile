import React from 'react';
import { View, Text } from 'react-native';
import { DetailScreenContainer } from '../../../shared/components/screens/DetailScreenContainer';
import { employeeEntityService } from '../services/employeeServiceAdapter';
import Card from '../../../shared/components/Card';
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
  const { t } = useTranslation(['employees', 'settings']);

  return (
    <DetailScreenContainer
      service={employeeEntityService}
      config={{
        entityName: 'employee',
        translationNamespace: 'employees',
      }}
      renderContent={(data: Employee) => (
        <View style={{ gap: spacing.md }}>
          <Card>
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('common:name', { defaultValue: 'Name' })}
                </Text>
                <Text style={{ fontSize: 16 }}>{data.name || '-'}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('settings:role', { defaultValue: 'Role' })}
                </Text>
                <Text style={{ fontSize: 16 }}>{data.role || '-'}</Text>
              </View>
            </View>
          </Card>
        </View>
      )}
    />
  );
}

