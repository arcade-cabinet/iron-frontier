/**
 * HexTileLoader - Loads and caches Kenney Hexagon Kit GLB models
 *
 * Provides efficient loading, caching, and instancing of hex tile meshes
 * for use in procedural hex-based terrain generation.
 */
import {
  AbstractMesh,
  type AssetContainer,
  type InstancedMesh,
  Mesh,
  type Scene,
  SceneLoader,
  type TransformNode,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

// Base path for hex tile assets
const HEX_TILES_PATH = '/assets/models/hex-tiles/';

/**
 * Scale factor for Kenney hex tiles to match the coordinate system.
 * Kenney tiles are approximately 1 unit wide, but the coordinate system
 * expects tiles to be 2 units wide (2 * size where size=1.0).
 * This scale ensures tiles snap together with no gaps.
 */
const TILE_SCALE_FACTOR = 2.0;

/**
 * All available hex tile types from the Kenney Hexagon Kit
 */
export type HexTileType =
  // Base terrain
  | 'grass'
  | 'grass-forest'
  | 'grass-hill'
  | 'sand'
  | 'sand-desert'
  | 'sand-rocks'
  | 'dirt'
  | 'dirt-lumber'
  | 'stone'
  | 'stone-hill'
  | 'stone-mountain'
  | 'stone-rocks'
  | 'water'
  | 'water-island'
  | 'water-rocks'
  // Bridge
  | 'bridge'
  // Buildings
  | 'building-archery'
  | 'building-cabin'
  | 'building-castle'
  | 'building-dock'
  | 'building-farm'
  | 'building-house'
  | 'building-market'
  | 'building-mill'
  | 'building-mine'
  | 'building-port'
  | 'building-sheep'
  | 'building-smelter'
  | 'building-tower'
  | 'building-village'
  | 'building-wall'
  | 'building-walls'
  | 'building-watermill'
  | 'building-wizard-tower'
  // Paths
  | 'path-corner'
  | 'path-corner-sharp'
  | 'path-crossing'
  | 'path-end'
  | 'path-intersectionA'
  | 'path-intersectionB'
  | 'path-intersectionC'
  | 'path-intersectionD'
  | 'path-intersectionE'
  | 'path-intersectionF'
  | 'path-intersectionG'
  | 'path-intersectionH'
  | 'path-square'
  | 'path-square-end'
  | 'path-start'
  | 'path-straight'
  // Rivers
  | 'river-corner'
  | 'river-corner-sharp'
  | 'river-crossing'
  | 'river-end'
  | 'river-intersectionA'
  | 'river-intersectionB'
  | 'river-intersectionC'
  | 'river-intersectionD'
  | 'river-intersectionE'
  | 'river-intersectionF'
  | 'river-intersectionG'
  | 'river-intersectionH'
  | 'river-start'
  | 'river-straight'
  // Units/decorations
  | 'unit-house'
  | 'unit-mansion'
  | 'unit-mill'
  | 'unit-ship'
  | 'unit-ship-large'
  | 'unit-tower'
  | 'unit-tree'
  | 'unit-wall-tower';

/**
 * Common tile types to preload on initialization
 */
const PRELOAD_TILES: HexTileType[] = [
  'grass',
  'sand',
  'dirt',
  'stone',
  'water',
  'grass-forest',
  'grass-hill',
  'path-straight',
  'river-straight',
];

/**
 * Cached tile data including the source mesh for instancing
 */
interface CachedTile {
  container: AssetContainer;
  sourceMesh: Mesh;
  instanceCount: number;
}

/**
 * Options for creating a tile instance
 */
export interface TileInstanceOptions {
  position?: Vector3;
  rotation?: number; // Y-axis rotation in radians
  scale?: number;
  parent?: TransformNode;
}

/**
 * HexTileLoader - Manages loading and instancing of hex tile GLB models
 */
export class HexTileLoader {
  private scene: Scene;
  private cache: Map<HexTileType, CachedTile> = new Map();
  private loadingPromises: Map<HexTileType, Promise<CachedTile>> = new Map();
  private isInitialized: boolean = false;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Initialize the loader and preload common tiles
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('[HexTileLoader] Initializing, preloading common tiles...');
    const startTime = performance.now();

    // Preload common tiles in parallel
    await Promise.all(PRELOAD_TILES.map((type) => this.loadTile(type)));

    const elapsed = performance.now() - startTime;
    console.log(
      `[HexTileLoader] Preloaded ${PRELOAD_TILES.length} tiles in ${elapsed.toFixed(0)}ms`
    );

    this.isInitialized = true;
  }

  /**
   * Load a tile type into the cache
   */
  async loadTile(type: HexTileType): Promise<CachedTile> {
    // Return cached tile if available
    const cached = this.cache.get(type);
    if (cached) {
      return cached;
    }

    // Return existing loading promise if in progress
    const existingPromise = this.loadingPromises.get(type);
    if (existingPromise) {
      return existingPromise;
    }

    // Start new load
    const loadPromise = this.loadTileInternal(type);
    this.loadingPromises.set(type, loadPromise);

    try {
      const result = await loadPromise;
      this.cache.set(type, result);
      return result;
    } finally {
      this.loadingPromises.delete(type);
    }
  }

  /**
   * Internal tile loading implementation
   */
  private async loadTileInternal(type: HexTileType): Promise<CachedTile> {
    const fileName = `${type}.glb`;
    const url = `${HEX_TILES_PATH}${fileName}`;

    try {
      // Load the GLB into an AssetContainer for efficient instancing
      const container = await SceneLoader.LoadAssetContainerAsync(
        HEX_TILES_PATH,
        fileName,
        this.scene
      );

      // Find the root mesh (first non-__root__ mesh)
      let sourceMesh: Mesh | null = null;
      for (const mesh of container.meshes) {
        if (mesh instanceof Mesh && mesh.name !== '__root__') {
          sourceMesh = mesh;
          break;
        }
      }

      if (!sourceMesh) {
        // Fallback: use the first mesh if available
        const firstMesh = container.meshes.find((m) => m instanceof Mesh) as Mesh | undefined;
        if (firstMesh) {
          sourceMesh = firstMesh;
        } else {
          throw new Error(`No valid mesh found in ${fileName}`);
        }
      }

      // Scale the source mesh to match the coordinate system
      // This ensures all instances will have the correct size for seamless tiling
      sourceMesh.scaling.setAll(TILE_SCALE_FACTOR);

      // Do NOT add to scene - we keep it in the container for instancing
      // The source mesh stays invisible; only instances are rendered

      console.log(`[HexTileLoader] Loaded tile: ${type} (scale: ${TILE_SCALE_FACTOR})`);

      return {
        container,
        sourceMesh,
        instanceCount: 0,
      };
    } catch (error) {
      const errorMsg = `[HexTileLoader] FATAL: Failed to load tile ${type} from ${url}`;
      console.error(errorMsg, error);
      throw new Error(`${errorMsg}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get a clone of a tile mesh (full copy, independent geometry)
   * Use for tiles that need unique modifications
   */
  async getClone(type: HexTileType, options: TileInstanceOptions = {}): Promise<TransformNode> {
    const cached = await this.loadTile(type);
    const { position, rotation, scale, parent } = options;

    // Clone the entire hierarchy from the container
    const cloneName = `${type}_clone_${Date.now()}`;
    const clonedMeshes = cached.container.instantiateModelsToScene(
      (name) => `${cloneName}_${name}`,
      false // Don't clone animations
    );

    // The root node of the cloned hierarchy
    const rootNode = clonedMeshes.rootNodes[0];
    if (!rootNode) {
      throw new Error(`Failed to clone tile ${type}`);
    }

    // Cast to TransformNode to access position/rotation/scaling
    const transformNode = rootNode as TransformNode;

    // Apply transforms
    if (position) {
      transformNode.position = position;
    }
    if (rotation !== undefined) {
      transformNode.rotation = new Vector3(0, rotation, 0);
    }
    if (scale !== undefined) {
      transformNode.scaling = new Vector3(scale, scale, scale);
    }
    if (parent) {
      transformNode.parent = parent;
    }

    return transformNode;
  }

  /**
   * Get an instanced mesh of a tile (shared geometry, efficient for many tiles)
   * Use for terrain tiles that don't need unique modifications
   */
  async getInstance(type: HexTileType, options: TileInstanceOptions = {}): Promise<InstancedMesh> {
    const cached = await this.loadTile(type);
    const { position, rotation, scale, parent } = options;

    // Ensure source mesh is in scene for instancing (but invisible)
    if (!cached.sourceMesh.isEnabled()) {
      cached.container.addAllToScene();
      cached.sourceMesh.setEnabled(false);
      cached.sourceMesh.isVisible = false;
    }

    // Create instance
    cached.instanceCount++;
    const instanceName = `${type}_inst_${cached.instanceCount}`;
    const instance = cached.sourceMesh.createInstance(instanceName);

    // Apply transforms
    if (position) {
      instance.position = position;
    }
    if (rotation !== undefined) {
      instance.rotation = new Vector3(0, rotation, 0);
    }
    if (scale !== undefined) {
      instance.scaling = new Vector3(scale, scale, scale);
    }
    if (parent) {
      instance.parent = parent;
    }

    return instance;
  }

  /**
   * Check if a tile type is loaded in the cache
   */
  isLoaded(type: HexTileType): boolean {
    return this.cache.has(type);
  }

  /**
   * Get the number of cached tile types
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Get statistics about the loader
   */
  getStats(): { cached: number; instances: number } {
    let totalInstances = 0;
    for (const cached of this.cache.values()) {
      totalInstances += cached.instanceCount;
    }
    return {
      cached: this.cache.size,
      instances: totalInstances,
    };
  }

  /**
   * Dispose of all cached tiles and clean up
   */
  dispose(): void {
    console.log('[HexTileLoader] Disposing all cached tiles...');

    for (const [type, cached] of this.cache) {
      cached.container.dispose();
    }

    this.cache.clear();
    this.loadingPromises.clear();
    this.isInitialized = false;

    console.log('[HexTileLoader] Disposed');
  }
}

/**
 * Singleton instance for global access
 */
let globalLoader: HexTileLoader | null = null;

/**
 * Get or create the global HexTileLoader instance
 */
export function getHexTileLoader(scene: Scene): HexTileLoader {
  if (!globalLoader || globalLoader['scene'] !== scene) {
    globalLoader = new HexTileLoader(scene);
  }
  return globalLoader;
}

/**
 * Dispose the global loader instance
 */
export function disposeHexTileLoader(): void {
  if (globalLoader) {
    globalLoader.dispose();
    globalLoader = null;
  }
}
