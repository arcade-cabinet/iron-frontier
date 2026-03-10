// DayNightCycle — R3F component that drives the day/night cycle.
//
// Wraps DayNightManager, ticks it via useFrame, passes timeOfDay to Sky
// and Lighting, renders atmospheric effects (fog, fireflies, dust), and
// manages a player lantern (point light child of camera) during nighttime.

import { useFrame, useThree } from "@react-three/fiber";
import Alea from "alea";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  DUST_PARTICLES,
  getDustFactor,
  getLanternFactor,
  LANTERN_CONFIG,
} from "@/engine/renderers/AtmosphericEffects";
import { DayNightManager, type PhaseChangeCallback } from "@/engine/renderers/DayNightManager";
import { Fireflies } from "./Fireflies.tsx";
import { Lighting } from "./Lighting.tsx";
import { Sky } from "./Sky.tsx";

export interface DayNightCycleProps {
  /** Starting time of day (0-24 float). Default: 10 (10 AM). */
  initialTime?: number;
  /** Real seconds per game minute. Lower = faster day cycle. */
  timeMultiplier?: number;
  /** Pause time progression (for menus/dialogue). */
  paused?: boolean;
  /** Callback when the time phase changes. */
  onPhaseChange?: PhaseChangeCallback;
}

// --- Dust motes (daytime sunlight shafts) ---

const _dustDummy = new THREE.Object3D();

function DustParticles({
  dustFactor,
  seed = "iron-frontier-dust",
}: {
  dustFactor: number;
  seed?: string;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const elapsedRef = useRef(0);
  const { count, radius, size, baseOpacity, color, driftSpeed } = DUST_PARTICLES;

  const particles = useMemo(() => {
    const rng = Alea(seed) as unknown as () => number;
    return Array.from({ length: count }, () => {
      const a = rng() * Math.PI * 2;
      const d = rng() * radius;
      return {
        base: new THREE.Vector3(Math.cos(a) * d, 0.5 + rng() * 4, Math.sin(a) * d),
        phase: rng() * Math.PI * 2,
        speed: driftSpeed * (0.5 + rng()),
        driftAngle: rng() * Math.PI * 2,
      };
    });
  }, [seed, count, radius, driftSpeed]);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
      }),
    [color],
  );
  const geometry = useMemo(() => new THREE.SphereGeometry(size, 4, 4), [size]);

  useFrame((_s, delta) => {
    if (!meshRef.current) return;
    if (dustFactor < 0.01) {
      meshRef.current.visible = false;
      return;
    }
    meshRef.current.visible = true;
    elapsedRef.current += delta;
    const t = elapsedRef.current;
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = baseOpacity * dustFactor;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      _dustDummy.position.set(
        p.base.x + Math.sin(t * p.speed * 0.2 + p.driftAngle) * 0.8,
        p.base.y + Math.sin(t * p.speed + p.phase) * 0.3,
        p.base.z + Math.cos(t * p.speed * 0.15 + p.driftAngle) * 0.8,
      );
      _dustDummy.updateMatrix();
      meshRef.current.setMatrixAt(i, _dustDummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} frustumCulled={false} />;
}

// --- Player lantern (warm point light near camera at night) ---

const _offsetVec = new THREE.Vector3();

function PlayerLantern({ nightFactor }: { nightFactor: number }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const { camera } = useThree();
  const elapsedRef = useRef(0);
  const { color, intensity, range, decay, offset, flickerAmplitude, flickerSpeed } = LANTERN_CONFIG;

  useFrame((_s, delta) => {
    if (!lightRef.current) return;
    const factor = getLanternFactor(nightFactor);
    if (factor < 0.01) {
      lightRef.current.visible = false;
      return;
    }
    lightRef.current.visible = true;
    elapsedRef.current += delta;

    _offsetVec.set(offset[0], offset[1], offset[2]).applyQuaternion(camera.quaternion);
    lightRef.current.position.copy(camera.position).add(_offsetVec);

    const t = elapsedRef.current;
    const flicker =
      Math.sin(t * flickerSpeed) * 0.5 +
      Math.sin(t * flickerSpeed * 1.7 + 0.5) * 0.3 +
      Math.sin(t * flickerSpeed * 3.1 + 1.2) * 0.2;
    lightRef.current.intensity = intensity * factor * (1 + flicker * flickerAmplitude);
  });

  return (
    <pointLight
      ref={lightRef}
      color={color}
      intensity={0}
      distance={range}
      decay={decay}
      castShadow={false}
    />
  );
}

// --- Main DayNightCycle component ---

export function DayNightCycle({
  initialTime = 10,
  timeMultiplier,
  paused = false,
  onPhaseChange,
}: DayNightCycleProps) {
  const timeRef = useRef(initialTime);
  const nightFactorRef = useRef(0);
  const dustFactorRef = useRef(0);

  const manager = useMemo(
    () => new DayNightManager(initialTime, timeMultiplier),
    [], // Stable — initialTime/timeMultiplier are startup values
  );

  useEffect(() => {
    if (timeMultiplier !== undefined) manager.setTimeMultiplier(timeMultiplier);
  }, [manager, timeMultiplier]);

  useEffect(() => {
    if (!onPhaseChange) return;
    return manager.onPhaseChange(onPhaseChange);
  }, [manager, onPhaseChange]);

  // Scene fog (imperative — no JSX element for FogExp2)
  const fogRef = useRef<THREE.FogExp2>(null);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const fog = new THREE.FogExp2(0xc8b090, 0.0008);
    scene.fog = fog;
    fogRef.current = fog;
    return () => {
      scene.fog = null;
      fogRef.current = null;
    };
  }, [scene]);

  // Tick every frame
  useFrame((_s, delta) => {
    if (!paused) manager.tick(delta);
    const tod = manager.getTimeOfDay();
    timeRef.current = tod;
    nightFactorRef.current = manager.getNightFactor();
    dustFactorRef.current = getDustFactor(tod);
    if (fogRef.current) {
      const fv = manager.getFog();
      fogRef.current.color.set(fv.color);
      fogRef.current.density = fv.density;
    }
  });

  // Sky and Lighting read timeOfDay in their own useFrame hooks — the prop
  // seeds the initial value; they animate internally every frame.
  const tod = timeRef.current;
  const nf = nightFactorRef.current;
  const df = dustFactorRef.current;

  return (
    <>
      <Sky timeOfDay={tod} />
      <Lighting timeOfDay={tod} />
      <Fireflies nightFactor={nf} />
      <DustParticles dustFactor={df} />
      <PlayerLantern nightFactor={nf} />
    </>
  );
}
