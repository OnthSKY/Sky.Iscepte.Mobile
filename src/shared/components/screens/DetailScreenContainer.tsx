import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenLayout from '../../layouts/ScreenLayout';
import Button from '../Button';
import Card from '../Card';
import LoadingState from '../LoadingState';
import ErrorState from '../ErrorState';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import { BaseEntity, DetailScreenConfig } from '../../../core/types/screen.types';
import { BaseEntityService } from '../../../core/services/baseEntityService.types';
import { useDetailScreen } from '../../../core/hooks/useDetailScreen';

/**
 * Single Responsibility: Composes detail screen UI
 * Interface Segregation: Receives render function, not specific entity structure
 */

interface DetailScreenContainerProps<T extends BaseEntity> {
  config: DetailScreenConfig;
  service: BaseEntityService<T>;
  renderContent: (data: T) => React.ReactNode;
  title?: string;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
}

/**
 * Generic Detail Screen Container
 * SRP: Only responsible for composing detail screen UI
 * Open/Closed: Can be extended via renderContent prop
 */
export function DetailScreenContainer<T extends BaseEntity>({
  config,
  service,
  renderContent,
  title,
  showEditButton = true,
  showDeleteButton = true,
}: DetailScreenContainerProps<T>) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const {
    data,
    loading,
    error,
    permissions,
    handleEdit,
    handleDelete,
    t,
  } = useDetailScreen(service, config);

  if (loading) {
    return (
      <ScreenLayout title={title} showBackButton>
        <LoadingState />
      </ScreenLayout>
    );
  }

  if (error || !data) {
    return (
      <ScreenLayout title={title} showBackButton>
        <ErrorState
          error={error || new Error('Not found')}
          onRetry={data ? undefined : () => {
            // Retry will be handled by useDetailScreen.refresh
          }}
          showRetry={false}
        />
      </ScreenLayout>
    );
  }

  const renderFooter = () => {
    if (!showEditButton && !showDeleteButton) return null;

    const handleDeleteConfirm = async () => {
      try {
        await handleDelete();
        // Navigate back after successful delete
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      } catch (err) {
        // Error is already handled in hook
      }
    };

    return (
      <View style={styles.footer}>
        {showEditButton && (
          <Button
            title={t('common:edit', { defaultValue: 'Edit' })}
            onPress={handleEdit}
            style={[styles.footerButton, { flex: 1 }]}
            disabled={!permissions.canEdit}
            showLockIcon={true}
          />
        )}
        {showDeleteButton && (
          <Button
            title={t('common:delete', { defaultValue: 'Delete' })}
            onPress={handleDeleteConfirm}
            style={[styles.footerButton, { flex: 1, backgroundColor: colors.error }]}
            disabled={!permissions.canDelete}
            showLockIcon={true}
          />
        )}
      </View>
    );
  };

  return (
    <ScreenLayout title={title} showBackButton footer={renderFooter()}>
      <ScrollView>
        <View style={styles.content}>
          {renderContent(data)}
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

