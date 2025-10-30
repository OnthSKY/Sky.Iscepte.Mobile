import React from 'react';
import { Modal as RNModal, View, StyleSheet } from 'react-native';
import spacing from '../../core/constants/spacing';
import { useTheme } from '../../core/contexts/ThemeContext';

type Props = {
  visible: boolean;
  onRequestClose?: () => void;
  children?: React.ReactNode;
  containerStyle?: any;
};

export default function Modal({ visible, onRequestClose, children, containerStyle }: Props) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  return (
    <RNModal transparent visible={visible} onRequestClose={onRequestClose} animationType="fade">
      <View style={styles.backdrop}>
        <View style={[styles.card, containerStyle]}>{children}</View>
      </View>
    </RNModal>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: colors.background, padding: spacing.lg, borderRadius: 12, width: '85%' },
});


