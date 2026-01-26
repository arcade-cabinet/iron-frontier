/**
 * Damage Numbers Hook
 *
 * Manages floating damage numbers with automatic cleanup.
 */

import { useCallback, useRef, useState } from 'react';
import type { DamageNumberConfig } from '../types';

interface UseDamageNumbersReturn {
  /** Currently active damage numbers */
  damageNumbers: DamageNumberConfig[];
  /** Add a new damage number */
  addDamageNumber: (config: Omit<DamageNumberConfig, 'id'>) => void;
  /** Remove a damage number by ID */
  removeDamageNumber: (id: string) => void;
  /** Clear all damage numbers */
  clearAll: () => void;
}

let damageNumberIdCounter = 0;

export function useDamageNumbers(
  /** Duration before auto-removal (ms) */
  duration: number = 1500
): UseDamageNumbersReturn {
  const [damageNumbers, setDamageNumbers] = useState<DamageNumberConfig[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeDamageNumber = useCallback((id: string) => {
    // Clear any existing timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setDamageNumbers((prev) => prev.filter((dn) => dn.id !== id));
  }, []);

  const addDamageNumber = useCallback(
    (config: Omit<DamageNumberConfig, 'id'>) => {
      const id = `damage-${++damageNumberIdCounter}`;
      const newDamageNumber: DamageNumberConfig = {
        ...config,
        id,
        // Add slight random offset for visual variety
        offsetX: config.offsetX ?? (Math.random() * 40 - 20),
        offsetY: config.offsetY ?? 0,
      };

      setDamageNumbers((prev) => [...prev, newDamageNumber]);

      // Set auto-removal timer
      const timer = setTimeout(() => {
        removeDamageNumber(id);
      }, duration);
      timersRef.current.set(id, timer);
    },
    [duration, removeDamageNumber]
  );

  const clearAll = useCallback(() => {
    // Clear all timers
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setDamageNumbers([]);
  }, []);

  return {
    damageNumbers,
    addDamageNumber,
    removeDamageNumber,
    clearAll,
  };
}
