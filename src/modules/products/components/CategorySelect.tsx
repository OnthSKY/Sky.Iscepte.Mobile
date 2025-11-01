import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import Modal from '../../../shared/components/Modal';
import AddCategoryModal from './AddCategoryModal';

type Props = {
  value?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  onChange?: (value: string) => void;
  onCategoryAdded?: (categoryName: string) => void;
};

export default function CategorySelect({ value, options, placeholder = 'Seçiniz', onChange, onCategoryAdded }: Props) {
  const { t } = useTranslation('stock');
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const selected = options.find((o) => o.value === value)?.label || placeholder;
  const [open, setOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleBackPress = () => {
    setOpen(false);
    navigation.navigate('StockDashboard');
  };

  const handleAddSuccess = (categoryName: string) => {
    // Call onChange with the new category name
    onChange?.(categoryName);
    setAddModalOpen(false);
    setOpen(false);
    // Notify parent to add the new category to the list
    onCategoryAdded?.(categoryName);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setOpen(true)}>
        <Text style={styles.text} numberOfLines={1}>{selected}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.muted} />
      </TouchableOpacity>
      
      <Modal visible={open} onRequestClose={handleBackPress}>
        <View style={styles.modalContent}>
          {/* Header with back button */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('category', { defaultValue: 'Kategori' })}
            </Text>
            <View style={{ width: 32 }} />
          </View>

          <FlatList
            data={options}
            keyExtractor={(item) => String(item.value)}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ paddingVertical: spacing.md }}
                onPress={() => {
                  onChange?.(item.value);
                  setOpen(false);
                }}
              >
                <Text style={{ color: colors.text }}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
          
          <View style={styles.addButtonContainer}>
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.md }} />
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setOpen(false);
                setAddModalOpen(true);
              }}
            >
              <Text style={styles.addButtonText}>+ {t('add_new_category', { defaultValue: 'Yeni Kategori Ekle' })}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AddCategoryModal
        visible={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        existingCategories={options.map(opt => opt.value)}
      />
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {},
  button: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 44,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: { color: colors.text, fontSize: 16, lineHeight: 22, flex: 1 },
  modalContent: {
    maxHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  addButtonContainer: {
    paddingHorizontal: spacing.md,
  },
  addButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

