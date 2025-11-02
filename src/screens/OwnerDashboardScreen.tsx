import React from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, Modal, ScrollView } from 'react-native';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import SummaryCard from '../shared/components/SummaryCard';
import DashboardTopBar from '../shared/components/DashboardTopBar';
import LoadingState from '../shared/components/LoadingState';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useOwnerDashboard } from '../core/hooks/useOwnerDashboard';

/**
 * OwnerDashboardScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes owner dashboard UI
 * Dependency Inversion: Depends on useOwnerDashboard hook, not concrete implementation
 */
export default function OwnerDashboardScreen() {
  const { colors, activeTheme } = useTheme();
  const { width } = useWindowDimensions();

  const isDark = activeTheme === 'dark';
  const headerGradientColors = isDark
    ? ['#0F172A', '#1E3A8A']
    : ['#1D4ED8', '#3B82F6'];

  const masked = '••••••';

  const {
    activeTab,
    setActiveTab,
    showValues,
    setShowValues,
    selectedEmployeeId,
    setSelectedEmployeeId,
    showEmpValues,
    setShowEmpValues,
    employeePickerVisible,
    setEmployeePickerVisible,
    ownerName,
    companyName,
    employeeCards,
    stats,
    employeeStats,
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
      {/* Welcome Header with Gradient, Premium badge and compact totals */}
      <LinearGradient
        colors={headerGradientColors}
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

      {/* Tabs: Today vs All-time */}
      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 4 }}>
          <TouchableOpacity style={{ flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: activeTab === 'today' ? colors.primary : 'transparent' }} onPress={() => setActiveTab('today')} activeOpacity={0.8}>
            <Text style={{ textAlign: 'center', color: activeTab === 'today' ? '#ffffff' : colors.text, fontWeight: '600', fontSize: 12 }}>
              {t('dashboard:tab_today', { defaultValue: 'Bugün' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: activeTab === 'all' ? colors.primary : 'transparent' }} onPress={() => setActiveTab('all')} activeOpacity={0.8}>
            <Text style={{ textAlign: 'center', color: activeTab === 'all' ? '#ffffff' : colors.text, fontWeight: '600', fontSize: 12 }}>
              {t('dashboard:tab_all', { defaultValue: 'Tümü' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Compact stats row with eye icon to toggle all */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {/* Sales small card */}
          <View style={{ flex: 1 }}>
            <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 }}>
              <Text style={{ color: colors.muted, fontSize: 11 }}>{t('dashboard:today_sales', { defaultValue: 'Satış' })}</Text>
              <Text style={{ color: showValues ? colors.success : colors.muted, fontSize: 18, fontWeight: '700', marginTop: 4, width: '100%', flexShrink: 1 }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
                {showValues ? stats.sales : masked}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 10, marginTop: 4 }}>{t('dashboard:income_desc', { defaultValue: 'Gelir' })}</Text>
            </View>
          </View>

          {/* Expense small card */}
          <View style={{ flex: 1 }}>
            <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 }}>
              <Text style={{ color: colors.muted, fontSize: 11 }}>{t('dashboard:today_expenses', { defaultValue: 'Gelir / Gider' })}</Text>
              <Text style={{ color: showValues ? colors.error : colors.muted, fontSize: 18, fontWeight: '700', marginTop: 4, width: '100%', flexShrink: 1 }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
                {showValues ? stats.expenses : masked}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 10, marginTop: 4 }}>{t('dashboard:expense_desc', { defaultValue: 'Gelir / Gider' })}</Text>
            </View>
          </View>

          {/* Total small card */}
          <View style={{ flex: 1 }}>
            <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 }}>
              <Text style={{ color: colors.muted, fontSize: 11 }}>{t('dashboard:today_total', { defaultValue: 'Toplam' })}</Text>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 4, width: '100%', flexShrink: 1 }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
                {showValues ? stats.total : masked}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 10, marginTop: 4 }}>{t('dashboard:net_desc', { defaultValue: 'Net' })}</Text>
            </View>
          </View>

          {/* Eye icon to toggle all */}
          <TouchableOpacity 
            style={{ justifyContent: 'center', paddingHorizontal: 8 }}
            onPress={() => setShowValues((v) => !v)}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={showValues ? 'eye-off-outline' : 'eye-outline'} 
              size={24} 
              color={colors.muted} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Employees: total count + selectable list + summary card */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>
          {t('dashboard:employee_overview', { defaultValue: 'Çalışan özeti' })} • {t('dashboard:total', { defaultValue: 'Toplam' })}: {employeeCards.length}
        </Text>

        {/* Names as chips, horizontal scroll + More */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
          <TouchableOpacity
            onPress={() => setSelectedEmployeeId('total')}
            style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: selectedEmployeeId === 'total' ? colors.primary : (colors.card || colors.surface), borderWidth: 1, borderColor: selectedEmployeeId === 'total' ? colors.primary : colors.border, marginRight: 8 }}
            activeOpacity={0.8}
          >
            <Ionicons name="people-outline" size={14} color={selectedEmployeeId === 'total' ? '#fff' : colors.muted} />
            <Text style={{ color: selectedEmployeeId === 'total' ? '#fff' : colors.text, fontWeight: '600', fontSize: 12, marginLeft: 6 }} numberOfLines={1}>{t('dashboard:all_employees', { defaultValue: 'Tüm çalışanlar' })}</Text>
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
            </Text>
            <TouchableOpacity onPress={() => setShowEmpValues(v => !v)} accessibilityRole="button">
              <Ionicons name={showEmpValues ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}>
              <Text style={{ color: colors.muted, fontSize: 11 }}>{t('dashboard:today_sales', { defaultValue: 'Bugün satış' })}</Text>
              <Text style={{ color: showEmpValues ? colors.success : colors.muted, fontSize: 18, fontWeight: '700', marginTop: 4, width: '100%', flexShrink: 1 }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                {showEmpValues ? employeeStats.sales : '••••••'}
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}>
              <Text style={{ color: colors.muted, fontSize: 11 }}>{t('dashboard:today_expenses', { defaultValue: 'Bugünkü Gelir / Gider' })}</Text>
              <Text style={{ color: showEmpValues ? colors.error : colors.muted, fontSize: 18, fontWeight: '700', marginTop: 4, width: '100%', flexShrink: 1 }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                {showEmpValues ? employeeStats.expenses : '••••••'}
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 }}>
              <Text style={{ color: colors.muted, fontSize: 11 }}>{t('dashboard:today_total', { defaultValue: 'Bugün toplam' })}</Text>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 4, width: '100%', flexShrink: 1 }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                {showEmpValues ? employeeStats.total : '••••••'}
              </Text>
            </View>
          </View>
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
    </ScreenLayout>
  );
}


