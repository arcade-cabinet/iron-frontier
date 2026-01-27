/**
 * HexGridRenderer - Renders hex tile maps using Babylon.js
 *
 * Flat-top hex grid with axial coordinates (q, r).
 * Designed for Fallout 2-style isometric gameplay with fixed camera angle.
 *
 * Uses existing HexTypes.ts for type definitions, HexCoord.ts for coordinate
 * math, and HexTileLoader.ts for loading Kenney Hexagon Kit GLB models.
 */

import {
  type AbstractMesh,
  ArcRotateCamera,
  Color3,
  type InstancedMesh,
  type Mesh,
  MeshBuilder,
  type Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import {
  hexDistance,
  hexNeighbors,
  hexToWorld as hexToWorldPos,
  worldToHex as worldToHexCoord,
} from './HexCoord';
import {
  getHexTileLoader,
  type HexTileLoader,
  type HexTileType as LoaderTileType,
} from './HexTileLoader';
import {
  DEFAULT_HEX_LAYOUT,
  HexBuildingType,
  type HexChunkData,
  type HexCoord,
  type HexLayout,
  HexTerrainType,
  type HexTileData,
  hexKey,
  parseHexKey,
} from './HexTypes';

// ============================================================================
// HEX GEOMETRY CONSTANTS
// ============================================================================

/**
 * For flat-top hexes:
 * - Width (corner to corner) = 2 * size
 * - Height (flat edge to flat edge) = sqrt(3) * size
 *
 * Kenney Hexagon Kit models are scaled in HexTileLoader to fit the coordinate system.
 */
export const HEX_SIZE = DEFAULT_HEX_LAYOUT.size;
export const HEX_WIDTH = HEX_SIZE * 2;
export const HEX_HEIGHT = Math.sqrt(3) * HEX_SIZE;

// Re-export coordinate utilities from HexCoord for convenience
export { hexDistance, hexNeighbors };

// ============================================================================
// COORDINATE CONVERSION (Vector3 wrappers)
// ============================================================================

/**
 * Converts axial hex coordinates to Babylon.js Vector3.
 * Wraps HexCoord.hexToWorld with elevation support.
 */
export function hexToWorld(
  coord: HexCoord,
  elevation: number = 0,
  layout: HexLayout = DEFAULT_HEX_LAYOUT
): Vector3 {
  const pos = hexToWorldPos(coord, layout);
  return new Vector3(pos.x, pos.y + elevation, pos.z);
}

/**
 * Converts Babylon.js Vector3 to the nearest hex coordinate.
 * Wraps HexCoord.worldToHex for Vector3 input.
 */
export function worldToHex(worldPos: Vector3, layout: HexLayout = DEFAULT_HEX_LAYOUT): HexCoord {
  return worldToHexCoord({ x: worldPos.x, y: worldPos.y, z: worldPos.z }, layout);
}

/**
 * Converts rotation step (0-5) to radians.
 * Each step is 60 degrees.
 */
export function rotationToRadians(rotation: number): number {
  return (rotation * Math.PI) / 3;
}

// ============================================================================
// ISOMETRIC CAMERA CONFIGURATION
// ============================================================================

export interface IsometricCameraConfig {
  distance: number; // Distance from target
  angle: number; // Elevation angle in radians (~35 deg for isometric)
  azimuth: number; // Horizontal rotation
  followSpeed: number; // Lerp speed for following player
}

export const DEFAULT_ISOMETRIC_CONFIG: IsometricCameraConfig = {
  distance: 12,
  angle: Math.PI / 5, // ~36 degrees from horizontal (Fallout 2 style)
  azimuth: Math.PI * 0.75, // 135 degrees (top-right view)
  followSpeed: 0.1,
};

// ============================================================================
// HEX GRID DATA STRUCTURE
// ============================================================================

/**
 * The full hex grid data structure for rendering.
 */
export interface HexGrid {
  tiles: Map<string, HexTileData>;
  chunks: Map<string, HexChunkData>;
  layout: HexLayout;
  bounds: {
    minQ: number;
    maxQ: number;
    minR: number;
    maxR: number;
  };
}

/**
 * Creates an empty hex grid.
 */
export function createEmptyGrid(layout: HexLayout = DEFAULT_HEX_LAYOUT): HexGrid {
  return {
    tiles: new Map(),
    chunks: new Map(),
    layout,
    bounds: {
      minQ: 0,
      maxQ: 0,
      minR: 0,
      maxR: 0,
    },
  };
}

// ============================================================================
// HEX GRID RENDERER CONFIGURATION
// ============================================================================

export interface HexGridRendererConfig {
  scene: Scene;
  layout?: HexLayout;
  viewDistance: number; // Tiles visible from center
  cullDistance: number; // Distance to hide tiles
  usePlaceholders: boolean; // Show placeholder hexes if no model
}

const DEFAULT_RENDERER_CONFIG: Partial<HexGridRendererConfig> = {
  layout: DEFAULT_HEX_LAYOUT,
  viewDistance: 15,
  cullDistance: 20,
  usePlaceholders: true,
};

// ============================================================================
// TERRAIN TYPE TO LOADER TYPE MAPPING
// ============================================================================

/**
 * Maps HexTerrainType to HexTileLoader's LoaderTileType.
 */
function terrainToLoaderType(terrain: HexTerrainType): LoaderTileType | null {
  const mapping: Partial<Record<HexTerrainType, LoaderTileType>> = {
    [HexTerrainType.Grass]: 'grass',
    [HexTerrainType.GrassHill]: 'grass-hill',
    [HexTerrainType.GrassForest]: 'grass-forest',
    [HexTerrainType.Sand]: 'sand',
    [HexTerrainType.SandHill]: 'sand-desert',
    [HexTerrainType.SandDunes]: 'sand-rocks',
    [HexTerrainType.Dirt]: 'dirt',
    [HexTerrainType.DirtHill]: 'dirt-lumber',
    [HexTerrainType.Stone]: 'stone',
    [HexTerrainType.StoneHill]: 'stone-hill',
    [HexTerrainType.StoneMountain]: 'stone-mountain',
    [HexTerrainType.StoneRocks]: 'stone-rocks',
    [HexTerrainType.Water]: 'water',
    [HexTerrainType.WaterShallow]: 'water-island',
    [HexTerrainType.WaterDeep]: 'water-rocks',
  };

  return mapping[terrain] ?? null;
}

/**
 * Maps HexBuildingType to HexTileLoader's LoaderTileType (Kenney building tiles).
 * These are complete hex tiles with buildings on them.
 */
function buildingToLoaderType(building: HexBuildingType): LoaderTileType | null {
  const mapping: Partial<Record<HexBuildingType, LoaderTileType>> = {
    [HexBuildingType.Cabin]: 'building-cabin',
    [HexBuildingType.House]: 'building-house',
    [HexBuildingType.Mansion]: 'building-house', // Closest match
    [HexBuildingType.Saloon]: 'building-market',
    [HexBuildingType.GeneralStore]: 'building-market',
    [HexBuildingType.Bank]: 'building-village',
    [HexBuildingType.Hotel]: 'building-house',
    [HexBuildingType.Mine]: 'building-mine',
    [HexBuildingType.Smelter]: 'building-smelter',
    [HexBuildingType.Workshop]: 'building-cabin',
    [HexBuildingType.Windmill]: 'building-mill',
    [HexBuildingType.WaterTower]: 'building-tower',
    [HexBuildingType.SheriffOffice]: 'building-village',
    [HexBuildingType.Church]: 'building-tower',
    [HexBuildingType.TrainStation]: 'building-dock',
    [HexBuildingType.Telegraph]: 'building-tower',
    [HexBuildingType.Well]: 'building-farm', // Using farm as placeholder
    [HexBuildingType.Stable]: 'building-farm',
    [HexBuildingType.Warehouse]: 'building-cabin',
    [HexBuildingType.Dock]: 'building-dock',
    [HexBuildingType.WatchTower]: 'building-tower',
    [HexBuildingType.Fort]: 'building-castle',
  };

  return mapping[building] ?? null;
}

// ============================================================================
// HEX GRID RENDERER CLASS
// ============================================================================

/**
 * Renders a hex grid using Babylon.js.
 * Manages tile mesh creation, positioning, and visibility culling.
 */
export class HexGridRenderer {
  private scene: Scene;
  private tileLoader: HexTileLoader;
  private config: HexGridRendererConfig;
  private layout: HexLayout;

  // Grid data
  private grid: HexGrid | null = null;

  // Rendered meshes
  private tileRoot: TransformNode;
  private tileMeshes: Map<string, AbstractMesh | InstancedMesh> = new Map();

  // Camera
  private camera: ArcRotateCamera | null = null;
  private cameraConfig: IsometricCameraConfig;
  private cameraTarget: Vector3 = Vector3.Zero();

  // Visibility tracking
  private visibleTiles: Set<string> = new Set();
  private lastCullCenter: HexCoord | null = null;

  // Placeholder materials by terrain type
  private placeholderMaterials: Map<HexTerrainType, StandardMaterial> = new Map();

  constructor(config: HexGridRendererConfig) {
    this.scene = config.scene;
    this.config = { ...DEFAULT_RENDERER_CONFIG, ...config } as HexGridRendererConfig;
    this.layout = this.config.layout ?? DEFAULT_HEX_LAYOUT;
    this.cameraConfig = { ...DEFAULT_ISOMETRIC_CONFIG };

    // Get the tile loader for this scene
    this.tileLoader = getHexTileLoader(this.scene);

    // Create root node for all tiles
    this.tileRoot = new TransformNode('hexGridRoot', this.scene);

    // Initialize placeholder materials
    this.initPlaceholderMaterials();

    console.log('[HexGridRenderer] Initialized');
  }

  /**
   * Initializes the renderer, preloading common tiles.
   */
  async init(): Promise<void> {
    await this.tileLoader.init();
    console.log('[HexGridRenderer] Tile loader initialized');
  }

  /**
   * Creates materials for placeholder hex tiles by terrain type.
   */
  private initPlaceholderMaterials(): void {
    const typeColors: Partial<Record<HexTerrainType, string>> = {
      [HexTerrainType.Grass]: '#6B8E23',
      [HexTerrainType.GrassHill]: '#556B2F',
      [HexTerrainType.GrassForest]: '#228B22',
      [HexTerrainType.Sand]: '#C4A574',
      [HexTerrainType.SandHill]: '#B8956B',
      [HexTerrainType.SandDunes]: '#D4A464',
      [HexTerrainType.Dirt]: '#8B7355',
      [HexTerrainType.DirtHill]: '#7B6345',
      [HexTerrainType.Stone]: '#696969',
      [HexTerrainType.StoneHill]: '#595959',
      [HexTerrainType.StoneMountain]: '#494949',
      [HexTerrainType.Water]: '#4682B4',
      [HexTerrainType.WaterShallow]: '#5F9EA0',
      [HexTerrainType.WaterDeep]: '#2E5090',
      [HexTerrainType.Mesa]: '#CD853F',
      [HexTerrainType.Canyon]: '#A0522D',
      [HexTerrainType.Badlands]: '#8B4513',
    };

    for (const [type, color] of Object.entries(typeColors)) {
      const mat = new StandardMaterial(`hexMat_${type}`, this.scene);
      mat.diffuseColor = Color3.FromHexString(color);
      mat.specularColor = new Color3(0.1, 0.1, 0.1);
      this.placeholderMaterials.set(type as HexTerrainType, mat);
    }
  }

  // ===========================================================================
  // GRID MANAGEMENT
  // ===========================================================================

  /**
   * Sets the hex grid data and triggers a full render update.
   */
  setGrid(grid: HexGrid): void {
    this.grid = grid;
    this.layout = grid.layout;
    this.rebuildVisibleTiles();
    console.log(`[HexGridRenderer] Grid set with ${grid.tiles.size} tiles`);
  }

  /**
   * Updates a single tile in the grid.
   */
  async updateTile(data: HexTileData): Promise<void> {
    if (!this.grid) {
      console.warn('[HexGridRenderer] No grid set, cannot update tile');
      return;
    }

    const key = hexKey(data.coord);
    this.grid.tiles.set(key, data);

    // Update grid bounds
    this.updateBounds(data.coord);

    // Rebuild this specific tile mesh
    await this.rebuildTileMesh(key, data);
  }

  /**
   * Removes a tile from the grid.
   */
  removeTile(coord: HexCoord): void {
    if (!this.grid) return;

    const key = hexKey(coord);
    this.grid.tiles.delete(key);

    // Dispose mesh
    const mesh = this.tileMeshes.get(key);
    if (mesh) {
      mesh.dispose();
      this.tileMeshes.delete(key);
    }
    this.visibleTiles.delete(key);
  }

  /**
   * Gets tile data at a hex coordinate.
   */
  getTile(coord: HexCoord): HexTileData | undefined {
    if (!this.grid) return undefined;
    return this.grid.tiles.get(hexKey(coord));
  }

  /**
   * Updates the grid bounds based on a new coordinate.
   */
  private updateBounds(coord: HexCoord): void {
    if (!this.grid) return;

    const { bounds } = this.grid;
    bounds.minQ = Math.min(bounds.minQ, coord.q);
    bounds.maxQ = Math.max(bounds.maxQ, coord.q);
    bounds.minR = Math.min(bounds.minR, coord.r);
    bounds.maxR = Math.max(bounds.maxR, coord.r);
  }

  // ===========================================================================
  // RENDERING
  // ===========================================================================

  /**
   * Rebuilds all visible tile meshes.
   */
  private async rebuildVisibleTiles(): Promise<void> {
    if (!this.grid) return;

    // Dispose existing meshes
    for (const mesh of this.tileMeshes.values()) {
      mesh.dispose();
    }
    this.tileMeshes.clear();
    this.visibleTiles.clear();

    // Build meshes for all tiles in grid
    const promises: Promise<void>[] = [];
    for (const [key, data] of this.grid.tiles) {
      promises.push(this.rebuildTileMesh(key, data));
    }

    await Promise.all(promises);
    console.log(`[HexGridRenderer] Rebuilt ${this.tileMeshes.size} tile meshes`);
  }

  /**
   * Rebuilds or creates a mesh for a single tile.
   * If the tile has a building, renders the building tile instead of terrain.
   */
  private async rebuildTileMesh(key: string, data: HexTileData): Promise<void> {
    // Dispose existing mesh if any
    const existing = this.tileMeshes.get(key);
    if (existing) {
      existing.dispose();
    }

    // Get elevation in world units
    const elevation = this.getElevationHeight(data.elevation);

    // Check if tile has a building - if so, use building tile instead of terrain
    const hasBuilding = data.building && data.building !== HexBuildingType.None;
    const buildingType = hasBuilding ? buildingToLoaderType(data.building) : null;
    const terrainType = terrainToLoaderType(data.terrain);

    // Prefer building tile, fall back to terrain tile
    const loaderType = buildingType ?? terrainType;

    let mesh: AbstractMesh | InstancedMesh | null = null;

    if (loaderType) {
      // Try to load the tile - will throw if it fails
      try {
        // Ensure tile is loaded first
        if (!this.tileLoader.isLoaded(loaderType)) {
          await this.tileLoader.loadTile(loaderType);
        }
        mesh = await this.tileLoader.getInstance(loaderType);

        if (hasBuilding) {
          console.log(`[HexGridRenderer] Loaded building tile: ${loaderType} at ${key}`);
        }
      } catch (err) {
        // NO FALLBACKS - fail loudly
        const errorMsg = `[HexGridRenderer] FATAL: Failed to load tile ${loaderType} for hex ${key}`;
        console.error(errorMsg, err);
        throw new Error(`${errorMsg}: ${err instanceof Error ? err.message : String(err)}`);
      }
    } else if (this.config.usePlaceholders) {
      // Only use placeholders for unmapped terrain types, not for load failures
      console.log(`[HexGridRenderer] Using placeholder for unmapped terrain: ${data.terrain}`);
      mesh = this.createPlaceholderHex(data.terrain, key);
    }

    if (!mesh) {
      throw new Error(
        `[HexGridRenderer] FATAL: No mesh available for tile ${key} with terrain ${data.terrain}`
      );
    }

    // Position and rotate
    const worldPos = hexToWorld(data.coord, elevation, this.layout);
    mesh.position = worldPos;

    // Apply rotation - use buildingRotation if building, else terrainRotation
    const totalRotation = hasBuilding ? data.buildingRotation : data.rotationOffset;
    mesh.rotation.y = rotationToRadians(totalRotation);

    mesh.parent = this.tileRoot;

    this.tileMeshes.set(key, mesh);
    this.visibleTiles.add(key);
  }

  /**
   * Converts elevation enum to world height in meters.
   */
  private getElevationHeight(elevation: number): number {
    // Each elevation level = 0.5 meters
    return elevation * 0.5;
  }

  /**
   * Creates a placeholder hexagonal mesh for tiles without models.
   */
  private createPlaceholderHex(terrain: HexTerrainType, name: string): Mesh {
    const size = this.layout.size;

    // Create a flat hexagonal prism
    const hex = MeshBuilder.CreateCylinder(
      `hex_${name}`,
      {
        height: 0.1,
        diameter: size * 2,
        tessellation: 6, // 6 sides = hexagon
      },
      this.scene
    );

    // Rotate to flat-top orientation (default cylinder is pointy-top when tessellation=6)
    hex.rotation.y = Math.PI / 6; // 30 degrees

    // Apply material
    const mat = this.placeholderMaterials.get(terrain);
    if (mat) {
      hex.material = mat;
    }

    hex.receiveShadows = true;

    return hex;
  }

  // ===========================================================================
  // VISIBILITY / CULLING
  // ===========================================================================

  /**
   * Updates tile visibility based on distance from a center point.
   * Call this each frame or when player moves.
   */
  updateVisibility(centerWorldPos: Vector3): void {
    const centerHex = worldToHex(centerWorldPos, this.layout);

    // Skip if center hasn't changed significantly
    if (this.lastCullCenter && hexDistance(centerHex, this.lastCullCenter) < 2) {
      return;
    }
    this.lastCullCenter = centerHex;

    // Update visibility for all tiles
    for (const [key, mesh] of this.tileMeshes) {
      const coord = parseHexKey(key);
      const dist = hexDistance(coord, centerHex);

      if (dist <= this.config.viewDistance) {
        mesh.setEnabled(true);
        this.visibleTiles.add(key);
      } else if (dist > this.config.cullDistance) {
        mesh.setEnabled(false);
        this.visibleTiles.delete(key);
      }
    }
  }

  /**
   * Gets all currently visible tile coordinates.
   */
  getVisibleTiles(): HexCoord[] {
    return Array.from(this.visibleTiles).map(parseHexKey);
  }

  // ===========================================================================
  // CAMERA - ISOMETRIC / FALLOUT 2 STYLE
  // ===========================================================================

  /**
   * Sets up the fixed isometric camera (Fallout 2 style).
   * Returns the camera for external use.
   */
  setupIsometricCamera(target: Vector3 = Vector3.Zero()): ArcRotateCamera {
    const { distance, angle, azimuth } = this.cameraConfig;

    // Beta is elevation from vertical (PI/2 - angle gives angle from horizontal)
    const beta = Math.PI / 2 - angle;

    this.camera = new ArcRotateCamera(
      'isometricCamera',
      azimuth,
      beta,
      distance,
      target,
      this.scene
    );

    // Lock camera rotation - Fallout 2 style fixed view
    this.camera.lowerAlphaLimit = azimuth;
    this.camera.upperAlphaLimit = azimuth;
    this.camera.lowerBetaLimit = beta;
    this.camera.upperBetaLimit = beta;

    // Allow zoom only
    this.camera.lowerRadiusLimit = distance * 0.5;
    this.camera.upperRadiusLimit = distance * 2;

    // Smooth zoom
    this.camera.wheelPrecision = 50;
    this.camera.wheelDeltaPercentage = 0.02;

    // Disable panning and rotation input
    this.camera.panningSensibility = 0;
    this.camera.angularSensibilityX = Infinity;
    this.camera.angularSensibilityY = Infinity;

    this.cameraTarget = target.clone();

    console.log(
      `[HexGridRenderer] Isometric camera: distance=${distance}, angle=${((angle * 180) / Math.PI).toFixed(1)}deg`
    );

    return this.camera;
  }

  /**
   * Updates camera to follow a target position (smooth lerp).
   * Call each frame for smooth camera follow.
   */
  updateCameraTarget(targetPos: Vector3): void {
    if (!this.camera) return;

    // Lerp toward target
    this.cameraTarget = Vector3.Lerp(this.cameraTarget, targetPos, this.cameraConfig.followSpeed);

    this.camera.target = this.cameraTarget;
  }

  /**
   * Sets camera configuration (distance, angle, etc.).
   */
  setCameraConfig(config: Partial<IsometricCameraConfig>): void {
    this.cameraConfig = { ...this.cameraConfig, ...config };

    if (this.camera) {
      this.camera.radius = this.cameraConfig.distance;
      this.camera.alpha = this.cameraConfig.azimuth;
      this.camera.beta = Math.PI / 2 - this.cameraConfig.angle;
    }
  }

  /**
   * Gets the current camera instance.
   */
  getCamera(): ArcRotateCamera | null {
    return this.camera;
  }

  // ===========================================================================
  // PICKING / HIT DETECTION
  // ===========================================================================

  /**
   * Gets the hex tile at a world position.
   * Useful for click detection.
   */
  getTileAtWorldPosition(worldPos: Vector3): HexTileData | undefined {
    const hexCoord = worldToHex(worldPos, this.layout);
    return this.getTile(hexCoord);
  }

  /**
   * Gets the hex coordinate at a world position.
   */
  getHexAtWorldPosition(worldPos: Vector3): HexCoord {
    return worldToHex(worldPos, this.layout);
  }

  /**
   * Gets the mesh at a hex coordinate (if rendered).
   */
  getMeshAtHex(coord: HexCoord): AbstractMesh | InstancedMesh | undefined {
    return this.tileMeshes.get(hexKey(coord));
  }

  /**
   * Performs a scene pick and returns the hex coordinate if a tile was hit.
   */
  pickHex(screenX: number, screenY: number): HexCoord | null {
    const pickResult = this.scene.pick(screenX, screenY, (mesh) => {
      // Only pick hex tiles (those parented to tile root)
      return mesh.parent === this.tileRoot;
    });

    if (pickResult?.hit && pickResult.pickedPoint) {
      return worldToHex(pickResult.pickedPoint, this.layout);
    }

    return null;
  }

  /**
   * Gets world position for a hex coordinate.
   */
  getWorldPosition(coord: HexCoord, elevation: number = 0): Vector3 {
    return hexToWorld(coord, elevation, this.layout);
  }

  // ===========================================================================
  // LIFECYCLE
  // ===========================================================================

  /**
   * Disposes all resources.
   */
  dispose(): void {
    // Dispose all tile meshes
    for (const mesh of this.tileMeshes.values()) {
      mesh.dispose();
    }
    this.tileMeshes.clear();

    // Dispose materials
    for (const mat of this.placeholderMaterials.values()) {
      mat.dispose();
    }
    this.placeholderMaterials.clear();

    // Dispose root node
    this.tileRoot.dispose();

    // Camera is managed by scene, don't dispose here

    console.log('[HexGridRenderer] Disposed');
  }

  // ===========================================================================
  // UTILITIES
  // ===========================================================================

  /**
   * Gets the root transform node for all tiles.
   */
  getTileRoot(): TransformNode {
    return this.tileRoot;
  }

  /**
   * Gets the current grid data.
   */
  getGrid(): HexGrid | null {
    return this.grid;
  }

  /**
   * Gets the hex layout configuration.
   */
  getLayout(): HexLayout {
    return this.layout;
  }

  /**
   * Gets the tile loader instance.
   */
  getTileLoader(): HexTileLoader {
    return this.tileLoader;
  }

  /**
   * Gets hex geometry constants for external use.
   */
  static getHexConstants() {
    return {
      size: HEX_SIZE,
      width: HEX_WIDTH,
      height: HEX_HEIGHT,
    };
  }
}
