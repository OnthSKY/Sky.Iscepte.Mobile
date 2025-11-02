/**
 * ProductHistoryModal Component
 * 
 * Single Responsibility: Displays product history/timeline in a modal
 * Responsive: Adapts to screen size
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../core/contexts/ThemeContext';
import spacing from '../../../core/constants/spacing';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Card from '../../../shared/components/Card';
import { useProductHistoryQuery } from '../hooks/useProductsQuery';
import { ProductHistoryItem } from '../services/productService';
import LoadingState from '../../../shared/components/LoadingState';
import ErrorState from '../../../shared/components/ErrorState';

interface ProductHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  productId: string | number | undefined;
}

export default function ProductHistoryModal({ 
  visible, 
  onClose, 
  productId 
}: ProductHistoryModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation(['stock', 'common']);
  const styles = getStyles(colors);

  const { data: history, isLoading, error, refetch } = useProductHistoryQuery(
    productId,
    { enabled: visible && !!productId }
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'create':
      case 'created':
        return 'add-circle';
      case 'update':
      case 'updated':
        return 'create';
      case 'delete':
      case 'deleted':
        return 'trash';
      case 'stock_increase':
        return 'arrow-up-circle';
      case 'stock_decrease':
        return 'arrow-down-circle';
      default:
        return 'time';
    }
  };

  const getActionColor = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'create':
      case 'created':
        return colors.success;
      case 'update':
      case 'updated':
        return colors.primary;
      case 'delete':
      case 'deleted':
        return colors.error;
      case 'stock_increase':
        return colors.success;
      case 'stock_decrease':
        return colors.warning;
      default:
        return colors.muted;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('stock:product_history', { defaultValue: 'Ürün Tarihçesi' })}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState
                error={error}
                onRetry={() => refetch()}
                showRetry={true}
              />
            ) : !history || history.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={48} color={colors.muted} />
                <Text style={[styles.emptyText, { color: colors.muted }]}>
                  {t('stock:no_history', { defaultValue: 'Tarihçe bulunamadı' })}
                </Text>
              </View>
            ) : (
              <View style={styles.timeline}>
                {history.map((item: ProductHistoryItem, index: number) => (
                  <View key={item.id || index} style={styles.timelineItem}>
                    <View style={styles.timelineContent}>
                      {/* Timeline dot and line */}
                      <View style={styles.timelineMarker}>
                        <View 
                          style={[
                            styles.timelineDot, 
                            { backgroundColor: getActionColor(item.action) }
                          ]}
                        >
                          <Ionicons 
                            name={getActionIcon(item.action)} 
                            size={16} 
                            color="#fff" 
                          />
                        </View>
                        {index < history.length - 1 && (
                          <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                        )}
                      </View>

                      {/* Content */}
                      <View style={styles.timelineCard}>
                        <Card style={{ padding: spacing.md }}>
                          <View style={styles.timelineHeader}>
                            <View style={styles.timelineHeaderLeft}>
                              <Text style={[styles.actionText, { color: colors.text }]}>
                                {t(`stock:action_${item.action}`, { 
                                  defaultValue: item.action 
                                })}
                              </Text>
                              {item.user && (
                                <Text style={[styles.userText, { color: colors.muted }]}>
                                  {t('common:by', { defaultValue: 'Tarafından' })}: {item.user}
                                </Text>
                              )}
                            </View>
                            <Text style={[styles.dateText, { color: colors.muted }]}>
                              {formatDate(item.timestamp)}
                            </Text>
                          </View>

                          {item.description && (
                            <Text style={[styles.descriptionText, { color: colors.text }]}>
                              {item.description}
                            </Text>
                          )}

                          {item.changes && Object.keys(item.changes).length > 0 && (
                            <View style={styles.changesContainer}>
                              {Object.entries(item.changes).map(([key, change]) => (
                                <View key={key} style={styles.changeItem}>
                                  <Text style={[styles.changeLabel, { color: colors.muted }]}>
                                    {key}:
                                  </Text>
                                  <View style={styles.changeValues}>
                                    <Text style={[styles.changeOld, { color: colors.error }]}>
                                      {String(change.old ?? '-')}
                                    </Text>
                                    <Ionicons name="arrow-forward" size={16} color={colors.muted} />
                                    <Text style={[styles.changeNew, { color: colors.success }]}>
                                      {String(change.new ?? '-')}
                                    </Text>
                                  </View>
                                </View>
                              ))}
                            </View>
                          )}
                        </Card>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  timeline: {
    gap: spacing.md,
  },
  timelineItem: {
    position: 'relative',
  },
  timelineContent: {
    flexDirection: 'row',
  },
  timelineMarker: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: spacing.xl,
    marginTop: spacing.xs,
  },
  timelineCard: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  timelineHeaderLeft: {
    flex: 1,
    gap: spacing.xs,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  userText: {
    fontSize: 13,
  },
  dateText: {
    fontSize: 12,
    marginLeft: spacing.sm,
  },
  descriptionText: {
    fontSize: 14,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  changesContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  changeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  changeLabel: {
    fontSize: 13,
    fontWeight: '500',
    minWidth: 80,
  },
  changeValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  changeOld: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  changeNew: {
    fontSize: 13,
    fontWeight: '500',
  },
});

