import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ListRenderItem, RefreshControl, View } from 'react-native';
import colors from '../../core/constants/colors';
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
};

export default function PaginatedList<T, Q = void>({ pageSize = 20, query, fetchPage, renderItem, keyExtractor, ListHeaderComponent, ListEmptyComponent, initialSkeletonCount = 6 }: Props<T, Q>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const canLoadMore = useMemo(() => items.length < total, [items.length, total]);

  const load = useCallback(async (nextPage: number, reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetchPage({ page: nextPage, pageSize, query });
      setTotal(res.total);
      setItems((prev) => (reset ? res.items : [...prev, ...res.items]));
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  }, [fetchPage, pageSize, query, loading]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load(1, true);
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  useEffect(() => { load(1, true); }, [query]);

  const isInitialLoading = loading && items.length === 0;

  return (
    <FlatList
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      ListHeaderComponent={ListHeaderComponent || null}
      ListEmptyComponent={
        isInitialLoading
          ? (
            <View style={{ padding: spacing.lg, gap: spacing.md }}>
              {Array.from({ length: initialSkeletonCount }).map((_, i) => (
                <View key={i} style={{ height: 60, borderRadius: 12, backgroundColor: '#F3F4F6' }} />
              ))}
            </View>
          )
          : (ListEmptyComponent || <View style={{ padding: spacing.lg }} />)
      }
      onEndReached={() => { if (canLoadMore) load(page + 1); }}
      onEndReachedThreshold={0.5}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      ListFooterComponent={loading && items.length > 0 ? (
        <View style={{ padding: spacing.md, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}
    />
  );
}


