import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';
import { useDashboard } from '../core/hooks/useDashboard';
import { useAppStore } from '../store/useAppStore';
import { DashboardHeader } from '../shared/components/dashboard/DashboardHeader';
import { StatCard } from '../shared/components/dashboard/StatCard';
import { QuickActionCard } from '../shared/components/dashboard/QuickActionCard';
import SummaryCard from '../shared/components/SummaryCard';
import LoadingState from '../shared/components/LoadingState';
import ErrorState from '../shared/components/ErrorState';
import Modal from '../shared/components/Modal';
import { employeeService } from '../modules/employees/services/employeeService';
import { Employee } from '../modules/employees/store/employeeStore';

/**
 * AdminDashboardScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only responsible for composing admin dashboard UI
 * Dependency Inversion: Depends on useDashboard hook and reusable components
 */
export default function AdminDashboardScreen() {
  const { t } = useTranslation(['dashboard', 'common']);
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { data, loading, error, role, navigate } = useDashboard();
  const { impersonateUser, stopImpersonating, originalRole, impersonatedUserId } = useAppStore();
  
  // User switching state
  const [userPickerVisible, setUserPickerVisible] = useState(false);
  const [users, setUsers] = useState<Employee[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load users list
  useEffect(() => {
    if (userPickerVisible && users.length === 0) {
      loadUsers();
    }
  }, [userPickerVisible]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await employeeService.list({
        page: 1,
        pageSize: 100,
        orderColumn: 'name',
        orderDirection: 'asc',
      });
      setUsers(response.items || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserSelect = async (user: Employee) => {
    try {
      await impersonateUser(String(user.id), user.role as 'admin' | 'owner' | 'staff' | 'guest');
      setUserPickerVisible(false);
      // Force re-render by navigating away and back
      // This will cause RootNavigator to re-render with new role
    } catch (err) {
      Alert.alert(
        t('common:error', { defaultValue: 'Hata' }),
        t('dashboard:impersonate_error', { defaultValue: 'Kullanıcıya geçiş yapılamadı' })
      );
    }
  };

  const handleStopImpersonating = async () => {
    await stopImpersonating();
    // Force re-render
  };

  // Layout calculations
  const layoutConfig = useMemo(() => {
    const numColumns = width > 650 ? 2 : 1;
    const cardMargin = spacing.md;
    const statCardWidth = numColumns > 1 
      ? (width - spacing.lg * 2 - cardMargin) / 2 
      : width - spacing.lg * 2;
    return { numColumns, cardMargin, statCardWidth };
  }, [width]);

  // Header pills configuration for admin - removed duplicates that are already in stats
  // Header pills removed to avoid duplication with stats below
  const headerPills = useMemo(() => [], []);

  if (loading) {
    return (
      <ScreenLayout>
        <LoadingState />
      </ScreenLayout>
    );
  }

  if (error || !data) {
    return (
      <ScreenLayout>
        <ErrorState
          error={error || new Error('Failed to load dashboard data')}
          showRetry={false}
        />
      </ScreenLayout>
    );
  }

  // Check if currently impersonating
  const isImpersonating = originalRole !== null && originalRole === 'admin';

  return (
    <ScreenLayout noPadding>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        style={{ backgroundColor: colors.page }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        scrollEventThrottle={16}
      >
        {/* Impersonation Banner */}
        {isImpersonating && (
          <View style={[styles.impersonationBanner, { backgroundColor: colors.warning || '#FFA500', borderBottomColor: colors.border }]}>
            <View style={styles.impersonationContent}>
              <Ionicons name="person-outline" size={20} color="white" />
              <Text style={styles.impersonationText}>
                {t('dashboard:viewing_as_user', { defaultValue: 'Kullanıcı görünümünde' })}
              </Text>
              <TouchableOpacity onPress={handleStopImpersonating} style={styles.stopButton}>
                <Text style={styles.stopButtonText}>
                  {t('dashboard:return_to_admin', { defaultValue: 'Admin\'e Dön' })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <DashboardHeader
          role={role}
          showPills={headerPills.length > 0}
          pills={headerPills}
        />

        <SummaryCard
          label={data.mainStat.label}
          value={data.mainStat.value}
          icon={data.mainStat.icon}
          color={data.mainStat.color}
          hideByDefault={true}
        />

        <View style={styles.statsGrid}>
          {data.secondaryStats.map((stat, index) => (
            <StatCard
              key={stat.key}
              stat={stat}
              onPress={() => navigate(stat.route)}
              width={layoutConfig.statCardWidth}
              marginRight={layoutConfig.numColumns > 1 && index % 2 === 0 ? layoutConfig.cardMargin : 0}
              hideByDefault={true}
            />
          ))}
        </View>

        {/* User Switch Button - Only show when not impersonating */}
        {!isImpersonating && originalRole === null && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.switchButton, { backgroundColor: colors.primary, borderColor: colors.border }]}
              onPress={() => setUserPickerVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="people-outline" size={24} color="white" />
              <Text style={styles.switchButtonText}>
                {t('dashboard:view_as_user', { defaultValue: 'Kullanıcı Görünümüne Geç' })}
              </Text>
              <Ionicons name="chevron-forward-outline" size={20} color="white" style={{ opacity: 0.7 }} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('dashboard:quick_actions', { defaultValue: 'Hızlı İşlemler' })}
          </Text>
          <View style={styles.actionsList}>
            {data.quickActions.map((action) => (
              <QuickActionCard
                key={action.key}
                action={action}
                onPress={() => navigate(action.route)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* User Picker Modal */}
      <Modal
        visible={userPickerVisible}
        onRequestClose={() => setUserPickerVisible(false)}
        containerStyle={[styles.modalContainer, { backgroundColor: colors.surface }]}
      >
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {t('dashboard:select_user', { defaultValue: 'Kullanıcı Seç' })}
          </Text>
          <TouchableOpacity onPress={() => setUserPickerVisible(false)}>
            <Ionicons name="close-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        {loadingUsers ? (
          <View style={styles.modalLoading}>
            <Text style={{ color: colors.muted }}>{t('common:loading', { defaultValue: 'Yükleniyor...' })}</Text>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.userItem, { borderBottomColor: colors.border }]}
                onPress={() => handleUserSelect(item)}
                activeOpacity={0.7}
              >
                <View style={styles.userInfo}>
                  <Ionicons
                    name={
                      item.role === 'admin' ? 'shield-outline' :
                      item.role === 'owner' ? 'business-outline' :
                      'person-outline'
                    }
                    size={24}
                    color={colors.primary}
                  />
                  <View style={styles.userDetails}>
                    <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.userRole, { color: colors.muted }]}>
                      {t(`common:role_${item.role}`, { defaultValue: item.role })}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward-outline" size={20} color={colors.muted} />
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
            style={styles.userList}
          />
        )}
      </Modal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  impersonationBanner: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  impersonationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  impersonationText: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  stopButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  stopButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
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
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.sm,
  },
  switchButtonText: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 16,
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalLoading: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  userList: {
    maxHeight: 400,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 13,
  },
});


