/**
 * StealthDetector — R3F scene component that runs stealth detection each frame.
 *
 * Reads enemy positions from the ECS world, player position from the store,
 * crouch/sprint state from the InputManager, and night state from the survival
 * clock. Feeds these into the pure StealthSystem tick function and writes the
 * result back to the store.
 *
 * Runs inside the R3F <Canvas> tree (no visual output — returns null).
 *
 * @module components/scene/StealthDetector
 */

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { enemies as enemyQuery } from "@/src/game/ecs/world";
import { InputManager } from "@/src/game/input";
import { gameStore } from "@/src/game/store/webGameStore";
import { type StealthTickInput, tickStealth } from "@/src/game/systems/StealthSystem";

// Throttle stealth ticks to ~10 Hz (every 100ms) to avoid per-frame store writes
const TICK_INTERVAL = 0.1;

export function StealthDetector() {
  const accumulatorRef = useRef(0);
  // Track previous crouch key state for toggle detection
  const prevCrouchRef = useRef(false);

  useFrame((_state, delta) => {
    accumulatorRef.current += delta;
    if (accumulatorRef.current < TICK_INTERVAL) return;

    const dt = accumulatorRef.current;
    accumulatorRef.current = 0;

    const state = gameStore.getState();

    // Only run stealth during active gameplay
    if (state.phase !== "playing") return;

    // Handle crouch toggle from input (rising edge only)
    const inputFrame = InputManager.getInstance().getFrame();
    const crouchPressed = inputFrame.crouch;
    if (crouchPressed && !prevCrouchRef.current) {
      state.toggleCrouch();
    }
    prevCrouchRef.current = crouchPressed;

    // Re-read stealth state after potential toggle
    const stealthState = gameStore.getState().stealthState;

    // Gather hostile positions from the pre-built ECS enemy query
    const hostilePositions: Array<{ x: number; y: number; z: number }> = [];
    for (const entity of enemyQuery) {
      if (entity.health.current > 0) {
        hostilePositions.push(entity.position);
      }
    }

    // Determine movement state from input
    const isMoving = Math.abs(inputFrame.move.x) > 0.1 || Math.abs(inputFrame.move.z) > 0.1;

    const input: StealthTickInput = {
      playerPosition: state.playerPosition,
      isCrouching: stealthState.isCrouching,
      isMoving,
      isSprinting: inputFrame.sprint && isMoving,
      isNight: state.isNight(),
      currentDetection: stealthState.detectionLevel,
      dt,
      hostilePositions,
    };

    const result = tickStealth(input);

    // Only write to store if values actually changed (avoid unnecessary renders)
    if (
      Math.abs(result.detectionLevel - stealthState.detectionLevel) > 0.5 ||
      Math.abs(result.nearestHostileDistance - stealthState.nearestHostileDistance) > 0.5
    ) {
      state.updateStealthDetection(result.detectionLevel, result.nearestHostileDistance);
    }
  });

  return null;
}
