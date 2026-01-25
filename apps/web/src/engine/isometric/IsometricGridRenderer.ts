/**
 * IsometricGridRenderer.ts - Main renderer for isometric tile maps
 *
 * Renders Fallout 2-style isometric square tiles (diamonds from top view).
 * Manages terrain tiles, props, and buildings as separate layers.
 * Uses visibility culling for performance on large maps.
 */

import {
  type AbstractMesh,
  ArcRotateCamera,
  Color3,
  DirectionalLight,
  HemisphericLight,
  type Mesh,
  type Scene,
  ShadowGenerator,
  TransformNode,
  Vector3,
} from '@babylonjs/core';

import { gridToWorld, worldToGrid, euclideanDistance } from './IsometricCoord';
import { IsometricTileFactory } from './IsometricTileFactory';
import { IsometricTileLoader } from './IsometricTileLoader';
import {
  createEmptyGrid,
  type GridCoord,
  type IsometricGrid,
  type IsometricLayout,
  DEFAULT_ISOMETRIC_LAYOUT,
  type PropPlacement,
  type TerrainTileData,
  TerrainType,
  tileKey,
  parseTileKey,
  RenderLayer,
} from './IsometricTypes';

// ============================================================================
// ISOMETRIC CAMERA CONFIGURATION
// ============================================================================

export interface IsometricCameraConfig {
  /** Distance from target in world units */
  distance: number;
  /** Elevation angle in radians (~36 deg for Fallout 2 style) */
  angle: number;
  /** Horizontal rotation angle */
  azimuth: number;
  /** Lerp speed for smooth camera follow (0-1) */
  followSpeed: number;
  /** Minimum zoom distance */
  minDistance: number;
  /** Maximum zoom distance */
  maxDistance: number;
}

export const DEFAULT_CAMERA_CONFIG: IsometricCameraConfig = {
  distance: 15,
  angle: Math.PI / 5, // ~36 degrees from horizontal (Fallout 2 style)
  azimuth: Math.PI * 0.75, // 135 degrees (top-right view)
  followSpeed: 0.1,
  minDistance: 8,
  maxDistance: 30,
};

// ============================================================================
// RENDERER CONFIGURATION
// ============================================================================

export interface IsometricRendererConfig {
  scene: Scene;
  layout?: IsometricLayout;
  /** Tile distance from center to render */
  viewDistance: number;
  /** Distance at which to hide tiles */
  cullDistance: number;
  /** Enable shadows */
  enableShadows: boolean;
  /** Shadow map size (power of 2) */
  shadowMapSize: number;
  /** Use precompiled GLB tiles instead of runtime generation */
  usePrecompiledTiles: boolean;
}

const DEFAULT_RENDERER_CONFIG: Partial<IsometricRendererConfig> = {
  layout: DEFAULT_ISOMETRIC_LAYOUT,
  viewDistance: 30,
  cullDistance: 40,
  enableShadows: true,
  shadowMapSize: 2048,
  usePrecompiledTiles: false, // Set to true after running pnpm compile:tiles
};

// ============================================================================
// ISOMETRIC GRID RENDERER CLASS
// ============================================================================

/**
 * Renders isometric tile maps with separate terrain, prop, and building layers.
 * Manages mesh creation, positioning, visibility culling, and camera.
 */
export class IsometricGridRenderer {
  private scene: Scene;
  private config: IsometricRendererConfig;
  private layout: IsometricLayout;

  // Factories / Loaders
  private tileFactory: IsometricTileFactory;
  private tileLoader: IsometricTileLoader | null = null;

  // Grid data
  private grid: IsometricGrid;

  // Layer root nodes
  private rootNode: TransformNode;
  private terrainRoot: TransformNode;
  private propsRoot: TransformNode;
  private buildingsRoot: TransformNode;
  private charactersRoot: TransformNode;
  private effectsRoot: TransformNode;

  // Rendered meshes by layer
  private terrainMeshes: Map<string, AbstractMesh> = new Map();
  private propMeshes: Map<string, AbstractMesh> = new Map();
  private buildingMeshes: Map<string, AbstractMesh> = new Map();

  // Camera
  private camera: ArcRotateCamera | null = null;
  private cameraConfig: IsometricCameraConfig;
  private cameraTarget: Vector3 = Vector3.Zero();

  // Lighting
  private sunLight: DirectionalLight | null = null;
  private ambientLight: HemisphericLight | null = null;
  private shadowGenerator: ShadowGenerator | null = null;

  // Visibility tracking
  private visibleTiles: Set<string> = new Set();
  private lastCullCenter: GridCoord | null = null;

  constructor(config: IsometricRendererConfig) {
    this.scene = config.scene;
    this.config = { ...DEFAULT_RENDERER_CONFIG, ...config } as IsometricRendererConfig;
    this.layout = this.config.layout ?? DEFAULT_ISOMETRIC_LAYOUT;
    this.cameraConfig = { ...DEFAULT_CAMERA_CONFIG };

    // Initialize empty grid
    this.grid = createEmptyGrid(this.layout);

    // Create tile factory (always available for runtime generation)
    this.tileFactory = new IsometricTileFactory(this.scene, this.layout);

    // Create tile loader if using precompiled tiles
    if (this.config.usePrecompiledTiles) {
      this.tileLoader = new IsometricTileLoader(this.scene);
    }

    // Create layer hierarchy
    this.rootNode = new TransformNode('isometricRoot', this.scene);

    this.terrainRoot = new TransformNode('terrainLayer', this.scene);
    this.terrainRoot.parent = this.rootNode;

    this.propsRoot = new TransformNode('propsLayer', this.scene);
    this.propsRoot.parent = this.rootNode;

    this.buildingsRoot = new TransformNode('buildingsLayer', this.scene);
    this.buildingsRoot.parent = this.rootNode;

    this.charactersRoot = new TransformNode('charactersLayer', this.scene);
    this.charactersRoot.parent = this.rootNode;

    this.effectsRoot = new TransformNode('effectsLayer', this.scene);
    this.effectsRoot.parent = this.rootNode;

    console.log('[IsometricGridRenderer] Initialized');
  }

  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================

  /**
   * Initialize the renderer - preload materials, setup lighting.
   */
  async init(): Promise<void> {
    // Initialize tile factory or loader based on config
    if (this.config.usePrecompiledTiles && this.tileLoader) {
      await this.tileLoader.init();
      console.log('[IsometricGridRenderer] Using precompiled GLB tiles');
    } else {
      await this.tileFactory.init();
      console.log('[IsometricGridRenderer] Using runtime tile generation');
    }

    // Setup default lighting
    this.setupLighting();

    console.log('[IsometricGridRenderer] Ready');
  }

  /**
   * Sets up Western-themed lighting (bright sun, warm tones).
   */
  private setupLighting(): void {
    // Ambient hemisphere light (sky blue top, warm ground)
    this.ambientLight = new HemisphericLight(
      'ambientLight',
      new Vector3(0, 1, 0),
      this.scene
    );
    this.ambientLight.intensity = 0.4;
    this.ambientLight.diffuse = new Color3(0.95, 0.9, 0.8); // Warm white
    this.ambientLight.groundColor = new Color3(0.6, 0.5, 0.4); // Warm brown

    // Directional sun light (matches isometric camera angle)
    const sunDirection = new Vector3(-1, -2, -1).normalize();
    this.sunLight = new DirectionalLight('sunLight', sunDirection, this.scene);
    this.sunLight.intensity = 0.8;
    this.sunLight.diffuse = new Color3(1, 0.95, 0.85); // Warm sunlight

    // Setup shadows
    if (this.config.enableShadows && this.sunLight) {
      this.shadowGenerator = new ShadowGenerator(
        this.config.shadowMapSize,
        this.sunLight
      );
      this.shadowGenerator.useBlurExponentialShadowMap = true;
      this.shadowGenerator.blurKernel = 32;
      this.shadowGenerator.darkness = 0.3;
    }

    console.log('[IsometricGridRenderer] Lighting setup complete');
  }

  // ===========================================================================
  // GRID MANAGEMENT
  // ===========================================================================

  /**
   * Sets the grid data and triggers full render.
   */
  async setGrid(grid: IsometricGrid): Promise<void> {
    this.grid = grid;
    this.layout = grid.layout;
    await this.rebuildAllTerrain();
    console.log(`[IsometricGridRenderer] Grid set with ${grid.tiles.size} tiles`);
  }

  /**
   * Gets the current grid.
   */
  getGrid(): IsometricGrid {
    return this.grid;
  }

  /**
   * Adds or updates a terrain tile.
   */
  async setTile(data: TerrainTileData): Promise<void> {
    const key = tileKey(data.coord);
    this.grid.tiles.set(key, data);
    this.updateBounds(data.coord);
    await this.rebuildTileMesh(key, data);
  }

  /**
   * Removes a terrain tile.
   */
  removeTile(coord: GridCoord): void {
    const key = tileKey(coord);
    this.grid.tiles.delete(key);

    const mesh = this.terrainMeshes.get(key);
    if (mesh) {
      mesh.dispose();
      this.terrainMeshes.delete(key);
    }
    this.visibleTiles.delete(key);
  }

  /**
   * Gets tile data at coordinate.
   */
  getTile(coord: GridCoord): TerrainTileData | undefined {
    return this.grid.tiles.get(tileKey(coord));
  }

  /**
   * Adds a prop to the grid.
   */
  addProp(prop: PropPlacement): void {
    this.grid.props.set(prop.id, prop);
    // TODO: Load and render prop mesh
    console.log(`[IsometricGridRenderer] Added prop: ${prop.propType} at ${prop.coord.x},${prop.coord.y}`);
  }

  /**
   * Removes a prop from the grid.
   */
  removeProp(propId: string): void {
    this.grid.props.delete(propId);
    const mesh = this.propMeshes.get(propId);
    if (mesh) {
      mesh.dispose();
      this.propMeshes.delete(propId);
    }
  }

  /**
   * Updates grid bounds.
   */
  private updateBounds(coord: GridCoord): void {
    const { bounds } = this.grid;
    bounds.minX = Math.min(bounds.minX, coord.x);
    bounds.maxX = Math.max(bounds.maxX, coord.x);
    bounds.minY = Math.min(bounds.minY, coord.y);
    bounds.maxY = Math.max(bounds.maxY, coord.y);
  }

  // ===========================================================================
  // TERRAIN RENDERING
  // ===========================================================================

  /**
   * Rebuilds all terrain tile meshes.
   */
  private async rebuildAllTerrain(): Promise<void> {
    // Dispose existing
    for (const mesh of this.terrainMeshes.values()) {
      mesh.dispose();
    }
    this.terrainMeshes.clear();
    this.visibleTiles.clear();

    // Build all tiles
    const promises: Promise<void>[] = [];
    for (const [key, data] of this.grid.tiles) {
      promises.push(this.rebuildTileMesh(key, data));
    }
    await Promise.all(promises);

    console.log(`[IsometricGridRenderer] Rebuilt ${this.terrainMeshes.size} terrain tiles`);
  }

  /**
   * Creates or rebuilds a single terrain tile mesh.
   */
  private async rebuildTileMesh(key: string, data: TerrainTileData): Promise<void> {
    // Dispose existing
    const existing = this.terrainMeshes.get(key);
    if (existing) {
      existing.dispose();
    }

    // Calculate world position
    const worldPos = gridToWorld(data.coord, data.elevation, this.layout);
    const worldVec = new Vector3(worldPos.x, worldPos.y, worldPos.z);

    // Create tile with appropriate rotation for variation
    const rotation = (data.variant * Math.PI) / 2; // 0, 90, 180, 270 degrees

    let mesh: AbstractMesh;
    if (this.config.usePrecompiledTiles && this.tileLoader) {
      // Use precompiled GLB tiles (instanced for performance)
      mesh = await this.tileLoader.getInstance(data.terrain, worldVec, rotation);
    } else {
      // Use runtime-generated tiles
      mesh = this.tileFactory.createTile(data.terrain, worldVec, rotation);
    }

    mesh.parent = this.terrainRoot;
    this.terrainMeshes.set(key, mesh);
    this.visibleTiles.add(key);
  }

  // ===========================================================================
  // VISIBILITY CULLING
  // ===========================================================================

  /**
   * Updates tile visibility based on distance from center.
   * Call each frame or when player moves significantly.
   */
  updateVisibility(centerWorldPos: Vector3): void {
    const centerGrid = worldToGrid(centerWorldPos.x, centerWorldPos.z, this.layout);

    // Skip if center hasn't moved much
    if (
      this.lastCullCenter &&
      euclideanDistance(centerGrid, this.lastCullCenter) < 2
    ) {
      return;
    }
    this.lastCullCenter = centerGrid;

    // Update visibility for all terrain tiles
    for (const [key, mesh] of this.terrainMeshes) {
      const coord = parseTileKey(key);
      const dist = euclideanDistance(coord, centerGrid);

      if (dist <= this.config.viewDistance) {
        mesh.setEnabled(true);
        this.visibleTiles.add(key);
      } else if (dist > this.config.cullDistance) {
        mesh.setEnabled(false);
        this.visibleTiles.delete(key);
      }
    }

    // Update visibility for props
    for (const [id, mesh] of this.propMeshes) {
      const prop = this.grid.props.get(id);
      if (!prop) continue;

      const dist = euclideanDistance(prop.coord, centerGrid);
      mesh.setEnabled(dist <= this.config.viewDistance);
    }
  }

  /**
   * Gets all visible tile coordinates.
   */
  getVisibleTiles(): GridCoord[] {
    return Array.from(this.visibleTiles).map(parseTileKey);
  }

  // ===========================================================================
  // CAMERA - ISOMETRIC / FALLOUT 2 STYLE
  // ===========================================================================

  /**
   * Sets up the fixed isometric camera.
   */
  setupIsometricCamera(target: Vector3 = Vector3.Zero()): ArcRotateCamera {
    const { distance, angle, azimuth, minDistance, maxDistance } = this.cameraConfig;

    // Beta is elevation from vertical axis
    const beta = Math.PI / 2 - angle;

    this.camera = new ArcRotateCamera(
      'isometricCamera',
      azimuth,
      beta,
      distance,
      target,
      this.scene
    );

    // Lock rotation - fixed isometric view
    this.camera.lowerAlphaLimit = azimuth;
    this.camera.upperAlphaLimit = azimuth;
    this.camera.lowerBetaLimit = beta;
    this.camera.upperBetaLimit = beta;

    // Allow zoom
    this.camera.lowerRadiusLimit = minDistance;
    this.camera.upperRadiusLimit = maxDistance;

    // Smooth zoom
    this.camera.wheelPrecision = 50;
    this.camera.wheelDeltaPercentage = 0.02;

    // Disable panning and rotation
    this.camera.panningSensibility = 0;
    this.camera.angularSensibilityX = Infinity;
    this.camera.angularSensibilityY = Infinity;

    this.cameraTarget = target.clone();

    console.log(
      `[IsometricGridRenderer] Camera: distance=${distance}, angle=${((angle * 180) / Math.PI).toFixed(1)}deg`
    );

    return this.camera;
  }

  /**
   * Smoothly follows a target position.
   * Call each frame for smooth camera movement.
   */
  updateCameraTarget(targetPos: Vector3): void {
    if (!this.camera) return;

    this.cameraTarget = Vector3.Lerp(
      this.cameraTarget,
      targetPos,
      this.cameraConfig.followSpeed
    );
    this.camera.target = this.cameraTarget;
  }

  /**
   * Instantly sets camera target.
   */
  setCameraTarget(targetPos: Vector3): void {
    this.cameraTarget = targetPos.clone();
    if (this.camera) {
      this.camera.target = this.cameraTarget;
    }
  }

  /**
   * Sets camera configuration.
   */
  setCameraConfig(config: Partial<IsometricCameraConfig>): void {
    this.cameraConfig = { ...this.cameraConfig, ...config };

    if (this.camera) {
      this.camera.radius = this.cameraConfig.distance;
      this.camera.alpha = this.cameraConfig.azimuth;
      this.camera.beta = Math.PI / 2 - this.cameraConfig.angle;
      this.camera.lowerRadiusLimit = this.cameraConfig.minDistance;
      this.camera.upperRadiusLimit = this.cameraConfig.maxDistance;
    }
  }

  /**
   * Gets the camera instance.
   */
  getCamera(): ArcRotateCamera | null {
    return this.camera;
  }

  // ===========================================================================
  // PICKING / HIT DETECTION
  // ===========================================================================

  /**
   * Gets the grid coordinate at a world position.
   */
  getGridAtWorldPosition(worldX: number, worldZ: number): GridCoord {
    return worldToGrid(worldX, worldZ, this.layout);
  }

  /**
   * Gets the tile at a world position.
   */
  getTileAtWorldPosition(worldX: number, worldZ: number): TerrainTileData | undefined {
    const coord = worldToGrid(worldX, worldZ, this.layout);
    return this.getTile(coord);
  }

  /**
   * Performs a scene pick and returns the grid coordinate if terrain was hit.
   */
  pickGrid(screenX: number, screenY: number): GridCoord | null {
    const pickResult = this.scene.pick(screenX, screenY, (mesh) => {
      return mesh.parent === this.terrainRoot;
    });

    if (pickResult?.hit && pickResult.pickedPoint) {
      return worldToGrid(
        pickResult.pickedPoint.x,
        pickResult.pickedPoint.z,
        this.layout
      );
    }

    return null;
  }

  /**
   * Gets world position for a grid coordinate.
   */
  getWorldPosition(coord: GridCoord, elevation: number = 0): Vector3 {
    const pos = gridToWorld(coord, elevation, this.layout);
    return new Vector3(pos.x, pos.y, pos.z);
  }

  // ===========================================================================
  // LAYER ACCESS
  // ===========================================================================

  /**
   * Gets the root node for all isometric content.
   */
  getRootNode(): TransformNode {
    return this.rootNode;
  }

  /**
   * Gets the terrain layer root.
   */
  getTerrainRoot(): TransformNode {
    return this.terrainRoot;
  }

  /**
   * Gets the props layer root.
   */
  getPropsRoot(): TransformNode {
    return this.propsRoot;
  }

  /**
   * Gets the buildings layer root.
   */
  getBuildingsRoot(): TransformNode {
    return this.buildingsRoot;
  }

  /**
   * Gets the characters layer root (for player, NPCs).
   */
  getCharactersRoot(): TransformNode {
    return this.charactersRoot;
  }

  /**
   * Gets the effects layer root.
   */
  getEffectsRoot(): TransformNode {
    return this.effectsRoot;
  }

  /**
   * Gets the shadow generator (for adding meshes to cast shadows).
   */
  getShadowGenerator(): ShadowGenerator | null {
    return this.shadowGenerator;
  }

  // ===========================================================================
  // LIFECYCLE
  // ===========================================================================

  /**
   * Disposes all resources.
   */
  dispose(): void {
    // Dispose terrain meshes
    for (const mesh of this.terrainMeshes.values()) {
      mesh.dispose();
    }
    this.terrainMeshes.clear();

    // Dispose prop meshes
    for (const mesh of this.propMeshes.values()) {
      mesh.dispose();
    }
    this.propMeshes.clear();

    // Dispose building meshes
    for (const mesh of this.buildingMeshes.values()) {
      mesh.dispose();
    }
    this.buildingMeshes.clear();

    // Dispose tile factory and loader
    this.tileFactory.dispose();
    this.tileLoader?.dispose();

    // Dispose lighting
    this.ambientLight?.dispose();
    this.sunLight?.dispose();
    this.shadowGenerator?.dispose();

    // Dispose layer nodes
    this.rootNode.dispose();

    console.log('[IsometricGridRenderer] Disposed');
  }

  // ===========================================================================
  // UTILITIES
  // ===========================================================================

  /**
   * Gets the layout configuration.
   */
  getLayout(): IsometricLayout {
    return this.layout;
  }

  /**
   * Gets the tile factory.
   */
  getTileFactory(): IsometricTileFactory {
    return this.tileFactory;
  }

  /**
   * Creates a simple test grid for development.
   */
  createTestGrid(size: number = 10): void {
    const terrainTypes = [
      TerrainType.Grass,
      TerrainType.GrassDry,
      TerrainType.Sand,
      TerrainType.Dirt,
      TerrainType.Stone,
    ];

    for (let x = -size; x <= size; x++) {
      for (let y = -size; y <= size; y++) {
        // Select terrain based on distance from center
        const dist = Math.sqrt(x * x + y * y);
        let terrain: TerrainType;

        if (dist < size * 0.3) {
          terrain = TerrainType.Dirt;
        } else if (dist < size * 0.5) {
          terrain = TerrainType.Grass;
        } else if (dist < size * 0.7) {
          terrain = TerrainType.GrassDry;
        } else {
          terrain = TerrainType.Sand;
        }

        // Add some variation
        if (Math.random() < 0.1) {
          terrain = TerrainType.Stone;
        }

        const tile: TerrainTileData = {
          coord: { x, y },
          terrain,
          elevation: 0,
          walkable: true, // Test grid has no water tiles
          pathCost: terrain === TerrainType.Sand ? 1.5 : 1.0,
          variant: Math.floor(Math.random() * 4),
        };

        this.setTile(tile);
      }
    }

    console.log(`[IsometricGridRenderer] Created test grid: ${(size * 2 + 1) ** 2} tiles`);
  }
}
