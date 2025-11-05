import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';
import SearchBar from '../../../shared/components/SearchBar';
import PaginatedList from '../../../shared/components/PaginatedList';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import EmptyState from '../../../shared/components/EmptyState';
import { Sale } from '../store/salesStore';
import { salesService } from '../services/salesService';
import { GridRequest } from '../../../shared/types/grid';
import { Paginated } from '../../../shared/types/module';
import { toQueryParams } from '../../../shared/utils/query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/services/queryClient';
import spacing from '../../../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatCurrency } from '../../products/utils/currency';
import { formatDate } from '../../../core/utils/dateUtils';

/**
 * DebtSalesScreen - Borçlu satışlar listesi
 * Sadece borçlu satışları gösterir ve ödeme alındı işaretleme özelliği sunar
 */
export default function DebtSalesScreen() {
  const { t } = useTranslation(['sales', 'common']);
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const queryClient = useQueryClient();

  // Ödeme alındı işaretle mutation
  const markAsPaidMutation = useMutation({
    mutationFn: (id: string) => salesService.markAsPaid(id),
    onSuccess: () => {
      // Cache'i invalidate et
      queryClient.invalidateQueries({ queryKey: [queryKeys.sales.all] });
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.debt() });
    },
  });

  // Borçlu satışlar listesi çekme fonksiyonu
  const fetchDebtSales = useCallback(async (request: GridRequest): Promise<Paginated<Sale>> => {
    const response = await salesService.debtList(request);
    return response;
  }, []);

  // Ödeme alındı işaretleme fonksiyonu
  const handleMarkAsPaid = useCallback((sale: Sale) => {
    const customerName = sale.customerName || 'Müşteri';
    const amount = formatCurrency(sale.total || sale.amount || 0, sale.currency || 'TRY');
    
    Alert.alert(
      t('sales:mark_as_paid', { defaultValue: 'Ödeme Alındı İşaretle' }),
      t('sales:mark_as_paid_confirmation', {
        defaultValue: '{{customerName}} müşterisinden {{amount}} tutarındaki ödemeyi alındı olarak işaretlemek istediğinize emin misiniz?',
        customerName,
        amount,
      }),
      [
        {
          text: t('common:cancel', { defaultValue: 'İptal' }),
          style: 'cancel',
        },
        {
          text: t('common:confirm', { defaultValue: 'Onayla' }),
          onPress: () => {
            markAsPaidMutation.mutate(String(sale.id), {
              onSuccess: () => {
                Alert.alert(
                  t('common:success', { defaultValue: 'Başarılı' }),
                  t('sales:marked_as_paid', { defaultValue: 'Ödeme alındı olarak işaretlendi' })
                );
              },
              onError: (error: any) => {
                Alert.alert(
                  t('common:error', { defaultValue: 'Hata' }),
                  error?.message || t('common:something_went_wrong', { defaultValue: 'Bir şeyler yanlış gitti' })
                );
              },
            });
          },
        },
      ]
    );
  }, [markAsPaidMutation, t]);

  // Satış öğesi render fonksiyonu
  const renderItem = useCallback((item: Sale) => {
    const isPaid = item.isPaid === true;
    const debtDate = item.debtCollectionDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dateStatus: 'future' | 'today' | 'overdue' | null = null;
    let dateStatusText = '';
    let dateStatusColor = colors.muted;
    
    if (debtDate && !isPaid) {
      const debt = new Date(debtDate);
      debt.setHours(0, 0, 0, 0);
      const diffTime = debt.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        dateStatus = 'overdue';
        dateStatusText = t('sales:overdue', { defaultValue: 'Süresi Geçti' });
        dateStatusColor = '#EF4444';
      } else if (diffDays === 0) {
        dateStatus = 'today';
        dateStatusText = t('sales:due_today', { defaultValue: 'Bugün Ödenecek' });
        dateStatusColor = '#F59E0B';
      } else {
        dateStatus = 'future';
        dateStatusText = t('sales:due_in_days', { days: diffDays, defaultValue: '{{days}} Gün Sonra' });
        dateStatusColor = '#3B82F6';
      }
    }

    return (
      <Card style={{ marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.xs }}>
              {item.customerName || t('sales:customer', { defaultValue: 'Müşteri' })}
            </Text>
            {item.productName && (
              <Text style={{ fontSize: 14, color: colors.muted, marginBottom: spacing.xs }}>
                {item.productName}
              </Text>
            )}
          </View>
          {isPaid && (
            <View style={{
              backgroundColor: '#10B981',
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              borderRadius: 8,
            }}>
              <Text style={{ fontSize: 12, color: 'white', fontWeight: '600' }}>
                {t('sales:paid', { defaultValue: 'Ödendi' })}
              </Text>
            </View>
          )}
        </View>

        <View style={{ gap: spacing.xs, marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="cash-outline" size={18} color={colors.primary} />
              <Text style={{ marginLeft: spacing.xs, fontSize: 16, fontWeight: '600', color: colors.primary }}>
                {formatCurrency(item.total || item.amount || 0, item.currency || 'TRY')}
              </Text>
            </View>
            {item.quantity && item.price && (
              <Text style={{ fontSize: 12, color: colors.muted }}>
                {item.quantity}x {formatCurrency(item.price, item.currency || 'TRY')}
              </Text>
            )}
          </View>

          {debtDate && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="calendar-outline" size={16} color={dateStatusColor} />
                <Text style={{ marginLeft: spacing.xs, fontSize: 14, color: dateStatusColor }}>
                  {new Date(debtDate).toLocaleDateString('tr-TR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })}
                </Text>
                {dateStatusText && (
                  <Text style={{ marginLeft: spacing.xs, fontSize: 12, color: dateStatusColor, fontWeight: '600' }}>
                    ({dateStatusText})
                  </Text>
                )}
              </View>
            </View>
          )}

          {item.date && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={16} color={colors.muted} />
              <Text style={{ marginLeft: spacing.xs, fontSize: 12, color: colors.muted }}>
                {t('sales:sale_date', { defaultValue: 'Satış Tarihi' })}: {new Date(item.date).toLocaleDateString('tr-TR', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
          )}
        </View>

        {!isPaid && (
          <Button
            title={t('sales:mark_as_paid', { defaultValue: 'Ödeme Alındı İşaretle' })}
            onPress={() => handleMarkAsPaid(item)}
            style={{ marginTop: spacing.sm }}
            loading={markAsPaidMutation.isPending && markAsPaidMutation.variables === String(item.id)}
            icon="checkmark-circle-outline"
          />
        )}
      </Card>
    );
  }, [colors, t, handleMarkAsPaid, markAsPaidMutation]);

  return (
    <ScreenLayout
      title={t('sales:debt_sales', { defaultValue: 'Borçlu Satışlar' })}
      titleIcon="cash-outline"
    >
      <View style={{ flex: 1, gap: spacing.md }}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t('common:search', { defaultValue: 'Ara' })}
        />

        <PaginatedList<Sale>
          pageSize={10}
          query={{
            searchValue: query,
            orderColumn: 'debtCollectionDate',
            orderDirection: 'ASC',
          }}
          fetchPage={fetchDebtSales}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => renderItem(item)}
          ListEmptyComponent={
            <EmptyState
              title={t('sales:no_debt_sales', { defaultValue: 'Borçlu satış bulunamadı' })}
              subtitle={t('sales:no_debt_sales_subtitle', { defaultValue: 'Tüm ödemeler alındı' })}
              icon="checkmark-circle-outline"
            />
          }
        />
      </View>
    </ScreenLayout>
  );
}

