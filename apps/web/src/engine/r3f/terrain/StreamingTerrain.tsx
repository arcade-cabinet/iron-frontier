// StreamingTerrain - Main terrain component for R3F
// Composes ChunkManager with biome textures and LOD system

import { useRef, useMemo, useCallback, createContext, useContext, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ChunkCoord, BiomeType } from '@iron-frontier/shared/types/engine';
import {
  useHeightmap,
  CHUNK_SIZE,
  VIEW_DISTANCE,
  HEIGHTMAP_RESOLUTION,
  worldToChunk,
  chunkKey,
  type UseHeightmapOptions,
  type TerrainConfig,
} from './useHeightmap';
import { ChunkManager, useTerrainHeight } from './ChunkManager';

// ============================================================================
// TYPES
// ============================================================================

export interface StreamingTerrainConfig {
  /** Random seed for terrain generation */
  seed: number;
  /** View distance in chunks (default: 3) */
  viewDistance: number;
  /** Enable debug wireframe mode */
  debug?: boolean;
  /** Enable shadow casting/receiving */
  shadows?: boolean;
  /** Custom terrain configuration */
  terrainConfig?: Partial<TerrainConfig>;
}

export interface StreamingTerrainProps extends Partial<StreamingTerrainConfig> {
  /** Player position for chunk loading (if not using camera) */
  playerPosition?: THREE.Vector3 | [number, number, number];
  /** Use camera position for chunk loading instead of playerPosition */
  followCamera?: boolean;
  /** Callback when terrain is clicked */
  onTerrainClick?: (worldPosition: THREE.Vector3, chunkCoord: ChunkCoord) => void;
  /** Callback when player enters a new chunk */
  onChunkEnter?: (coord: ChunkCoord) => void;
  /** Children to render within terrain context */
  children?: React.ReactNode;
}

export interface TerrainContextValue {
  /** Get terrain height at world position */
  getHeightAt: (x: number, z: number) => number;
  /** Get dominant biome at world position */
  getBiomeAt: (x: number, z: number) => BiomeType;
  /** Get biome weights at world position */
  getBiomeWeights: (x: number, z: number) => Record<BiomeType, number>;
  /** Get position on terrain (with Y height) */
  getPositionOnTerrain: (x: number, z: number) => THREE.Vector3;
  /** Current player chunk */
  playerChunk: ChunkCoord;
  /** Terrain configuration */
  config: StreamingTerrainConfig;
}

// ============================================================================
// CONTEXT
// ============================================================================

const TerrainContext = createContext<TerrainContextValue | null>(null);

/**
 * Hook to access terrain context from child components.
 *
 * @example
 * ```tsx
 * function Player() {
 *   const { getHeightAt, getPositionOnTerrain } = useTerrain();
 *   const pos = getPositionOnTerrain(100, 200);
 *   // Use pos.y as ground height
 * }
 * ```
 */
export function useTerrain(): TerrainContextValue {
  const context = useContext(TerrainContext);
  if (!context) {
    throw new Error('useTerrain must be used within a StreamingTerrain component');
  }
  return context;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: StreamingTerrainConfig = {
  seed: 12345,
  viewDistance: VIEW_DISTANCE,
  debug: false,
  shadows: true,
};

// ============================================================================
// TERRAIN LOADING FALLBACK
// ============================================================================

function TerrainLoadingFallback() {
  return (
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[CHUNK_SIZE * 3, CHUNK_SIZE * 3, 32, 32]} />
      <meshStandardMaterial color={0x886644} roughness={0.9} />
    </mesh>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * StreamingTerrain - Main terrain system component for React Three Fiber.
 *
 * Features:
 * - Infinite procedural terrain with chunk streaming
 * - LOD (Level of Detail) based on distance
 * - Biome-based PBR textures
 * - Height queries for physics/gameplay
 * - Context provider for child components
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <StreamingTerrain
 *     seed={12345}
 *     viewDistance={3}
 *     followCamera
 *     onTerrainClick={(pos) => console.log('Clicked at:', pos)}
 *   >
 *     <Player />
 *     <NPCs />
 *   </StreamingTerrain>
 * </Canvas>
 * ```
 */
export function StreamingTerrain({
  seed = DEFAULT_CONFIG.seed,
  viewDistance = DEFAULT_CONFIG.viewDistance,
  debug = DEFAULT_CONFIG.debug,
  shadows = DEFAULT_CONFIG.shadows,
  terrainConfig,
  playerPosition,
  followCamera = false,
  onTerrainClick,
  onChunkEnter,
  children,
}: StreamingTerrainProps) {
  const { camera } = useThree();

  // Heightmap generator hook
  const heightmapOptions: UseHeightmapOptions = useMemo(
    () => ({
      seed,
      config: terrainConfig,
    }),
    [seed, terrainConfig]
  );

  const { getHeightAt, getBiomeAt, getBiomeWeights, config: generatorConfig } =
    useHeightmap(heightmapOptions);

  // Track current player chunk
  const playerChunkRef = useRef<ChunkCoord>({ cx: 0, cz: 0 });
  const lastChunkRef = useRef<ChunkCoord>({ cx: 0, cz: 0 });

  // Get current player world position
  const getPlayerWorldPosition = useCallback((): THREE.Vector3 => {
    if (playerPosition) {
      if (Array.isArray(playerPosition)) {
        return new THREE.Vector3(playerPosition[0], playerPosition[1], playerPosition[2]);
      }
      // Clone to avoid type issues between different @types/three versions
      return new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
    }
    if (followCamera) {
      // Clone camera position to avoid type compatibility issues
      return new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
    }
    return new THREE.Vector3(0, 0, 0);
  }, [playerPosition, followCamera, camera]);

  // Track chunk changes
  useFrame(() => {
    const worldPos = getPlayerWorldPosition();
    const newChunk = worldToChunk(worldPos.x, worldPos.z);

    if (
      newChunk.cx !== lastChunkRef.current.cx ||
      newChunk.cz !== lastChunkRef.current.cz
    ) {
      lastChunkRef.current = newChunk;
      playerChunkRef.current = newChunk;
      onChunkEnter?.(newChunk);
    }
  });

  // Handle terrain click
  const handleChunkClick = useCallback(
    (coord: ChunkCoord, point: THREE.Vector3) => {
      onTerrainClick?.(point, coord);
    },
    [onTerrainClick]
  );

  // Get position on terrain surface
  const getPositionOnTerrain = useCallback(
    (x: number, z: number): THREE.Vector3 => {
      const y = getHeightAt(x, z);
      return new THREE.Vector3(x, y, z);
    },
    [getHeightAt]
  );

  // Build context value
  const contextValue = useMemo<TerrainContextValue>(
    () => ({
      getHeightAt,
      getBiomeAt,
      getBiomeWeights,
      getPositionOnTerrain,
      playerChunk: playerChunkRef.current,
      config: {
        seed,
        viewDistance,
        debug,
        shadows,
        terrainConfig,
      },
    }),
    [
      getHeightAt,
      getBiomeAt,
      getBiomeWeights,
      getPositionOnTerrain,
      seed,
      viewDistance,
      debug,
      shadows,
      terrainConfig,
    ]
  );

  return (
    <TerrainContext.Provider value={contextValue}>
      <group name="streaming-terrain">
        <Suspense fallback={<TerrainLoadingFallback />}>
          <ChunkManager
            playerPosition={playerPosition}
            viewDistance={viewDistance}
            heightmapOptions={heightmapOptions}
            onChunkClick={handleChunkClick}
            debug={debug}
            followCamera={followCamera}
          />
        </Suspense>
        {children}
      </group>
    </TerrainContext.Provider>
  );
}

// ============================================================================
// ADDITIONAL EXPORTS
// ============================================================================

export { CHUNK_SIZE, VIEW_DISTANCE, HEIGHTMAP_RESOLUTION, worldToChunk, chunkKey };

// ============================================================================
// TERRAIN MARKER COMPONENT
// ============================================================================

interface TerrainMarkerProps {
  /** World X position */
  x: number;
  /** World Z position */
  z: number;
  /** Vertical offset above terrain */
  offsetY?: number;
  /** Children to render at position */
  children: React.ReactNode;
}

/**
 * TerrainMarker - Positions children on the terrain surface.
 *
 * Automatically calculates Y position based on terrain height.
 *
 * @example
 * ```tsx
 * <StreamingTerrain>
 *   <TerrainMarker x={100} z={200} offsetY={1}>
 *     <mesh>
 *       <boxGeometry args={[1, 1, 1]} />
 *       <meshStandardMaterial color="red" />
 *     </mesh>
 *   </TerrainMarker>
 * </StreamingTerrain>
 * ```
 */
export function TerrainMarker({ x, z, offsetY = 0, children }: TerrainMarkerProps) {
  const { getHeightAt } = useTerrain();

  const position = useMemo<[number, number, number]>(() => {
    const y = getHeightAt(x, z) + offsetY;
    return [x, y, z];
  }, [getHeightAt, x, z, offsetY]);

  return <group position={position}>{children}</group>;
}

// ============================================================================
// TERRAIN ALIGNED GROUP
// ============================================================================

interface TerrainAlignedProps {
  /** World position [x, z] or [x, y, z] */
  position: [number, number] | [number, number, number];
  /** Rotation around Y axis (radians) */
  rotation?: number;
  /** Additional Y offset */
  offsetY?: number;
  /** Align to terrain normal */
  alignToNormal?: boolean;
  /** Children to render */
  children: React.ReactNode;
}

/**
 * TerrainAligned - Group that aligns children to terrain surface.
 *
 * @example
 * ```tsx
 * <StreamingTerrain>
 *   <TerrainAligned position={[100, 200]} rotation={Math.PI / 4}>
 *     <Building />
 *   </TerrainAligned>
 * </StreamingTerrain>
 * ```
 */
export function TerrainAligned({
  position,
  rotation = 0,
  offsetY = 0,
  alignToNormal = false,
  children,
}: TerrainAlignedProps) {
  const { getHeightAt } = useTerrain();
  const groupRef = useRef<THREE.Group>(null);

  const [x, z] = position.length === 2 ? position : [position[0], position[2]];

  const finalPosition = useMemo<[number, number, number]>(() => {
    const y = getHeightAt(x, z) + offsetY;
    return [x, y, z];
  }, [getHeightAt, x, z, offsetY]);

  // Calculate terrain normal for alignment (optional)
  const normalRotation = useMemo<THREE.Euler>(() => {
    if (!alignToNormal) {
      return new THREE.Euler(0, rotation, 0);
    }

    // Sample heights around the point to calculate normal
    const delta = 0.5;
    const hCenter = getHeightAt(x, z);
    const hLeft = getHeightAt(x - delta, z);
    const hRight = getHeightAt(x + delta, z);
    const hBack = getHeightAt(x, z - delta);
    const hFront = getHeightAt(x, z + delta);

    const dx = hLeft - hRight;
    const dz = hBack - hFront;

    const normal = new THREE.Vector3(dx, 2 * delta, dz).normalize();
    const up = new THREE.Vector3(0, 1, 0);

    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
    const euler = new THREE.Euler().setFromQuaternion(quaternion);

    // Add Y rotation
    euler.y += rotation;

    return euler;
  }, [getHeightAt, x, z, alignToNormal, rotation]);

  return (
    <group ref={groupRef} position={finalPosition} rotation={normalRotation}>
      {children}
    </group>
  );
}

// ============================================================================
// TERRAIN RAYCASTER HOOK
// ============================================================================

/**
 * Hook for raycasting against terrain from mouse/touch position.
 *
 * @example
 * ```tsx
 * function TerrainClickHandler() {
 *   const raycastTerrain = useTerrainRaycast();
 *
 *   const handleClick = (event) => {
 *     const hit = raycastTerrain(event.clientX, event.clientY);
 *     if (hit) {
 *       console.log('Hit terrain at:', hit.point);
 *     }
 *   };
 * }
 * ```
 */
export function useTerrainRaycast() {
  const { camera, gl, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  return useCallback(
    (
      clientX: number,
      clientY: number
    ): { point: THREE.Vector3; normal: THREE.Vector3; distance: number } | null => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;

      // Cast camera to THREE.Camera to handle R3F's extended camera type
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera as THREE.Camera);

      // Find terrain meshes
      const terrainMeshes: THREE.Mesh[] = [];
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name.startsWith('terrain_')) {
          terrainMeshes.push(child);
        }
      });

      const intersects = raycaster.intersectObjects(terrainMeshes);
      if (intersects.length > 0) {
        const hit = intersects[0];
        return {
          point: hit.point.clone(),
          normal: hit.face?.normal?.clone() ?? new THREE.Vector3(0, 1, 0),
          distance: hit.distance,
        };
      }

      return null;
    },
    [camera, gl, scene, raycaster]
  );
}
