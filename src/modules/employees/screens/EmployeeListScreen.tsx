import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useEmployeeStatsQuery } from '../hooks/useEmployeesQuery';
import { ListScreenContainer } from '../../../shared/components/screens/ListScreenContainer';
import { employeeEntityService } from '../services/employeeServiceAdapter';
import Card from '../../../shared/components/Card';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Employee } from '../store/employeeStore';
import { ModuleStatsHeader, ModuleStat } from '../../../shared/components/dashboard/ModuleStatsHeader';
import LoadingState from '../../../shared/components/LoadingState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import spacing from '../../../core/constants/spacing';

/**
 * EmployeeListScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes list screen UI with stats
 * Dependency Inversion: Depends on service adapter interface
 */
export default function EmployeeListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const mode = route.params?.mode; // 'permissions' mode for permissions management
  const { t } = useTranslation(['settings', 'common', 'employees']);
  const { colors } = useTheme();

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useEmployeeStatsQuery();

  // Transform stats to ModuleStat format (without departments)
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        key: 'total-employees',
        label: t('settings:total_employees', { defaultValue: 'Toplam Çalışan' }),
        value: stats.totalEmployees ?? 0,
        icon: 'people-outline',
        color: colors.statPrimary,
        route: 'Employees',
      },
      {
        key: 'active-employees',
        label: t('settings:active_employees', { defaultValue: 'Aktif Çalışan' }),
        value: stats.activeEmployees ?? 0,
        icon: 'checkmark-circle-outline',
        color: colors.statSuccess,
        route: 'Employees',
      },
    ];
  }, [stats, t, colors]);

  return (
    <ScreenLayout 
      noPadding
      title={mode === 'permissions' ? t('employees:manage_permissions', { defaultValue: 'Personel Yetkilerini Yönet' }) : undefined}
    >
      <View style={{ flex: 1, backgroundColor: colors.page }}>
        {/* Stats Header */}
        {statsLoading ? (
          <View style={{ padding: spacing.lg }}>
            <LoadingState />
          </View>
        ) : (
          <ModuleStatsHeader 
            stats={moduleStats}
            mainStatKey="total-employees"
            translationNamespace="settings"
          />
        )}

        {/* List Section */}
        <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
          <ListScreenContainer
            service={employeeEntityService}
            config={{
              entityName: 'employee',
              translationNamespace: 'employees',
              defaultPageSize: 10,
            }}
            emptyStateTitle={t('employees:no_employees_found', { defaultValue: 'Henüz çalışan yok' })}
            emptyStateSubtitle={t('employees:no_employees_found_subtitle', { defaultValue: 'Yeni çalışan eklemek için menüden ilgili seçeneği kullanabilirsiniz.' })}
            showFilters={false}
            renderItem={(item: Employee) => (
              <Card
                style={{ marginBottom: 12 }}
                onPress={() => {
                  if (mode === 'permissions') {
                    // Navigate to permissions screen when in permissions mode
                    navigation.navigate('EmployeePermissions', {
                      employeeId: item.id,
                      employeeName: item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim(),
                    });
                  } else {
                    // Default behavior: navigate to detail screen
                    navigation.navigate('EmployeeDetail', { 
                      id: item.id, 
                      name: item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim(), 
                      position: item.position 
                    });
                  }
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '500' }}>
                  {item.firstName || item.name} {item.lastName}
                </Text>
                <Text>{item.position}</Text>
              </Card>
            )}
            keyExtractor={(item: Employee) => String(item.id)}
          />
        </View>
      </View>
    </ScreenLayout>
  );
}


