import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { useSupplierStatsQuery } from '../hooks/useSuppliersQuery';
import { ListScreenContainer } from '../../../shared/components/screens/ListScreenContainer';
import { supplierEntityService } from '../services/supplierServiceAdapter';
import Card from '../../../shared/components/Card';
import { useNavigation } from '@react-navigation/native';
import { Supplier } from '../store/supplierStore';
import { ModuleStatsHeader, ModuleStat } from '../../../shared/components/dashboard/ModuleStatsHeader';
import LoadingState from '../../../shared/components/LoadingState';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import spacing from '../../../core/constants/spacing';

/**
 * SupplierListScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes list screen UI with stats
 * Dependency Inversion: Depends on service adapter interface
 */
export default function SupplierListScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['suppliers', 'common']);
  const { activeTheme, colors } = useTheme();
  const isDark = activeTheme === 'dark';

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useSupplierStatsQuery();

  // Transform stats to ModuleStat format
  const moduleStats: ModuleStat[] = React.useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        key: 'total-suppliers',
        label: t('suppliers:total_suppliers', { defaultValue: 'Toplam Tedarikçi' }),
        value: stats.totalSuppliers ?? 0,
        icon: 'people-outline',
        color: isDark ? '#60A5FA' : '#1D4ED8',
        route: 'SuppliersList',
      },
      {
        key: 'active-suppliers',
        label: t('suppliers:active_suppliers', { defaultValue: 'Aktif Tedarikçi' }),
        value: stats.activeSuppliers ?? 0,
        icon: 'checkmark-circle-outline',
        color: isDark ? '#34D399' : '#059669',
        route: 'SuppliersList',
      },
      {
        key: 'total-orders',
        label: t('suppliers:total_orders', { defaultValue: 'Toplam Sipariş' }),
        value: stats.totalOrders ?? 0,
        icon: 'receipt-outline',
        color: isDark ? '#F59E0B' : '#D97706',
        route: 'PurchaseList',
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
            mainStatKey="total-suppliers"
            translationNamespace="suppliers"
          />
        )}

        {/* List Section */}
        <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
          <ListScreenContainer
            service={supplierEntityService}
            config={{
              entityName: 'supplier',
              translationNamespace: 'suppliers',
              defaultPageSize: 10,
            }}
            renderItem={(item: Supplier) => (
              <Card
                style={{ marginBottom: 12 }}
                onPress={() => navigation.navigate('SupplierDetail', { id: item.id, name: item.name })}
              >
                <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.name}</Text>
              </Card>
            )}
            keyExtractor={(item: Supplier) => String(item.id)}
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

