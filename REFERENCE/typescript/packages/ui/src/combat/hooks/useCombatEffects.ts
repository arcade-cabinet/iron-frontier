/**
 * Combat Effects Hook
 *
 * Manages visual combat effects like screen flashes and hit sparks.
 */

import { useCallback, useRef, useState } from 'react';
import type { CombatEffect, CombatEffectType } from '../types';

interface UseCombatEffectsReturn {
  /** Currently active effects */
  effects: CombatEffect[];
  /** Add a new effect */
  addEffect: (config: Omit<CombatEffect, 'id'>) => void;
  /** Remove an effect by ID */
  removeEffect: (id: string) => void;
  /** Trigger screen flash */
  triggerScreenFlash: (color?: string, intensity?: 'light' | 'medium' | 'heavy') => void;
  /** Trigger screen shake */
  triggerScreenShake: (intensity?: 'light' | 'medium' | 'heavy') => void;
  /** Trigger hit spark on target */
  triggerHitSpark: (targetId: string) => void;
  /** Trigger heal glow on target */
  triggerHealGlow: (targetId: string) => void;
  /** Clear all effects */
  clearAll: () => void;
}

let effectIdCounter = 0;

const DEFAULT_DURATIONS: Record<CombatEffectType, number> = {
  screen_flash: 200,
  screen_shake: 400,
  hit_spark: 300,
  heal_glow: 600,
  status_apply: 500,
};

export function useCombatEffects(): UseCombatEffectsReturn {
  const [effects, setEffects] = useState<CombatEffect[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeEffect = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setEffects((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addEffect = useCallback(
    (config: Omit<CombatEffect, 'id'>) => {
      const id = `effect-${++effectIdCounter}`;
      const duration = config.duration || DEFAULT_DURATIONS[config.type];

      const newEffect: CombatEffect = {
        ...config,
        id,
        duration,
      };

      setEffects((prev) => [...prev, newEffect]);

      // Auto-remove after duration
      const timer = setTimeout(() => {
        removeEffect(id);
      }, duration);
      timersRef.current.set(id, timer);
    },
    [removeEffect]
  );

  const triggerScreenFlash = useCallback(
    (color: string = '#ffffff', intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
      addEffect({
        type: 'screen_flash',
        color,
        intensity,
        duration: intensity === 'heavy' ? 300 : intensity === 'medium' ? 200 : 100,
      });
    },
    [addEffect]
  );

  const triggerScreenShake = useCallback(
    (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
      addEffect({
        type: 'screen_shake',
        intensity,
        duration: intensity === 'heavy' ? 500 : intensity === 'medium' ? 400 : 200,
      });
    },
    [addEffect]
  );

  const triggerHitSpark = useCallback(
    (targetId: string) => {
      addEffect({
        type: 'hit_spark',
        targetId,
        color: '#ff6600',
        duration: 300,
      });
    },
    [addEffect]
  );

  const triggerHealGlow = useCallback(
    (targetId: string) => {
      addEffect({
        type: 'heal_glow',
        targetId,
        color: '#00ff88',
        duration: 600,
      });
    },
    [addEffect]
  );

  const clearAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setEffects([]);
  }, []);

  return {
    effects,
    addEffect,
    removeEffect,
    triggerScreenFlash,
    triggerScreenShake,
    triggerHitSpark,
    triggerHealGlow,
    clearAll,
  };
}
