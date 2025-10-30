import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import Card from '../shared/components/Card';
import Button from '../shared/components/Button';
import colors from '../core/constants/colors';
import spacing from '../core/constants/spacing';

type Props = {
  navigation: any;
};

export default function ProfileScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { t: tSettings } = useTranslation('settings');

  const handleLogout = () => {
    // Logout logic will be added
  };

  return (
    <ScreenLayout>
      <ScrollView>
        <View style={{ gap: spacing.md }}>
          <Text style={{ fontSize: 24, fontWeight: '600' }}>{t('profile')}</Text>

          <Card>
            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 24, color: '#fff' }}>U</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '600' }}>User Name</Text>
                  <Text style={{ fontSize: 14, color: colors.muted }}>user@example.com</Text>
                </View>
              </View>
            </View>
          </Card>

          <Card>
            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: spacing.md }}>
              {t('general')}
            </Text>
            <View style={{ gap: spacing.sm }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: spacing.sm,
                }}
                onPress={() => navigation.navigate('Settings')}
              >
                <Text style={{ fontSize: 16 }}>{t('settings')}</Text>
                <Text style={{ color: colors.muted }}>›</Text>
              </TouchableOpacity>

              <View style={{ height: 1, backgroundColor: colors.border }} />

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: spacing.sm,
                }}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Text style={{ fontSize: 16 }}>{t('notifications')}</Text>
                <Text style={{ color: colors.muted }}>›</Text>
              </TouchableOpacity>
            </View>
          </Card>

          <Button
            title={t('logout')}
            onPress={handleLogout}
            style={{ backgroundColor: '#ef4444', marginTop: spacing.md }}
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

