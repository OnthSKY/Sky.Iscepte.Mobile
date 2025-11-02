import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, TouchableOpacity, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';
import { getColumnsForStats } from '../../core/constants/breakpoints';
import { StatCard } from './dashboard/StatCard';
import { QuickActionCard } from './dashboard/QuickActionCard';
import { RelatedModuleCard, RelatedModule } from './dashboard/RelatedModuleCard';
import ScreenLayout from '../layouts/ScreenLayout';
import { useAsyncData } from '../../core/hooks/useAsyncData';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import { errorMessages, getErrorMessage } from '../../core/utils/errorUtils';
import Button from './Button';
import { BaseEntity, ListScreenConfig } from '../../core/types/screen.types';
import { BaseEntityService } from '../../core/services/baseEntityService.types';
import { useListScreen } from '../../core/hooks/useListScreen';
import SearchBar from './SearchBar';
import PaginatedList from './PaginatedList';
import EmptyState from './EmptyState';
import ConfirmDialog from './ConfirmDialog';
import { MODULE_CONFIGS, getModuleConfig } from '../../core/config/moduleConfig';

export interface ModuleStat {
  key: string;
  label: string;
  value: string | number;
  icon: string;
  color: string;
  route?: string;
}

export interface ModuleQuickAction {
  key: string;
  label: string;
  icon: string;
  color: string;
  route: string;
  action?: () => void; // Optional custom callback function
}

export interface ModuleDashboardConfig<T extends BaseEntity = BaseEntity> {
  module: string;
  stats: () => Promise<ModuleStat[]> | ModuleStat[]; // Can return sync or async
  quickActions: ModuleQuickAction[];
  mainStatKey?: string; // Which stat to show as main (large) card
  relatedModules?: RelatedModule[]; // Related modules for quick navigation
  listRoute?: string; // Route to view all items (deprecated, use listConfig instead)
  createRoute?: string; // Route to create new item
  description?: string; // Module description/summary (optional, will be translated)
  compactStats?: boolean; // If true, show all stats in a single row (compact mode)
  // List configuration for integrated list tab
  listConfig?: {
    service: BaseEntityService<T>;
    config: ListScreenConfig<T>;
    renderItem: (item: T) => React.ReactNode;
    keyExtractor: (item: T) => string;
  };
}

interface ModuleDashboardScreenProps<T extends BaseEntity = BaseEntity> {
  config: ModuleDashboardConfig<T>;
}

/**
 * ModuleDashboardScreen - Reusable dashboard for each module
 * 
 * Single Responsibility: Only responsible for composing module dashboard UI
 * Open/Closed: Open for extension (different modules via config), closed for modification
 */
export const ModuleDashboardScreen = <T extends BaseEntity = BaseEntity>({ config }: ModuleDashboardScreenProps<T>) => {
  const { t } = useTranslation([config.module, 'common']);
  const { colors, activeTheme } = useTheme();
  const isDark = activeTheme === 'dark';
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list'>('dashboard');
  
  // Get module config for display name
  const moduleConfig = useMemo(() => {
    return getModuleConfig(config.module) || 
           MODULE_CONFIGS.find(m => m.translationNamespace === config.module) || null;
  }, [config.module]);
  
  // Get module display name
  const moduleName = useMemo(() => {
    if (!moduleConfig) return '';
    return t(`${moduleConfig.translationNamespace}:${moduleConfig.translationKey}`, {
      defaultValue: moduleConfig.key,
    });
  }, [moduleConfig, t]);

  // Fetch stats - handle both sync and async
  const statsResult = React.useMemo(() => {
    try {
      const result = config.stats();
      // If it's a promise, we need async handling
      if (result instanceof Promise) {
        return { type: 'promise' as const };
      }
      // If it's already an array, use it directly
      if (Array.isArray(result)) {
        return { type: 'sync' as const, data: result };
      }
      return { type: 'unknown' as const };
    } catch (err) {
      return { type: 'error' as const, error: err instanceof Error ? err : new Error('Failed to get stats') };
    }
  }, [config.stats]);

  // For async stats, use useAsyncData
  const { data: asyncStats, loading: asyncLoading, error: asyncError } = useAsyncData(
    async () => {
      const result = config.stats();
      if (result instanceof Promise) {
        const statsData = await result;
        // Empty stats is OK, not an error - return empty array
        return statsData || [];
      }
      // If it's sync, return it
      if (Array.isArray(result)) {
        return result;
      }
      // If not array or promise, return empty array
      return [];
    },
    [config.module, statsResult.type],
    {
      immediate: statsResult.type !== 'sync', // Only fetch async if not sync
    }
  );

  // Determine final stats based on sync vs async
  const finalStats = statsResult.type === 'sync' ? statsResult.data : asyncStats;
  const finalLoading = statsResult.type === 'sync' ? false : asyncLoading;
  const finalError = statsResult.type === 'error' ? statsResult.error : asyncError;
  
  // If no stats but no error, use empty stats (data might be empty but that's OK)
  // finalStats can be empty array, which is valid
  const safeStats = finalStats || [];

  // Layout calculations
  const layoutConfig = useMemo(() => {
    const numColumns = getColumnsForStats(width);
    const cardMargin = spacing.md;
    const statCardWidth = numColumns > 1 
      ? (width - spacing.lg * 2 - cardMargin) / numColumns
      : width - spacing.lg * 2;
    return { numColumns, cardMargin, statCardWidth };
  }, [width]);

  // Find main stat and secondary stats
  const { mainStat, secondaryStats } = useMemo(() => {
    const statsToUse = safeStats.length > 0 ? safeStats : [];
    
    if (statsToUse.length === 0) {
      return { mainStat: null, secondaryStats: [] };
    }

    const mainStatIndex = config.mainStatKey 
      ? statsToUse.findIndex(s => s.key === config.mainStatKey)
      : 0;
    
    const mainStatIndexValid = mainStatIndex >= 0 ? mainStatIndex : 0;
    const mainStat = statsToUse[mainStatIndexValid];
    const secondaryStats = statsToUse.filter((_, index) => index !== mainStatIndexValid);

    return { mainStat, secondaryStats };
  }, [safeStats, config.mainStatKey]);

  const handleNavigate = (route?: string) => {
    if (route) {
      navigation.navigate(route);
    }
  };

  // List screen hooks - always call hooks, but only use if listConfig is provided
  // We need to provide a dummy service/config to satisfy React hooks rules
  const dummyListConfig = React.useMemo(() => ({
    entityName: 'dummy',
    translationNamespace: 'common',
    defaultPageSize: 10,
  }), []);
  
  const dummyService = React.useMemo(() => ({
    list: async () => ({ items: [], total: 0, page: 1, pageSize: 10 }),
    get: async () => null,
    create: async () => { throw new Error('Not implemented'); },
    update: async () => { throw new Error('Not implemented'); },
    delete: async () => { throw new Error('Not implemented'); },
  }), []);

  const listScreen = useListScreen(
    config.listConfig?.service || dummyService as any,
    config.listConfig?.config || dummyListConfig as any
  );
  
  const [deleteDialog, setDeleteDialog] = useState<{ visible: boolean; item: T | null }>({ visible: false, item: null });
  const [listRefreshKey, setListRefreshKey] = useState(0);

  if (finalLoading) {
    return (
      <ScreenLayout showBackButton={false}>
        <LoadingState />
      </ScreenLayout>
    );
  }

  // Only show error if there's an actual error, not if stats is just empty
  if (finalError) {
    const errorMessage = errorMessages.failedToLoad(t(`${config.module}:module`, { defaultValue: 'Module data' }));
    
    return (
      <ScreenLayout showBackButton={false}>
        <ErrorState
          error={finalError}
          message={getErrorMessage(finalError)}
          showRetry={false}
        />
      </ScreenLayout>
    );
  }

  // Render dashboard tab content
  const renderDashboardTab = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={{ backgroundColor: colors.page }}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="never"
      scrollEventThrottle={16}
    >
      {/* Module Name Header */}
      {moduleName && (
        <View style={[styles.moduleHeaderSection, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg }]}>
          <View style={[styles.moduleHeaderCard, { backgroundColor: isDark ? colors.surface : colors.card, borderColor: colors.border }]}>
            <View style={styles.moduleHeaderContent}>
              {moduleConfig && (
                <Ionicons 
                  name={moduleConfig.icon as any} 
                  size={width > 640 ? 28 : 24} 
                  color={colors.primary} 
                  style={styles.moduleHeaderIcon}
                />
              )}
              <View style={styles.moduleHeaderTextContainer}>
                <Text style={[styles.moduleHeaderLabel, { color: colors.muted, fontSize: width > 640 ? 12 : 11 }]}>
                  {t('common:current_module', { defaultValue: 'Mevcut Modül' })}
                </Text>
                <Text 
                  style={[
                    styles.moduleHeaderName, 
                    { 
                      color: colors.text,
                      fontSize: width > 640 ? 20 : width > 400 ? 18 : 16,
                    }
                  ]} 
                  numberOfLines={1}
                >
                  {moduleName}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
      
      {/* Module Description */}
      {config.description && (
        <View style={[styles.descriptionSection, { paddingHorizontal: spacing.lg, paddingTop: moduleName ? spacing.md : spacing.lg }]}>
          <View style={[styles.descriptionCard, { backgroundColor: isDark ? colors.surface : colors.card, borderColor: colors.border }]}>
            <View style={styles.descriptionHeader}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              <Text style={[styles.descriptionTitle, { color: colors.text }]}>
                {t(`${config.module}:module_overview`, { defaultValue: 'Modül Özeti' })}
              </Text>
            </View>
              <Text style={[styles.descriptionText, { color: colors.muted }]}>
                {t(config.description, { defaultValue: config.description })}
              </Text>
            </View>
          </View>
        )}

        {/* Summary Stats Cards - Top Section */}
        {finalStats && finalStats.length > 0 && (
          <View style={styles.summarySection}>
            {config.compactStats ? (
              /* Compact mode: All stats in single row */
              <View style={[styles.summaryStatsRow, { gap: spacing.md, justifyContent: 'space-between' }]}>
                {finalStats.map((stat) => {
                  const valueStr = typeof stat.value === 'number' 
                    ? stat.value.toLocaleString() 
                    : String(stat.value ?? '—');
                  return (
                    <TouchableOpacity
                      key={stat.key}
                      style={[
                        styles.compactStatCard,
                        { 
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          flex: 1,
                        },
                      ]}
                      onPress={() => handleNavigate(stat.route)}
                      activeOpacity={1}
                    >
                      <Ionicons 
                        name={stat.icon as any} 
                        size={24} 
                        color={stat.color} 
                        style={{ marginBottom: spacing.xs }}
                      />
                      <Text 
                        style={{ 
                          fontSize: 20, 
                          fontWeight: 'bold', 
                          color: colors.text,
                          marginBottom: spacing.xs / 2,
                        }}
                      >
                        {valueStr}
                      </Text>
                      <Text 
                        style={{ 
                          fontSize: 11, 
                          color: colors.muted,
                          textAlign: 'center',
                        }}
                        numberOfLines={2}
                      >
                        {stat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              /* Default mode: Main stat as large card, others in grid */
              <View style={styles.summaryStatsRow}>
                {finalStats.slice(0, layoutConfig.numColumns === 2 ? 2 : 1).map((stat) => {
                  const valueStr = typeof stat.value === 'number' 
                    ? stat.value.toLocaleString() 
                    : String(stat.value ?? '—');
                  return (
                    <TouchableOpacity
                      key={stat.key}
                      style={[
                        styles.summaryCard,
                        { backgroundColor: stat.color },
                        isDark ? styles.cardDarkShadow : styles.cardLightShadow,
                        layoutConfig.numColumns === 2 
                          ? { width: (width - spacing.lg * 3) / 2 }
                          : { width: width - spacing.lg * 2 },
                      ]}
                      onPress={() => handleNavigate(stat.route)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.summaryCardContent}>
                        <View style={styles.summaryIconContainer}>
                          <Ionicons name={stat.icon as any} size={28} color="white" />
                        </View>
                        <View style={styles.summaryTextContainer}>
                          <Text style={styles.summaryLabel}>{stat.label}</Text>
                          <Text style={styles.summaryValue}>{valueStr}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Secondary Stats Grid - Only show if not compact mode */}
        {!config.compactStats && secondaryStats.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t(`${config.module}:statistics`, { defaultValue: 'İstatistikler' })}
            </Text>
            <View style={styles.statsGrid}>
              {secondaryStats.map((stat, index) => {
                const valueStr = typeof stat.value === 'number' 
                  ? stat.value.toLocaleString() 
                  : String(stat.value ?? '—');
                return (
                  <StatCard
                    key={stat.key}
                    stat={{
                      key: stat.key,
                      label: stat.label,
                      value: valueStr,
                      icon: stat.icon,
                      color: stat.color,
                      route: stat.route || '',
                    }}
                    onPress={() => handleNavigate(stat.route)}
                    width={layoutConfig.statCardWidth}
                    marginRight={layoutConfig.numColumns > 1 && index % 2 === 0 ? layoutConfig.cardMargin : 0}
                  />
                );
              })}
            </View>
          </View>
        )}

        {/* Quick Access Buttons */}
        {(config.listRoute || config.createRoute) && (
          <View style={styles.quickAccessSection}>
            <View style={styles.quickAccessRow}>
              {config.listRoute && (
                <TouchableOpacity
                  style={[
                    styles.quickAccessButton,
                    { 
                      backgroundColor: isDark ? colors.surface : colors.card,
                      borderColor: colors.border,
                      flex: config.createRoute ? 1 : 0,
                      marginRight: config.createRoute ? spacing.sm : 0,
                    },
                  ]}
                  onPress={() => {
                    // If listConfig exists, switch to list tab instead of navigating
                    if (config.listConfig) {
                      setActiveTab('list');
                    } else {
                      handleNavigate(config.listRoute);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="list-outline" size={20} color={colors.primary} />
                  <Text style={[styles.quickAccessButtonText, { color: colors.primary }]}>
                    {t(`${config.module}:view_all`, { defaultValue: 'Tümünü Görüntüle' })}
                  </Text>
                </TouchableOpacity>
              )}
              {config.createRoute && (
                <TouchableOpacity
                  style={[
                    styles.quickAccessButton,
                    { 
                      backgroundColor: colors.primary,
                      flex: config.listRoute ? 1 : 0,
                    },
                  ]}
                  onPress={() => handleNavigate(config.createRoute)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle-outline" size={20} color="white" />
                  <Text style={[styles.quickAccessButtonText, { color: 'white' }]}>
                    {t(`${config.module}:create_new`, { defaultValue: 'Yeni Ekle' })}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}


        {/* Related Modules */}
        {config.relatedModules && config.relatedModules.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t(`${config.module}:related_modules`, { defaultValue: 'İlgili Modüller' })}
            </Text>
            <View style={styles.relatedModulesList}>
              {config.relatedModules.map((relatedModule) => (
                <RelatedModuleCard
                  key={relatedModule.key}
                  module={relatedModule}
                  onPress={() => handleNavigate(relatedModule.route)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        {config.quickActions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t(`${config.module}:quick_actions`, { defaultValue: 'Hızlı İşlemler' })}
            </Text>
            <View style={styles.actionsList}>
              {config.quickActions.map((action) => (
                <QuickActionCard
                  key={action.key}
                  action={{
                    key: action.key,
                    label: action.label,
                    icon: action.icon,
                    color: action.color,
                    route: action.route,
                  }}
                  onPress={() => {
                    // If action has a custom callback, use it; otherwise navigate to route
                    if (action.action && typeof action.action === 'function') {
                      action.action();
                    } else {
                      handleNavigate(action.route);
                    }
                  }}
                />
              ))}
            </View>
          </View>
        )}
    </ScrollView>
  );

  // Render list tab content
  const renderListTab = () => {
    if (!config.listConfig) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
          <Text style={{ color: colors.muted }}>{t('common:list_not_configured', { defaultValue: 'Liste yapılandırılmamış' })}</Text>
        </View>
      );
    }

    const { query, setQuery, filters, setFilters, permissions, handleCreate, handleEdit, handleViewDetail, fetchPage } = listScreen;

    const handleDelete = async (item: T) => {
      try {
        await config.listConfig!.service.delete(item.id);
        setDeleteDialog({ visible: false, item: null });
        // Trigger refresh by updating key
        setListRefreshKey(prev => prev + 1);
      } catch (err) {
        // Error handling can be improved with toast
      }
    };

    // Enhanced renderItem with card-based design and actions
    const renderItemWithActions = (item: T) => {
      const originalItem = config.listConfig!.renderItem(item);
      
      // If original item has onPress, extract it and make item clickable for detail view
      const handleViewDetail = () => {
        if (listScreen?.handleViewDetail) {
          listScreen.handleViewDetail(item);
        }
      };

      return (
        <View style={styles.cardContainer}>
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleViewDetail}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              {originalItem}
            </View>
          </TouchableOpacity>
          
          {(permissions.canEdit || permissions.canDelete) && (
            <View style={styles.cardActions}>
              {permissions.canEdit && (
                <TouchableOpacity
                  style={[styles.cardActionButton, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleEdit(item);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={18} color={colors.primary} />
                  <Text style={[styles.cardActionButtonText, { color: colors.primary }]}>
                    {t('common:edit', { defaultValue: 'Düzenle' })}
                  </Text>
                </TouchableOpacity>
              )}
              {permissions.canDelete && (
                <TouchableOpacity
                  style={[styles.cardActionButton, { backgroundColor: (colors.error || '#DC2626') + '15', borderColor: (colors.error || '#DC2626') + '30' }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    setDeleteDialog({ visible: true, item });
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error || '#DC2626'} />
                  <Text style={[styles.cardActionButtonText, { color: colors.error || '#DC2626' }]}>
                    {t('common:delete', { defaultValue: 'Sil' })}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      );
    };

    return (
      <View style={{ flex: 1, backgroundColor: colors.page }}>
        <View style={[styles.listHeader, { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm }]}>
          {permissions.canCreate && (
            <Button
              title={t('common:create', { defaultValue: 'Oluştur' })}
              onPress={handleCreate}
              style={styles.createButton}
            />
          )}
        </View>
        
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder={t('common:search', { defaultValue: 'Ara' }) as string}
          />
        </View>

        <View style={{ flex: 1 }}>
          <PaginatedList
            key={`list-${listRefreshKey}`}
            pageSize={config.listConfig.config.defaultPageSize || 10}
            query={{
              searchValue: query,
              orderColumn: 'CreatedAt',
              orderDirection: 'DESC',
              filters,
            }}
            fetchPage={fetchPage}
            keyExtractor={config.listConfig.keyExtractor}
            renderItem={({ item }) => renderItemWithActions(item)}
            ListEmptyComponent={
              <EmptyState
                title={t('common:no_results', { defaultValue: 'Sonuç bulunamadı' }) as string}
                subtitle={t('common:try_adjust_filters', { defaultValue: 'Arama kriterlerini değiştirmeyi deneyin' }) as string}
              />
            }
          />
        </View>

        <ConfirmDialog
          visible={deleteDialog.visible}
          title={t('common:confirm_delete', { defaultValue: 'Silmeyi Onayla' })}
          message={t('common:confirm_delete_message', { defaultValue: 'Bu kaydı silmek istediğinize emin misiniz?' })}
          onConfirm={() => deleteDialog.item && handleDelete(deleteDialog.item)}
          onCancel={() => setDeleteDialog({ visible: false, item: null })}
        />
      </View>
    );
  };

  return (
    <ScreenLayout noPadding showBackButton={false}>
      {/* Tab Selector */}
      {config.listConfig && (
        <View style={[styles.tabContainer, { paddingHorizontal: spacing.lg, paddingTop: spacing.md }]}>
          <View style={[styles.tabSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'dashboard' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab('dashboard')}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="stats-chart-outline" 
                size={18} 
                color={activeTab === 'dashboard' ? 'white' : colors.text} 
              />
              <Text style={[
                styles.tabButtonText, 
                { color: activeTab === 'dashboard' ? 'white' : colors.text }
              ]}>
                {t(`${config.module}:dashboard`, { defaultValue: 'Dashboard' })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'list' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab('list')}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="list-outline" 
                size={18} 
                color={activeTab === 'list' ? 'white' : colors.text} 
              />
              <Text style={[
                styles.tabButtonText, 
                { color: activeTab === 'list' ? 'white' : colors.text }
              ]}>
                {t(`${config.module}:list`, { defaultValue: 'Liste' })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Tab Content */}
      {activeTab === 'dashboard' ? renderDashboardTab() : renderListTab()}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  summarySection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryCard: {
    borderRadius: 20,
    padding: spacing.lg,
    minHeight: 100,
    justifyContent: 'center',
  },
  summaryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  compactStatCard: {
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  quickAccessSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  quickAccessRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickAccessButton: {
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: spacing.sm,
  },
  quickAccessButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  actionsList: {
    gap: spacing.sm,
  },
  relatedModulesList: {
    gap: 0,
  },
  cardLightShadow: {
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
      },
    }),
  },
  cardDarkShadow: {
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
      },
    }),
  },
  tabContainer: {
    marginBottom: spacing.md,
  },
  tabSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    gap: spacing.xs,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listHeader: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  createButton: {
    alignSelf: 'flex-start',
  },
  cardContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  cardContent: {
    padding: spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  cardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    gap: spacing.xs,
    flex: 1,
    borderWidth: 1,
    minHeight: 44, // Minimum touch target size for mobile
  },
  cardActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  moduleHeaderSection: {
    marginBottom: spacing.md,
  },
  moduleHeaderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  moduleHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  moduleHeaderIcon: {
    flexShrink: 0,
  },
  moduleHeaderTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  moduleHeaderLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: spacing.xs / 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moduleHeaderName: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  descriptionSection: {
    marginBottom: spacing.md,
  },
  descriptionCard: {
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ModuleDashboardScreen;

