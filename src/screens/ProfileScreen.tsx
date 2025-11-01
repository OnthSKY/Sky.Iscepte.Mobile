import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';
import { useAppStore } from '../store/useAppStore';
import LanguagePicker from '../shared/components/LanguagePicker';
import ThemeGradientToggle from '../shared/components/ThemeGradientToggle';
import ConfirmDialog from '../shared/components/ConfirmDialog';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ProfileScreen() {
  const { t } = useTranslation(['common', 'settings']);
  const { colors, activeTheme } = useTheme();
  const user = useAppStore((s: any) => s.user);
  const role = useAppStore((s: any) => s.role);
  const logout = useAppStore((s: any) => s.logout);
  const [logoutVisible, setLogoutVisible] = React.useState(false);

  const styles = getStyles({ colors });
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U';

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
          <Text style={styles.name}>{user?.name || 'User Name'}</Text>
          <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{role?.toUpperCase() || 'GUEST'}</Text>
          </View>
        </LinearGradient>

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

        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
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
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
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
      gap: spacing.md,
    },
    groupTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.muted,
      textTransform: 'uppercase',
      marginBottom: spacing.xs,
      paddingHorizontal: spacing.xs,
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
  });

