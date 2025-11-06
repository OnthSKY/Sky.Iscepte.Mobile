import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { salesEntityService } from '../services/salesServiceAdapter';
import Card from '../../../shared/components/Card';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import { Sale } from '../store/salesStore';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../products/utils/currency';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import LoadingState from '../../../shared/components/LoadingState';
import ErrorState from '../../../shared/components/ErrorState';
import { useSaleQuery } from '../hooks/useSalesQuery';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * SalesDetailScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes detail screen UI
 * Dependency Inversion: Depends on service adapter interface
 */
export default function SalesDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation(['sales', 'stock', 'common']);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const saleId = route.params?.id;

  const { data, isLoading, error } = useSaleQuery(saleId);

  const handleQuickSale = () => {
    if (data?.items?.[0]?.productId) {
      navigation.navigate('QuickSale', { productId: data.items[0].productId });
    } else {
      navigation.navigate('QuickSale');
    }
  };

  const handleQuickPurchase = () => {
    if (data?.items?.[0]?.productId) {
      navigation.navigate('QuickPurchase', { productId: data.items[0].productId });
    } else {
      navigation.navigate('QuickPurchase');
    }
  };

  const handleStockList = () => {
    navigation.navigate('StockList');
  };

  const renderFooter = () => {
    return (
      <View style={{ 
        gap: spacing.md, 
        padding: spacing.md, 
        borderTopWidth: 1, 
        borderTopColor: colors.border, 
        backgroundColor: colors.surface 
      }}>
        {/* Quick Actions */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <TouchableOpacity
            onPress={handleQuickSale}
            style={{ 
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.md,
              borderRadius: 12,
              backgroundColor: colors.primary,
            }}
          >
            <Ionicons name="flash-outline" size={18} color="#fff" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
              {t('stock:quick_sale', { defaultValue: 'Hızlı Satış' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleQuickPurchase}
            style={{ 
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.md,
              borderRadius: 12,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Ionicons name="cart-outline" size={18} color={colors.text} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
              {t('purchases:quick_purchase', { defaultValue: 'Hızlı Alış' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleStockList}
            style={{ 
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.md,
              borderRadius: 12,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Ionicons name="cube-outline" size={18} color={colors.text} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
              {t('stock:stock', { defaultValue: 'Stok' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <ScreenLayout title={t('sales:sale_details', { defaultValue: 'Satış Detayları' })} showBackButton>
        <LoadingState />
      </ScreenLayout>
    );
  }

  if (error || !data) {
    return (
      <ScreenLayout title={t('sales:sale_details', { defaultValue: 'Satış Detayları' })} showBackButton>
        <ErrorState error={error || new Error('Satış bulunamadı')} showRetry={false} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout 
      title={t('sales:sale_details', { defaultValue: 'Satış Detayları' })} 
      showBackButton
      footer={renderFooter()}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <View style={{ gap: spacing.md }}>
          <Card>
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('product_name', { defaultValue: 'Product Name' })}
                </Text>
                <Text style={{ fontSize: 16 }}>{data.title || '-'}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.muted }}>
                  {t('total_amount', { defaultValue: 'Total Amount' })}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>
                  {data.amount ? formatCurrency(data.amount, data.currency || 'TRY') : '-'}
                </Text>
              </View>
            </View>
          </Card>

          <Card>
            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: spacing.sm }}>
              {t('items', { defaultValue: 'Items' })}
            </Text>
            <View style={{ gap: spacing.sm }}>
              <Text style={{ color: colors.muted }}>No items available</Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

