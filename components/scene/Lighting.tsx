// Lighting — Scene lighting that responds to time of day.
//
// A directional "sun" light orbits overhead, shifting from warm daylight
// to cool moonlight. Ambient and hemisphere lights provide fill.

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export interface LightingProps {
  /** Time of day as a 0-24 float (12.0 = noon, 0.0 = midnight) */
  timeOfDay: number;
}

// Sun orbit radius and height
const SUN_DISTANCE = 80;
const SUN_HEIGHT = 60;

// Shadow map configuration
const SHADOW_MAP_SIZE = 1024;
const SHADOW_FRUSTUM = 40;

const _sunColor = new THREE.Color();
const _ambientColor = new THREE.Color();

const DAY_COLOR = new THREE.Color(0xfff5e6);
const NIGHT_COLOR = new THREE.Color(0x4466aa);
const DAWN_COLOR = new THREE.Color(0xffaa66);

const SKY_HEMISPHERE = new THREE.Color(0x87ceeb);
const GROUND_HEMISPHERE = new THREE.Color(0x5c4033);

export function Lighting({ timeOfDay }: LightingProps) {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  // Pre-compute shadow camera settings once
  const shadowCameraProps = useMemo(
    () => ({
      left: -SHADOW_FRUSTUM,
      right: SHADOW_FRUSTUM,
      top: SHADOW_FRUSTUM,
      bottom: -SHADOW_FRUSTUM,
      near: 1,
      far: 200,
    }),
    [],
  );

  useFrame(() => {
    if (!sunRef.current || !ambientRef.current) return;

    const t = timeOfDay % 24;

    // --- Sun position on circular orbit ---
    // 0h = directly below (midnight), 12h = directly above (noon)
    const angle = ((t - 6) / 24) * Math.PI * 2; // 6AM = horizon
    const x = Math.cos(angle) * SUN_DISTANCE;
    const y = Math.sin(angle) * SUN_HEIGHT;
    const z = Math.sin(angle * 0.3) * SUN_DISTANCE * 0.5; // Slight off-axis

    sunRef.current.position.set(x, y, z);

    // --- Sun color and intensity ---
    const dayFactor = computeDayFactor(t);
    const dawnFactor = computeDawnFactor(t);

    _sunColor
      .copy(DAY_COLOR)
      .lerp(DAWN_COLOR, dawnFactor)
      .lerp(NIGHT_COLOR, 1 - dayFactor);

    sunRef.current.color.copy(_sunColor);
    sunRef.current.intensity = THREE.MathUtils.lerp(0.1, 2.5, dayFactor);

    // --- Fill light — opposite side of sun, brightens shadows ---
    if (fillRef.current) {
      fillRef.current.position.set(-x, Math.max(y * 0.5, 10), -z);
      fillRef.current.color.copy(_sunColor);
      fillRef.current.intensity = THREE.MathUtils.lerp(0.05, 0.8, dayFactor);
    }

    // --- Ambient intensity ---
    _ambientColor.set(0x222233).lerp(new THREE.Color(0x998877), dayFactor);
    ambientRef.current.color.copy(_ambientColor);
    ambientRef.current.intensity = THREE.MathUtils.lerp(0.2, 1.0, dayFactor);
  });

  return (
    <>
      <directionalLight
        ref={sunRef}
        castShadow
        shadow-mapSize-width={SHADOW_MAP_SIZE}
        shadow-mapSize-height={SHADOW_MAP_SIZE}
        shadow-camera-left={shadowCameraProps.left}
        shadow-camera-right={shadowCameraProps.right}
        shadow-camera-top={shadowCameraProps.top}
        shadow-camera-bottom={shadowCameraProps.bottom}
        shadow-camera-near={shadowCameraProps.near}
        shadow-camera-far={shadowCameraProps.far}
        shadow-bias={-0.001}
      />
      {/* Fill light — opposite the sun to soften shadows on buildings */}
      <directionalLight ref={fillRef} />
      <ambientLight ref={ambientRef} />
      <hemisphereLight args={[SKY_HEMISPHERE, GROUND_HEMISPHERE, 0.8]} />
    </>
  );
}

// --- Helpers ---

/** Returns 0 at night, 1 during full day, with smooth transitions at dawn/dusk. */
function computeDayFactor(t: number): number {
  if (t >= 7 && t <= 17) return 1; // Full day
  if (t >= 19 || t <= 5) return 0; // Full night
  if (t > 5 && t < 7) return smoothstep((t - 5) / 2); // Dawn
  /* t > 17 && t < 19 */ return smoothstep((19 - t) / 2); // Dusk
}

/** Returns 0 most of the time, peaks at 1 during dawn/dusk transitions. */
function computeDawnFactor(t: number): number {
  if (t >= 5 && t <= 7) return 1 - Math.abs(t - 6); // Dawn peak at 6
  if (t >= 17 && t <= 19) return 1 - Math.abs(t - 18); // Dusk peak at 18
  return 0;
}

function smoothstep(x: number): number {
  const c = x < 0 ? 0 : x > 1 ? 1 : x;
  return c * c * (3 - 2 * c);
}
