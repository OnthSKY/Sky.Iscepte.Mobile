import React from 'react';
import { Modal as RNModal, View, StyleSheet } from 'react-native';
import spacing from '../../core/constants/spacing';
import colors from '../../core/constants/colors';

type Props = {
  visible: boolean;
  onRequestClose?: () => void;
  children?: React.ReactNode;
};

export default function Modal({ visible, onRequestClose, children }: Props) {
  return (
    <RNModal transparent visible={visible} onRequestClose={onRequestClose} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>{children}</View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: colors.background, padding: spacing.lg, borderRadius: 12, width: '85%' },
});


