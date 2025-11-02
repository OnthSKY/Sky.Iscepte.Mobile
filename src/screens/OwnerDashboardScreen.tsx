import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import DashboardTopBar from '../shared/components/DashboardTopBar';
import LoadingState from '../shared/components/LoadingState';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useOwnerDashboard } from '../core/hooks/useOwnerDashboard';
import { formatCurrency } from '../modules/products/utils/currency';

/**
 * OwnerDashboardScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes owner dashboard UI
 * Dependency Inversion: Depends on useOwnerDashboard hook, not concrete implementation
 */
export default function OwnerDashboardScreen() {
  const navigation = useNavigation<any>();
  const { colors, activeTheme } = useTheme();


  const {
    activeTab,
    setActiveTab,
    showStoreIncomeValues,
    setShowStoreIncomeValues,
    showStoreExpenseValues,
    setShowStoreExpenseValues,
    selectedEmployeeId,
    setSelectedEmployeeId,
    showEmpIncomeValues,
    setShowEmpIncomeValues,
    showEmpExpenseValues,
    setShowEmpExpenseValues,
    employeePickerVisible,
    setEmployeePickerVisible,
    showMoreTopProducts,
    setShowMoreTopProducts,
    showMoreEmployeeProducts,
    setShowMoreEmployeeProducts,
    employeeCards,
    stats,
    employeeStats,
    topProducts,
    topProductsCount,
    isLoading,
    t,
  } = useOwnerDashboard();

  if (isLoading) {
    return (
      <ScreenLayout>
        <LoadingState />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header with Gradient, Premium badge and compact totals */}
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ marginHorizontal: 16, marginTop: 8, borderRadius: 16, padding: 16 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <DashboardTopBar variant="owner" />
            </View>
          </View>
        </LinearGradient>

        {/* Tabs: Day, Week, Month, Year, All */}
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 6, fontWeight: '500' }}>
          {t('dashboard:all_data_period', { defaultValue: 'Tüm veriler için dönem' })}
        </Text>
        <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 4 }}>
          <TouchableOpacity style={{ flex: 1, paddingVertical: 6, borderRadius: 8, backgroundColor: activeTab === 'day' ? colors.primary : 'transparent' }} onPress={() => setActiveTab('day')} activeOpacity={0.8}>
            <Text style={{ textAlign: 'center', color: activeTab === 'day' ? '#ffffff' : colors.text, fontWeight: '600', fontSize: 11 }}>
              {t('dashboard:tab_day', { defaultValue: 'Gün' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1, paddingVertical: 6, borderRadius: 8, backgroundColor: activeTab === 'week' ? colors.primary : 'transparent' }} onPress={() => setActiveTab('week')} activeOpacity={0.8}>
            <Text style={{ textAlign: 'center', color: activeTab === 'week' ? '#ffffff' : colors.text, fontWeight: '600', fontSize: 11 }}>
              {t('dashboard:tab_week', { defaultValue: 'Hafta' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1, paddingVertical: 6, borderRadius: 8, backgroundColor: activeTab === 'month' ? colors.primary : 'transparent' }} onPress={() => setActiveTab('month')} activeOpacity={0.8}>
            <Text style={{ textAlign: 'center', color: activeTab === 'month' ? '#ffffff' : colors.text, fontWeight: '600', fontSize: 11 }}>
              {t('dashboard:tab_month', { defaultValue: 'Ay' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1, paddingVertical: 6, borderRadius: 8, backgroundColor: activeTab === 'year' ? colors.primary : 'transparent' }} onPress={() => setActiveTab('year')} activeOpacity={0.8}>
            <Text style={{ textAlign: 'center', color: activeTab === 'year' ? '#ffffff' : colors.text, fontWeight: '600', fontSize: 11 }}>
              {t('dashboard:tab_year', { defaultValue: 'Yıl' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1, paddingVertical: 6, borderRadius: 8, backgroundColor: activeTab === 'all' ? colors.primary : 'transparent' }} onPress={() => setActiveTab('all')} activeOpacity={0.8}>
            <Text style={{ textAlign: 'center', color: activeTab === 'all' ? '#ffffff' : colors.text, fontWeight: '600', fontSize: 11 }}>
              {t('dashboard:tab_all', { defaultValue: 'Tümü' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Dükkan Overview */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Store Summary card */}
        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="storefront-outline" size={18} color={colors.muted} />
            <Text style={{ color: colors.text, fontWeight: '700', marginLeft: 8, flex: 1 }} numberOfLines={1}>
              {t('dashboard:store_summary', { defaultValue: 'Dükkan' })}
            </Text>
            <TouchableOpacity onPress={() => {
              const bothVisible = showStoreIncomeValues && showStoreExpenseValues;
              setShowStoreIncomeValues(!bothVisible);
              setShowStoreExpenseValues(!bothVisible);
            }} accessibilityRole="button">
              <Ionicons name={showStoreIncomeValues && showStoreExpenseValues ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowStoreIncomeValues((v) => !v)} activeOpacity={0.8}>
              <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}>
                <Text style={{ color: colors.muted, fontSize: 11 }}>{t('dashboard:income', { defaultValue: 'Gelir' })}</Text>
                <Text style={{ color: showStoreIncomeValues ? colors.success : colors.muted, fontSize: 18, fontWeight: '700', marginTop: 4, width: '100%', flexShrink: 1 }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                  {showStoreIncomeValues ? stats.sales : '••••••'}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowStoreExpenseValues((v) => !v)} activeOpacity={0.8}>
              <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}>
                <Text style={{ color: colors.muted, fontSize: 11 }}>{t('dashboard:expenses', { defaultValue: 'Gider' })}</Text>
                <Text style={{ color: showStoreExpenseValues ? colors.error : colors.muted, fontSize: 18, fontWeight: '700', marginTop: 4, width: '100%', flexShrink: 1 }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                  {showStoreExpenseValues ? stats.expenses : '••••••'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
            <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}>
              <Text style={{ color: colors.muted, fontSize: 11 }}>{t('dashboard:total', { defaultValue: 'Net Kar' })}</Text>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700', marginTop: 4, width: '100%', flexShrink: 1 }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                {showStoreIncomeValues && showStoreExpenseValues ? stats.total : '••••••'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Top Products Sales */}
      {topProducts && topProducts.length > 0 && (
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="cube-outline" size={18} color={colors.muted} />
              <Text style={{ color: colors.text, fontWeight: '700', marginLeft: 8, flex: 1 }} numberOfLines={1}>
                {t('dashboard:top_products', { defaultValue: 'En Çok Satan Ürünler' })}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 11 }}>
                {topProductsCount} {t('dashboard:products', { defaultValue: 'ürün' })}
              </Text>
            </View>
            {(showMoreTopProducts ? topProducts.slice(0, 20) : topProducts.slice(0, 5)).map((product: any, index: number) => {
              const displayedItems = showMoreTopProducts ? Math.min(topProducts.length, 20) : 5;
              return (
              <View key={product.productId || index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: index < displayedItems - 1 ? 1 : 0, borderBottomColor: colors.border }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                      <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>#{index + 1}</Text>
                    </View>
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', flex: 1 }} numberOfLines={1}>{product.productName}</Text>
                  </View>
                  <Text style={{ color: colors.muted, fontSize: 12, marginLeft: 32 }}>
                    {product.quantity} {t('dashboard:quantity', { defaultValue: 'adet satış' })}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: colors.success, fontSize: 16, fontWeight: '700' }}>
                    {formatCurrency(product.totalAmount, product.currency || 'TRY')}
                  </Text>
                </View>
              </View>
              );
            })}
            {topProducts.length > 5 && (
              <View>
                <TouchableOpacity onPress={() => setShowMoreTopProducts(!showMoreTopProducts)} style={{ paddingVertical: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, marginTop: 4 }}>
                  <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>
                    {showMoreTopProducts ? t('common:show_less', { defaultValue: 'Daha Az Göster' }) : t('common:show_more', { defaultValue: 'Daha Fazla Göster' })} ({topProducts.length - 5})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('StockList')} style={{ paddingVertical: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border }}>
                  <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600' }}>
                    {t('dashboard:view_all_products', { defaultValue: 'Tümünü Görüntüle' })}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Employees: selectable list + summary card */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Names as chips, horizontal scroll + More */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
          <TouchableOpacity
            onPress={() => setSelectedEmployeeId('total')}
            style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: selectedEmployeeId === 'total' ? colors.primary : (colors.card || colors.surface), borderWidth: 1, borderColor: selectedEmployeeId === 'total' ? colors.primary : colors.border, marginRight: 8 }}
            activeOpacity={0.8}
          >
            <Ionicons name="people-outline" size={14} color={selectedEmployeeId === 'total' ? '#fff' : colors.muted} />
            <Text style={{ color: selectedEmployeeId === 'total' ? '#fff' : colors.text, fontWeight: '600', fontSize: 12, marginLeft: 6 }} numberOfLines={1}>
              {t('dashboard:all_employees', { defaultValue: 'Tüm çalışanlar' })} ({employeeCards.length})
            </Text>
          </TouchableOpacity>

          {employeeCards.map((e: any) => (
            <TouchableOpacity
              key={e.id}
              onPress={() => setSelectedEmployeeId(e.id)}
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: selectedEmployeeId === e.id ? colors.primary : (colors.card || colors.surface), borderWidth: 1, borderColor: selectedEmployeeId === e.id ? colors.primary : colors.border, marginRight: 8 }}
              activeOpacity={0.8}
            >
              <Ionicons name="person-outline" size={14} color={selectedEmployeeId === e.id ? '#fff' : colors.muted} />
              <Text style={{ color: selectedEmployeeId === e.id ? '#fff' : colors.text, fontWeight: '600', fontSize: 12, marginLeft: 6 }} numberOfLines={1}>{e.name}</Text>
            </TouchableOpacity>
          ))}

          {employeeCards.length > 8 && (
            <TouchableOpacity onPress={() => setEmployeePickerVisible(true)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
              <Ionicons name="ellipsis-horizontal" size={14} color={colors.muted} />
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 12, marginLeft: 6 }}>{t('common:more', { defaultValue: 'Daha fazla' })}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Summary card below chips with show/hide */}
        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name={selectedEmployeeId === 'total' ? 'people-outline' : 'person-circle-outline'} size={18} color={colors.muted} />
            <Text style={{ color: colors.text, fontWeight: '700', marginLeft: 8, flex: 1 }} numberOfLines={1}>
              {selectedEmployeeId === 'total' ? (t('dashboard:all_employees', { defaultValue: 'Tüm çalışanlar' }) as any) : (employeeCards.find((e: any) => e.id === selectedEmployeeId)?.name || '')}
              {employeeStats.productCount > 0 && (
                <Text style={{ color: colors.muted, fontSize: 12, marginLeft: 4 }}> • {employeeStats.productCount} {t('dashboard:products', { defaultValue: 'ürün' })}</Text>
              )}
            </Text>
            <TouchableOpacity onPress={() => {
              const bothVisible = showEmpIncomeValues && showEmpExpenseValues;
              setShowEmpIncomeValues(!bothVisible);
              setShowEmpExpenseValues(!bothVisible);
            }} accessibilityRole="button">
              <Ionicons name={showEmpIncomeValues && showEmpExpenseValues ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowEmpIncomeValues((v) => !v)} activeOpacity={0.8}>
              <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}>
                <Text style={{ color: colors.muted, fontSize: 11 }}>{t('dashboard:income', { defaultValue: 'Gelir' })}</Text>
                <Text style={{ color: showEmpIncomeValues ? colors.success : colors.muted, fontSize: 18, fontWeight: '700', marginTop: 4, width: '100%', flexShrink: 1 }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                  {showEmpIncomeValues ? employeeStats.sales : '••••••'}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowEmpExpenseValues((v) => !v)} activeOpacity={0.8}>
              <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}>
                <Text style={{ color: colors.muted, fontSize: 11 }}>{t('dashboard:expenses', { defaultValue: 'Gider' })}</Text>
                <Text style={{ color: showEmpExpenseValues ? colors.error : colors.muted, fontSize: 18, fontWeight: '700', marginTop: 4, width: '100%', flexShrink: 1 }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                  {showEmpExpenseValues ? employeeStats.expenses : '••••••'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
            <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}>
              <Text style={{ color: colors.muted, fontSize: 11 }}>{t('dashboard:total', { defaultValue: 'Net Kar' })}</Text>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700', marginTop: 4, width: '100%', flexShrink: 1 }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                {showEmpIncomeValues && showEmpExpenseValues ? employeeStats.total : '••••••'}
              </Text>
            </View>
          </View>

          {/* Product Sales Details */}
          {employeeStats.productSales && employeeStats.productSales.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 8, fontWeight: '600' }}>
                {t('dashboard:product_sales_details', { defaultValue: 'Ürün satış detayları' })}
              </Text>
              {(showMoreEmployeeProducts ? employeeStats.productSales.slice(0, 20) : employeeStats.productSales.slice(0, 5)).map((product: any, index: number) => {
                const displayedItems = showMoreEmployeeProducts ? Math.min(employeeStats.productSales.length, 20) : 5;
                return (
                <View key={product.productId || index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: index < displayedItems - 1 ? 1 : 0, borderBottomColor: colors.border }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }} numberOfLines={1}>{product.productName}</Text>
                    <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
                      {product.quantity} {t('dashboard:quantity', { defaultValue: 'adet' })} • {t('dashboard:amount', { defaultValue: 'Tutar' })}: {showEmpIncomeValues ? formatCurrency(product.totalAmount, product.currency || 'TRY') : '••••••'}
                    </Text>
                  </View>
                </View>
                );
              })}
              {employeeStats.productSales.length > 5 && (
                <View>
                  <TouchableOpacity onPress={() => setShowMoreEmployeeProducts(!showMoreEmployeeProducts)} style={{ paddingVertical: 10, alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                      {showMoreEmployeeProducts ? t('common:show_less', { defaultValue: 'Daha Az Göster' }) : t('common:show_more', { defaultValue: 'Daha Fazla Göster' })} ({employeeStats.productSales.length - 5})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('SalesList')} style={{ paddingVertical: 8, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border }}>
                    <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '600' }}>
                      {t('dashboard:view_all_sales', { defaultValue: 'Tümünü Görüntüle' })}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Employee picker modal (for many employees) */}
        {employeePickerVisible && (
          <Modal visible transparent animationType="fade" onRequestClose={() => setEmployeePickerVisible(false)}>
            <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 16 }} activeOpacity={1} onPress={() => setEmployeePickerVisible(false)}>
              <View style={{ width: '100%', maxWidth: 420, backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 12 }}>{t('dashboard:all_employees', { defaultValue: 'Tüm çalışanlar' })}</Text>
                <ScrollView style={{ maxHeight: 360 }}>
                  <TouchableOpacity onPress={() => { setSelectedEmployeeId('total'); setEmployeePickerVisible(false); }} style={{ paddingVertical: 10 }}>
                    <Text style={{ color: colors.text }}>{t('dashboard:all_employees', { defaultValue: 'Tüm çalışanlar' })}</Text>
                  </TouchableOpacity>
                  {employeeCards.map((e: any) => (
                    <TouchableOpacity key={e.id} onPress={() => { setSelectedEmployeeId(e.id); setEmployeePickerVisible(false); }} style={{ paddingVertical: 10 }}>
                      <Text style={{ color: colors.text }}>{e.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
      </ScrollView>
    </ScreenLayout>
  );
}


