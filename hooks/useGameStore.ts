/**
 * useGameStore — Thin hook wrapper around the Zustand game store.
 *
 * Provides the same API as zustand's `useStore` but tied to the
 * singleton `gameStore` instance so consumers don't need to import it directly.
 *
 * @module hooks/useGameStore
 */

import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { gameStore } from '@/src/game/store';
import type { GameState } from '@/src/game/store';

/**
 * Subscribe to the entire game store (re-renders on every change).
 *
 * Prefer passing a selector to limit re-renders:
 * ```ts
 * const health = useGameStore((s) => s.playerStats.health);
 * ```
 */
export function useGameStore(): GameState;

/**
 * Subscribe to a derived slice of game state.
 *
 * @param selector - Pure function that picks the fields you need.
 */
export function useGameStore<T>(selector: (state: GameState) => T): T;

export function useGameStore<T>(selector?: (state: GameState) => T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useStore(gameStore, selector as any);
}

/**
 * Subscribe to multiple fields with shallow equality (avoids spurious re-renders).
 *
 * @example
 * ```ts
 * const { health, gold } = useGameStoreShallow((s) => ({
 *   health: s.playerStats.health,
 *   gold: s.playerStats.gold,
 * }));
 * ```
 */
export function useGameStoreShallow<T>(selector: (state: GameState) => T): T {
  return useStore(gameStore, useShallow(selector));
}
