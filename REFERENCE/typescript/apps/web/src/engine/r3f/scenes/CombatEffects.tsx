/**
 * CombatEffects.tsx - Visual feedback effects for combat
 *
 * Features:
 * - Attack hit effects (particles)
 * - Damage numbers (floating text)
 * - Buff/debuff visual indicators
 * - Victory/defeat effects
 */

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Billboard, Sparkles, Trail } from '@react-three/drei';
import * as THREE from 'three';

import type { CombatResult } from '@iron-frontier/shared/store';
import {
  type CombatEffectsProps,
  type DamageNumber,
  type HitEffect,
  type Position3D,
} from './types';

// ============================================================================
// DAMAGE NUMBER COMPONENT
// ============================================================================

interface FloatingDamageNumberProps {
  damage: DamageNumber;
  onComplete: () => void;
}

const DAMAGE_NUMBER_DURATION = 1500; // ms

function FloatingDamageNumber({ damage, onComplete }: FloatingDamageNumberProps) {
  const [progress, setProgress] = useState(0);
  const startTime = useRef(damage.createdAt);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const newProgress = Math.min(1, elapsed / DAMAGE_NUMBER_DURATION);
      setProgress(newProgress);

      if (newProgress >= 1) {
        clearInterval(interval);
        onComplete();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Animate position (float up and fade out)
  const yOffset = progress * 2;
  const opacity = 1 - progress * progress;
  const scale = damage.isCritical ? 1.5 : 1;

  // Get display text and color
  const getText = () => {
    if (damage.isMiss) return 'MISS';
    return damage.value.toString();
  };

  const getColor = () => {
    if (damage.isMiss) return '#9ca3af';
    if (damage.isCritical) return '#fbbf24';
    return '#ef4444';
  };

  return (
    <Html
      position={[
        damage.position.x,
        damage.position.y + 2.5 + yOffset,
        damage.position.z,
      ]}
      center
      style={{
        pointerEvents: 'none',
        opacity,
        transform: `scale(${scale})`,
        transition: 'transform 0.1s',
      }}
    >
      <div
        style={{
          fontSize: damage.isCritical ? '24px' : '18px',
          fontWeight: 'bold',
          color: getColor(),
          textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.5)',
          fontFamily: 'Impact, sans-serif',
        }}
      >
        {damage.isCritical && !damage.isMiss && 'CRIT! '}
        {getText()}
      </div>
    </Html>
  );
}

// ============================================================================
// HIT PARTICLE EFFECT COMPONENT
// ============================================================================

interface HitParticlesProps {
  effect: HitEffect;
  onComplete: () => void;
}

const HIT_EFFECT_DURATION = 800; // ms

function HitParticles({ effect, onComplete }: HitParticlesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(0);
  const startTime = useRef(effect.createdAt);

  // Generate particle positions
  const particles = useMemo(() => {
    const count = effect.type === 'critical' ? 20 : effect.type === 'heal' ? 15 : 10;
    return Array.from({ length: count }, () => ({
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 3 + 1,
        (Math.random() - 0.5) * 4
      ),
      scale: 0.05 + Math.random() * 0.1,
    }));
  }, [effect.type]);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const newProgress = Math.min(1, elapsed / HIT_EFFECT_DURATION);
      setProgress(newProgress);

      if (newProgress >= 1) {
        clearInterval(interval);
        onComplete();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Get particle color based on effect type
  const getColor = () => {
    switch (effect.type) {
      case 'critical':
        return '#fbbf24';
      case 'heal':
        return '#22c55e';
      case 'miss':
        return '#9ca3af';
      default:
        return '#ef4444';
    }
  };

  const opacity = 1 - progress;
  const color = getColor();

  return (
    <group
      ref={groupRef}
      position={[effect.position.x, effect.position.y + 1.5, effect.position.z]}
    >
      {particles.map((particle, i) => {
        const pos = particle.velocity.clone().multiplyScalar(progress);
        const gravity = -progress * progress * 2; // Add gravity

        return (
          <mesh
            key={i}
            position={[pos.x, pos.y + gravity, pos.z]}
            scale={particle.scale * (1 - progress * 0.5)}
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={opacity} />
          </mesh>
        );
      })}
    </group>
  );
}

// ============================================================================
// MUZZLE FLASH EFFECT
// ============================================================================

interface MuzzleFlashProps {
  position: Position3D;
  direction: 'left' | 'right';
  onComplete: () => void;
}

function MuzzleFlash({ position, direction, onComplete }: MuzzleFlashProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 100);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  const xOffset = direction === 'right' ? 0.8 : -0.8;

  return (
    <group position={[position.x + xOffset, position.y + 1.2, position.z]}>
      {/* Flash cone */}
      <mesh rotation={[0, direction === 'right' ? Math.PI / 2 : -Math.PI / 2, 0]}>
        <coneGeometry args={[0.3, 0.5, 8]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.9} />
      </mesh>
      {/* Core glow */}
      <pointLight color="#ff6b35" intensity={5} distance={3} />
    </group>
  );
}

// ============================================================================
// VICTORY EFFECT COMPONENT
// ============================================================================

interface VictoryEffectProps {
  playerPosition: Position3D;
}

function VictoryEffect({ playerPosition }: VictoryEffectProps) {
  return (
    <group position={[playerPosition.x, playerPosition.y, playerPosition.z]}>
      {/* Golden sparkles */}
      <Sparkles
        count={50}
        scale={4}
        size={3}
        speed={0.5}
        color="#fbbf24"
      />
      {/* Upward light beam */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.5, 1.5, 6, 16, 1, true]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ============================================================================
// DEFEAT EFFECT COMPONENT
// ============================================================================

interface DefeatEffectProps {
  playerPosition: Position3D;
}

function DefeatEffect({ playerPosition }: DefeatEffectProps) {
  return (
    <group position={[playerPosition.x, playerPosition.y + 2, playerPosition.z]}>
      {/* Red/dark particles */}
      <Sparkles
        count={30}
        scale={3}
        size={2}
        speed={0.3}
        color="#ef4444"
      />
    </group>
  );
}

// ============================================================================
// COMBAT LOG DISPLAY (Optional floating combat log)
// ============================================================================

interface CombatLogOverlayProps {
  results: CombatResult[];
  maxVisible?: number;
}

function CombatLogOverlay({ results, maxVisible = 3 }: CombatLogOverlayProps) {
  const recentResults = results.slice(-maxVisible);

  if (recentResults.length === 0) return null;

  return (
    <Html
      position={[0, 6, 0]}
      center
      style={{ pointerEvents: 'none' }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        {recentResults.map((result, i) => (
          <div
            key={i}
            style={{
              padding: '4px 12px',
              backgroundColor: 'rgba(0,0,0,0.7)',
              borderRadius: '4px',
              fontSize: '12px',
              color: result.success ? '#22c55e' : '#9ca3af',
              whiteSpace: 'nowrap',
              opacity: 0.8 - (maxVisible - 1 - i) * 0.2,
            }}
          >
            {result.message}
          </div>
        ))}
      </div>
    </Html>
  );
}

// ============================================================================
// MAIN COMBAT EFFECTS COMPONENT
// ============================================================================

export function CombatEffects({ damageNumbers, hitEffects, lastResult }: CombatEffectsProps) {
  const [activeNumbers, setActiveNumbers] = useState<DamageNumber[]>([]);
  const [activeHitEffects, setActiveHitEffects] = useState<HitEffect[]>([]);

  // Sync external damage numbers
  useEffect(() => {
    setActiveNumbers((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const newNumbers = damageNumbers.filter((n) => !existingIds.has(n.id));
      return [...prev, ...newNumbers];
    });
  }, [damageNumbers]);

  // Sync external hit effects
  useEffect(() => {
    setActiveHitEffects((prev) => {
      const existingIds = new Set(prev.map((e) => e.id));
      const newEffects = hitEffects.filter((e) => !existingIds.has(e.id));
      return [...prev, ...newEffects];
    });
  }, [hitEffects]);

  const removeDamageNumber = (id: string) => {
    setActiveNumbers((prev) => prev.filter((n) => n.id !== id));
  };

  const removeHitEffect = (id: string) => {
    setActiveHitEffects((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <group>
      {/* Floating damage numbers */}
      {activeNumbers.map((damage) => (
        <FloatingDamageNumber
          key={damage.id}
          damage={damage}
          onComplete={() => removeDamageNumber(damage.id)}
        />
      ))}

      {/* Hit particle effects */}
      {activeHitEffects.map((effect) => (
        <HitParticles
          key={effect.id}
          effect={effect}
          onComplete={() => removeHitEffect(effect.id)}
        />
      ))}
    </group>
  );
}

// ============================================================================
// HOOKS FOR EFFECT MANAGEMENT
// ============================================================================

export function useCombatEffects() {
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
  const idCounter = useRef(0);

  const spawnDamageNumber = (position: Position3D, value: number, isCritical: boolean = false, isMiss: boolean = false) => {
    const id = `damage-${idCounter.current++}`;
    setDamageNumbers((prev) => [
      ...prev,
      {
        id,
        value,
        position,
        isCritical,
        isMiss,
        createdAt: Date.now(),
      },
    ]);
  };

  const spawnHitEffect = (position: Position3D, type: HitEffect['type']) => {
    const id = `hit-${idCounter.current++}`;
    setHitEffects((prev) => [
      ...prev,
      {
        id,
        position,
        type,
        createdAt: Date.now(),
      },
    ]);
  };

  const clearEffects = () => {
    setDamageNumbers([]);
    setHitEffects([]);
  };

  return {
    damageNumbers,
    hitEffects,
    spawnDamageNumber,
    spawnHitEffect,
    clearEffects,
  };
}

export { VictoryEffect, DefeatEffect, MuzzleFlash, CombatLogOverlay };
export default CombatEffects;
