import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenLayout from '../../layouts/ScreenLayout';
import SearchBar from '../SearchBar';
import FiltersEditor from '../FiltersEditor';
import PaginatedList from '../PaginatedList';
import EmptyState from '../EmptyState';
import Button from '../Button';
import { useTheme } from '../../../core/contexts/ThemeContext';
import { BaseEntity, ListScreenConfig } from '../../../core/types/screen.types';
import { BaseEntityService } from '../../../core/services/baseEntityService.types';
import { useListScreen } from '../../../core/hooks/useListScreen';

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
}: ListScreenContainerProps<T>) {
  const { colors } = useTheme();
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

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{screenTitle}</Text>
          {permissions.canCreate && (
            <Button
              title={t('common:create', { defaultValue: 'Create' })}
              onPress={handleCreate}
              style={styles.createButton}
            />
          )}
        </View>

        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t('common:search', { defaultValue: 'Search' }) as string}
        />

        <FiltersEditor value={filters} onChange={setFilters} />

        <PaginatedList
          pageSize={config.defaultPageSize || 10}
          query={{
            searchValue: query,
            orderColumn: 'CreatedAt',
            orderDirection: 'DESC',
            filters,
          }}
          fetchPage={fetchPage}
          keyExtractor={keyExtractor}
          renderItem={({ item }) => renderItem(item)}
          ListEmptyComponent={
            <EmptyState
              title={emptyStateTitle || (t('common:no_results', { defaultValue: 'No results' }) as string)}
              subtitle={emptyStateSubtitle || (t('common:try_adjust_filters', { defaultValue: 'Try adjusting filters' }) as string)}
            />
          }
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  createButton: {
    minWidth: 100,
  },
});

