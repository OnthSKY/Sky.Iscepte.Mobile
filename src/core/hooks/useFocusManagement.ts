/**
 * useFocusManagement Hook
 *
 * Single Responsibility: Manages focus for modals and forms
 *
 * Features:
 * - Focus trap for modals
 * - Focus restoration
 * - Focus order management
 */

import { useRef, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

/**
 * Focus management options
 */
export interface FocusManagementOptions {
  /**
   * Enable focus trap (for modals)
   */
  trapFocus?: boolean;

  /**
   * Restore focus on unmount
   */
  restoreFocus?: boolean;

  /**
   * Initial focus element ref
   */
  initialFocusRef?: React.RefObject<HTMLElement>;

  /**
   * Focus order (array of refs)
   */
  focusOrder?: React.RefObject<HTMLElement>[];
}

/**
 * useFocusManagement hook return type
 */
export interface UseFocusManagementReturn {
  /**
   * Set focus to an element
   */
  setFocus: (ref: React.RefObject<HTMLElement>) => void;

  /**
   * Move focus to next element
   */
  focusNext: () => void;

  /**
   * Move focus to previous element
   */
  focusPrevious: () => void;

  /**
   * Restore previous focus
   */
  restoreFocus: () => void;
}

/**
 * useFocusManagement hook
 * Manages focus for modals and forms
 *
 * @param options - Focus management options
 * @returns Focus management utilities
 *
 * @example
 * ```tsx
 * const { setFocus, focusNext } = useFocusManagement({
 *   trapFocus: true,
 *   focusOrder: [input1Ref, input2Ref, buttonRef],
 * });
 * ```
 */
export function useFocusManagement(options: FocusManagementOptions = {}): UseFocusManagementReturn {
  const {
    trapFocus = false,
    restoreFocus: shouldRestore = false,
    initialFocusRef,
    focusOrder = [],
  } = options;
  const previousFocusRef = useRef<React.RefObject<HTMLElement> | null>(null);
  const currentFocusIndex = useRef<number>(-1);

  // Save previous focus on mount
  useEffect(() => {
    if (shouldRestore && Platform.OS === 'web') {
      // Save current active element
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement) {
        // Create a ref-like object to store the element
        previousFocusRef.current = { current: activeElement } as React.RefObject<HTMLElement>;
      }
    }
  }, [shouldRestore]);

  // Set initial focus
  useEffect(() => {
    if (initialFocusRef?.current) {
      setFocus(initialFocusRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFocusRef]);

  // Focus trap (web only)
  useEffect(() => {
    if (!trapFocus || Platform.OS !== 'web' || focusOrder.length === 0) {
      return;
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') {
        return;
      }

      const firstRef = focusOrder[0];
      const lastRef = focusOrder[focusOrder.length - 1];

      if (e.shiftKey) {
        // Shift + Tab (backward)
        if (document.activeElement === firstRef?.current) {
          e.preventDefault();
          lastRef?.current?.focus();
          currentFocusIndex.current = focusOrder.length - 1;
        }
      } else {
        // Tab (forward)
        if (document.activeElement === lastRef?.current) {
          e.preventDefault();
          firstRef?.current?.focus();
          currentFocusIndex.current = 0;
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => {
      document.removeEventListener('keydown', handleTab);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trapFocus, focusOrder]);

  // Restore focus on unmount
  useEffect(() => {
    return () => {
      if (shouldRestore && previousFocusRef.current?.current) {
        (previousFocusRef.current.current as HTMLElement).focus();
      }
    };
  }, [shouldRestore]);

  const setFocus = useCallback(
    (ref: React.RefObject<HTMLElement>) => {
      if (ref?.current) {
        if (Platform.OS === 'web') {
          (ref.current as HTMLElement).focus();
        } else {
          // React Native
          if (ref.current.focus) {
            ref.current.focus();
          }
        }

        // Update current focus index
        const index = focusOrder.findIndex((r) => r === ref);
        if (index !== -1) {
          currentFocusIndex.current = index;
        }
      }
    },
    [focusOrder]
  );

  const focusNext = useCallback(() => {
    if (focusOrder.length === 0) {
      return;
    }

    const nextIndex = (currentFocusIndex.current + 1) % focusOrder.length;
    const nextRef = focusOrder[nextIndex];
    setFocus(nextRef);
  }, [focusOrder, setFocus]);

  const focusPrevious = useCallback(() => {
    if (focusOrder.length === 0) {
      return;
    }

    const prevIndex =
      currentFocusIndex.current <= 0 ? focusOrder.length - 1 : currentFocusIndex.current - 1;
    const prevRef = focusOrder[prevIndex];
    setFocus(prevRef);
  }, [focusOrder, setFocus]);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current?.current) {
      setFocus(previousFocusRef.current);
    }
  }, [setFocus]);

  return {
    setFocus,
    focusNext,
    focusPrevious,
    restoreFocus,
  };
}
