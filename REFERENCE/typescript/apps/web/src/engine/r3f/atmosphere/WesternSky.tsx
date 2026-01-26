/**
 * WesternSky - Main sky component for Western game aesthetic
 *
 * Features:
 * - Procedural sky gradient based on time of day
 * - Sun disc that follows time
 * - Warm sunset/sunrise tones for Western aesthetic
 * - Day/night cycle support
 * - Optional integration with drei's Sky component
 *
 * This component creates a sky dome without requiring @react-three/drei,
 * using pure Three.js through R3F primitives.
 */

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useTimeOfDay, useSunPosition } from './useTimeOfDay';
import type { TimeColors, TimeConfig } from './types';

// ============================================================================
// SHADER CODE
// ============================================================================

const SKY_VERTEX_SHADER = `
varying vec3 vWorldPosition;
varying vec3 vSunDirection;

uniform vec3 sunPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  vSunDirection = normalize(sunPosition);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SKY_FRAGMENT_SHADER = `
uniform vec3 topColor;
uniform vec3 horizonColor;
uniform vec3 sunColor;
uniform float sunSize;
uniform float sunIntensity;
uniform float haziness;
uniform float dustAmount;
uniform vec3 dustColor;

varying vec3 vWorldPosition;
varying vec3 vSunDirection;

void main() {
  // Normalize direction from camera to sky point
  vec3 direction = normalize(vWorldPosition);

  // Height above horizon (0 at horizon, 1 at zenith)
  float height = direction.y;

  // Base sky gradient (bottom to top)
  float gradientFactor = smoothstep(-0.1, 0.5, height);
  vec3 skyColor = mix(horizonColor, topColor, gradientFactor);

  // Add haziness near horizon (Western desert dust)
  float hazeAmount = (1.0 - smoothstep(-0.05, 0.3, height)) * haziness;
  skyColor = mix(skyColor, dustColor, hazeAmount * dustAmount);

  // Sun disc
  float sunAngle = acos(dot(direction, vSunDirection));
  float sunDisc = smoothstep(sunSize * 1.5, sunSize * 0.8, sunAngle);

  // Sun glow (larger, softer area around sun)
  float sunGlow = exp(-sunAngle * 3.0) * sunIntensity;

  // Combine sun with sky
  vec3 finalColor = skyColor;
  finalColor += sunColor * sunGlow * 0.5;
  finalColor = mix(finalColor, sunColor, sunDisc * sunIntensity);

  // Add subtle purple tint to upper sky at dusk/dawn
  float upperSkyPurple = smoothstep(0.3, 0.8, height) * (1.0 - gradientFactor) * 0.1;
  finalColor += vec3(0.1, 0.0, 0.15) * upperSkyPurple;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// ============================================================================
// TYPES
// ============================================================================

export interface WesternSkyProps {
  /** Override time of day (0-24). If not provided, uses game time. */
  timeOfDay?: number;
  /** Time configuration for day/night boundaries */
  timeConfig?: Partial<TimeConfig>;
  /** Radius of the sky dome */
  radius?: number;
  /** Sun disc size in radians */
  sunSize?: number;
  /** Haziness amount (0-1) - controls horizon fade */
  haziness?: number;
  /** Dust amount (0-1) - Western desert dust in the air */
  dustAmount?: number;
  /** Enable sky rotation for subtle movement */
  enableRotation?: boolean;
  /** Rotation speed (radians per second) */
  rotationSpeed?: number;
  /** Enable the component */
  enabled?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function WesternSky({
  timeOfDay: manualTime,
  timeConfig,
  radius = 1000,
  sunSize = 0.02,
  haziness = 0.6,
  dustAmount = 0.5,
  enableRotation = false,
  rotationSpeed = 0.001,
  enabled = true,
}: WesternSkyProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Get time-based colors
  const { colors, state } = useTimeOfDay({
    manualHour: manualTime,
    config: timeConfig,
  });

  // Get sun position
  const sunPosition = useSunPosition(radius * 0.8);

  // Create shader material with memoization
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: SKY_VERTEX_SHADER,
      fragmentShader: SKY_FRAGMENT_SHADER,
      uniforms: {
        topColor: { value: new THREE.Color(...colors.sky) },
        horizonColor: { value: new THREE.Color(...colors.horizon) },
        sunColor: { value: new THREE.Color(...colors.sun) },
        sunPosition: { value: new THREE.Vector3(...sunPosition) },
        sunSize: { value: sunSize },
        sunIntensity: { value: state.sunIntensity },
        haziness: { value: haziness },
        dustAmount: { value: dustAmount },
        dustColor: { value: new THREE.Color(0.9, 0.75, 0.55) },
      },
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  // Update uniforms when colors change
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.topColor.value.set(...colors.sky);
      materialRef.current.uniforms.horizonColor.value.set(...colors.horizon);
      materialRef.current.uniforms.sunColor.value.set(...colors.sun);
      materialRef.current.uniforms.sunPosition.value.set(...sunPosition);
      materialRef.current.uniforms.sunIntensity.value = state.sunIntensity;
      materialRef.current.uniforms.haziness.value = haziness;
      materialRef.current.uniforms.dustAmount.value = dustAmount;
    }
  }, [colors, sunPosition, state.sunIntensity, haziness, dustAmount]);

  // Animation frame for subtle rotation
  useFrame((_, delta) => {
    if (enableRotation && meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed * delta;
    }
  });

  if (!enabled) return null;

  return (
    <mesh ref={meshRef} renderOrder={-1000}>
      <sphereGeometry args={[radius, 64, 32]} />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}

// ============================================================================
// SUN DISC COMPONENT (optional separate sun rendering)
// ============================================================================

export interface SunDiscProps {
  /** Override time of day (0-24) */
  timeOfDay?: number;
  /** Time configuration */
  timeConfig?: Partial<TimeConfig>;
  /** Distance from camera */
  distance?: number;
  /** Sun size */
  size?: number;
  /** Enable lens flare effect */
  enableFlare?: boolean;
}

export function SunDisc({
  timeOfDay: manualTime,
  timeConfig,
  distance = 800,
  size = 30,
  enableFlare = false,
}: SunDiscProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  const { colors, state } = useTimeOfDay({
    manualHour: manualTime,
    config: timeConfig,
  });

  const sunPosition = useSunPosition(distance);

  // Only show sun when above horizon
  const visible = state.sunInclination > -0.1;

  // Update sun color and position
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...sunPosition);
    }
    if (materialRef.current) {
      materialRef.current.color.set(...colors.sun);
      materialRef.current.opacity = Math.max(0, state.sunIntensity);
    }
  }, [sunPosition, colors.sun, state.sunIntensity]);

  if (!visible) return null;

  return (
    <mesh ref={meshRef} position={sunPosition} renderOrder={-999}>
      <circleGeometry args={[size, 32]} />
      <meshBasicMaterial
        ref={materialRef}
        color={colors.sun}
        transparent
        opacity={state.sunIntensity}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ============================================================================
// MOON COMPONENT
// ============================================================================

export interface MoonProps {
  /** Override time of day (0-24) */
  timeOfDay?: number;
  /** Time configuration */
  timeConfig?: Partial<TimeConfig>;
  /** Distance from camera */
  distance?: number;
  /** Moon size */
  size?: number;
  /** Moon phase (0-1, 0 = new moon, 0.5 = full moon) */
  phase?: number;
}

export function Moon({
  timeOfDay: manualTime,
  timeConfig,
  distance = 700,
  size = 20,
  phase = 0.5,
}: MoonProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  const { state, colors } = useTimeOfDay({
    manualHour: manualTime,
    config: timeConfig,
  });

  // Moon is opposite to sun (roughly)
  const moonPosition = useMemo<[number, number, number]>(() => {
    // Moon is roughly 12 hours offset from sun, but with some variation
    const moonAzimuth = state.sunAzimuth + Math.PI;
    const moonInclination = Math.max(0, -state.sunInclination + 0.3);

    const x = Math.cos(moonAzimuth) * Math.cos(moonInclination) * distance;
    const y = Math.sin(moonInclination) * distance;
    const z = Math.sin(moonAzimuth) * Math.cos(moonInclination) * distance;

    return [x, y, z];
  }, [state.sunAzimuth, state.sunInclination, distance]);

  // Moon visibility (only at night/evening)
  const visible = colors.starVisibility > 0.2;

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...moonPosition);
    }
  }, [moonPosition]);

  if (!visible) return null;

  // Calculate moon brightness based on time
  const brightness = colors.starVisibility * 0.8;

  return (
    <group position={moonPosition}>
      {/* Moon glow */}
      <mesh renderOrder={-998}>
        <circleGeometry args={[size * 1.5, 32]} />
        <meshBasicMaterial
          color={[0.6, 0.65, 0.8]}
          transparent
          opacity={brightness * 0.3}
          depthWrite={false}
        />
      </mesh>
      {/* Moon disc */}
      <mesh ref={meshRef} renderOrder={-997}>
        <circleGeometry args={[size, 32]} />
        <meshBasicMaterial
          ref={materialRef}
          color={[0.95, 0.95, 1.0]}
          transparent
          opacity={brightness}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default WesternSky;
