import React from 'react';
import { View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Button, TextInput, Text, Surface } from 'react-native-paper';
import spacing from '../core/constants/spacing';
import ThemeGradientToggle from '../shared/components/ThemeGradientToggle';
import LanguagePicker from '../shared/components/LanguagePicker';
import { useTheme } from '../core/contexts/ThemeContext';
import { useRegister } from '../core/hooks/useAuth';

type Props = {
  navigation: any;
};

/**
 * RegisterScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes register UI
 * Dependency Inversion: Depends on useAuth hook, not concrete implementation
 */
export default function RegisterScreen({ navigation }: Props) {
  const { t } = useTranslation('register');
  const { colors, activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';

  const {
    formData,
    updateField,
    errors,
    submitting,
    handleRegister,
  } = useRegister();

  const handleLogin = () => navigation.navigate('Login');

  const onRegisterSuccess = async () => {
    const success = await handleRegister();
    if (success) {
      navigation.navigate('Login');
    }
  };

  return (
    <LinearGradient
      colors={colors.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ padding: spacing.xl, flexGrow: 1, justifyContent: 'center' }}>
        <Surface style={{ padding: spacing.xl, borderRadius: 16, elevation: 4, backgroundColor: colors.surface }}>
        <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
          <Text variant="headlineSmall" style={{ fontWeight: '700', color: colors.text }}>{t('title')}</Text>
          <Text variant="bodyMedium" style={{ color: colors.muted, marginTop: 4 }}>{t('subtitle')}</Text>
        </View>

        <View style={{ gap: spacing.md }}>
          <TextInput
            label={t('name')}
            value={formData.name}
            onChangeText={(text) => updateField('name', text)}
            mode="outlined"
            error={!!errors.name}
          />
          {errors.name ? <Text style={{ color: colors.error }}>{errors.name}</Text> : null}

          <TextInput
            label={t('email')}
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.email}
          />
          {errors.email ? <Text style={{ color: colors.error }}>{errors.email}</Text> : null}

          <TextInput
            label={t('phone')}
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            mode="outlined"
            keyboardType="phone-pad"
            error={!!errors.phone}
          />
          {errors.phone ? <Text style={{ color: colors.error }}>{errors.phone}</Text> : null}

          <TextInput
            label={t('password')}
            value={formData.password}
            onChangeText={(text) => updateField('password', text)}
            mode="outlined"
            secureTextEntry
            error={!!errors.password}
          />
          {errors.password ? <Text style={{ color: colors.error }}>{errors.password}</Text> : null}

          <TextInput
            label={t('confirm_password')}
            value={formData.confirmPassword}
            onChangeText={(text) => updateField('confirmPassword', text)}
            mode="outlined"
            secureTextEntry
            error={!!errors.confirmPassword}
          />
          {errors.confirmPassword ? <Text style={{ color: colors.error }}>{errors.confirmPassword}</Text> : null}
        </View>

        <Button mode="contained" onPress={onRegisterSuccess} loading={submitting} disabled={submitting} style={{ marginTop: spacing.lg }}>
          {t('register')}
        </Button>

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md }}>
          <Text style={{ color: colors.muted }}>{t('have_account')}</Text>
          <Text style={{ color: colors.primary, fontWeight: '600' }} onPress={handleLogin}>
            {t('login')}
          </Text>
        </View>

        <View style={{ marginTop: spacing.md }}>
          <LanguagePicker centeredLabel />
        </View>
        <View style={{ marginTop: spacing.lg }}>
          <ThemeGradientToggle />
        </View>
      </Surface>

    </ScrollView>
    </LinearGradient>
  );
}

