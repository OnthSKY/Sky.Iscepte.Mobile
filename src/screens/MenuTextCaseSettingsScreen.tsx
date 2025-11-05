import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import { useTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../store/useAppStore';
import { MenuTextCase } from '../core/config/appConstants';

/**
 * Menu Text Case Settings Screen
 * Allows users to choose between normal, uppercase, and lowercase for menu text
 */
export default function MenuTextCaseSettingsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation(['settings', 'common']);
  const { colors } = useTheme();
  const menuTextCase = useAppStore((s) => s.menuTextCase);
  const setMenuTextCase = useAppStore((s) => s.setMenuTextCase);

  const options = [
    {
      value: MenuTextCase.NORMAL,
      label: t('settings:menu_text_case_normal', { defaultValue: 'Normal' }),
      desc: t('settings:menu_text_case_normal_desc', { defaultValue: 'Metinler orijinal haliyle görüntülenir' }),
      icon: 'text-outline',
    },
    {
      value: MenuTextCase.UPPERCASE,
      label: t('settings:menu_text_case_uppercase', { defaultValue: 'BÜYÜK HARF' }),
      desc: t('settings:menu_text_case_uppercase_desc', { defaultValue: 'Tüm menü metinleri büyük harfle görüntülenir' }),
      icon: 'text-outline',
    },
    {
      value: MenuTextCase.LOWERCASE,
      label: t('settings:menu_text_case_lowercase', { defaultValue: 'küçük harf' }),
      desc: t('settings:menu_text_case_lowercase_desc', { defaultValue: 'Tüm menü metinleri küçük harfle görüntülenir' }),
      icon: 'text-outline',
    },
  ];

  const styles = getStyles(colors);

  const handleBackPress = () => {
    navigation.navigate('GeneralModuleSettings');
  };

  const handleSelect = async (caseType: MenuTextCase) => {
    await setMenuTextCase(caseType);
  };

  return (
    <ScreenLayout 
      title={t('settings:menu_text_case', { defaultValue: 'Menü Metin Boyutu' })}
      subtitle={t('settings:menu_text_case_subtitle', { defaultValue: 'Menü metinlerinin görünümünü seçin' })}
      showBackButton
      onBackPress={handleBackPress}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.description}>
          {t('settings:menu_text_case_description', { defaultValue: 'Menü öğelerinin yazı tipini seçin. Bu ayar tüm sistemdeki menü metinlerini etkiler.' })}
        </Text>

        <View style={styles.optionsList}>
          {options.map((option) => {
            const isSelected = menuTextCase === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  isSelected && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => handleSelect(option.value)}
              >
                <View style={styles.optionContent}>
                  <View style={[styles.iconContainer, { backgroundColor: isSelected ? colors.primary + '20' : colors.page }]}>
                    <Ionicons 
                      name={option.icon as any} 
                      size={24} 
                      color={isSelected ? colors.primary : colors.muted} 
                    />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, { color: isSelected ? colors.primary : colors.text }]}>
                      {option.label}
                    </Text>
                    <Text style={styles.optionDesc}>
                      {option.desc}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  description: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  optionsList: {
    gap: spacing.md,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  optionDesc: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
  },
});

