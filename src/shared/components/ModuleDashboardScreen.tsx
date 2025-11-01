import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, TouchableOpacity, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';
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
import FiltersEditor from './FiltersEditor';
import PaginatedList from './PaginatedList';
import EmptyState from './EmptyState';
import ConfirmDialog from './ConfirmDialog';

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
  
  // Get current route name to determine if we should show back button
  const route = navigation.getState()?.routes[navigation.getState()?.index ?? 0];
  const currentRouteName = route?.name;
  // Show back button for all module dashboards (not the main Dashboard)
  const canGoBack = currentRouteName !== 'Dashboard' && navigation.canGoBack();
  
  // Custom back handler: navigate to Dashboard if in Tab Navigator
  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Fallback: navigate to Dashboard if canGoBack doesn't work
      navigation.navigate('Dashboard' as never);
    }
  };

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
    const numColumns = width > 650 ? 2 : 1;
    const cardMargin = spacing.md;
    const statCardWidth = numColumns > 1 
      ? (width - spacing.lg * 2 - cardMargin) / 2 
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
      <ScreenLayout showBackButton={canGoBack} onBackPress={handleBackPress}>
        <LoadingState />
      </ScreenLayout>
    );
  }

  // Only show error if there's an actual error, not if stats is just empty
  if (finalError) {
    const errorMessage = errorMessages.failedToLoad(t(`${config.module}:module`, { defaultValue: 'Module data' }));
    
    return (
      <ScreenLayout showBackButton={canGoBack} onBackPress={handleBackPress}>
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
        {/* Module Description */}
        {config.description && (
          <View style={[styles.descriptionSection, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg }]}>
            <View style={[styles.descriptionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      flex: config.createRoute ? 1 : 0,
                      marginRight: config.createRoute ? spacing.sm : 0,
                    },
                  ]}
                  onPress={() => handleNavigate(config.listRoute)}
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

        {/* Secondary Stats Grid */}
        {secondaryStats.length > 0 && (
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
                  onPress={() => handleNavigate(action.route)}
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

    // Enhanced renderItem with actions
    const renderItemWithActions = (item: T) => {
      const originalItem = config.listConfig!.renderItem(item);
      
      // If original item has onPress, extract it and make item clickable for detail view
      const handleViewDetail = () => {
        if (listScreen?.handleViewDetail) {
          listScreen.handleViewDetail(item);
        }
      };

      return (
        <TouchableOpacity 
          style={{ marginBottom: spacing.sm }}
          onPress={handleViewDetail}
          activeOpacity={0.7}
        >
          <View style={{ marginBottom: spacing.xs }}>
            {originalItem}
          </View>
          {(permissions.canEdit || permissions.canDelete) && (
            <View style={[styles.itemActions, { paddingHorizontal: spacing.lg, marginTop: spacing.xs }]}>
              {permissions.canEdit && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary + '15' }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleEdit(item);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={18} color={colors.primary} />
                  <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                    {t('common:edit', { defaultValue: 'Düzenle' })}
                  </Text>
                </TouchableOpacity>
              )}
              {permissions.canDelete && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: (colors.error || '#DC2626') + '15' }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    setDeleteDialog({ visible: true, item });
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error || '#DC2626'} />
                  <Text style={[styles.actionButtonText, { color: colors.error || '#DC2626' }]}>
                    {t('common:delete', { defaultValue: 'Sil' })}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>
      );
    };

    return (
      <View style={{ flex: 1 }}>
        <View style={[styles.listHeader, { paddingHorizontal: spacing.lg }]}>
          {permissions.canCreate && (
            <Button
              title={t('common:create', { defaultValue: 'Oluştur' })}
              onPress={handleCreate}
              style={styles.createButton}
            />
          )}
        </View>
        
        <View style={{ paddingHorizontal: spacing.lg }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder={t('common:search', { defaultValue: 'Ara' }) as string}
          />
          <FiltersEditor value={filters} onChange={setFilters} />
        </View>

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
              subtitle={t('common:try_adjust_filters', { defaultValue: 'Filtreleri ayarlamayı deneyin' }) as string}
            />
          }
        />

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
    <ScreenLayout noPadding showBackButton={canGoBack} onBackPress={handleBackPress}>
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
  itemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    gap: spacing.xs,
    flex: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
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

