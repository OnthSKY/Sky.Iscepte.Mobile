import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Button, TextInput, Text, Surface } from 'react-native-paper';
import spacing from '../core/constants/spacing';
import { required, isEmail, minLength } from '../core/utils/validators';
import ThemeGradientToggle from '../shared/components/ThemeGradientToggle';
import { useAppStore } from '../store/useAppStore';
import LanguagePicker from '../shared/components/LanguagePicker';

type Props = {
  navigation: any;
};

export default function RegisterScreen({ navigation }: Props) {
  const { t } = useTranslation('register');
  const themePreference = useAppStore(s => s.themePreference);
  const isDark = themePreference === 'dark';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [k: string]: string | undefined }>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next: { [k: string]: string | undefined } = {};
    next.name = required(formData.name) || (minLength(2)(formData.name) ?? undefined);
    if (!formData.email) next.email = t('errors.email_required');
    else next.email = isEmail(formData.email);
    next.phone = required(formData.phone);
    const pwdMin = minLength(6)(formData.password);
    next.password = required(formData.password) || pwdMin;
    next.confirmPassword = required(formData.confirmPassword) ||
      (formData.password !== formData.confirmPassword ? t('errors.passwords_mismatch') : undefined);
    setErrors(next);
    return Object.values(next).every((e) => !e);
  };

  const handleRegister = () => {
    if (!validate()) return;
    setSubmitting(true);
    // Simulate success; integrate API when ready
    setTimeout(() => {
      setSubmitting(false);
      navigation.navigate('Login');
    }, 500);
  };

  const handleLogin = () => navigation.navigate('Login');

  return (
    <LinearGradient
      colors={isDark ? ['#0f2027', '#203a43', '#2c5364'] : ['#f6f9ff', '#e9efff', '#dde7ff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ padding: spacing.xl, flexGrow: 1, justifyContent: 'center' }}>
        <Surface style={{ padding: spacing.xl, borderRadius: 16, elevation: 4, backgroundColor: 'rgba(255,255,255,0.95)' }}>
        <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
          <Text variant="headlineSmall" style={{ fontWeight: '700' }}>{t('title')}</Text>
          <Text variant="bodyMedium" style={{ opacity: 0.7, marginTop: 4 }}>{t('subtitle')}</Text>
        </View>

        <View style={{ gap: spacing.md }}>
          <TextInput
            label={t('name')}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            mode="outlined"
            error={!!errors.name}
          />
          {errors.name ? <Text style={{ color: '#b00020' }}>{errors.name}</Text> : null}

          <TextInput
            label={t('email')}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.email}
          />
          {errors.email ? <Text style={{ color: '#b00020' }}>{errors.email}</Text> : null}

          <TextInput
            label={t('phone')}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            mode="outlined"
            keyboardType="phone-pad"
            error={!!errors.phone}
          />
          {errors.phone ? <Text style={{ color: '#b00020' }}>{errors.phone}</Text> : null}

          <TextInput
            label={t('password')}
            value={formData.password}
            onChangeText={(text) => {
              const next = { ...formData, password: text };
              setFormData(next);
              // live validate confirm match if user typed confirm already
              if (next.confirmPassword) {
                setErrors((prev) => ({
                  ...prev,
                  confirmPassword:
                    next.password !== next.confirmPassword ? t('errors.passwords_mismatch') : undefined,
                }));
              }
            }}
            mode="outlined"
            secureTextEntry
            error={!!errors.password}
          />
          {errors.password ? <Text style={{ color: '#b00020' }}>{errors.password}</Text> : null}

          <TextInput
            label={t('confirm_password')}
            value={formData.confirmPassword}
            onChangeText={(text) => {
              const next = { ...formData, confirmPassword: text };
              setFormData(next);
              // live validate mismatch
              setErrors((prev) => ({
                ...prev,
                confirmPassword:
                  next.password !== next.confirmPassword ? t('errors.passwords_mismatch') : undefined,
              }));
            }}
            mode="outlined"
            secureTextEntry
            error={!!errors.confirmPassword}
          />
          {errors.confirmPassword ? <Text style={{ color: '#b00020' }}>{errors.confirmPassword}</Text> : null}
        </View>

        <Button mode="contained" onPress={handleRegister} loading={submitting} disabled={submitting} style={{ marginTop: spacing.lg }}>
          {t('register')}
        </Button>

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md }}>
          <Text style={{ opacity: 0.7, color: isDark ? '#cfd8dc' : undefined }}>{t('have_account')}</Text>
          <Text style={{ color: '#2F6FED', fontWeight: '600' }} onPress={handleLogin}>
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

