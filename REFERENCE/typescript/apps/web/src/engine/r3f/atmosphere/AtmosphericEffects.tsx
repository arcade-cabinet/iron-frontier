/**
 * AtmosphericEffects - Post-processing and particle effects for Western atmosphere
 *
 * Features:
 * - Dust particles floating in the air
 * - Distance fog with time-based color
 * - Heat haze effect for desert (optional)
 * - Volumetric light shafts (god rays) - simplified version
 *
 * Uses pure Three.js/R3F primitives for maximum compatibility.
 */

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useTimeOfDay } from './useTimeOfDay';
import {
  DEFAULT_DUST_CONFIG,
  type DustConfig,
  type TimeConfig,
} from './types';

// ============================================================================
// DUST PARTICLES COMPONENT
// ============================================================================

const DUST_VERTEX_SHADER = `
attribute float size;
attribute float opacity;
attribute vec3 velocity;

uniform float time;
uniform float windSpeed;
uniform vec3 cameraPos;

varying float vOpacity;
varying float vDistance;

void main() {
  // Animate position with wind and subtle floating motion
  vec3 pos = position;
  pos.x += sin(time * 0.5 + position.y * 0.1) * windSpeed * 2.0;
  pos.y += sin(time * 0.3 + position.x * 0.05) * 0.2;
  pos.z += cos(time * 0.4 + position.y * 0.08) * windSpeed;

  // Distance from camera for fade
  vDistance = distance(pos, cameraPos);

  // Output
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = size * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;

  vOpacity = opacity * smoothstep(100.0, 20.0, vDistance);
}
`;

const DUST_FRAGMENT_SHADER = `
uniform vec3 color;
uniform float globalOpacity;

varying float vOpacity;
varying float vDistance;

void main() {
  // Circular particle with soft edge
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

  // Distance-based fade
  float distanceFade = 1.0 - smoothstep(30.0, 80.0, vDistance);

  gl_FragColor = vec4(color, alpha * vOpacity * globalOpacity * distanceFade);
}
`;

export interface DustParticlesProps {
  /** Override time of day (0-24) */
  timeOfDay?: number;
  /** Time configuration */
  timeConfig?: Partial<TimeConfig>;
  /** Dust configuration */
  config?: Partial<DustConfig>;
  /** Follow camera position */
  followCamera?: boolean;
  /** Enable/disable particles */
  enabled?: boolean;
}

export function DustParticles({
  timeOfDay: manualTime,
  timeConfig,
  config: configOverrides,
  followCamera = true,
  enabled = true,
}: DustParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { colors, state } = useTimeOfDay({
    manualHour: manualTime,
    config: timeConfig,
  });

  const { camera } = useThree();

  // Merge config
  const config: DustConfig = {
    ...DEFAULT_DUST_CONFIG,
    ...configOverrides,
  };

  // Create particle geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(config.count * 3);
    const sizes = new Float32Array(config.count);
    const opacities = new Float32Array(config.count);
    const velocities = new Float32Array(config.count * 3);

    for (let i = 0; i < config.count; i++) {
      // Random position in cylinder around origin
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * config.radius;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.3) * config.height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Random size within range
      sizes[i] =
        config.sizeRange[0] +
        Math.random() * (config.sizeRange[1] - config.sizeRange[0]);

      // Random base opacity
      opacities[i] = 0.3 + Math.random() * 0.7;

      // Random velocity for animation variation
      velocities[i * 3] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    return geo;
  }, [config.count, config.radius, config.height, config.sizeRange]);

  // Create shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: DUST_VERTEX_SHADER,
      fragmentShader: DUST_FRAGMENT_SHADER,
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(...config.color) },
        globalOpacity: { value: config.opacity },
        windSpeed: { value: config.windSpeed },
        cameraPos: { value: new THREE.Vector3() },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [config.color, config.opacity, config.windSpeed]);

  // Update uniforms each frame
  useFrame((state) => {
    if (!materialRef.current || !pointsRef.current) return;

    // Update time
    materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    materialRef.current.uniforms.cameraPos.value.copy(camera.position);

    // Follow camera if enabled
    if (followCamera) {
      pointsRef.current.position.x = camera.position.x;
      pointsRef.current.position.z = camera.position.z;
    }

    // Adjust opacity based on time of day (less visible at night, more at dusk)
    const timeMultiplier = state.clock.elapsedTime > 0
      ? Math.max(0.3, colors.intensity * 1.5)
      : 1;
    materialRef.current.uniforms.globalOpacity.value = config.opacity * timeMultiplier;
  });

  // Update color based on time of day
  useEffect(() => {
    if (materialRef.current) {
      // Tint dust color based on ambient light
      const tintedColor = new THREE.Color(...config.color);
      const ambientColor = new THREE.Color(...colors.ambient);
      tintedColor.lerp(ambientColor, 0.3);
      materialRef.current.uniforms.color.value = tintedColor;
    }
  }, [colors.ambient, config.color]);

  if (!enabled) return null;

  return (
    <points ref={pointsRef}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </points>
  );
}

// ============================================================================
// SCENE FOG COMPONENT
// ============================================================================

export interface AtmosphericFogProps {
  /** Override time of day (0-24) */
  timeOfDay?: number;
  /** Time configuration */
  timeConfig?: Partial<TimeConfig>;
  /** Fog type: 'linear' or 'exponential' */
  type?: 'linear' | 'exponential';
  /** Near distance for linear fog */
  near?: number;
  /** Far distance for linear fog */
  far?: number;
  /** Density multiplier */
  densityMultiplier?: number;
  /** Enable/disable fog */
  enabled?: boolean;
}

export function AtmosphericFog({
  timeOfDay: manualTime,
  timeConfig,
  type = 'exponential',
  near = 10,
  far = 300,
  densityMultiplier = 1.0,
  enabled = true,
}: AtmosphericFogProps) {
  const { scene } = useThree();
  const { colors } = useTimeOfDay({
    manualHour: manualTime,
    config: timeConfig,
  });

  useEffect(() => {
    if (!enabled) {
      scene.fog = null;
      return;
    }

    const fogColor = new THREE.Color(...colors.fog);
    const density = colors.fogDensity * densityMultiplier;

    if (type === 'exponential') {
      // Type assertion needed due to Three.js version mismatch in types
      (scene as any).fog = new THREE.FogExp2(fogColor, density);
    } else {
      (scene as any).fog = new THREE.Fog(fogColor, near, far);
    }

    return () => {
      scene.fog = null;
    };
  }, [enabled, type, colors.fog, colors.fogDensity, near, far, densityMultiplier, scene]);

  // Update fog color when time changes
  useEffect(() => {
    if (scene.fog) {
      scene.fog.color.set(...colors.fog);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.density = colors.fogDensity * densityMultiplier;
      }
    }
  }, [colors.fog, colors.fogDensity, densityMultiplier, scene.fog]);

  return null;
}

// ============================================================================
// HEAT HAZE EFFECT (Simplified)
// ============================================================================

const HEAT_HAZE_VERTEX_SHADER = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const HEAT_HAZE_FRAGMENT_SHADER = `
uniform float time;
uniform float intensity;
uniform float distortionScale;

varying vec2 vUv;

void main() {
  // Create distortion pattern
  vec2 distortion = vec2(
    sin(vUv.y * distortionScale + time * 2.0) * 0.01,
    cos(vUv.x * distortionScale + time * 1.5) * 0.005
  ) * intensity;

  // This is a placeholder - actual heat haze requires post-processing
  // This creates a visible shimmer effect on a plane
  float shimmer = sin(vUv.y * 50.0 + time * 5.0) * 0.5 + 0.5;
  shimmer *= sin(vUv.x * 30.0 + time * 3.0) * 0.5 + 0.5;

  gl_FragColor = vec4(1.0, 1.0, 1.0, shimmer * intensity * 0.1);
}
`;

export interface HeatHazeProps {
  /** Override time of day (0-24) */
  timeOfDay?: number;
  /** Time configuration */
  timeConfig?: Partial<TimeConfig>;
  /** Effect intensity */
  intensity?: number;
  /** Distortion scale */
  distortionScale?: number;
  /** Position of the haze plane */
  position?: [number, number, number];
  /** Size of the haze plane */
  size?: [number, number];
  /** Only show during hot hours (10-16) */
  hotHoursOnly?: boolean;
  /** Enable/disable effect */
  enabled?: boolean;
}

export function HeatHaze({
  timeOfDay: manualTime,
  timeConfig,
  intensity = 0.5,
  distortionScale = 20,
  position = [0, 0.5, -50],
  size = [200, 30],
  hotHoursOnly = true,
  enabled = true,
}: HeatHazeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { state, colors } = useTimeOfDay({
    manualHour: manualTime,
    config: timeConfig,
  });

  // Create shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: HEAT_HAZE_VERTEX_SHADER,
      fragmentShader: HEAT_HAZE_FRAGMENT_SHADER,
      uniforms: {
        time: { value: 0 },
        intensity: { value: intensity },
        distortionScale: { value: distortionScale },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, [intensity, distortionScale]);

  // Animate heat haze
  useFrame((frameState) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = frameState.clock.elapsedTime;

      // Adjust intensity based on time of day (stronger at midday)
      let timeIntensity = intensity;
      if (hotHoursOnly) {
        const hour = state.hour;
        if (hour >= 10 && hour <= 16) {
          // Peak at noon
          const peakFactor = 1 - Math.abs(hour - 13) / 3;
          timeIntensity = intensity * peakFactor * colors.intensity;
        } else {
          timeIntensity = 0;
        }
      }
      materialRef.current.uniforms.intensity.value = timeIntensity;
    }
  });

  if (!enabled) return null;

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={size} />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}

// ============================================================================
// COMBINED ATMOSPHERIC EFFECTS
// ============================================================================

export interface AtmosphericEffectsProps {
  /** Override time of day (0-24) */
  timeOfDay?: number;
  /** Time configuration */
  timeConfig?: Partial<TimeConfig>;
  /** Enable dust particles */
  enableDust?: boolean;
  /** Enable fog */
  enableFog?: boolean;
  /** Enable heat haze */
  enableHeatHaze?: boolean;
  /** Dust configuration */
  dustConfig?: Partial<DustConfig>;
  /** Fog density multiplier */
  fogDensityMultiplier?: number;
  /** Heat haze intensity */
  heatHazeIntensity?: number;
}

export function AtmosphericEffects({
  timeOfDay,
  timeConfig,
  enableDust = true,
  enableFog = true,
  enableHeatHaze = false,
  dustConfig,
  fogDensityMultiplier = 1.0,
  heatHazeIntensity = 0.5,
}: AtmosphericEffectsProps) {
  return (
    <>
      {enableFog && (
        <AtmosphericFog
          timeOfDay={timeOfDay}
          timeConfig={timeConfig}
          densityMultiplier={fogDensityMultiplier}
        />
      )}
      {enableDust && (
        <DustParticles
          timeOfDay={timeOfDay}
          timeConfig={timeConfig}
          config={dustConfig}
        />
      )}
      {enableHeatHaze && (
        <HeatHaze
          timeOfDay={timeOfDay}
          timeConfig={timeConfig}
          intensity={heatHazeIntensity}
        />
      )}
    </>
  );
}

export default AtmosphericEffects;
