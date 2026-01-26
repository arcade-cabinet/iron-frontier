/**
 * CombatantMesh.tsx - Visual representation of combatants
 *
 * Features:
 * - Player character mesh
 * - Enemy meshes (placeholder capsules with type-based styling)
 * - Health bar above heads
 * - Status effect indicators
 * - Attack/defend animations
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';

import type { Combatant } from '@iron-frontier/shared/store';
import {
  type CombatantMeshProps,
  type CombatantAnimation,
  type Position3D,
  ANIMATION_DURATIONS,
} from './types';

// ============================================================================
// HEALTH BAR COMPONENT
// ============================================================================

interface HealthBarProps {
  current: number;
  max: number;
  isPlayer: boolean;
}

function HealthBar({ current, max, isPlayer }: HealthBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  // Color based on health percentage
  const getHealthColor = () => {
    if (percentage > 60) return '#22c55e'; // Green
    if (percentage > 30) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <Html
      position={[0, 2.5, 0]}
      center
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: '60px',
          padding: '2px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderRadius: '4px',
          border: `1px solid ${isPlayer ? '#3b82f6' : '#ef4444'}`,
        }}
      >
        {/* Health bar background */}
        <div
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#374151',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          {/* Health bar fill */}
          <div
            style={{
              width: `${percentage}%`,
              height: '100%',
              backgroundColor: getHealthColor(),
              transition: 'width 0.3s ease-out',
            }}
          />
        </div>
        {/* Health text */}
        <div
          style={{
            fontSize: '9px',
            color: '#ffffff',
            textAlign: 'center',
            marginTop: '2px',
            fontFamily: 'monospace',
          }}
        >
          {current}/{max}
        </div>
      </div>
    </Html>
  );
}

// ============================================================================
// STATUS EFFECTS DISPLAY
// ============================================================================

interface StatusEffectsProps {
  effects: Array<{ type: string; turnsRemaining: number; value?: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  bleeding: '#dc2626',
  stunned: '#fbbf24',
  poisoned: '#22c55e',
  burning: '#f97316',
  buffed: '#3b82f6',
};

const STATUS_ICONS: Record<string, string> = {
  bleeding: '💔',
  stunned: '💫',
  poisoned: '☠️',
  burning: '🔥',
  buffed: '⬆️',
};

function StatusEffects({ effects }: StatusEffectsProps) {
  if (effects.length === 0) return null;

  return (
    <Html position={[0, 3.2, 0]} center style={{ pointerEvents: 'none' }}>
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
        {effects.map((effect, i) => (
          <div
            key={`${effect.type}-${i}`}
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: STATUS_COLORS[effect.type] || '#666',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
            title={`${effect.type} (${effect.turnsRemaining} turns)`}
          >
            {STATUS_ICONS[effect.type] || '?'}
          </div>
        ))}
      </div>
    </Html>
  );
}

// ============================================================================
// NAME PLATE COMPONENT
// ============================================================================

interface NamePlateProps {
  name: string;
  isPlayer: boolean;
  isActive: boolean;
}

function NamePlate({ name, isPlayer, isActive }: NamePlateProps) {
  return (
    <Html position={[0, 3.5, 0]} center style={{ pointerEvents: 'none' }}>
      <div
        style={{
          padding: '2px 8px',
          backgroundColor: isActive ? 'rgba(59, 130, 246, 0.9)' : 'rgba(0,0,0,0.7)',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 'bold',
          color: isPlayer ? '#93c5fd' : '#fca5a5',
          whiteSpace: 'nowrap',
          border: isActive ? '1px solid #60a5fa' : '1px solid transparent',
        }}
      >
        {name}
      </div>
    </Html>
  );
}

// ============================================================================
// SELECTION INDICATOR
// ============================================================================

interface SelectionIndicatorProps {
  isSelected: boolean;
  isTargeted: boolean;
}

function SelectionIndicator({ isSelected, isTargeted }: SelectionIndicatorProps) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ringRef.current && (isSelected || isTargeted)) {
      // Pulsing animation
      const scale = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.1;
      ringRef.current.scale.set(scale, scale, 1);
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.5;
    }
  });

  if (!isSelected && !isTargeted) return null;

  return (
    <mesh
      ref={ringRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.05, 0]}
    >
      <ringGeometry args={[0.8, 1, 32]} />
      <meshBasicMaterial
        color={isSelected ? '#3b82f6' : '#ef4444'}
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ============================================================================
// COMBATANT BODY MESH
// ============================================================================

interface CombatantBodyProps {
  isPlayer: boolean;
  type?: string;
  isDead: boolean;
  animation: CombatantAnimation;
}

function CombatantBody({ isPlayer, type = 'bandit', isDead, animation }: CombatantBodyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [animProgress, setAnimProgress] = useState(0);
  const animStartTime = useRef(0);

  // Determine body color based on combatant type
  const getBodyColor = () => {
    if (isPlayer) return '#2563eb'; // Blue for player
    switch (type) {
      case 'animal':
        return '#78716c';
      case 'automaton':
        return '#71717a';
      case 'bandit':
      case 'gunslinger':
        return '#b91c1c';
      case 'brute':
        return '#7c2d12';
      case 'sharpshooter':
        return '#166534';
      case 'dynamiter':
        return '#c2410c';
      default:
        return '#6b7280';
    }
  };

  // Animation effects
  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const elapsed = clock.getElapsedTime();

    // Idle breathing animation
    if (animation === 'idle' && !isDead) {
      groupRef.current.position.y = Math.sin(elapsed * 2) * 0.05;
    }

    // Attack animation (lunge forward)
    if (animation === 'attack') {
      const duration = ANIMATION_DURATIONS.attack / 1000;
      const progress = Math.min(1, (elapsed - animStartTime.current) / duration);
      const lunge = Math.sin(progress * Math.PI) * 0.5;
      groupRef.current.position.z = isPlayer ? lunge : -lunge;
    }

    // Hit animation (recoil)
    if (animation === 'hit') {
      const duration = ANIMATION_DURATIONS.hit / 1000;
      const progress = Math.min(1, (elapsed - animStartTime.current) / duration);
      const recoil = Math.sin(progress * Math.PI) * 0.3;
      groupRef.current.position.z = isPlayer ? -recoil : recoil;
      groupRef.current.rotation.z = Math.sin(progress * Math.PI * 4) * 0.1;
    }

    // Defend animation (crouch)
    if (animation === 'defend') {
      const duration = ANIMATION_DURATIONS.defend / 1000;
      const progress = Math.min(1, (elapsed - animStartTime.current) / duration);
      groupRef.current.scale.y = 1 - Math.sin(progress * Math.PI) * 0.2;
    }

    // Death animation (fall over)
    if (animation === 'death' || isDead) {
      const duration = ANIMATION_DURATIONS.death / 1000;
      const progress = Math.min(1, (elapsed - animStartTime.current) / duration);
      groupRef.current.rotation.x = progress * (Math.PI / 2);
      groupRef.current.position.y = -progress * 0.5;
    }

    // Victory animation (jump)
    if (animation === 'victory') {
      const jumpHeight = Math.abs(Math.sin(elapsed * 6)) * 0.5;
      groupRef.current.position.y = jumpHeight;
    }
  });

  // Track animation start time
  useEffect(() => {
    animStartTime.current = performance.now() / 1000;
  }, [animation]);

  const bodyColor = getBodyColor();
  const opacity = isDead ? 0.5 : 1;

  return (
    <group ref={groupRef}>
      {/* Body (capsule shape) */}
      <mesh position={[0, 1, 0]} castShadow>
        <capsuleGeometry args={[0.4, 1, 8, 16]} />
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.7}
          metalness={0.1}
          transparent={isDead}
          opacity={opacity}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={isPlayer ? '#f3e8ff' : '#fecaca'}
          roughness={0.8}
          transparent={isDead}
          opacity={opacity}
        />
      </mesh>

      {/* Hat (for non-animals) */}
      {type !== 'animal' && type !== 'automaton' && (
        <mesh position={[0, 2.35, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.4, 0.15, 16]} />
          <meshStandardMaterial
            color="#3f3f46"
            roughness={0.9}
            transparent={isDead}
            opacity={opacity}
          />
        </mesh>
      )}

      {/* Automaton antenna */}
      {type === 'automaton' && (
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  );
}

// ============================================================================
// TURN INDICATOR
// ============================================================================

interface TurnIndicatorProps {
  isActive: boolean;
  actionPoints: number;
  maxActionPoints: number;
}

function TurnIndicator({ isActive, actionPoints, maxActionPoints }: TurnIndicatorProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current && isActive) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 2;
    }
  });

  if (!isActive) return null;

  return (
    <group ref={groupRef} position={[0, 0.1, 0]}>
      {/* Rotating arrows indicating it's this combatant's turn */}
      {[0, 120, 240].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.sin((angle * Math.PI) / 180) * 1.2,
            0,
            Math.cos((angle * Math.PI) / 180) * 1.2,
          ]}
          rotation={[-Math.PI / 2, 0, ((angle + 180) * Math.PI) / 180]}
        >
          <coneGeometry args={[0.15, 0.3, 4]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      ))}

      {/* AP indicator */}
      <Html position={[0, -0.5, 0]} center style={{ pointerEvents: 'none' }}>
        <div
          style={{
            padding: '2px 6px',
            backgroundColor: 'rgba(251, 191, 36, 0.9)',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#000',
          }}
        >
          AP: {actionPoints}/{maxActionPoints}
        </div>
      </Html>
    </group>
  );
}

// ============================================================================
// MAIN COMBATANT MESH COMPONENT
// ============================================================================

export function CombatantMesh({
  combatant,
  position,
  isSelected,
  isTargeted,
  animation,
  onClick,
}: CombatantMeshProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Determine combatant type from definition ID for styling
  const getCombatantType = () => {
    if (combatant.isPlayer) return 'player';
    // Extract type from definition ID patterns
    const id = combatant.definitionId.toLowerCase();
    if (id.includes('wolf') || id.includes('coyote') || id.includes('bear') || id.includes('snake') || id.includes('scorpion') || id.includes('lion')) {
      return 'animal';
    }
    if (id.includes('automaton') || id.includes('golem') || id.includes('clockwork') || id.includes('remnant') || id.includes('mechanical')) {
      return 'automaton';
    }
    if (id.includes('brute') || id.includes('enforcer')) {
      return 'brute';
    }
    if (id.includes('sharpshooter') || id.includes('marksman')) {
      return 'sharpshooter';
    }
    if (id.includes('dynamiter') || id.includes('saboteur')) {
      return 'dynamiter';
    }
    if (id.includes('gunslinger') || id.includes('gunman') || id.includes('gunner')) {
      return 'gunslinger';
    }
    return 'bandit';
  };

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      // Make clickable enemies have pointer cursor
      onPointerOver={() => {
        if (onClick && !combatant.isPlayer && !combatant.isDead) {
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Selection/target indicator ring */}
      <SelectionIndicator isSelected={isSelected} isTargeted={isTargeted} />

      {/* Turn indicator */}
      <TurnIndicator
        isActive={combatant.isActive}
        actionPoints={combatant.actionPoints}
        maxActionPoints={combatant.maxActionPoints}
      />

      {/* Combatant body */}
      <CombatantBody
        isPlayer={combatant.isPlayer}
        type={getCombatantType()}
        isDead={combatant.isDead}
        animation={animation}
      />

      {/* Name plate */}
      {!combatant.isDead && (
        <NamePlate
          name={combatant.name}
          isPlayer={combatant.isPlayer}
          isActive={combatant.isActive}
        />
      )}

      {/* Health bar */}
      {!combatant.isDead && (
        <HealthBar
          current={combatant.health}
          max={combatant.maxHealth}
          isPlayer={combatant.isPlayer}
        />
      )}

      {/* Status effects */}
      <StatusEffects effects={combatant.statusEffects} />
    </group>
  );
}

export default CombatantMesh;
