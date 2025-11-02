import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';

/**
 * Owner Settings Screen (Deprecated - Use module-specific settings screens instead)
 * This screen is kept for backward compatibility but should not be used
 */
export default function OwnerSettingsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['settings', 'common']);
  const { colors } = useTheme();

  const handleBackPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <ScreenLayout 
      title={t('settings:deprecated', { defaultValue: 'Bu ekran kullanımdan kaldırılmıştır' })}
      showBackButton
      onBackPress={handleBackPress}
    >
      <View style={styles.container}>
        <Text style={[styles.errorText, { color: colors.muted }]}>
          {t('settings:use_module_settings', { defaultValue: 'Lütfen modül bazlı ayar ekranlarını kullanın' })}
        </Text>
      </View>
    </ScreenLayout>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    padding: spacing.xl,
  },
});

