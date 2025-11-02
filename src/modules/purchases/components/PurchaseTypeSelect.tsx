import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import Modal from '../../../shared/components/Modal';
import AddPurchaseTypeModal from '../../../shared/components/AddPurchaseTypeModal';
import { PurchaseType } from '../services/purchaseTypeService';

type Props = {
  value?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  onChange?: (value: string) => void;
  onTypeAdded?: () => void;
};

export default function PurchaseTypeSelect({ value, options, placeholder = 'Seçiniz', onChange, onTypeAdded }: Props) {
  const { t } = useTranslation('purchases');
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const selected = options.find((o) => o.value === value)?.label || placeholder;
  const [open, setOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleAddSuccess = (type: PurchaseType) => {
    // Call onChange with the new type's ID
    onChange?.(String(type.id));
    setAddModalOpen(false);
    setOpen(false);
    // Notify parent to refresh the types list
    onTypeAdded?.();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setOpen(true)}>
        <Text style={styles.text} numberOfLines={1}>{selected}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.muted} />
      </TouchableOpacity>
      
      <Modal visible={open} onRequestClose={() => setOpen(false)}>
        <View style={styles.modalContent}>
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
              <Text style={styles.addButtonText}>+ {t('add_new_type', { defaultValue: 'Add New Type' })}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AddPurchaseTypeModal
        visible={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAddSuccess}
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

