/**
 * OptimizedFlatList Component
 *
 * NEDEN: FlatList performans optimizasyonları
 * - getItemLayout: Sabit item height'lar için layout hesaplama
 * - removeClippedSubviews: Görünmeyen view'ları kaldır
 * - maxToRenderPerBatch: Batch başına render edilecek item sayısı
 * - windowSize: Render window boyutu
 * - initialNumToRender: İlk render'da gösterilecek item sayısı
 */

import React from 'react';
import { FlatList, FlatListProps } from 'react-native';

interface OptimizedFlatListProps<T> extends FlatListProps<T> {
  /**
   * Estimated item height for getItemLayout optimization
   * NEDEN: Sabit height'lar için layout hesaplama performansı artırır
   */
  estimatedItemHeight?: number;

  /**
   * Remove clipped subviews for better performance
   * NEDEN: Görünmeyen view'ları DOM'dan kaldırır, memory kullanımını azaltır
   */
  removeClippedSubviews?: boolean;

  /**
   * Maximum items to render per batch
   * NEDEN: Batch başına render edilecek item sayısını kontrol eder
   */
  maxToRenderPerBatch?: number;

  /**
   * Render window size (in viewport units)
   * NEDEN: Render window boyutunu kontrol eder, daha küçük = daha az memory
   */
  windowSize?: number;

  /**
   * Initial number of items to render
   * NEDEN: İlk render'da gösterilecek item sayısını kontrol eder
   */
  initialNumToRender?: number;
}

/**
 * Optimized FlatList Component
 *
 * NEDEN: FlatList performans optimizasyonları için wrapper
 * - getItemLayout: Sabit height'lar için layout hesaplama
 * - removeClippedSubviews: Memory optimization
 * - Batch rendering: Daha kontrollü rendering
 * - Window size: Render window optimization
 */
export function OptimizedFlatList<T>({
  estimatedItemHeight,
  removeClippedSubviews = true,
  maxToRenderPerBatch = 10,
  windowSize = 5,
  initialNumToRender = 10,
  getItemLayout,
  ...props
}: OptimizedFlatListProps<T>) {
  // Generate getItemLayout if estimatedItemHeight is provided
  const optimizedGetItemLayout = React.useMemo(() => {
    if (getItemLayout) {
      return getItemLayout;
    }

    if (estimatedItemHeight && props.data) {
      return (_data: any, index: number) => ({
        length: estimatedItemHeight,
        offset: estimatedItemHeight * index,
        index,
      });
    }

    return undefined;
  }, [getItemLayout, estimatedItemHeight, props.data]);

  return (
    <FlatList
      {...props}
      getItemLayout={optimizedGetItemLayout}
      removeClippedSubviews={removeClippedSubviews}
      maxToRenderPerBatch={maxToRenderPerBatch}
      windowSize={windowSize}
      initialNumToRender={initialNumToRender}
      // Performance optimizations
      updateCellsBatchingPeriod={50} // Batch update period in ms
      legacyImplementation={false} // Use new implementation
    />
  );
}

export default OptimizedFlatList;
