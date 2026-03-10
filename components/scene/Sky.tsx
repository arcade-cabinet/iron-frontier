// Sky — Gradient sky dome with sun, moon, and procedural stars.
//
// A large inverted sphere whose vertex colors are driven by timeOfDay.
// Stars are generated deterministically via alea PRNG.

import { useFrame, useThree } from "@react-three/fiber";
import Alea from "alea";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export interface SkyProps {
  /** Time of day as a 0-24 float */
  timeOfDay: number;
}

const SKY_RADIUS = 500;
const SUN_RADIUS = 8;
const MOON_RADIUS = 5;
const ORBIT_RADIUS = 400;
const STAR_COUNT = 300;
const SKY_SEGMENTS = 32;

// --- Color palettes ---
const DAWN_TOP = new THREE.Color(0xff7744);
const DAWN_BOTTOM = new THREE.Color(0xffccaa);
const DAY_TOP = new THREE.Color(0x4488cc);
const DAY_BOTTOM = new THREE.Color(0xaaddff);
const DUSK_TOP = new THREE.Color(0x884488);
const DUSK_BOTTOM = new THREE.Color(0xff8844);
const NIGHT_TOP = new THREE.Color(0x000011);
const NIGHT_BOTTOM = new THREE.Color(0x111133);

// Scratch colors
const _topColor = new THREE.Color();
const _bottomColor = new THREE.Color();
const _vertColor = new THREE.Color();

export function Sky({ timeOfDay }: SkyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const domeRef = useRef<THREE.Mesh>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);
  const starsRef = useRef<THREE.Points>(null);
  const camera = useThree((s) => s.camera);

  // Generate deterministic star positions
  const starGeometry = useMemo(() => {
    const prng = Alea("iron-frontier-stars");
    const positions = new Float32Array(STAR_COUNT * 3);

    for (let i = 0; i < STAR_COUNT; i++) {
      // Distribute on upper hemisphere via spherical coords
      const theta = prng() * Math.PI * 2;
      const phi = prng() * Math.PI * 0.45; // Upper hemisphere only
      const r = SKY_RADIUS * 0.95;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi); // Y is up
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  // Sky dome geometry with vertex colors
  const domeGeometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(SKY_RADIUS, SKY_SEGMENTS, SKY_SEGMENTS);
    const count = geo.attributes.position.count;
    const colors = new Float32Array(count * 3);
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  useFrame(() => {
    // Keep sky dome centered on camera
    if (groupRef.current) {
      groupRef.current.position.set(camera.position.x, 0, camera.position.z);
    }

    const t = timeOfDay % 24;

    // --- Update dome vertex colors ---
    if (domeRef.current) {
      const geo = domeRef.current.geometry;
      const posAttr = geo.attributes.position as THREE.BufferAttribute;
      const colAttr = geo.attributes.color as THREE.BufferAttribute;

      computeGradientColors(t, _topColor, _bottomColor);

      for (let i = 0; i < posAttr.count; i++) {
        // Normalize Y from -1..1 to 0..1 (bottom to top)
        const ny = (posAttr.getY(i) / SKY_RADIUS + 1) * 0.5;
        _vertColor.copy(_bottomColor).lerp(_topColor, ny);
        colAttr.setXYZ(i, _vertColor.r, _vertColor.g, _vertColor.b);
      }
      colAttr.needsUpdate = true;
    }

    // --- Sun position ---
    const sunAngle = ((t - 6) / 24) * Math.PI * 2;
    if (sunRef.current) {
      sunRef.current.position.set(
        Math.cos(sunAngle) * ORBIT_RADIUS,
        Math.sin(sunAngle) * ORBIT_RADIUS * 0.8,
        -ORBIT_RADIUS * 0.3,
      );
    }

    // --- Moon position (opposite sun) ---
    if (moonRef.current) {
      moonRef.current.position.set(
        Math.cos(sunAngle + Math.PI) * ORBIT_RADIUS,
        Math.sin(sunAngle + Math.PI) * ORBIT_RADIUS * 0.8,
        ORBIT_RADIUS * 0.3,
      );
    }

    // --- Star visibility ---
    if (starsRef.current) {
      const mat = starsRef.current.material as THREE.PointsMaterial;
      const nightFactor = computeNightFactor(t);
      mat.opacity = nightFactor;
      mat.visible = nightFactor > 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Sky dome */}
      <mesh ref={domeRef} geometry={domeGeometry}>
        <meshBasicMaterial vertexColors side={THREE.BackSide} depthWrite={false} />
      </mesh>

      {/* Sun */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[SUN_RADIUS, 16, 16]} />
        <meshBasicMaterial color={0xffdd44} toneMapped={false} />
      </mesh>

      {/* Moon */}
      <mesh ref={moonRef}>
        <sphereGeometry args={[MOON_RADIUS, 16, 16]} />
        <meshBasicMaterial color={0xddddee} toneMapped={false} />
      </mesh>

      {/* Stars */}
      <points ref={starsRef} geometry={starGeometry}>
        <pointsMaterial
          color={0xffffff}
          size={1.5}
          sizeAttenuation={false}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// --- Helpers ---

/** Compute top/bottom gradient colors based on time of day. */
function computeGradientColors(t: number, outTop: THREE.Color, outBottom: THREE.Color): void {
  if (t >= 7 && t <= 17) {
    // Day
    outTop.copy(DAY_TOP);
    outBottom.copy(DAY_BOTTOM);
  } else if (t >= 19 || t <= 5) {
    // Night
    outTop.copy(NIGHT_TOP);
    outBottom.copy(NIGHT_BOTTOM);
  } else if (t > 5 && t < 7) {
    // Dawn transition
    const f = smoothstep((t - 5) / 2);
    outTop.copy(NIGHT_TOP).lerp(DAWN_TOP, f);
    outBottom.copy(NIGHT_BOTTOM).lerp(DAWN_BOTTOM, f);
    // Then blend dawn -> day in latter half
    if (t > 6) {
      const f2 = smoothstep(t - 6);
      outTop.lerp(DAY_TOP, f2);
      outBottom.lerp(DAY_BOTTOM, f2);
    }
  } else {
    // Dusk transition (17 < t < 19)
    const f = smoothstep((t - 17) / 2);
    outTop.copy(DAY_TOP).lerp(DUSK_TOP, f);
    outBottom.copy(DAY_BOTTOM).lerp(DUSK_BOTTOM, f);
    // Then blend dusk -> night in latter half
    if (t > 18) {
      const f2 = smoothstep(t - 18);
      outTop.lerp(NIGHT_TOP, f2);
      outBottom.lerp(NIGHT_BOTTOM, f2);
    }
  }
}

/** Returns 0 during day, 1 at full night, with smooth transitions. */
function computeNightFactor(t: number): number {
  if (t >= 19 || t <= 5) return 1;
  if (t >= 7 && t <= 17) return 0;
  if (t > 5 && t < 7) return 1 - smoothstep((t - 5) / 2);
  /* 17 < t < 19 */ return smoothstep((t - 17) / 2);
}

function smoothstep(x: number): number {
  const c = x < 0 ? 0 : x > 1 ? 1 : x;
  return c * c * (3 - 2 * c);
}
