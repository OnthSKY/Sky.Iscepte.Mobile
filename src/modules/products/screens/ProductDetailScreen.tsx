import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '../../../shared/layouts/ScreenLayout';

export default function ProductDetailScreen() {
  const { t } = useTranslation(['products']);
  return (
    <ScreenLayout title={t('products:product_details', { defaultValue: 'Ürün detayları' })}>
      <View style={{ padding: 16 }}>
        <Text>{t('products:details_placeholder', { defaultValue: 'Ürün detay içeriği buraya gelecek.' })}</Text>
      </View>
    </ScreenLayout>
  );
}


