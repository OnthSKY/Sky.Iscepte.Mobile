import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';
import { useAppStore } from '../store/useAppStore';
import { useProfileQuery } from '../core/hooks/useProfileQuery';
import LanguagePicker from '../shared/components/LanguagePicker';
import ThemeGradientToggle from '../shared/components/ThemeGradientToggle';
import ConfirmDialog from '../shared/components/ConfirmDialog';
import LoadingState from '../shared/components/LoadingState';
import ErrorReportModal from '../shared/components/ErrorReportModal';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ProfileScreen() {
  const { t } = useTranslation(['common', 'settings']);
  const { colors, activeTheme } = useTheme();
  const logout = useAppStore((s: any) => s.logout);
  const [logoutVisible, setLogoutVisible] = React.useState(false);
  const [contactModalVisible, setContactModalVisible] = React.useState(false);
  
  // Fetch profile from API
  const { data: profile, isLoading: isLoadingProfile } = useProfileQuery();
  const userFromStore = useAppStore((s: any) => s.user);
  const setUser = useAppStore((s: any) => s.setUser);
  const user = userFromStore || profile;
  const role = useAppStore((s: any) => s.role);
  
  // Update store when profile is fetched
  React.useEffect(() => {
    if (profile && !userFromStore) {
      setUser(profile);
    }
  }, [profile, userFromStore, setUser]);
  
  const isLoading = isLoadingProfile && !userFromStore;

  const styles = getStyles({ colors });
  const initials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U';
  
  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.name || t('common:default_user');
  
  const companyName = user?.company || user?.ownerCompanyName || null;

  if (isLoading && !user) {
    return (
      <ScreenLayout title={t('profile')}>
        <LoadingState />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={t('profile')} headerRight={<LanguagePicker showLabel={false} variant="compact" />}>
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          {companyName && (
            <Text style={styles.company}>{companyName}</Text>
          )}
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{role?.toUpperCase() || t('common:guest')}</Text>
          </View>
        </LinearGradient>

        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>{t('settings:personal_info')}</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color={colors.muted} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('common:name')}</Text>
                <Text style={styles.infoValue}>{displayName}</Text>
              </View>
            </View>
            {user?.phone && (
              <View style={[styles.infoRow, styles.infoRowMargin]}>
                <Ionicons name="call-outline" size={20} color={colors.muted} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t('common:phone')}</Text>
                  <Text style={styles.infoValue}>{user.phone}</Text>
                </View>
              </View>
            )}
            {companyName && (
              <View style={[styles.infoRow, styles.infoRowMargin]}>
                <Ionicons name="business-outline" size={20} color={colors.muted} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>
                    {user?.role === 'owner' 
                      ? t('settings:company')
                      : t('settings:works_for')}
                  </Text>
                  <Text style={styles.infoValue}>{companyName}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>{t('settings:preferences')}</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('settings:language')}</Text>
            <LanguagePicker showLabel={false} />
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('settings:theme')}</Text>
            <ThemeGradientToggle />
          </View>
        </View>
        
        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>{t('settings:account')}</Text>
          <TouchableOpacity style={styles.card} onPress={() => setLogoutVisible(true)}>
            <View style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={22} color={colors.error} />
              <Text style={styles.logoutButtonText}>{t('common:logout')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsGroup}>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setContactModalVisible(true)}
            >
              <View style={styles.settingItemLeft}>
                <Ionicons name="mail-outline" size={22} color={colors.primary} />
                <View style={styles.settingItemContent}>
                  <Text style={[styles.settingItemTitle, { color: colors.text }]}>
                    {t('common:contact_us', { defaultValue: 'Bizimle İletişime Geç' })}
                  </Text>
                  <Text style={[styles.settingItemDesc, { color: colors.muted }]}>
                    {t('common:contact_us_desc', { defaultValue: 'Sorularınız, önerileriniz veya sorunlarınız için bize ulaşın' })}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>{t('common:version', { version: '1.0.0' })}</Text>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={logoutVisible}
        title={t('common:logout_confirm_title')}
        message={t('common:logout_confirm_message')}
        confirmText={t('common:logout')}
        cancelText={t('common:cancel')}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={logout}
      />

      <ErrorReportModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
        errorCategory="business"
        errorMessage={t('common:contact_form', { defaultValue: 'İletişim Formu' })}
        context="profile-contact"
        mode="contact"
      />
    </ScreenLayout>
  );
}

const getStyles = ({ colors }: { colors: any }) =>
  StyleSheet.create({
    container: {
      paddingBottom: spacing.lg,
    },
    header: {
      alignItems: 'center',
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
      paddingHorizontal: spacing.lg,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#fff',
    },
    name: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#fff',
      textShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
    },
    email: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.8)',
      marginTop: 4,
    },
    roleBadge: {
      marginTop: spacing.sm,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    roleText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#fff',
    },
    settingsGroup: {
      paddingHorizontal: spacing.lg,
      marginTop: spacing.xl,
      gap: spacing.sm,
    },
    groupTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.muted,
      textTransform: 'uppercase',
      marginBottom: 4,
      paddingHorizontal: spacing.xs,
      letterSpacing: 0.5,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    logoutButtonText: {
      color: colors.error,
      fontWeight: 'bold',
      fontSize: 16,
    },
    footer: {
      marginTop: spacing.xl,
      alignItems: 'center',
    },
    versionText: {
      color: colors.muted,
      fontSize: 12,
    },
    company: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.7)',
      marginTop: 4,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    infoRowMargin: {
      marginTop: spacing.md,
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 12,
      color: colors.muted,
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
    },
    settingItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: spacing.md,
    },
    settingItemContent: {
      flex: 1,
    },
    settingItemTitle: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: spacing.xs / 2,
    },
    settingItemDesc: {
      fontSize: 12,
    },
  });

