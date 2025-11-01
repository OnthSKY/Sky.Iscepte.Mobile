import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import Modal from '../../../shared/components/Modal';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import spacing from '../../../core/constants/spacing';
import notificationService from '../../../shared/services/notificationService';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: (categoryName: string) => void;
  existingCategories?: string[];
};

export default function AddCategoryModal({ visible, onClose, onSuccess, existingCategories = [] }: Props) {
  const { t } = useTranslation('stock');
  const { colors } = useTheme();
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = () => {
    const trimmed = categoryName.trim();
    
    if (!trimmed) {
      notificationService.error(t('category_name_required', { defaultValue: 'Kategori adı gereklidir' }));
      return;
    }

    // Check if category already exists (case-insensitive)
    const exists = existingCategories.some(
      cat => cat.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      notificationService.error(t('category_already_exists', { defaultValue: 'Bu kategori zaten mevcut' }));
      return;
    }

    onSuccess(trimmed);
    setCategoryName('');
  };

  const handleClose = () => {
    setCategoryName('');
    onClose();
  };

  return (
    <Modal visible={visible} onRequestClose={handleClose}>
      <View style={styles.modalContent}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('add_new_category', { defaultValue: 'Yeni Kategori Ekle' })}
        </Text>

        <Input
          value={categoryName}
          onChangeText={setCategoryName}
          placeholder={t('category_name', { defaultValue: 'Kategori Adı' })}
          autoFocus
          onSubmitEditing={handleSubmit}
        />

        <View style={styles.actions}>
          <Button
            title={t('common:cancel', { defaultValue: 'İptal' })}
            onPress={handleClose}
            style={[styles.button, { backgroundColor: colors.muted }]}
          />
          <Button
            title={t('common:add', { defaultValue: 'Ekle' })}
            onPress={handleSubmit}
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});

