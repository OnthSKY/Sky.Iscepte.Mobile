import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import colors from '../../core/constants/colors';
import spacing from '../../core/constants/spacing';
import Modal from './Modal';

type Option = { label: string; value: string };

type Props = {
  value?: string;
  options: Option[];
  placeholder?: string;
  onChange?: (value: string) => void;
};

export default function Select({ value, options, placeholder = 'Seçiniz', onChange }: Props) {
  const selected = options.find((o) => o.value === value)?.label || placeholder;
  const [open, setOpen] = useState(false);
  const data = useMemo(() => options, [options]);
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setOpen(true)}>
        <Text style={styles.text}>{selected}</Text>
      </TouchableOpacity>
      <Modal visible={open} onRequestClose={() => setOpen(false)}>
        <FlatList
          data={data}
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
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  button: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  text: { color: colors.text },
});


