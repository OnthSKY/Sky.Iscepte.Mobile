/**
 * LoadingSkeleton Component
 *
 * Single Responsibility: Displays skeleton loading states
 *
 * Features:
 * - Skeleton loading animation
 * - Customizable shapes (text, circle, rectangle)
 * - Configurable size and spacing
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Animated, Easing } from 'react-native';
import { useTheme } from '../../core/contexts/ThemeContext';

/**
 * Skeleton shape types
 */
export type SkeletonShape = 'text' | 'circle' | 'rectangle';

/**
 * LoadingSkeleton props
 */
export interface LoadingSkeletonProps {
  /**
   * Shape type
   */
  shape?: SkeletonShape;

  /**
   * Width (default: '100%' for text/rectangle, number for circle)
   */
  width?: number | string;

  /**
   * Height (default: 16 for text, width for circle)
   */
  height?: number;

  /**
   * Border radius
   */
  borderRadius?: number;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Number of skeleton items (for multiple)
   */
  count?: number;

  /**
   * Spacing between items
   */
  spacing?: number;
}

/**
 * LoadingSkeleton component
 * Displays skeleton loading animation
 *
 * @example
 * ```tsx
 * <LoadingSkeleton shape="text" width="80%" />
 * <LoadingSkeleton shape="circle" width={40} />
 * <LoadingSkeleton shape="rectangle" width="100%" height={100} />
 * ```
 */
export default function LoadingSkeleton({
  shape = 'text',
  width,
  height,
  borderRadius,
  style,
  count = 1,
  spacing = 8,
}: LoadingSkeletonProps) {
  const { colors } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  // Default dimensions based on shape
  const defaultWidth = shape === 'circle' ? 40 : '100%';
  const defaultHeight =
    shape === 'circle' ? (typeof width === 'number' ? width : 40) : shape === 'text' ? 16 : 100;
  const defaultBorderRadius = borderRadius ?? (shape === 'circle' ? 999 : shape === 'text' ? 4 : 8);

  const skeletonStyle: ViewStyle = {
    width: width ?? defaultWidth,
    height: height ?? defaultHeight,
    borderRadius: defaultBorderRadius,
    backgroundColor: colors.border,
  };

  if (count === 1) {
    return (
      <Animated.View
        style={[
          skeletonStyle,
          style,
          {
            opacity,
          },
        ]}
      />
    );
  }

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            skeletonStyle,
            index > 0 && { marginTop: spacing },
            style,
            {
              opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
