import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Platform, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';
import { useAppStore } from '../store/useAppStore';
import SummaryCard from '../shared/components/SummaryCard';

const DashboardScreen = () => {
  const { t, i18n } = useTranslation(['dashboard', 'sales', 'customers', 'expenses', 'reports', 'common']);
  const navigation = useNavigation<any>();
  const { colors, activeTheme } = useTheme();
  const { width } = useWindowDimensions();
  const user = useAppStore((state: any) => state.user);
  const role = useAppStore((state: any) => state.role);
  const logout = useAppStore(state => state.logout);
  const insets = useSafeAreaInsets();

  const isDark = activeTheme === 'dark';
  const headerGradientColors = isDark
    ? ['#0F172A', '#1E3A8A']
    : ['#1D4ED8', '#3B82F6'];
  const titleColor = isDark ? '#F8FAFC' : '#0B1220';
  const subtitleColor = isDark ? '#CBD5E1' : '#334155';
  // Removed date display as per requirements
  const numColumns = width > 650 ? 2 : 1;
  const cardMargin = spacing.md;
  const statCardWidth = (width - spacing.lg * 2 - cardMargin * (numColumns - 1)) / numColumns;

  const stats = [
    { 
      key: 'sales', 
      label: t('dashboard:total_sales'), 
      value: '₺125,430', 
      icon: 'trending-up-outline', 
      color: colors.success,
      route: 'Sales'
    },
    { 
      key: 'customers', 
      label: t('dashboard:total_customers'), 
      value: '1,247', 
      icon: 'people-outline', 
      color: colors.info,
      route: 'Customers'
    },
    { 
      key: 'expenses', 
      label: t('dashboard:total_expenses'), 
      value: '₺45,230', 
      icon: 'wallet-outline', 
      color: colors.error,
      route: 'Expenses'
    },
    { 
      key: 'profit', 
      label: t('dashboard:net_profit'), 
      value: '₺80,200', 
      icon: 'cash-outline', 
      color: (colors as any).profit || colors.primary,
      route: 'Reports'
    },
  ];

  const mainStat = stats[0];
  const secondaryStats = stats.slice(1);

  const quickActions = [
    { 
      key: 'new-sale', 
      label: t('sales:new_sale'), 
      icon: 'add-circle-outline', 
      color: colors.success,
      route: 'SalesCreate'
    },
    { 
      key: 'new-customer', 
      label: t('customers:new_customer'), 
      icon: 'person-add-outline', 
      color: colors.info,
      route: 'CustomerCreate'
    },
    { 
      key: 'new-expense', 
      label: t('expenses:new_expense'), 
      icon: 'add-circle-outline', 
      color: colors.error,
      route: 'ExpenseCreate'
    },
    { 
      key: 'reports', 
      label: t('reports:reports'), 
      icon: 'stats-chart-outline', 
      color: (colors as any).profit || colors.primary,
      route: 'Reports'
    },
  ];

  const handleNavigation = (route: string) => {
    const routeNames: string[] | undefined = (navigation.getState() as any)?.routeNames;
    if (routeNames?.includes(route)) {
      navigation.navigate(route as never);
      return;
    }
    const fallbackMap: Record<string, string> = {
      SalesCreate: 'Sales',
      SalesEdit: 'Sales',
      CustomerCreate: 'Customers',
      CustomerEdit: 'Customers',
      ExpenseCreate: 'Expenses',
      ExpenseEdit: 'Expenses',
    };
    const fallback = fallbackMap[route];
    if (fallback && routeNames?.includes(fallback)) {
      navigation.navigate(fallback as never);
    } else {
      console.warn(`Route "${route}" not available on the current navigator.`);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('common:logout_confirm_title'),
      t('common:logout_confirm_message'),
      [
        { text: t('common:cancel'), style: 'cancel' },
        { text: t('common:logout'), style: 'destructive', onPress: logout },
      ],
      { cancelable: true }
    );
  };

  const renderStatCard = (stat: typeof stats[0], index: number) => (
    <TouchableOpacity
      key={stat.key}
      style={[
        styles.statCard,
        { 
          backgroundColor: colors.surface, 
          width: statCardWidth,
          marginRight: numColumns > 1 && index % 2 === 0 ? cardMargin : 0,
        },
        isDark ? styles.cardDarkShadow : styles.cardLightShadow
      ]}
      onPress={() => handleNavigation(stat.route)}
      activeOpacity={0.8}
    >
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View style={[styles.statIconWrap, { backgroundColor: `${stat.color}20` }]}>
          <Ionicons name={stat.icon as any} size={22} color={stat.color} />
        </View>
        <View>
          <Text style={[styles.statLabel, { color: colors.muted }]}>{stat.label}</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderActionCard = (action: typeof quickActions[0]) => (
    <TouchableOpacity
      key={action.key}
      style={[
        styles.actionCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        isDark ? styles.cardDarkShadow : styles.cardLightShadow
      ]}
      onPress={() => handleNavigation(action.route)}
      activeOpacity={0.8}
    >
      <View style={[styles.actionIconWrap, { backgroundColor: `${action.color}20` }]}>
        <Ionicons name={action.icon as any} size={22} color={action.color} />
      </View>
      <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
      <Ionicons name="chevron-forward-outline" size={20} color={colors.muted} />
    </TouchableOpacity>
  );

  return (
    <ScreenLayout noPadding>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        style={{ backgroundColor: colors.page }} 
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        scrollEventThrottle={16}
      >
        <LinearGradient colors={headerGradientColors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.headerGradient, { paddingTop: insets.top + spacing.sm, paddingBottom: spacing.lg }] }>
          {/* overlay: dark theme slight black, light theme slight white */}
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: activeTheme === 'dark' ? '#00000010' : '#FFFFFF10' }]} />
          <View style={[styles.header, { flexDirection: 'column' }] }>
            <View style={{ flex: 1, width: '100%', paddingRight: spacing.xl }}>
              <Text style={[styles.title, { color: titleColor }]}>{t('dashboard:welcome_back')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <Text
                  style={[styles.subtitle, { color: subtitleColor, flexShrink: 1 }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {user?.name || 'User'}
                </Text>
                <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: `${colors.primary}20` }}>
                  <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>{role?.toUpperCase() || 'GUEST'}</Text>
                </View>
              </View>
            </View>
            {!!user?.avatar && (
              <View style={[styles.avatarWrap, { top: insets.top + spacing.sm, right: spacing.lg }]}>
                <Image 
                  source={{ uri: user.avatar }}
                  style={styles.avatar}
                />
              </View>
            )}
          </View>
          <View style={styles.pillsRow}>
            <View style={[styles.headerPill, { backgroundColor: colors.card || colors.surface, borderColor: colors.border, flex: 1 }]}>
              <Ionicons name="trending-up-outline" size={16} color={colors.muted} />
              <Text style={[styles.pillText, { color: colors.muted }]}>{t('dashboard:today_sales', { defaultValue: 'Bugünkü Satış' })}</Text>
              <Text style={[styles.pillValue, { color: colors.success }]}>₺3,240</Text>
            </View>
            <View style={[styles.headerPill, { backgroundColor: colors.card || colors.surface, borderColor: colors.border, flex: 1 }]}>
              <Ionicons name="wallet-outline" size={16} color={colors.muted} />
              <Text style={[styles.pillText, { color: colors.muted }]}>{t('dashboard:today_expenses', { defaultValue: 'Bugünkü Gider' })}</Text>
              <Text style={[styles.pillValue, { color: colors.error }]}>₺820</Text>
            </View>
          </View>
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
        </LinearGradient>

        <SummaryCard 
          {...mainStat}
          onPress={() => handleNavigation(mainStat.route)}
        />

        <View style={styles.statsGrid}>
          {secondaryStats.map(renderStatCard)}
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('dashboard:quick_actions')}</Text>
          <View style={styles.actionsList}>
            {quickActions.map(renderActionCard)}
          </View>
        </View>

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? spacing.lg : spacing.lg,
  },
  headerGradient: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 2,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  glassPill: {
    backgroundColor: 'rgba(255,255,255,0.66)',
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(8px)' } as any
      : {}),
  },
  pillText: { fontSize: 12 },
  pillValue: { fontSize: 12, fontWeight: '700' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarWrap: {
    position: 'absolute',
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 28,
    padding: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  statCard: {
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardLightShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  cardDarkShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  actionsList: {
    gap: spacing.sm,
  },
  actionCard: {
    borderRadius: 16,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
});

export default DashboardScreen;
