import React from 'react';
import { View, Text } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import spacing from '../../core/constants/spacing';
import { useTheme } from '../../core/contexts/ThemeContext';

type Props = {
  visible: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
};

export default function ConfirmDialog({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: Props) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} onRequestClose={onCancel}>
      <View style={{ gap: spacing.md }}>
        {title && <Text style={{ fontSize: 18, fontWeight: '600' }}>{title}</Text>}
        <Text style={{ fontSize: 14, color: colors.text }}>{message}</Text>
        <View style={{ flexDirection: 'row', gap: spacing.md, justifyContent: 'flex-end' }}>
          <Button
            title={cancelText}
            onPress={onCancel}
            style={{ backgroundColor: colors.muted, paddingHorizontal: spacing.lg }}
          />
          <Button
            title={confirmText}
            onPress={onConfirm}
            style={{ paddingHorizontal: spacing.lg }}
          />
        </View>
      </View>
    </Modal>
  );
}

