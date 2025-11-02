/**
 * useDebounce Hook
 * 
 * Single Responsibility: Debounces a value with configurable delay
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced value
 * 
 * @example
 * ```tsx
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 500);
 * // debouncedSearch will only update 500ms after search stops changing
 * ```
 */

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

