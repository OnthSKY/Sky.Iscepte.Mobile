import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import ScreenLayout from '../../layouts/ScreenLayout';
import Button from '../Button';
import Card from '../Card';
import LoadingState from '../LoadingState';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import { BaseEntity, FormScreenConfig } from '../../../core/types/screen.types';
import { BaseEntityService } from '../../../core/services/baseEntityService.types';
import { useFormScreen } from '../../../core/hooks/useFormScreen';

/**
 * Single Responsibility: Composes form screen UI
 * Interface Segregation: Receives render function, not specific form structure
 */

interface FormScreenContainerProps<T extends BaseEntity> {
  config: FormScreenConfig;
  service: BaseEntityService<T>;
  initialData?: Partial<T>;
  validator?: (data: Partial<T>) => Record<string, string>;
  renderForm: (formData: Partial<T>, updateField: (field: keyof T, value: any) => void, errors: Record<string, string>) => React.ReactNode;
  title?: string;
}

/**
 * Generic Form Screen Container
 * SRP: Only responsible for composing form screen UI
 * Open/Closed: Can be extended via renderForm prop
 */
export function FormScreenContainer<T extends BaseEntity>({
  config,
  service,
  initialData,
  validator,
  renderForm,
  title,
}: FormScreenContainerProps<T>) {
  const { colors } = useTheme();
  const {
    formData,
    errors,
    loading,
    submitting,
    isEditMode,
    updateField,
    handleSubmit,
    handleCancel,
    t,
  } = useFormScreen(service, config, initialData, validator);

  const screenTitle = title || (
    isEditMode
      ? t(`${config.translationNamespace}:edit_${config.entityName}`, { defaultValue: `Edit ${config.entityName}` })
      : t(`${config.translationNamespace}:new_${config.entityName}`, { defaultValue: `New ${config.entityName}` })
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Button
        title={t('common:cancel', { defaultValue: 'Cancel' })}
        onPress={handleCancel}
        style={[styles.footerButton, { flex: 1, backgroundColor: colors.muted }]}
        disabled={submitting}
      />
      <Button
        title={t('common:save', { defaultValue: 'Save' })}
        onPress={handleSubmit}
        style={[styles.footerButton, { flex: 1 }]}
        loading={submitting}
        disabled={submitting}
      />
    </View>
  );

  if (loading) {
    return (
      <ScreenLayout title={screenTitle} showBackButton>
        <LoadingState />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={screenTitle} showBackButton footer={renderFooter()}>
      <ScrollView>
        <View style={styles.content}>
          <Card>
            {renderForm(formData, updateField, errors)}
          </Card>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  footerButton: {
    minHeight: 44,
  },
});

