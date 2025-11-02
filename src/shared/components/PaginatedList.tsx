import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { ActivityIndicator, FlatList, ListRenderItem, RefreshControl, View } from 'react-native';
import { useTheme } from '../../core/contexts/ThemeContext';
import spacing from '../../core/constants/spacing';

export interface PaginationResult<T> {
  items: T[];
  total: number;
}

type FetchPage<T, Q = void> = (args: { page: number; pageSize: number; query?: Q }) => Promise<PaginationResult<T>>;

type Props<T, Q = void> = {
  pageSize?: number;
  query?: Q;
  fetchPage: FetchPage<T, Q>;
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  ListHeaderComponent?: React.ReactElement | null;
  ListEmptyComponent?: React.ReactElement | null;
  initialSkeletonCount?: number;
  filterItems?: (items: T[]) => T[];
};

export default function PaginatedList<T, Q = void>({ pageSize = 20, query, fetchPage, renderItem, keyExtractor, ListHeaderComponent, ListEmptyComponent, initialSkeletonCount = 6, filterItems }: Props<T, Q>) {
  const { colors } = useTheme();
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true); // Start with true for initial load
  const [refreshing, setRefreshing] = useState(false);
  const loadingRef = useRef(false);
  const isFirstLoad = useRef(true);

  // Filter items if filterItems function is provided
  const filteredItems = useMemo(() => {
    return filterItems ? filterItems(items) : items;
  }, [items, filterItems]);

  const canLoadMore = useMemo(() => {
    // Use original total before filtering for pagination
    return items.length < total;
  }, [items.length, total]);

  const load = useCallback(async (nextPage: number, reset = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await fetchPage({ page: nextPage, pageSize, query });
      setTotal(res.total);
      setItems((prev) => (reset ? res.items : [...prev, ...res.items]));
      setPage(nextPage);
      isFirstLoad.current = false;
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [fetchPage, pageSize, query]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load(1, true);
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  // Load initial data when query changes
  useEffect(() => { 
    isFirstLoad.current = true;
    load(1, true); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]); // Query changes should trigger reload

  // Initial loading check - show loading if first load is in progress or if loading and no items yet
  const isInitialLoading = (loading && isFirstLoad.current) || (loading && items.length === 0);

  return (
    <FlatList
      data={filteredItems}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      ListHeaderComponent={ListHeaderComponent || null}
      ListEmptyComponent={
        isInitialLoading
          ? (
            <View style={{ padding: spacing.lg, gap: spacing.md }}>
              {Array.from({ length: initialSkeletonCount }).map((_, i) => (
                <View key={i} style={{ height: 60, borderRadius: 12, backgroundColor: colors.page }} />
              ))}
            </View>
          )
          : (ListEmptyComponent || <View style={{ padding: spacing.lg }} />)
      }
      onEndReached={() => { if (canLoadMore) load(page + 1); }}
      onEndReachedThreshold={0.5}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      ListFooterComponent={loading && filteredItems.length > 0 ? (
        <View style={{ padding: spacing.md, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}
    />
  );
}


