/**
 * CombatScene.tsx - Main R3F combat scene for turn-based battles
 *
 * Features:
 * - Separate 3D scene from overworld
 * - Arena/environment based on encounter location
 * - Position player and enemy combatants
 * - Connect to combat state from game store
 *
 * The combat UI (action buttons, health bars panel) remains in React DOM
 * This is just the 3D backdrop that visualizes the combat.
 */

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stats, Preload } from '@react-three/drei';
import * as THREE from 'three';

import type { CombatState, CombatResult, Combatant } from '@iron-frontier/shared/store';
import { useGameStore } from '../../../game/store/webGameStore';

import { CombatArena } from './CombatArena';
import { CombatantMesh } from './CombatantMesh';
import { CombatCamera, useCameraShake } from './CombatCamera';
import { CombatEffects, useCombatEffects, VictoryEffect, DefeatEffect } from './CombatEffects';
import {
  type CombatSceneProps,
  type ArenaType,
  type CameraMode,
  type Position3D,
  type CombatantAnimation,
  COMBAT_POSITIONS,
  ANIMATION_DURATIONS,
} from './types';

// ============================================================================
// COMBAT SCENE MANAGER (Internal state management)
// ============================================================================

interface CombatSceneState {
  cameraMode: CameraMode;
  focusPosition?: Position3D;
  combatantAnimations: Map<string, CombatantAnimation>;
  selectedTargetId?: string;
}

function useCombatSceneState(combatState: CombatState | null) {
  const [state, setState] = useState<CombatSceneState>({
    cameraMode: 'overview',
    combatantAnimations: new Map(),
  });

  const lastLogLength = useRef(0);

  // Monitor combat log for new actions
  useEffect(() => {
    if (!combatState) return;

    const newLength = combatState.log.length;
    if (newLength > lastLogLength.current) {
      const newResults = combatState.log.slice(lastLogLength.current);

      // Process new combat results
      newResults.forEach((result) => {
        const { action, success, damage, isCritical, wasDodged } = result;

        // Set attacker animation
        if (action.type === 'attack' || action.type === 'aimed_shot') {
          setState((prev) => ({
            ...prev,
            combatantAnimations: new Map(prev.combatantAnimations).set(
              action.actorId,
              'attack'
            ),
          }));

          // Set target animation
          if (action.targetId) {
            const targetAnim: CombatantAnimation = wasDodged
              ? 'dodge'
              : success
              ? 'hit'
              : 'idle';

            setTimeout(() => {
              setState((prev) => ({
                ...prev,
                combatantAnimations: new Map(prev.combatantAnimations).set(
                  action.targetId!,
                  targetAnim
                ),
              }));
            }, 200);

            // Reset animations after duration
            setTimeout(() => {
              setState((prev) => ({
                ...prev,
                combatantAnimations: new Map(prev.combatantAnimations)
                  .set(action.actorId, 'idle')
                  .set(action.targetId!, 'idle'),
              }));
            }, ANIMATION_DURATIONS.attack + 200);
          }
        }

        // Defend animation
        if (action.type === 'defend') {
          setState((prev) => ({
            ...prev,
            combatantAnimations: new Map(prev.combatantAnimations).set(
              action.actorId,
              'defend'
            ),
          }));

          setTimeout(() => {
            setState((prev) => ({
              ...prev,
              combatantAnimations: new Map(prev.combatantAnimations).set(
                action.actorId,
                'idle'
              ),
            }));
          }, ANIMATION_DURATIONS.defend);
        }
      });

      lastLogLength.current = newLength;
    }
  }, [combatState?.log]);

  // Update camera mode based on combat phase
  useEffect(() => {
    if (!combatState) return;

    switch (combatState.phase) {
      case 'victory':
        setState((prev) => ({ ...prev, cameraMode: 'victory' }));
        break;
      case 'defeat':
        setState((prev) => ({ ...prev, cameraMode: 'defeat' }));
        break;
      default:
        setState((prev) => ({ ...prev, cameraMode: 'overview' }));
    }
  }, [combatState?.phase]);

  // Handle death animations
  useEffect(() => {
    if (!combatState) return;

    combatState.combatants.forEach((combatant) => {
      if (combatant.isDead && state.combatantAnimations.get(combatant.definitionId) !== 'death') {
        setState((prev) => ({
          ...prev,
          combatantAnimations: new Map(prev.combatantAnimations).set(
            combatant.definitionId,
            'death'
          ),
        }));
      }
    });
  }, [combatState?.combatants]);

  const setSelectedTarget = (targetId?: string) => {
    setState((prev) => ({ ...prev, selectedTargetId: targetId }));
  };

  return {
    ...state,
    setSelectedTarget,
  };
}

// ============================================================================
// COMBATANT POSITION CALCULATOR
// ============================================================================

function getCombatantPosition(combatant: Combatant, index: number, isPlayer: boolean): Position3D {
  if (isPlayer) {
    return COMBAT_POSITIONS.player;
  }

  // Enemy positions - distribute based on index
  const positions = COMBAT_POSITIONS.enemies;
  if (index < positions.length) {
    return positions[index];
  }

  // Overflow enemies get stacked behind
  return {
    x: positions[0].x + 2,
    y: 0,
    z: positions[index % positions.length].z,
  };
}

// ============================================================================
// ARENA TYPE FROM ENCOUNTER
// ============================================================================

function getArenaType(encounterId: string): ArenaType {
  const id = encounterId.toLowerCase();

  if (id.includes('boss') || id.includes('final') || id.includes('thorne') || id.includes('tyrant')) {
    return 'boss';
  }
  if (id.includes('mine') || id.includes('remnant') || id.includes('automaton')) {
    return 'mine';
  }
  if (id.includes('canyon') || id.includes('badlands')) {
    return 'canyon';
  }
  if (id.includes('town') || id.includes('street') || id.includes('saloon')) {
    return 'town';
  }
  if (id.includes('forest') || id.includes('woods')) {
    return 'forest';
  }

  return 'desert';
}

// ============================================================================
// COMBAT SCENE CONTENT (Inside Canvas)
// ============================================================================

interface CombatSceneContentProps {
  combatState: CombatState;
  arenaType: ArenaType;
  onSelectTarget?: (targetId: string) => void;
}

function CombatSceneContent({ combatState, arenaType, onSelectTarget }: CombatSceneContentProps) {
  const {
    cameraMode,
    focusPosition,
    combatantAnimations,
    selectedTargetId,
    setSelectedTarget,
  } = useCombatSceneState(combatState);

  const { shake, triggerShake } = useCameraShake();
  const { damageNumbers, hitEffects, spawnDamageNumber, spawnHitEffect } = useCombatEffects();

  const lastLogLength = useRef(0);

  // Process combat results for effects
  useEffect(() => {
    const newLength = combatState.log.length;
    if (newLength > lastLogLength.current) {
      const newResults = combatState.log.slice(lastLogLength.current);

      newResults.forEach((result) => {
        const { action, success, damage, isCritical, wasDodged } = result;

        // Find target position
        if (action.targetId) {
          const target = combatState.combatants.find((c) => c.definitionId === action.targetId);
          if (target) {
            const targetIndex = combatState.combatants.filter((c) => !c.isPlayer).indexOf(target);
            const position = getCombatantPosition(target, targetIndex, target.isPlayer);

            // Spawn damage number
            if (action.type === 'attack' || action.type === 'aimed_shot') {
              if (wasDodged || !success) {
                spawnDamageNumber(position, 0, false, true);
              } else if (damage) {
                spawnDamageNumber(position, damage, isCritical);
                spawnHitEffect(position, isCritical ? 'critical' : 'hit');

                // Camera shake on hit
                triggerShake(isCritical ? 0.3 : 0.15, isCritical ? 400 : 200);
              }
            }
          }
        }
      });

      lastLogLength.current = newLength;
    }
  }, [combatState.log, combatState.combatants, spawnDamageNumber, spawnHitEffect, triggerShake]);

  // Get player and enemies
  const player = combatState.combatants.find((c) => c.isPlayer);
  const enemies = combatState.combatants.filter((c) => !c.isPlayer);

  // Handle target selection
  const handleSelectEnemy = useCallback(
    (targetId: string) => {
      setSelectedTarget(targetId);
      onSelectTarget?.(targetId);
    },
    [onSelectTarget, setSelectedTarget]
  );

  // Get game store's selected target
  const storeSelectedTarget = combatState.selectedTargetId;

  return (
    <>
      {/* Camera */}
      <CombatCamera mode={cameraMode} focusPosition={focusPosition} shake={shake} />

      {/* Arena environment */}
      <CombatArena type={arenaType} width={20} depth={15} />

      {/* Player combatant */}
      {player && (
        <CombatantMesh
          combatant={player}
          position={COMBAT_POSITIONS.player}
          isSelected={false}
          isTargeted={false}
          animation={combatantAnimations.get(player.definitionId) || 'idle'}
        />
      )}

      {/* Enemy combatants */}
      {enemies.map((enemy, index) => (
        <CombatantMesh
          key={enemy.definitionId}
          combatant={enemy}
          position={getCombatantPosition(enemy, index, false)}
          isSelected={combatState.selectedTargetId === enemy.definitionId}
          isTargeted={selectedTargetId === enemy.definitionId}
          animation={combatantAnimations.get(enemy.definitionId) || 'idle'}
          onClick={() => handleSelectEnemy(enemy.definitionId)}
        />
      ))}

      {/* Combat effects */}
      <CombatEffects damageNumbers={damageNumbers} hitEffects={hitEffects} />

      {/* Victory/Defeat effects */}
      {combatState.phase === 'victory' && player && (
        <VictoryEffect playerPosition={COMBAT_POSITIONS.player} />
      )}
      {combatState.phase === 'defeat' && player && (
        <DefeatEffect playerPosition={COMBAT_POSITIONS.player} />
      )}
    </>
  );
}

// ============================================================================
// MAIN COMBAT SCENE COMPONENT
// ============================================================================

export function CombatScene({ combatState, arenaType, onSelectTarget }: CombatSceneProps) {
  // Determine arena type from encounter if not provided
  const resolvedArenaType = arenaType || getArenaType(combatState.encounterId);

  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    >
      <color attach="background" args={['#1a1510']} />

      <CombatSceneContent
        combatState={combatState}
        arenaType={resolvedArenaType}
        onSelectTarget={onSelectTarget}
      />

      <Preload all />
    </Canvas>
  );
}

// ============================================================================
// COMBAT SCENE WRAPPER (Connected to store)
// ============================================================================

export function CombatSceneConnected() {
  const combatState = useGameStore((s) => s.combatState);
  const selectCombatTarget = useGameStore((s) => s.selectCombatTarget);

  if (!combatState) return null;

  return (
    <CombatScene
      combatState={combatState}
      onSelectTarget={(targetId) => selectCombatTarget(targetId)}
    />
  );
}

export default CombatScene;
