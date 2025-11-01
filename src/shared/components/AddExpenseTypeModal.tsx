import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';
import { typography } from '../../core/constants/typography';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import expenseTypeService from '../../modules/expenses/services/expenseTypeService';

interface AddExpenseTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (type: { id: string; name: string }) => void;
}

export default function AddExpenseTypeModal({ visible, onClose, onSuccess }: AddExpenseTypeModalProps) {
  const { t } = useTranslation('expenses');
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [typeName, setTypeName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const trimmedName = typeName.trim();
    
    if (!trimmedName) {
      setError(t('type_name_required', { defaultValue: 'Type name is required' }));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newType = await expenseTypeService.create({ name: trimmedName });
      onSuccess(newType);
      setTypeName('');
      onClose();
    } catch (err: any) {
      setError(err?.message || t('create_failed', { defaultValue: 'Failed to create type' }));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTypeName('');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>
          <Text style={styles.title}>{t('new_expense_type', { defaultValue: 'New Income / Expense Type' })}</Text>
          
          <Input
            placeholder={t('expense_type_name_placeholder', { defaultValue: 'Enter type name' })}
            value={typeName}
            onChangeText={(text) => {
              setTypeName(text);
              setError('');
            }}
            style={styles.input}
            autoFocus
          />

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>{t('cancel', { defaultValue: 'Cancel' })}</Text>
            </TouchableOpacity>
            <View style={{ width: spacing.md }} />
            <Button
              title={t('save', { defaultValue: 'Save' })}
              onPress={handleSave}
              disabled={loading || !typeName.trim()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.size.sm,
    marginBottom: spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
});

