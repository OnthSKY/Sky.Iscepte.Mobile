/**
 * NetworkStatusIndicator Component
 * 
 * Shows network connectivity status and offline queue information
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNetworkStatus } from '../../core/hooks/useNetworkStatus';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';
import { useTranslation } from 'react-i18next';

const NetworkStatusIndicator = memo(function NetworkStatusIndicator() {
  const { isOnline, queueLength, retryQueue } = useNetworkStatus();
  const { colors } = useTheme();
  const { t } = useTranslation('common');

  // Don't show if online and no queue
  if (isOnline && queueLength === 0) {
    return null;
  }

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {!isOnline ? (
        <View style={styles.offlineContainer}>
          <Ionicons name="cloud-offline-outline" size={16} color={colors.error} />
          <Text style={styles.text}>
            {t('common:offline', { defaultValue: 'Offline' })}
          </Text>
          {queueLength > 0 && (
            <Text style={styles.queueText}>
              {t('common:pending_requests', { count: queueLength, defaultValue: `${queueLength} pending` })}
            </Text>
          )}
        </View>
      ) : queueLength > 0 ? (
        <TouchableOpacity style={styles.queueContainer} onPress={retryQueue}>
          <Ionicons name="sync-outline" size={16} color={colors.warning} />
          <Text style={styles.text}>
            {t('common:syncing', { count: queueLength, defaultValue: `Syncing ${queueLength} items...` })}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
});

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    offlineContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.error + '15',
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      gap: spacing.xs,
    },
    queueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.warning + '15',
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      gap: spacing.xs,
    },
    text: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '500',
    },
    queueText: {
      color: colors.muted,
      fontSize: 11,
      marginLeft: spacing.xs,
    },
  });

export default NetworkStatusIndicator;

