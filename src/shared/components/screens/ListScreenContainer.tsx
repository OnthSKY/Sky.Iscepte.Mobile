import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import ScreenLayout from '../../layouts/ScreenLayout';
import SearchBar from '../SearchBar';
import FiltersEditor from '../FiltersEditor';
import FiltersModal from '../FiltersModal';
import PaginatedList from '../PaginatedList';
import EmptyState from '../EmptyState';
import Button from '../Button';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { BaseEntity, ListScreenConfig } from '../../../core/types/screen.types';
import { BaseEntityService } from '../../../core/services/baseEntityService.types';
import { useListScreen } from '../../../core/hooks/useListScreen';
import spacing from '../../../core/constants/spacing';
import { isSmallScreen } from '../../../core/constants/breakpoints';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * Single Responsibility: Composes list screen UI
 * Interface Segregation: Only receives what it needs
 */

interface ListScreenContainerProps<T extends BaseEntity> {
  config: ListScreenConfig<T>;
  service: BaseEntityService<T>;
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
  title?: string;
  emptyStateTitle?: string;
  emptyStateSubtitle?: string;
  showFilters?: boolean;
  hideSearch?: boolean;
  hideCreate?: boolean;
  filterItems?: (items: T[]) => T[];
  ListHeaderComponent?: React.ReactElement | null;
}

/**
 * Generic List Screen Container
 * SRP: Only responsible for composing list screen UI
 * Open/Closed: Can be extended via props, closed for modification
 */
export function ListScreenContainer<T extends BaseEntity>({
  config,
  service,
  renderItem,
  keyExtractor,
  title,
  emptyStateTitle,
  emptyStateSubtitle,
  showFilters = true,
  hideSearch = false,
  hideCreate = false,
  filterItems,
  ListHeaderComponent,
}: ListScreenContainerProps<T>) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [filtersModalVisible, setFiltersModalVisible] = React.useState(false);
  
  const {
    query,
    setQuery,
    filters,
    setFilters,
    loading,
    permissions,
    handleCreate,
    fetchPage,
    t,
  } = useListScreen(service, config);

  const screenTitle = title || t(`${config.translationNamespace}:${config.entityName}`, { defaultValue: config.entityName });
  const activeFilterCount = filters ? Object.keys(filters).length : 0;

  // Responsive layout for header
  const headerStyle = React.useMemo(() => {
    const isSmall = isSmallScreen(width);
    return {
      flexDirection: isSmall ? 'column' : 'row' as 'row' | 'column',
      alignItems: isSmall ? 'stretch' : 'center' as 'stretch' | 'center',
      gap: isSmall ? spacing.sm : spacing.md,
    };
  }, [width]);

  return (
    <View style={styles.container}>
      {title && (
        <View style={[styles.header, headerStyle]}>
          <Text style={[styles.title, { color: colors.text }]}>{screenTitle}</Text>
          {!hideCreate && (
            <Button
              title={t('common:create', { defaultValue: 'Create' })}
              onPress={handleCreate}
              style={[styles.createButton, width < 640 && styles.createButtonFullWidth]}
              disabled={!permissions.canCreate}
              showLockIcon={true}
            />
          )}
        </View>
      )}

      {!hideSearch && (
        <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder={t('common:search', { defaultValue: 'Search' }) as string}
            />
          </View>
          {showFilters && config.filterOptions && config.filterOptions.length > 0 && (
            <TouchableOpacity
              style={[
                styles.filterButton,
                {
                  backgroundColor: activeFilterCount > 0 ? colors.primary : colors.surface,
                  borderColor: activeFilterCount > 0 ? colors.primary : colors.border,
                }
              ]}
              onPress={() => setFiltersModalVisible(true)}
            >
              <Ionicons 
                name="filter-outline" 
                size={20} 
                color={activeFilterCount > 0 ? '#fff' : colors.text} 
              />
              {activeFilterCount > 0 && (
                <View style={[styles.badge, { backgroundColor: '#fff' }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>
                    {activeFilterCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Active Filters Chips */}
      {showFilters && activeFilterCount > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {Object.entries(filters || {}).map(([key, val]) => {
            const filterOption = config.filterOptions?.find(opt => opt.key === key);
            const label = filterOption?.label || key;
            const displayValue = filterOption?.type === 'select' 
              ? filterOption.options?.find(opt => opt.value === val)?.label || String(val)
              : String(val);
            
            return (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  const next = { ...filters };
                  delete next[key];
                  setFilters(Object.keys(next).length ? next : undefined);
                }}
                style={[styles.filterChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[styles.filterChipText, { color: colors.text }]}>
                  {t(label, { defaultValue: label })}: {displayValue} ×
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            onPress={() => {
              setFilters(undefined);
              setFiltersModalVisible(true);
            }}
            style={[styles.filterChip, styles.editFiltersChip, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
          >
            <Text style={[styles.filterChipText, { color: colors.primary }]}>
              {t('common:edit_filters', { defaultValue: 'Düzenle' })} ✎
            </Text>
          </TouchableOpacity>
        </View>
      )}

        <PaginatedList
          pageSize={config.defaultPageSize || 10}
          query={{
            searchValue: query, // Will be debounced in buildQuery inside fetchPage
            orderColumn: 'CreatedAt',
            orderDirection: 'DESC',
            filters,
          }}
          fetchPage={fetchPage}
          keyExtractor={keyExtractor}
          renderItem={({ item }) => renderItem(item)}
          filterItems={filterItems}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={
            <EmptyState
              title={emptyStateTitle || (t('common:no_results', { defaultValue: 'No results' }) as string)}
              subtitle={emptyStateSubtitle || (t('common:try_adjust_filters', { defaultValue: 'Try adjusting filters' }) as string)}
            />
          }
        />

        {/* Filters Modal */}
        {showFilters && config.filterOptions && config.filterOptions.length > 0 && (
          <FiltersModal
            visible={filtersModalVisible}
            onClose={() => setFiltersModalVisible(false)}
            value={filters}
            onChange={setFilters}
            filterOptions={config.filterOptions}
            translationNamespace={config.translationNamespace}
          />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  header: {
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  createButton: {
    minWidth: 100,
  },
  createButtonFullWidth: {
    width: '100%',
    minWidth: '100%',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  filterChipText: {
    fontSize: 14,
  },
  editFiltersChip: {
    paddingHorizontal: spacing.sm,
  },
});

