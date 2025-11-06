/**
 * OptimizedImage Component
 *
 * NEDEN: expo-image ile optimized image loading
 * - Lazy loading: Sadece görünür olduğunda yüklenir
 * - Caching: Otomatik cache yönetimi
 * - Placeholder: Loading state için placeholder
 * - Error handling: Hata durumunda fallback
 * - Performance: React Native Image'den daha performanslı
 */

import React from 'react';
import { Image as ExpoImage, ImageProps as ExpoImageProps } from 'expo-image';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../core/contexts/ThemeContext';

interface OptimizedImageProps extends Omit<ExpoImageProps, 'source'> {
  source: string | null | undefined;
  placeholder?: string;
  fallback?: string;
  showLoadingIndicator?: boolean;
  cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk';
}

/**
 * Optimized Image Component
 *
 * NEDEN: expo-image kullanarak performanslı image loading
 * - Lazy loading: Sadece görünür olduğunda yüklenir
 * - Automatic caching: Disk ve memory cache
 * - Placeholder support: Loading state
 * - Error handling: Fallback image
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  placeholder,
  fallback,
  showLoadingIndicator = true,
  cachePolicy = 'memory-disk',
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  // Convert string source to expo-image format
  const imageSource = source ? (typeof source === 'string' ? { uri: source } : source) : null;

  // Use fallback if error or no source
  const displaySource = hasError && fallback ? { uri: fallback } : imageSource;

  if (!displaySource && !placeholder) {
    return (
      <View style={[styles.container, style]}>
        {showLoadingIndicator && <ActivityIndicator color={colors.primary} />}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {isLoading && showLoadingIndicator && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
      <ExpoImage
        source={displaySource || placeholder ? { uri: placeholder } : undefined}
        contentFit="cover"
        transition={200}
        cachePolicy={cachePolicy}
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        style={[styles.image, style]}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default OptimizedImage;
