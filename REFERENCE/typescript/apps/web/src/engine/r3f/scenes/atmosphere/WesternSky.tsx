/**
 * WesternSky.tsx - Western-themed sky and atmospheric effects for R3F
 *
 * Features:
 * - Day/night cycle tied to game time
 * - Western desert atmosphere with dusty sunsets
 * - Dynamic sun position and color
 * - Atmospheric fog that matches time of day
 * - Ambient lighting adjustments
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sky, Cloud } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================================
// TYPES
// ============================================================================

export interface WesternSkyProps {
  /** Current game hour (0-24) */
  gameHour: number;
  /** Enable clouds */
  enableClouds?: boolean;
  /** Cloud density (0-1) */
  cloudDensity?: number;
}

export interface AtmosphericEffectsProps {
  /** Current game hour (0-24) */
  gameHour: number;
  /** Enable distance fog */
  enableFog?: boolean;
  /** Enable dust particles */
  enableDust?: boolean;
  /** Dust intensity (0-1) */
  dustIntensity?: number;
}

export type TimeOfDay = 'night' | 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'evening';

// ============================================================================
// TIME OF DAY CALCULATIONS
// ============================================================================

const TIME_BOUNDARIES = {
  nightEnd: 5,
  dawnEnd: 7,
  morningEnd: 12,
  middayEnd: 14,
  afternoonEnd: 18,
  duskEnd: 20,
  eveningEnd: 22,
};

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour < TIME_BOUNDARIES.nightEnd) return 'night';
  if (hour < TIME_BOUNDARIES.dawnEnd) return 'dawn';
  if (hour < TIME_BOUNDARIES.morningEnd) return 'morning';
  if (hour < TIME_BOUNDARIES.middayEnd) return 'midday';
  if (hour < TIME_BOUNDARIES.afternoonEnd) return 'afternoon';
  if (hour < TIME_BOUNDARIES.duskEnd) return 'dusk';
  if (hour < TIME_BOUNDARIES.eveningEnd) return 'evening';
  return 'night';
}

function getSunPosition(hour: number): THREE.Vector3 {
  // Normalize hour to 0-24
  const h = ((hour % 24) + 24) % 24;

  // Sun angle: 0 at 6am (sunrise), PI at 6pm (sunset)
  const angle = ((h - 6) / 24) * Math.PI * 2;

  // Calculate sun position on sky dome
  const elevation = Math.sin(angle);
  const azimuth = Math.cos(angle);

  // Position on a unit sphere, scaled for sky distance
  const distance = 1;
  const x = azimuth * 0.7 * distance;
  const y = Math.max(-0.2, elevation) * distance; // Keep slightly above horizon
  const z = -0.5 * distance;

  return new THREE.Vector3(x, y, z).normalize();
}

// ============================================================================
// SKY PRESETS
// ============================================================================

interface SkyPreset {
  turbidity: number;
  rayleigh: number;
  mieCoefficient: number;
  mieDirectionalG: number;
  sunColor: THREE.Color;
  ambientColor: THREE.Color;
  ambientIntensity: number;
  directionalIntensity: number;
  fogColor: THREE.Color;
  fogDensity: number;
}

const SKY_PRESETS: Record<TimeOfDay, SkyPreset> = {
  night: {
    turbidity: 2,
    rayleigh: 0.1,
    mieCoefficient: 0.001,
    mieDirectionalG: 0.8,
    sunColor: new THREE.Color(0x404070),
    ambientColor: new THREE.Color(0x202040),
    ambientIntensity: 0.15,
    directionalIntensity: 0.05,
    fogColor: new THREE.Color(0x101020),
    fogDensity: 0.002,
  },
  dawn: {
    turbidity: 8,
    rayleigh: 2,
    mieCoefficient: 0.02,
    mieDirectionalG: 0.95,
    sunColor: new THREE.Color(0xff7040),
    ambientColor: new THREE.Color(0xff9060),
    ambientIntensity: 0.4,
    directionalIntensity: 0.5,
    fogColor: new THREE.Color(0xffd0a0),
    fogDensity: 0.004,
  },
  morning: {
    turbidity: 6,
    rayleigh: 1,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.9,
    sunColor: new THREE.Color(0xfff0d0),
    ambientColor: new THREE.Color(0xffe8d0),
    ambientIntensity: 0.6,
    directionalIntensity: 0.85,
    fogColor: new THREE.Color(0xc0d0e0),
    fogDensity: 0.002,
  },
  midday: {
    turbidity: 5,
    rayleigh: 0.5,
    mieCoefficient: 0.003,
    mieDirectionalG: 0.85,
    sunColor: new THREE.Color(0xffffff),
    ambientColor: new THREE.Color(0xf0f0ff),
    ambientIntensity: 0.7,
    directionalIntensity: 1.0,
    fogColor: new THREE.Color(0xb0c0d0),
    fogDensity: 0.0015,
  },
  afternoon: {
    turbidity: 6,
    rayleigh: 0.8,
    mieCoefficient: 0.004,
    mieDirectionalG: 0.88,
    sunColor: new THREE.Color(0xfff0c0),
    ambientColor: new THREE.Color(0xffecd0),
    ambientIntensity: 0.65,
    directionalIntensity: 0.9,
    fogColor: new THREE.Color(0xc0c0b0),
    fogDensity: 0.002,
  },
  dusk: {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.03,
    mieDirectionalG: 0.97,
    sunColor: new THREE.Color(0xff6030),
    ambientColor: new THREE.Color(0xff8050),
    ambientIntensity: 0.35,
    directionalIntensity: 0.4,
    fogColor: new THREE.Color(0xff9070),
    fogDensity: 0.005,
  },
  evening: {
    turbidity: 4,
    rayleigh: 0.5,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.85,
    sunColor: new THREE.Color(0x604080),
    ambientColor: new THREE.Color(0x403060),
    ambientIntensity: 0.2,
    directionalIntensity: 0.1,
    fogColor: new THREE.Color(0x302040),
    fogDensity: 0.003,
  },
};

// ============================================================================
// INTERPOLATION HELPERS
// ============================================================================

function lerpColor(a: THREE.Color, b: THREE.Color, t: number): THREE.Color {
  return new THREE.Color(
    a.r + (b.r - a.r) * t,
    a.g + (b.g - a.g) * t,
    a.b + (b.b - a.b) * t
  );
}

function lerpNumber(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function getInterpolatedPreset(hour: number): SkyPreset {
  const timeOfDay = getTimeOfDay(hour);
  const preset = SKY_PRESETS[timeOfDay];

  // Get transition progress within current period
  let t = 0;
  let nextPreset = preset;

  if (hour >= TIME_BOUNDARIES.nightEnd && hour < TIME_BOUNDARIES.dawnEnd) {
    t = (hour - TIME_BOUNDARIES.nightEnd) / (TIME_BOUNDARIES.dawnEnd - TIME_BOUNDARIES.nightEnd);
    nextPreset = SKY_PRESETS.morning;
  } else if (hour >= TIME_BOUNDARIES.dawnEnd && hour < TIME_BOUNDARIES.morningEnd) {
    t = (hour - TIME_BOUNDARIES.dawnEnd) / (TIME_BOUNDARIES.morningEnd - TIME_BOUNDARIES.dawnEnd);
    nextPreset = SKY_PRESETS.midday;
  } else if (hour >= TIME_BOUNDARIES.afternoonEnd && hour < TIME_BOUNDARIES.duskEnd) {
    t = (hour - TIME_BOUNDARIES.afternoonEnd) / (TIME_BOUNDARIES.duskEnd - TIME_BOUNDARIES.afternoonEnd);
    nextPreset = SKY_PRESETS.evening;
  } else if (hour >= TIME_BOUNDARIES.duskEnd && hour < TIME_BOUNDARIES.eveningEnd) {
    t = (hour - TIME_BOUNDARIES.duskEnd) / (TIME_BOUNDARIES.eveningEnd - TIME_BOUNDARIES.duskEnd);
    nextPreset = SKY_PRESETS.night;
  }

  // Interpolate all values
  return {
    turbidity: lerpNumber(preset.turbidity, nextPreset.turbidity, t),
    rayleigh: lerpNumber(preset.rayleigh, nextPreset.rayleigh, t),
    mieCoefficient: lerpNumber(preset.mieCoefficient, nextPreset.mieCoefficient, t),
    mieDirectionalG: lerpNumber(preset.mieDirectionalG, nextPreset.mieDirectionalG, t),
    sunColor: lerpColor(preset.sunColor, nextPreset.sunColor, t),
    ambientColor: lerpColor(preset.ambientColor, nextPreset.ambientColor, t),
    ambientIntensity: lerpNumber(preset.ambientIntensity, nextPreset.ambientIntensity, t),
    directionalIntensity: lerpNumber(preset.directionalIntensity, nextPreset.directionalIntensity, t),
    fogColor: lerpColor(preset.fogColor, nextPreset.fogColor, t),
    fogDensity: lerpNumber(preset.fogDensity, nextPreset.fogDensity, t),
  };
}

// ============================================================================
// WESTERN SKY COMPONENT
// ============================================================================

export function WesternSky({
  gameHour,
  enableClouds = true,
  cloudDensity = 0.4,
}: WesternSkyProps) {
  const sunPosition = useMemo(() => getSunPosition(gameHour), [gameHour]);
  const preset = useMemo(() => getInterpolatedPreset(gameHour), [gameHour]);

  // Convert sun position to euler angles for Sky component
  const sunPositionArray: [number, number, number] = [
    sunPosition.x * 100,
    sunPosition.y * 100,
    sunPosition.z * 100,
  ];

  return (
    <group name="western-sky">
      {/* Main sky dome */}
      <Sky
        distance={450000}
        sunPosition={sunPositionArray}
        turbidity={preset.turbidity}
        rayleigh={preset.rayleigh}
        mieCoefficient={preset.mieCoefficient}
        mieDirectionalG={preset.mieDirectionalG}
        inclination={0.5}
        azimuth={0.25}
      />

      {/* Sun light */}
      <directionalLight
        position={sunPositionArray}
        color={preset.sunColor}
        intensity={preset.directionalIntensity * Math.PI}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.0001}
      />

      {/* Ambient light */}
      <ambientLight color={preset.ambientColor} intensity={preset.ambientIntensity} />

      {/* Hemisphere light for ground bounce */}
      <hemisphereLight
        color={preset.ambientColor}
        groundColor={new THREE.Color(0x8b7355)}
        intensity={preset.ambientIntensity * 0.5}
      />

      {/* Clouds */}
      {enableClouds && gameHour > 5 && gameHour < 21 && (
        <group position={[0, 80, 0]}>
          <Cloud
            opacity={cloudDensity * 0.6}
            speed={0.1}
            bounds={[100, 10, 100]}
            segments={20}
          />
          <Cloud
            opacity={cloudDensity * 0.4}
            speed={0.15}
            bounds={[80, 8, 80]}
            segments={15}
            position={[100, 20, -50]}
          />
          <Cloud
            opacity={cloudDensity * 0.5}
            speed={0.08}
            bounds={[120, 12, 120]}
            segments={25}
            position={[-80, 10, 100]}
          />
        </group>
      )}
    </group>
  );
}

// ============================================================================
// ATMOSPHERIC EFFECTS COMPONENT
// ============================================================================

export function AtmosphericEffects({
  gameHour,
  enableFog = true,
  enableDust = true,
  dustIntensity = 0.5,
}: AtmosphericEffectsProps) {
  const { scene } = useThree();
  const preset = useMemo(() => getInterpolatedPreset(gameHour), [gameHour]);

  // Dust particle system ref
  const dustRef = useRef<THREE.Points>(null);

  // Update fog
  useEffect(() => {
    if (enableFog) {
      scene.fog = new THREE.FogExp2(preset.fogColor.getHex(), preset.fogDensity);
    } else {
      scene.fog = null;
    }

    return () => {
      scene.fog = null;
    };
  }, [scene, enableFog, preset.fogColor, preset.fogDensity]);

  // Dust particles geometry
  const dustGeometry = useMemo(() => {
    if (!enableDust) return null;

    const particleCount = Math.floor(1000 * dustIntensity);
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Random positions in a large area around origin
      positions[i3] = (Math.random() - 0.5) * 200;
      positions[i3 + 1] = Math.random() * 30;
      positions[i3 + 2] = (Math.random() - 0.5) * 200;

      // Random slow velocities (wind drift)
      velocities[i3] = (Math.random() - 0.5) * 0.5;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.userData.velocities = velocities;

    return geometry;
  }, [enableDust, dustIntensity]);

  // Animate dust particles
  useFrame((state, delta) => {
    if (!dustRef.current || !dustGeometry) return;

    const positions = dustGeometry.attributes.position.array as Float32Array;
    const velocities = dustGeometry.userData.velocities as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < positions.length; i += 3) {
      // Add wind influence
      const windX = Math.sin(time * 0.2 + positions[i] * 0.01) * 0.3;
      const windZ = Math.cos(time * 0.15 + positions[i + 2] * 0.01) * 0.2;

      positions[i] += (velocities[i] + windX) * delta * 2;
      positions[i + 1] += velocities[i + 1] * delta * 2;
      positions[i + 2] += (velocities[i + 2] + windZ) * delta * 2;

      // Wrap around bounds
      if (positions[i] > 100) positions[i] = -100;
      if (positions[i] < -100) positions[i] = 100;
      if (positions[i + 1] > 30) positions[i + 1] = 0;
      if (positions[i + 1] < 0) positions[i + 1] = 30;
      if (positions[i + 2] > 100) positions[i + 2] = -100;
      if (positions[i + 2] < -100) positions[i + 2] = 100;
    }

    dustGeometry.attributes.position.needsUpdate = true;
  });

  // Only show dust during day and dusk
  const showDust = enableDust && gameHour > 6 && gameHour < 20;

  return (
    <group name="atmospheric-effects">
      {/* Dust particles */}
      {showDust && dustGeometry && (
        <points ref={dustRef} geometry={dustGeometry}>
          <pointsMaterial
            size={0.5}
            color={preset.fogColor}
            transparent
            opacity={0.3 * dustIntensity}
            sizeAttenuation
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
}

export default WesternSky;
