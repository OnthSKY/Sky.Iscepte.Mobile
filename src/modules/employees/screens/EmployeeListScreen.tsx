import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useEmployeeStatsQuery } from '../hooks/useEmployeesQuery';
import { ListScreenContainer } from '../../../shared/components/screens/ListScreenContainer';
import { employeeEntityService } from '../services/employeeServiceAdapter';
import Card from '../../../shared/components/Card';
import { useNavigation } from '@react-navigation/native';
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
  const { t } = useTranslation(['settings', 'common']);
  const { activeTheme, colors } = useTheme();
  const isDark = activeTheme === 'dark';

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useEmployeeStatsQuery();

  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        key: 'total-employees',
        label: t('settings:total_employees', { defaultValue: 'Toplam Çalışan' }),
        value: stats.totalEmployees ?? 0,
        icon: 'people-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
        route: 'Employees',
      },
      {
        key: 'active-employees',
        label: t('settings:active_employees', { defaultValue: 'Aktif Çalışan' }),
        value: stats.activeEmployees ?? 0,
        icon: 'checkmark-circle-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'Employees',
      },
      {
        key: 'total-departments',
        label: t('settings:total_departments', { defaultValue: 'Toplam Departman' }),
        value: stats.totalDepartments ?? 0,
        icon: 'business-outline',
        color: isDark ? '#F59E0B' : '#D97706',
        route: 'Employees',
      },
    ];
  }, [stats, t, isDark]);

  return (
    <ScreenLayout noPadding>
      <ScrollView 
        style={{ flex: 1, backgroundColor: colors.page }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
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
            renderItem={(item: Employee) => (
              <Card
                style={{ marginBottom: 12 }}
                onPress={() => navigation.navigate('EmployeeDetail', { id: item.id, name: item.name, role: item.role })}
              >
                <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.name}</Text>
                <Text>{item.role}</Text>
              </Card>
            )}
            keyExtractor={(item: Employee) => String(item.id)}
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}


