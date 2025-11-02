import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useCustomerStatsQuery } from '../hooks/useCustomersQuery';
import { ListScreenContainer } from '../../../shared/components/screens/ListScreenContainer';
import { customerEntityService } from '../services/customerServiceAdapter';
import Card from '../../../shared/components/Card';
import { useNavigation } from '@react-navigation/native';
import { Customer } from '../store/customerStore';
import { ModuleStatsHeader, ModuleStat } from '../../../shared/components/dashboard/ModuleStatsHeader';
import LoadingState from '../../../shared/components/LoadingState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import spacing from '../../../core/constants/spacing';

/**
 * CustomerListScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes list screen UI with stats
 * Dependency Inversion: Depends on service adapter interface
 */
export default function CustomerListScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['customers', 'common']);
  const { activeTheme, colors } = useTheme();
  const isDark = activeTheme === 'dark';

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useCustomerStatsQuery();

  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        key: 'total-customers',
        label: t('customers:total_customers', { defaultValue: 'Toplam Müşteri' }),
        value: stats.totalCustomers ?? 0,
        icon: 'people-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
        route: 'CustomersList',
      },
      {
        key: 'active-customers',
        label: t('customers:active_customers', { defaultValue: 'Aktif Müşteri' }),
        value: stats.activeCustomers ?? 0,
        icon: 'checkmark-circle-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'CustomersList',
      },
      {
        key: 'total-orders',
        label: t('customers:total_orders', { defaultValue: 'Toplam Sipariş' }),
        value: stats.totalOrders ?? 0,
        icon: 'receipt-outline',
        color: isDark ? '#F59E0B' : '#D97706',
        route: 'SalesList',
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
            mainStatKey="total-customers"
            translationNamespace="customers"
          />
        )}

        {/* List Section */}
        <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
          <ListScreenContainer
            service={customerEntityService}
            config={{
              entityName: 'customer',
              translationNamespace: 'customers',
              defaultPageSize: 10,
              filterOptions: [
                {
                  key: 'isActive',
                  label: 'customers:active_status',
                  type: 'select',
                  options: [
                    { label: t('common:all', { defaultValue: 'Tümü' }), value: '' },
                    { label: t('common:active', { defaultValue: 'Aktif' }), value: 'true' },
                    { label: t('common:inactive', { defaultValue: 'Pasif' }), value: 'false' },
                  ],
                },
                {
                  key: 'status',
                  label: 'customers:status',
                  type: 'text',
                },
              ],
            }}
            renderItem={(item: Customer) => (
              <Card
                style={{ marginBottom: 12 }}
                onPress={() => navigation.navigate('CustomerDetail', { id: item.id, name: item.name })}
              >
                <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.name}</Text>
              </Card>
            )}
            keyExtractor={(item: Customer) => String(item.id)}
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}


