/**
 * useShallow Hook
 *
 * NEDEN: Selective subscriptions için
 * - Sadece ihtiyaç duyulan state değişikliklerinde re-render
 * - Gereksiz re-render'ları önler
 * - Performance iyileştirmesi
 */

import { useShallow as zustandUseShallow } from 'zustand/react/shallow';

/**
 * Shallow comparison hook for Zustand
 *
 * NEDEN: Object reference equality yerine shallow equality kullanır
 * - Sadece değişen field'lar için re-render
 * - Daha performanslı component'ler
 *
 * Örnek kullanım:
 * ```tsx
 * const { theme, language } = useAppStore(
 *   useShallow((state) => ({ theme: state.themePreference, language: state.language }))
 * );
 * ```
 */
export const useShallow = zustandUseShallow;
