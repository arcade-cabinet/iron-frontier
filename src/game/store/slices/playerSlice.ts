/**
 * Player Slice - Player state and actions
 *
 * Manages player-specific state including position, stats,
 * appearance, and related actions like healing and damage.
 *
 * @module game/store/slices/playerSlice
 */

import type { StateCreator } from 'zustand';
import type {
  CharacterAppearance,
  PlayerStats,
  WorldPosition,
  Notification,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Player state data (serializable).
 */
export interface PlayerState {
  /** Unique player ID */
  playerId: string;
  /** Player display name */
  playerName: string;
  /** Player visual appearance */
  playerAppearance: CharacterAppearance | null;
  /** World position */
  playerPosition: WorldPosition;
  /** Y-axis rotation in radians */
  playerRotation: number;
  /** Player statistics */
  playerStats: PlayerStats;
}

/**
 * Player actions.
 */
export interface PlayerActions {
  /** Set player position in world */
  setPlayerPosition: (pos: WorldPosition) => void;
  /** Set player rotation */
  setPlayerRotation: (rotation: number) => void;
  /** Set player name */
  setPlayerName: (name: string) => void;
  /** Set player appearance */
  setPlayerAppearance: (appearance: CharacterAppearance) => void;
  /** Update player stats (partial) */
  updatePlayerStats: (stats: Partial<PlayerStats>) => void;
  /** Gain experience points */
  gainXP: (amount: number) => void;
  /** Take damage (reduces health) */
  takeDamage: (amount: number) => void;
  /** Heal (increases health up to max) */
  heal: (amount: number) => void;
  /** Add gold to player */
  addGold: (amount: number) => void;
  /** Remove gold from player */
  removeGold: (amount: number) => boolean;
  /** Reset player to initial state */
  resetPlayer: () => void;
}

/**
 * Dependencies from other slices.
 */
export interface PlayerSliceDeps {
  addNotification: (type: Notification['type'], message: string) => void;
  setPhase: (phase: string) => void;
}

/**
 * Complete player slice type.
 */
export type PlayerSlice = PlayerState & PlayerActions;

// ============================================================================
// DEFAULTS
// ============================================================================

/**
 * Default player stats.
 */
export const DEFAULT_PLAYER_STATS: PlayerStats = {
  health: 100,
  maxHealth: 100,
  stamina: 100,
  maxStamina: 100,
  xp: 0,
  xpToNext: 100,
  level: 1,
  gold: 50,
  ivrcScript: 0,
  reputation: 0,
  attributes: {
    grit: 5,
    perception: 5,
    endurance: 5,
    charisma: 5,
    intelligence: 5,
    agility: 5,
    luck: 5,
  },
  skills: {
    guns: 20,
    melee: 15,
    lockpick: 15,
    speech: 20,
    repair: 15,
    medicine: 15,
    survival: 25,
    barter: 20,
  },
};

/**
 * Default world position.
 */
/**
 * Default player spawn position in world space.
 * Corresponds to the west entry of Dusty Springs (starting town).
 * Town center at (2200, 0, 1800); player arrives from the west road.
 */
export const DEFAULT_WORLD_POSITION: WorldPosition = {
  x: 2160,
  y: 0,
  z: 1798,
};

/**
 * Default player state.
 */
export const DEFAULT_PLAYER_STATE: PlayerState = {
  playerId: 'player',
  playerName: 'Stranger',
  playerAppearance: null,
  playerPosition: DEFAULT_WORLD_POSITION,
  playerRotation: 0,
  playerStats: DEFAULT_PLAYER_STATS,
};

// ============================================================================
// SLICE FACTORY
// ============================================================================

/**
 * Creates the player Zustand slice.
 *
 * Note: This slice depends on actions from other slices (addNotification, setPhase).
 * The full store must provide these dependencies.
 *
 * @example
 * ```typescript
 * const useGameStore = create<GameState>()((...a) => ({
 *   ...createCoreSlice(...a),
 *   ...createPlayerSlice(...a),
 *   // ... other slices
 * }));
 * ```
 */
export const createPlayerSlice: StateCreator<
  PlayerSlice & PlayerSliceDeps,
  [],
  [],
  PlayerSlice
> = (set, get) => ({
  // State
  ...DEFAULT_PLAYER_STATE,

  // Actions
  setPlayerPosition: (pos: WorldPosition) => set({ playerPosition: pos }),

  setPlayerRotation: (rotation: number) => set({ playerRotation: rotation }),

  setPlayerName: (name: string) => set({ playerName: name }),

  setPlayerAppearance: (appearance: CharacterAppearance) =>
    set({ playerAppearance: appearance }),

  updatePlayerStats: (stats: Partial<PlayerStats>) =>
    set((state) => ({
      playerStats: { ...state.playerStats, ...stats },
    })),

  gainXP: (amount: number) => {
    const state = get();
    const { xp, xpToNext, level } = state.playerStats;
    let newXp = xp + amount;
    let newLevel = level;
    let newXpToNext = xpToNext;

    // Level up logic
    if (newXp >= xpToNext) {
      newXp -= xpToNext;
      newLevel++;
      newXpToNext = Math.floor(xpToNext * 1.5);
      state.addNotification('level', `Level Up! You are now level ${newLevel}`);
      // Heal on level up
      state.heal(state.playerStats.maxHealth);
    } else {
      state.addNotification('xp', `Gained ${amount} XP`);
    }

    set((s) => ({
      playerStats: {
        ...s.playerStats,
        xp: newXp,
        level: newLevel,
        xpToNext: newXpToNext,
      },
    }));
  },

  takeDamage: (amount: number) => {
    set((state) => {
      const currentHealth = state.playerStats.health;
      const newHealth = Math.max(0, currentHealth - amount);

      if (newHealth === 0 && currentHealth > 0) {
        // Player died - defer phase change
        setTimeout(() => get().setPhase('game_over'), 1000);
      }

      return {
        playerStats: { ...state.playerStats, health: newHealth },
      };
    });
  },

  heal: (amount: number) => {
    set((state) => ({
      playerStats: {
        ...state.playerStats,
        health: Math.min(state.playerStats.maxHealth, state.playerStats.health + amount),
      },
    }));
  },

  addGold: (amount: number) => {
    set((state) => ({
      playerStats: {
        ...state.playerStats,
        gold: state.playerStats.gold + amount,
      },
    }));
    get().addNotification('item', `Received ${amount} gold`);
  },

  removeGold: (amount: number) => {
    const currentGold = get().playerStats.gold;
    if (currentGold < amount) return false;

    set((state) => ({
      playerStats: {
        ...state.playerStats,
        gold: state.playerStats.gold - amount,
      },
    }));
    return true;
  },

  resetPlayer: () =>
    set({
      ...DEFAULT_PLAYER_STATE,
    }),
});
