import React from 'react';
import { View, Text } from 'react-native';
import spacing from '../../core/constants/spacing';
import colors from '../../core/constants/colors';

type Props = { title?: string; subtitle?: string };

export default function EmptyState({ title = 'Kayıt bulunamadı', subtitle = 'Filtreleri değiştirin ya da yeni kayıt ekleyin.' }: Props) {
  return (
    <View style={{ padding: spacing.xl, alignItems: 'center' }}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.sm }}>{title}</Text>
      <Text style={{ color: colors.muted, textAlign: 'center' }}>{subtitle}</Text>
    </View>
  );
}


