/**
 * DayNightCycle - Time-based lighting changes for the R3F scene
 *
 * Features:
 * - Directional light (sun) that follows game time
 * - Ambient light with time-based color shifts
 * - Star field that appears at night
 * - Shadow configuration based on sun position
 * - Western-themed warm/cool color palette
 *
 * This component manages all scene lighting based on the game's time system.
 */

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useTimeOfDay, useSunPosition } from './useTimeOfDay';
import { DEFAULT_STAR_CONFIG, type StarConfig, type TimeConfig } from './types';

// ============================================================================
// DIRECTIONAL LIGHT (SUN)
// ============================================================================

export interface SunLightProps {
  /** Override time of day (0-24) */
  timeOfDay?: number;
  /** Time configuration */
  timeConfig?: Partial<TimeConfig>;
  /** Light intensity multiplier */
  intensityMultiplier?: number;
  /** Enable shadows */
  castShadow?: boolean;
  /** Shadow map size */
  shadowMapSize?: number;
  /** Shadow camera frustum size */
  shadowCameraSize?: number;
  /** Shadow bias */
  shadowBias?: number;
  /** Distance from origin */
  distance?: number;
  /** Enable/disable the light */
  enabled?: boolean;
}

export function SunLight({
  timeOfDay: manualTime,
  timeConfig,
  intensityMultiplier = 1.0,
  castShadow = true,
  shadowMapSize = 2048,
  shadowCameraSize = 100,
  shadowBias = -0.0001,
  distance = 100,
  enabled = true,
}: SunLightProps) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);

  const { colors, state } = useTimeOfDay({
    manualHour: manualTime,
    config: timeConfig,
  });

  const sunPosition = useSunPosition(distance);

  // Update light properties each frame
  useEffect(() => {
    if (!lightRef.current) return;

    // Update position
    lightRef.current.position.set(...sunPosition);

    // Update color based on time
    lightRef.current.color.set(...colors.sun);

    // Update intensity (0 when sun is below horizon)
    const intensity = Math.max(0, state.sunIntensity) * intensityMultiplier * Math.PI;
    lightRef.current.intensity = intensity;

    // Point towards origin
    if (targetRef.current) {
      lightRef.current.target = targetRef.current;
    }
  }, [sunPosition, colors.sun, state.sunIntensity, intensityMultiplier]);

  // Configure shadow camera when component mounts
  useEffect(() => {
    if (!lightRef.current || !castShadow) return;

    lightRef.current.castShadow = true;
    lightRef.current.shadow.mapSize.width = shadowMapSize;
    lightRef.current.shadow.mapSize.height = shadowMapSize;
    lightRef.current.shadow.bias = shadowBias;

    // Configure shadow camera frustum
    const cam = lightRef.current.shadow.camera;
    cam.left = -shadowCameraSize;
    cam.right = shadowCameraSize;
    cam.top = shadowCameraSize;
    cam.bottom = -shadowCameraSize;
    cam.near = 0.5;
    cam.far = distance * 3;
    cam.updateProjectionMatrix();
  }, [castShadow, shadowMapSize, shadowCameraSize, shadowBias, distance]);

  if (!enabled) return null;

  // Convert color tuple to hex for JSX prop
  const sunColor = new THREE.Color(...colors.sun);

  return (
    <>
      <directionalLight
        ref={lightRef}
        position={sunPosition}
        color={sunColor}
        intensity={state.sunIntensity * intensityMultiplier * Math.PI}
        castShadow={castShadow}
      />
      <object3D ref={targetRef} position={[0, 0, 0]} />
    </>
  );
}

// ============================================================================
// AMBIENT LIGHT
// ============================================================================

export interface AmbientLightProps {
  /** Override time of day (0-24) */
  timeOfDay?: number;
  /** Time configuration */
  timeConfig?: Partial<TimeConfig>;
  /** Intensity multiplier */
  intensityMultiplier?: number;
  /** Minimum intensity (for night time) */
  minIntensity?: number;
  /** Enable/disable */
  enabled?: boolean;
}

export function AmbientLight({
  timeOfDay: manualTime,
  timeConfig,
  intensityMultiplier = 1.0,
  minIntensity = 0.1,
  enabled = true,
}: AmbientLightProps) {
  const lightRef = useRef<THREE.AmbientLight>(null);

  const { colors, state } = useTimeOfDay({
    manualHour: manualTime,
    config: timeConfig,
  });

  useEffect(() => {
    if (!lightRef.current) return;

    // Update color
    lightRef.current.color.set(...colors.ambient);

    // Update intensity with minimum threshold
    const intensity = Math.max(minIntensity, colors.intensity * 0.5) * intensityMultiplier;
    lightRef.current.intensity = intensity;
  }, [colors.ambient, colors.intensity, minIntensity, intensityMultiplier]);

  if (!enabled) return null;

  const intensity = Math.max(minIntensity, colors.intensity * 0.5) * intensityMultiplier;
  const ambientColor = new THREE.Color(...colors.ambient);

  return (
    <ambientLight
      ref={lightRef}
      color={ambientColor}
      intensity={intensity}
    />
  );
}

// ============================================================================
// HEMISPHERE LIGHT
// ============================================================================

export interface HemisphereLightProps {
  /** Override time of day (0-24) */
  timeOfDay?: number;
  /** Time configuration */
  timeConfig?: Partial<TimeConfig>;
  /** Intensity multiplier */
  intensityMultiplier?: number;
  /** Ground color multiplier (darker = more contrast) */
  groundColorMultiplier?: number;
  /** Enable/disable */
  enabled?: boolean;
}

export function HemisphereLight({
  timeOfDay: manualTime,
  timeConfig,
  intensityMultiplier = 1.0,
  groundColorMultiplier = 0.4,
  enabled = true,
}: HemisphereLightProps) {
  const lightRef = useRef<THREE.HemisphereLight>(null);

  const { colors } = useTimeOfDay({
    manualHour: manualTime,
    config: timeConfig,
  });

  useEffect(() => {
    if (!lightRef.current) return;

    // Sky color (from above)
    lightRef.current.color.set(...colors.sky);

    // Ground color (reflected from below) - darker version of ambient
    const groundColor = colors.ambient.map((c) => c * groundColorMultiplier) as [number, number, number];
    lightRef.current.groundColor.set(...groundColor);

    // Update intensity
    lightRef.current.intensity = colors.intensity * 0.6 * intensityMultiplier;
  }, [colors, groundColorMultiplier, intensityMultiplier]);

  if (!enabled) return null;

  const skyColor = new THREE.Color(...colors.sky);
  const groundColor = new THREE.Color(
    colors.ambient[0] * groundColorMultiplier,
    colors.ambient[1] * groundColorMultiplier,
    colors.ambient[2] * groundColorMultiplier
  );

  return (
    <hemisphereLight
      ref={lightRef}
      args={[skyColor, groundColor]}
      intensity={colors.intensity * 0.6 * intensityMultiplier}
    />
  );
}

// ============================================================================
// STAR FIELD
// ============================================================================

const STAR_VERTEX_SHADER = `
attribute float size;
attribute float twinkleOffset;

uniform float time;
uniform float twinkleSpeed;
uniform float visibility;

varying float vBrightness;

void main() {
  // Twinkle effect
  float twinkle = sin(time * twinkleSpeed + twinkleOffset) * 0.5 + 0.5;
  vBrightness = mix(0.5, 1.0, twinkle) * visibility;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * visibility;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const STAR_FRAGMENT_SHADER = `
uniform vec3 color;

varying float vBrightness;

void main() {
  // Circular star with soft edge
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  float alpha = 1.0 - smoothstep(0.2, 0.5, dist);

  gl_FragColor = vec4(color, alpha * vBrightness);
}
`;

export interface StarFieldProps {
  /** Override time of day (0-24) */
  timeOfDay?: number;
  /** Time configuration */
  timeConfig?: Partial<TimeConfig>;
  /** Star field configuration */
  config?: Partial<StarConfig>;
  /** Enable/disable stars */
  enabled?: boolean;
}

export function StarField({
  timeOfDay: manualTime,
  timeConfig,
  config: configOverrides,
  enabled = true,
}: StarFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { colors } = useTimeOfDay({
    manualHour: manualTime,
    config: timeConfig,
  });

  // Merge config
  const config: StarConfig = {
    ...DEFAULT_STAR_CONFIG,
    ...configOverrides,
  };

  // Create star geometry - positioned on upper hemisphere
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(config.count * 3);
    const sizes = new Float32Array(config.count);
    const twinkleOffsets = new Float32Array(config.count);

    for (let i = 0; i < config.count; i++) {
      // Random position on upper hemisphere
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI * 0.45 + 0.1; // 0.1 to 0.55 PI (above horizon)

      positions[i * 3] = Math.sin(theta) * Math.cos(phi) * config.radius;
      positions[i * 3 + 1] = Math.cos(theta) * config.radius; // Y is up
      positions[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * config.radius;

      // Random size
      sizes[i] =
        config.sizeRange[0] +
        Math.random() * (config.sizeRange[1] - config.sizeRange[0]);

      // Random twinkle phase offset
      twinkleOffsets[i] = Math.random() * Math.PI * 2;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('twinkleOffset', new THREE.BufferAttribute(twinkleOffsets, 1));

    return geo;
  }, [config.count, config.radius, config.sizeRange]);

  // Create shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: STAR_VERTEX_SHADER,
      fragmentShader: STAR_FRAGMENT_SHADER,
      uniforms: {
        time: { value: 0 },
        twinkleSpeed: { value: config.twinkleSpeed },
        visibility: { value: 0 },
        color: { value: new THREE.Color(1, 1, 1) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [config.twinkleSpeed]);

  // Animate stars
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      // Smooth transition for star visibility
      materialRef.current.uniforms.visibility.value = colors.starVisibility;
    }
  });

  if (!enabled || colors.starVisibility < 0.01) return null;

  return (
    <points ref={pointsRef} renderOrder={-995}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </points>
  );
}

// ============================================================================
// COMBINED DAY/NIGHT CYCLE COMPONENT
// ============================================================================

export interface DayNightCycleProps {
  /** Override time of day (0-24) */
  timeOfDay?: number;
  /** Time configuration */
  timeConfig?: Partial<TimeConfig>;
  /** Enable sun light */
  enableSunLight?: boolean;
  /** Enable ambient light */
  enableAmbientLight?: boolean;
  /** Enable hemisphere light (alternative to ambient) */
  enableHemisphereLight?: boolean;
  /** Enable star field */
  enableStars?: boolean;
  /** Sun casts shadows */
  sunCastsShadow?: boolean;
  /** Shadow map size */
  shadowMapSize?: number;
  /** Overall intensity multiplier */
  intensityMultiplier?: number;
  /** Star field configuration */
  starConfig?: Partial<StarConfig>;
}

export function DayNightCycle({
  timeOfDay,
  timeConfig,
  enableSunLight = true,
  enableAmbientLight = false,
  enableHemisphereLight = true,
  enableStars = true,
  sunCastsShadow = true,
  shadowMapSize = 2048,
  intensityMultiplier = 1.0,
  starConfig,
}: DayNightCycleProps) {
  return (
    <>
      {enableSunLight && (
        <SunLight
          timeOfDay={timeOfDay}
          timeConfig={timeConfig}
          intensityMultiplier={intensityMultiplier}
          castShadow={sunCastsShadow}
          shadowMapSize={shadowMapSize}
        />
      )}

      {enableAmbientLight && (
        <AmbientLight
          timeOfDay={timeOfDay}
          timeConfig={timeConfig}
          intensityMultiplier={intensityMultiplier}
        />
      )}

      {enableHemisphereLight && (
        <HemisphereLight
          timeOfDay={timeOfDay}
          timeConfig={timeConfig}
          intensityMultiplier={intensityMultiplier}
        />
      )}

      {enableStars && (
        <StarField
          timeOfDay={timeOfDay}
          timeConfig={timeConfig}
          config={starConfig}
        />
      )}
    </>
  );
}

export default DayNightCycle;
