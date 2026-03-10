/**
 * Stealth Slice - Detection and crouching state
 *
 * Manages stealth/detection level based on proximity to hostile entities,
 * crouching state, and environmental modifiers (night, movement).
 *
 * Detection level:
 *   0       = fully hidden
 *   1-29    = hidden (indicator shows [HIDDEN])
 *   30-79   = caution (indicator shows [CAUTION])
 *   80-100  = danger (indicator shows [DANGER])
 *
 * @module game/store/slices/stealthSlice
 */

import type { StateCreator } from 'zustand';
import type { StealthState } from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Stealth slice state (same as StealthState from types).
 */
export type StealthSliceState = StealthState;

/**
 * Stealth slice actions.
 */
export interface StealthActions {
  /** Set crouching state directly */
  setCrouching: (crouching: boolean) => void;
  /** Toggle crouch on/off */
  toggleCrouch: () => void;
  /** Update detection level and nearest hostile distance (called by stealth tick) */
  updateStealthDetection: (detectionLevel: number, nearestDistance: number) => void;
}

/**
 * Complete stealth slice type.
 */
export type StealthSlice = StealthSliceState & StealthActions;

// ============================================================================
// DEFAULTS
// ============================================================================

export const DEFAULT_STEALTH_STATE: StealthSliceState = {
  detectionLevel: 0,
  isHidden: true,
  isCrouching: false,
  nearestHostileDistance: -1,
};

// ============================================================================
// SLICE FACTORY
// ============================================================================

/**
 * Creates the stealth Zustand slice.
 */
export const createStealthSlice: StateCreator<any, [], [], any> = (
  set,
  _get,
) => ({
  // Nested state object matching GameStateData.stealthState
  stealthState: { ...DEFAULT_STEALTH_STATE },

  // Actions at root level matching GameStateActions
  setCrouching: (crouching: boolean) => {
    set((s: any) => ({ stealthState: { ...s.stealthState, isCrouching: crouching } }));
  },

  toggleCrouch: () => {
    set((s: any) => ({ stealthState: { ...s.stealthState, isCrouching: !s.stealthState.isCrouching } }));
  },

  updateStealthDetection: (detectionLevel: number, nearestDistance: number) => {
    const clamped = Math.max(0, Math.min(100, detectionLevel));
    set((s: any) => ({
      stealthState: {
        ...s.stealthState,
        detectionLevel: clamped,
        isHidden: clamped < 30,
        nearestHostileDistance: nearestDistance,
      },
    }));
  },
});
