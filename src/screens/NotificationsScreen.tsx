import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../shared/layouts/ScreenLayout';
import Card from '../shared/components/Card';
import EmptyState from '../shared/components/EmptyState';
import { useTheme } from '../core/contexts/ThemeContext';
import spacing from '../core/constants/spacing';

type Props = {
  navigation: any;
};

export default function NotificationsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <ScreenLayout>
      <ScrollView>
        <View style={{ gap: spacing.md }}>
          <Text style={{ fontSize: 24, fontWeight: '600' }}>{t('notifications')}</Text>

          {/* Notifications list will be added when notification data is available */}
          <EmptyState
            title="Bildirim yok"
            subtitle="Henüz bildirim bulunmuyor"
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

