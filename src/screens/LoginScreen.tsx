import React from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, TextInput, Text, Surface, Checkbox } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LanguagePicker from '../shared/components/LanguagePicker';
import ThemeGradientToggle from '../shared/components/ThemeGradientToggle';
import { useTheme } from '../core/contexts/ThemeContext';
import { useLogin } from '../core/hooks/useAuth';

type Props = NativeStackScreenProps<any>;

/**
 * LoginScreen - SOLID Principles Applied
 * 
 * Single Responsibility: Only composes login UI
 * Dependency Inversion: Depends on useAuth hook, not concrete implementation
 */
export default function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation('login');
  const { colors, activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';
  
  const {
    username,
    setUsername,
    password,
    setPassword,
    passwordVisible,
    setPasswordVisible,
    rememberMe,
    setRememberMe,
    error,
    usernameError,
    passwordError,
    loading,
    handleLogin,
  } = useLogin();

  return (
    <LinearGradient
      colors={colors.gradient as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'center', padding: 20 }}
      >
        <Surface style={{
          padding: 24,
          borderRadius: 16,
          elevation: 5,
          backgroundColor: colors.surface,
          shadowColor: '#000',
        }}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text variant="headlineMedium" style={{ color: colors.primaryDark, fontWeight: '700' }}>
              {t('title') || 'İşÇepte Giriş'}
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.muted, marginTop: 4 }}>
              {t('welcome_back') || 'Hoş geldiniz'}
            </Text>
          </View>

          <TextInput
            label={t('username')}
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            autoCapitalize="none"
            style={{ marginBottom: 12 }}
            error={!!usernameError}
          />
          {usernameError && <Text style={{ color: colors.error, marginBottom: 8 }}>{usernameError}</Text>}

          <TextInput
            label={t('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            mode="outlined"
            error={!!passwordError}
            right={
              <TextInput.Icon
                icon={passwordVisible ? 'eye-off' : 'eye'}
                onPress={() => setPasswordVisible(v => !v)}
                forceTextInputFocus={false}
              />
            }
          />
          {passwordError && <Text style={{ color: colors.error, marginBottom: 8 }}>{passwordError}</Text>}

          {error && <Text style={{ color: colors.error, marginBottom: 12 }}>{error}</Text>}

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Checkbox.Android
                status={rememberMe ? 'checked' : 'unchecked'}
                onPress={() => setRememberMe(v => !v)}
              />
              <Text onPress={() => setRememberMe(v => !v)}>{t('remember_me') || 'Beni hatırla'}</Text>
            </View>
            <Button mode="text" onPress={() => navigation.navigate('Register')} compact>
              {t('sign_up')}
            </Button>
          </View>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={{ borderRadius: 10, marginTop: 8 }}
            contentStyle={{ paddingVertical: 6 }}
          >
            {t('login')}
          </Button>

          <View style={{ marginTop: 20 }}>
            <LanguagePicker centeredLabel />
          </View>
        </Surface>

        <View style={{ marginTop: 20 }}>
          <ThemeGradientToggle />
        </View>

        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <Text variant="labelSmall" style={{ color: colors.muted }}>SKY · Yazılım Ekibi</Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
