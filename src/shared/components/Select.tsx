import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../../core/contexts/ThemeContext';
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
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const selected = options.find((o) => o.value === value)?.label || placeholder;
  const [open, setOpen] = useState(false);
  const data = useMemo(() => options, [options]);
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setOpen(true)}>
        <Text style={styles.text} numberOfLines={1}>{selected}</Text>
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
  },
  text: { color: colors.text, fontSize: 16, lineHeight: 22 },
});


