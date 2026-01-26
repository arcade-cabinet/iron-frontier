/**
 * VegetationInstances.tsx - R3F instanced vegetation rendering
 *
 * Features:
 * - Instanced rendering for performance
 * - Biome-based vegetation spawning
 * - Distance-based culling
 * - Multiple vegetation types (cacti, shrubs, dead trees)
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';
import Alea from 'alea';
import { createNoise2D, type NoiseFunction2D } from 'simplex-noise';

// ============================================================================
// TYPES
// ============================================================================

export interface VegetationInstancesProps {
  /** Random seed for vegetation placement */
  seed: number;
  /** Current player position */
  playerPosition: THREE.Vector3;
  /** Height query function */
  getHeightAt: (x: number, z: number) => number;
  /** View distance for vegetation */
  viewDistance?: number;
  /** Density multiplier (0-1) */
  density?: number;
}

export type VegetationType =
  | 'saguaro'
  | 'barrel_cactus'
  | 'prickly_pear'
  | 'sagebrush'
  | 'dead_tree'
  | 'tumbleweed'
  | 'yucca';

interface VegetationInstance {
  type: VegetationType;
  position: THREE.Vector3;
  rotation: number;
  scale: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_VIEW_DISTANCE = 150;
const DEFAULT_DENSITY = 0.5;
const CHUNK_SIZE = 32;
const MAX_INSTANCES_PER_TYPE = 500;

/** Vegetation type configurations */
const VEGETATION_CONFIG: Record<
  VegetationType,
  {
    color: THREE.Color;
    minScale: number;
    maxScale: number;
    spawnWeight: number;
  }
> = {
  saguaro: {
    color: new THREE.Color(0x2e8b57), // Sea green
    minScale: 0.8,
    maxScale: 1.5,
    spawnWeight: 0.1,
  },
  barrel_cactus: {
    color: new THREE.Color(0x228b22), // Forest green
    minScale: 0.5,
    maxScale: 1.0,
    spawnWeight: 0.15,
  },
  prickly_pear: {
    color: new THREE.Color(0x3cb371), // Medium sea green
    minScale: 0.4,
    maxScale: 0.9,
    spawnWeight: 0.2,
  },
  sagebrush: {
    color: new THREE.Color(0x9acd32), // Yellow green
    minScale: 0.3,
    maxScale: 0.7,
    spawnWeight: 0.25,
  },
  dead_tree: {
    color: new THREE.Color(0x8b7355), // Burly wood
    minScale: 0.8,
    maxScale: 1.3,
    spawnWeight: 0.1,
  },
  tumbleweed: {
    color: new THREE.Color(0xdaa520), // Goldenrod
    minScale: 0.3,
    maxScale: 0.6,
    spawnWeight: 0.15,
  },
  yucca: {
    color: new THREE.Color(0x556b2f), // Dark olive green
    minScale: 0.5,
    maxScale: 1.0,
    spawnWeight: 0.05,
  },
};

// ============================================================================
// VEGETATION GEOMETRY BUILDERS
// ============================================================================

function createSaguaroGeometry(): THREE.BufferGeometry {
  const group = new THREE.Group();

  // Main trunk
  const trunk = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
  trunk.translate(0, 2, 0);

  // Arms
  const arm1 = new THREE.CylinderGeometry(0.2, 0.25, 1.5, 6);
  arm1.translate(0.7, 2.5, 0);
  arm1.rotateZ(Math.PI / 4);

  const arm2 = new THREE.CylinderGeometry(0.2, 0.25, 1.5, 6);
  arm2.translate(-0.7, 3, 0);
  arm2.rotateZ(-Math.PI / 4);

  // Merge geometries
  const merged = new THREE.BufferGeometry();
  merged.copy(trunk);

  return merged;
}

function createBarrelCactusGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(0.5, 16, 12);
  geometry.scale(1, 0.7, 1);
  geometry.translate(0, 0.35, 0);
  return geometry;
}

function createPricklyPearGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BoxGeometry(0.5, 0.6, 0.1);
  geometry.translate(0, 0.3, 0);
  return geometry;
}

function createSagebrushGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(0.4, 8, 6);
  geometry.scale(1, 0.7, 1);
  geometry.translate(0, 0.3, 0);
  return geometry;
}

function createDeadTreeGeometry(): THREE.BufferGeometry {
  const trunk = new THREE.CylinderGeometry(0.15, 0.3, 3, 6);
  trunk.translate(0, 1.5, 0);
  return trunk;
}

function createTumbleweedGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.IcosahedronGeometry(0.3, 1);
  geometry.translate(0, 0.3, 0);
  return geometry;
}

function createYuccaGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.ConeGeometry(0.3, 1.2, 8);
  geometry.translate(0, 0.6, 0);
  return geometry;
}

const GEOMETRY_BUILDERS: Record<VegetationType, () => THREE.BufferGeometry> = {
  saguaro: createSaguaroGeometry,
  barrel_cactus: createBarrelCactusGeometry,
  prickly_pear: createPricklyPearGeometry,
  sagebrush: createSagebrushGeometry,
  dead_tree: createDeadTreeGeometry,
  tumbleweed: createTumbleweedGeometry,
  yucca: createYuccaGeometry,
};

// ============================================================================
// VEGETATION SPAWNER
// ============================================================================

class VegetationSpawner {
  private seed: number;
  private noise: NoiseFunction2D;
  private prng: () => number;

  constructor(seed: number) {
    this.seed = seed;
    this.prng = Alea(seed);
    this.noise = createNoise2D(this.prng);
  }

  generateChunkVegetation(
    chunkX: number,
    chunkZ: number,
    getHeightAt: (x: number, z: number) => number,
    density: number
  ): VegetationInstance[] {
    const instances: VegetationInstance[] = [];

    // Use chunk coordinates to seed per-chunk random
    const chunkSeed = this.seed + chunkX * 73856093 + chunkZ * 19349663;
    const chunkPrng = Alea(chunkSeed);

    // World coordinates
    const worldX = chunkX * CHUNK_SIZE;
    const worldZ = chunkZ * CHUNK_SIZE;

    // Spawn points based on density
    const spawnCount = Math.floor(20 * density);

    for (let i = 0; i < spawnCount; i++) {
      // Random position within chunk
      const localX = chunkPrng() * CHUNK_SIZE;
      const localZ = chunkPrng() * CHUNK_SIZE;

      const x = worldX + localX;
      const z = worldZ + localZ;

      // Use noise to determine spawn probability
      const noiseValue = (this.noise(x * 0.05, z * 0.05) + 1) / 2;
      if (chunkPrng() > noiseValue * density) continue;

      // Get terrain height
      const y = getHeightAt(x, z);

      // Select vegetation type based on weighted random
      const type = this.selectVegetationType(chunkPrng);
      const config = VEGETATION_CONFIG[type];

      // Random scale and rotation
      const scale = config.minScale + chunkPrng() * (config.maxScale - config.minScale);
      const rotation = chunkPrng() * Math.PI * 2;

      instances.push({
        type,
        position: new THREE.Vector3(x, y, z),
        rotation,
        scale,
      });
    }

    return instances;
  }

  private selectVegetationType(prng: () => number): VegetationType {
    const totalWeight = Object.values(VEGETATION_CONFIG).reduce(
      (sum, config) => sum + config.spawnWeight,
      0
    );

    let random = prng() * totalWeight;

    for (const [type, config] of Object.entries(VEGETATION_CONFIG)) {
      random -= config.spawnWeight;
      if (random <= 0) {
        return type as VegetationType;
      }
    }

    return 'sagebrush'; // Default fallback
  }
}

// ============================================================================
// VEGETATION TYPE INSTANCES COMPONENT
// ============================================================================

interface VegetationTypeInstancesProps {
  type: VegetationType;
  instances: VegetationInstance[];
}

function VegetationTypeInstances({ type, instances }: VegetationTypeInstancesProps) {
  const config = VEGETATION_CONFIG[type];

  // Create geometry
  const geometry = useMemo(() => GEOMETRY_BUILDERS[type](), [type]);

  // Filter instances for this type
  const typeInstances = useMemo(
    () => instances.filter((inst) => inst.type === type).slice(0, MAX_INSTANCES_PER_TYPE),
    [instances, type]
  );

  if (typeInstances.length === 0) return null;

  return (
    <Instances limit={MAX_INSTANCES_PER_TYPE} geometry={geometry}>
      <meshStandardMaterial
        color={config.color}
        roughness={0.9}
        metalness={0.1}
      />
      {typeInstances.map((instance, index) => (
        <Instance
          key={`${type}-${index}`}
          position={instance.position}
          rotation={[0, instance.rotation, 0]}
          scale={instance.scale}
        />
      ))}
    </Instances>
  );
}

// ============================================================================
// MAIN VEGETATION INSTANCES COMPONENT
// ============================================================================

export function VegetationInstances({
  seed,
  playerPosition,
  getHeightAt,
  viewDistance = DEFAULT_VIEW_DISTANCE,
  density = DEFAULT_DENSITY,
}: VegetationInstancesProps) {
  // Create spawner
  const spawner = useMemo(() => new VegetationSpawner(seed), [seed]);

  // Track loaded chunks
  const [loadedChunks, setLoadedChunks] = useState<Map<string, VegetationInstance[]>>(new Map());

  // Current player chunk
  const playerChunkX = Math.floor(playerPosition.x / CHUNK_SIZE);
  const playerChunkZ = Math.floor(playerPosition.z / CHUNK_SIZE);

  // View distance in chunks
  const chunkViewDistance = Math.ceil(viewDistance / CHUNK_SIZE);

  // Update loaded chunks based on player position
  useFrame(() => {
    const newChunks = new Map<string, VegetationInstance[]>();

    // Generate chunks in view distance
    for (let dx = -chunkViewDistance; dx <= chunkViewDistance; dx++) {
      for (let dz = -chunkViewDistance; dz <= chunkViewDistance; dz++) {
        const cx = playerChunkX + dx;
        const cz = playerChunkZ + dz;
        const key = `${cx},${cz}`;

        // Reuse existing chunk data if available
        if (loadedChunks.has(key)) {
          newChunks.set(key, loadedChunks.get(key)!);
        } else {
          // Generate new chunk
          const instances = spawner.generateChunkVegetation(cx, cz, getHeightAt, density);
          newChunks.set(key, instances);
        }
      }
    }

    // Only update if chunks changed
    if (newChunks.size !== loadedChunks.size) {
      setLoadedChunks(newChunks);
    } else {
      let changed = false;
      for (const key of newChunks.keys()) {
        if (!loadedChunks.has(key)) {
          changed = true;
          break;
        }
      }
      if (changed) {
        setLoadedChunks(newChunks);
      }
    }
  });

  // Aggregate all instances from loaded chunks
  const allInstances = useMemo(() => {
    const instances: VegetationInstance[] = [];
    for (const chunkInstances of loadedChunks.values()) {
      instances.push(...chunkInstances);
    }
    return instances;
  }, [loadedChunks]);

  // Render instances by type
  const vegetationTypes = Object.keys(VEGETATION_CONFIG) as VegetationType[];

  return (
    <group name="vegetation-instances">
      {vegetationTypes.map((type) => (
        <VegetationTypeInstances key={type} type={type} instances={allInstances} />
      ))}
    </group>
  );
}

export default VegetationInstances;
