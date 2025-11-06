/**
 * useAccessibility Hook
 *
 * Single Responsibility: Provides accessibility utilities for components
 *
 * Features:
 * - Accessibility props helpers
 * - Color contrast checking
 * - Keyboard navigation
 */

import { useMemo } from 'react';
import {
  createAccessibilityProps,
  createTranslatedAccessibilityProps,
  getContrastRatio,
  meetsContrastRatio,
  ContrastLevel,
  ContrastLevelType,
  createKeyboardNavigationProps,
  AccessibilityRoles,
} from '../utils/accessibility';
import { useTheme } from '../contexts/ThemeContext';

/**
 * useAccessibility hook return type
 */
export interface UseAccessibilityReturn {
  /**
   * Create accessibility props
   */
  createProps: typeof createAccessibilityProps;

  /**
   * Create translated accessibility props
   */
  createTranslatedProps: typeof createTranslatedAccessibilityProps;

  /**
   * Check contrast ratio
   */
  checkContrast: (
    foreground: string,
    background: string,
    level?: ContrastLevelType,
    isLargeText?: boolean
  ) => boolean;

  /**
   * Get contrast ratio
   */
  getContrast: (foreground: string, background: string) => number;

  /**
   * Create keyboard navigation props
   */
  createKeyboardProps: typeof createKeyboardNavigationProps;

  /**
   * Accessibility roles
   */
  roles: typeof AccessibilityRoles;

  /**
   * Check if current theme colors meet contrast requirements
   */
  checkThemeContrast: (level?: ContrastLevelType) => {
    text: boolean;
    primary: boolean;
    surface: boolean;
  };
}

/**
 * useAccessibility hook
 * Provides accessibility utilities for components
 *
 * @returns Accessibility utilities
 *
 * @example
 * ```tsx
 * const { createProps, checkContrast } = useAccessibility();
 *
 * const a11yProps = createProps('Save button', 'Saves the form', 'button');
 * const isAccessible = checkContrast('#000000', '#FFFFFF');
 * ```
 */
export function useAccessibility(): UseAccessibilityReturn {
  const { colors } = useTheme();

  const checkContrast = useMemo(
    () =>
      (
        foreground: string,
        background: string,
        level: ContrastLevel = ContrastLevel.AA,
        isLargeText: boolean = false
      ) => {
        return meetsContrastRatio(foreground, background, level, isLargeText);
      },
    []
  );

  const getContrast = useMemo(
    () => (foreground: string, background: string) => {
      return getContrastRatio(foreground, background);
    },
    []
  );

  const checkThemeContrast = useMemo(
    () =>
      (level: ContrastLevelType = ContrastLevel.AA) => {
        return {
          text: meetsContrastRatio(colors.text, colors.background, level),
          primary: meetsContrastRatio(colors.primary, colors.background, level),
          surface: meetsContrastRatio(colors.text, colors.surface, level),
        };
      },
    [colors]
  );

  return {
    createProps: createAccessibilityProps,
    createTranslatedProps: createTranslatedAccessibilityProps,
    checkContrast,
    getContrast,
    createKeyboardProps: createKeyboardNavigationProps,
    roles: AccessibilityRoles,
    checkThemeContrast,
  };
}
