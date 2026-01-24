/**
 * HexSceneManager - Babylon.js scene orchestration for hex-tile based maps
 *
 * Replaces the continuous terrain SceneManager with a hex-tile based approach
 * using Kenney Hexagon Kit assets and Fallout 2-style isometric camera.
 */

import {
  AbstractMesh,
  AnimationGroup,
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  Scene,
  SceneLoader,
  ShadowGenerator,
  Skeleton,
  StandardMaterial,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

import { WesternAssets } from '../assets/WesternRegistry';
import {
  HexCoord,
  HexTileData,
  HexTerrainType,
  HexElevation,
  HexEdgeType,
  HexFeatureType,
  HexBuildingType,
  DEFAULT_HEX_LAYOUT,
  hexKey,
  createEmptyTile,
  isTerrainPassable,
  isTerrainWater,
  isTerrainBuildable,
} from './HexTypes';
import {
  hex,
  hexToWorld as coordHexToWorld,
  worldToHex as coordWorldToHex,
  hexDistance,
  hexNeighbors,
} from './HexCoord';
import {
  HexGridRenderer,
  hexToWorld,
  worldToHex,
  createEmptyGrid,
  HEX_SIZE,
  type HexGrid,
} from './HexGridRenderer';
import { HexTileLoader, getHexTileLoader } from './HexTileLoader';
import {
  HexMapGenerator,
  generateHexMap,
  type HexTileData as GeneratorTileData,
} from './HexMapGenerator';
import { loadLocation, getDefaultSpawnPoint, type LoadedLocation } from './LocationLoader';
import type { Location } from '../../data/schemas/spatial';

// ============================================================================
// TYPES
// ============================================================================

export interface WorldPosition {
  x: number;
  y: number;
  z: number;
}

export interface HexSceneConfig {
  seed: number;
  mapWidth: number;
  mapHeight: number;
  hexSize: number;
}

const DEFAULT_CONFIG: HexSceneConfig = {
  seed: 42,
  mapWidth: 32,
  mapHeight: 32,
  hexSize: 1,
};

// ============================================================================
// HEX SCENE MANAGER
// ============================================================================

export class HexSceneManager {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private scene: Scene;
  private camera: ArcRotateCamera | null = null;
  private shadowGenerator: ShadowGenerator | null = null;

  // Hex system
  private gridRenderer: HexGridRenderer | null = null;
  private tileLoader: HexTileLoader | null = null;
  private mapGenerator: HexMapGenerator;
  private hexGrid: HexGrid | null = null;
  private loadedLocation: LoadedLocation | null = null;

  // Configuration
  private config: HexSceneConfig;

  // Player
  private playerMesh: AbstractMesh | null = null;
  private playerSkeleton: Skeleton | null = null;
  private playerAnimations: AnimationGroup[] = [];
  private playerHex: HexCoord = { q: 0, r: 0 };
  private playerWorldPos: Vector3 = Vector3.Zero();
  private playerFacingAngle: number = 0; // Y rotation in radians
  private playerModelYOffset: number = 0; // Compensate for models not centered at origin

  // Camera azimuth for calculating player facing direction
  // Player should face TOWARD the camera by default (Fallout 2 style)
  // Camera is at azimuth 135° (top-right looking down at player)
  private readonly CAMERA_AZIMUTH = Math.PI * 0.75; // 135 degrees
  private readonly DEFAULT_PLAYER_FACING = -Math.PI * 0.25; // -45 degrees - face toward camera
  // Model rotation offset: the model's "forward" is offset from standard atan2
  // To face direction θ, set rotation.y = θ + MODEL_ROTATION_OFFSET
  private readonly MODEL_ROTATION_OFFSET = -Math.PI; // -180 degrees

  // Sky backdrop (diorama style)
  private skyDome: Mesh | null = null;

  // Callbacks
  private onHexClick?: (coord: HexCoord, tile: HexTileData | undefined) => void;
  private onGroundClick?: (position: WorldPosition) => void;

  constructor(canvas: HTMLCanvasElement, config: Partial<HexSceneConfig> = {}) {
    this.canvas = canvas;
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Create Babylon engine
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    // Create scene
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.4, 0.6, 0.9, 1); // Sky blue fallback

    // Create map generator
    this.mapGenerator = new HexMapGenerator({
      seed: this.config.seed,
      width: this.config.mapWidth,
      height: this.config.mapHeight,
      hexSize: this.config.hexSize,
    });

    console.log(`[HexSceneManager] Created with seed ${this.config.seed}, ${this.config.mapWidth}x${this.config.mapHeight} hex grid`);
  }

  /**
   * Initialize the scene - must be called before start()
   * @param location Optional Location to load (if not provided, uses procedural generation)
   */
  async init(location?: Location): Promise<void> {
    console.log('[HexSceneManager] Initializing...');

    // Setup scene components
    this.setupSkyDome();
    this.setupLighting();

    // Initialize hex grid renderer
    this.gridRenderer = new HexGridRenderer({
      scene: this.scene,
      viewDistance: 20,
      cullDistance: 25,
      usePlaceholders: true,
    });
    await this.gridRenderer.init();

    // Load location or generate procedural map
    if (location) {
      await this.loadLocationMap(location);
    } else {
      await this.generateMap();
    }

    // Calculate map center position for camera
    const centerQ = Math.floor(this.hexGrid?.bounds.maxQ ?? this.config.mapWidth) / 2;
    const centerR = Math.floor(this.hexGrid?.bounds.maxR ?? this.config.mapHeight) / 2;
    const centerWorldPos = hexToWorld({ q: centerQ, r: centerR }, 0, DEFAULT_HEX_LAYOUT);

    // Setup isometric camera centered on map
    this.camera = this.gridRenderer.setupIsometricCamera(centerWorldPos);
    this.camera.attachControl(this.canvas, true);

    // Load player character
    await this.createPlayerMesh();

    // Setup input
    this.setupInput();

    // Determine spawn point
    let spawnHex: HexCoord;
    if (this.loadedLocation) {
      // Use location's entry point
      spawnHex = getDefaultSpawnPoint(this.loadedLocation);
      console.log(`[HexSceneManager] Spawning at location entry point: (${spawnHex.q}, ${spawnHex.r})`);
    } else {
      // Find passable spawn near center
      spawnHex = this.findPassableSpawnPoint({ q: Math.floor(centerQ), r: Math.floor(centerR) });
    }
    this.setPlayerHex(spawnHex);

    console.log('[HexSceneManager] Initialization complete');
  }

  /**
   * Load a Location into the scene
   */
  private async loadLocationMap(location: Location): Promise<void> {
    console.log(`[HexSceneManager] Loading location: ${location.name}`);

    // Load location data
    this.loadedLocation = loadLocation(location);
    this.hexGrid = this.loadedLocation.grid;

    // Set grid on renderer
    if (this.gridRenderer) {
      this.gridRenderer.setGrid(this.hexGrid);
    }

    console.log(`[HexSceneManager] Loaded ${this.hexGrid.tiles.size} tiles from location "${location.name}"`);
  }

  /**
   * Find a passable spawn point near the desired location
   * Spirals outward from center until a passable tile is found
   */
  private findPassableSpawnPoint(center: HexCoord): HexCoord {
    // Check center first
    const centerTile = this.hexGrid?.tiles.get(hexKey(center));
    if (centerTile && centerTile.isPassable && !centerTile.isWater) {
      return center;
    }

    // Spiral outward to find a passable tile
    const maxRadius = 10;
    for (let radius = 1; radius <= maxRadius; radius++) {
      const neighbors = hexNeighbors(center);

      // Check tiles at this radius in a ring pattern
      for (const neighbor of neighbors) {
        const tile = this.hexGrid?.tiles.get(hexKey(neighbor));
        if (tile && tile.isPassable && !tile.isWater) {
          console.log(`[HexSceneManager] Found passable spawn at (${neighbor.q}, ${neighbor.r})`);
          return neighbor;
        }
      }

      // Expand search - check tiles at increasing distance
      const checkCoords: HexCoord[] = [];
      for (let q = center.q - radius; q <= center.q + radius; q++) {
        for (let r = center.r - radius; r <= center.r + radius; r++) {
          const coord = { q, r };
          const dist = hexDistance(center, coord);
          if (dist === radius) {
            checkCoords.push(coord);
          }
        }
      }

      for (const coord of checkCoords) {
        const tile = this.hexGrid?.tiles.get(hexKey(coord));
        if (tile && tile.isPassable && !tile.isWater) {
          console.log(`[HexSceneManager] Found passable spawn at (${coord.q}, ${coord.r})`);
          return coord;
        }
      }
    }

    // Fallback to center if nothing found (shouldn't happen)
    console.warn('[HexSceneManager] No passable spawn found, using center');
    return center;
  }

  /**
   * Generate the hex map using procedural generation
   */
  private async generateMap(): Promise<void> {
    console.log('[HexSceneManager] Generating hex map...');

    // Generate map data
    const generatedTiles = this.mapGenerator.generate();

    // Convert to HexGrid format for renderer
    this.hexGrid = createEmptyGrid(DEFAULT_HEX_LAYOUT);

    for (const [key, genTile] of generatedTiles) {
      // Convert generator tile format to renderer tile format
      const rendererTile = this.convertTileData(genTile);
      this.hexGrid.tiles.set(key, rendererTile);

      // Update bounds
      this.hexGrid.bounds.minQ = Math.min(this.hexGrid.bounds.minQ, genTile.coord.q);
      this.hexGrid.bounds.maxQ = Math.max(this.hexGrid.bounds.maxQ, genTile.coord.q);
      this.hexGrid.bounds.minR = Math.min(this.hexGrid.bounds.minR, genTile.coord.r);
      this.hexGrid.bounds.maxR = Math.max(this.hexGrid.bounds.maxR, genTile.coord.r);
    }

    // Set grid on renderer
    if (this.gridRenderer) {
      this.gridRenderer.setGrid(this.hexGrid);
    }

    console.log(`[HexSceneManager] Generated ${this.hexGrid.tiles.size} hex tiles`);
  }

  /**
   * Convert generator tile format to renderer tile format
   */
  private convertTileData(genTile: GeneratorTileData): HexTileData {
    // Map biome/tile to HexTerrainType enum
    const terrainType = this.mapTerrainType(genTile.baseTile, genTile.biome);

    // Clamp elevation to valid enum range
    const elevationValue = Math.max(0, Math.min(4, Math.round(genTile.elevation * 3)));

    return {
      coord: genTile.coord,
      terrain: terrainType,
      elevation: elevationValue as HexElevation,
      edges: {
        edges: [
          HexEdgeType.None,
          HexEdgeType.None,
          HexEdgeType.None,
          HexEdgeType.None,
          HexEdgeType.None,
          HexEdgeType.None,
        ],
      },
      feature: HexFeatureType.None,
      building: genTile.building ? this.mapBuildingType(genTile.building) : HexBuildingType.None,
      buildingRotation: 0,
      isPassable: isTerrainPassable(terrainType),
      isWater: isTerrainWater(terrainType),
      isBuildable: isTerrainBuildable(terrainType),
      modelVariant: Math.floor(Math.random() * 4),
      rotationOffset: genTile.rotation,
    };
  }

  /**
   * Map base tile name to HexTerrainType
   */
  private mapTerrainType(baseTile: string, biome: string): HexTerrainType {
    // Direct mapping from Kenney tile names to terrain types
    const mapping: Record<string, HexTerrainType> = {
      'grass': HexTerrainType.Grass,
      'grass-forest': HexTerrainType.GrassForest,
      'grass-hill': HexTerrainType.GrassHill,
      'sand': HexTerrainType.Sand,
      'sand-desert': HexTerrainType.SandHill,
      'sand-rocks': HexTerrainType.SandDunes,
      'dirt': HexTerrainType.Dirt,
      'dirt-lumber': HexTerrainType.DirtHill,
      'stone': HexTerrainType.Stone,
      'stone-hill': HexTerrainType.StoneHill,
      'stone-mountain': HexTerrainType.StoneMountain,
      'stone-rocks': HexTerrainType.StoneRocks,
      'water': HexTerrainType.Water,
      'water-island': HexTerrainType.WaterShallow,
      'water-rocks': HexTerrainType.WaterDeep,
    };

    const terrain = mapping[baseTile];
    if (!terrain) {
      throw new Error(`[HexSceneManager] FATAL: Unknown terrain type "${baseTile}" - no fallback allowed`);
    }
    return terrain;
  }

  /**
   * Map building name to HexBuildingType
   */
  private mapBuildingType(building: string): HexBuildingType {
    // Map Kenney building names to HexBuildingType
    const mapping: Record<string, HexBuildingType> = {
      'building-cabin': HexBuildingType.Cabin,
      'building-farm': HexBuildingType.Stable,
      'building-mine': HexBuildingType.Mine,
      'building-mill': HexBuildingType.Windmill,
      'building-market': HexBuildingType.GeneralStore,
      'building-tower': HexBuildingType.WatchTower,
      'building-village': HexBuildingType.House,
    };
    return mapping[building] ?? HexBuildingType.None;
  }

  /**
   * Create sky dome for diorama effect
   */
  private setupSkyDome(): void {
    const mapSize = Math.max(this.config.mapWidth, this.config.mapHeight) * this.config.hexSize * 2;

    this.skyDome = MeshBuilder.CreateSphere('skyDome', {
      diameter: mapSize * 4,
      segments: 32,
      sideOrientation: Mesh.BACKSIDE,
    }, this.scene);

    // Position at map center, below ground
    const centerWorld = this.getMapCenterWorld();
    this.skyDome.position = new Vector3(centerWorld.x, -mapSize * 0.3, centerWorld.z);

    // Sky material - warm western sky
    const skyMat = new StandardMaterial('skyMat', this.scene);
    skyMat.emissiveColor = new Color3(0.6, 0.78, 0.95);
    skyMat.disableLighting = true;
    skyMat.backFaceCulling = false;

    this.skyDome.material = skyMat;
    this.skyDome.isPickable = false;
    this.skyDome.renderingGroupId = 0;

    console.log('[HexSceneManager] Sky dome created');
  }

  /**
   * Setup scene lighting
   */
  private setupLighting(): void {
    // Ambient hemisphere light
    const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), this.scene);
    ambient.intensity = 0.5;
    ambient.groundColor = new Color3(0.4, 0.35, 0.3);
    ambient.diffuse = new Color3(1, 0.95, 0.85);

    // Directional sun light
    const sun = new DirectionalLight('sun', new Vector3(-0.5, -1, -0.3).normalize(), this.scene);
    sun.intensity = 1.0;
    sun.diffuse = new Color3(1, 0.95, 0.8);

    // Shadow generator
    this.shadowGenerator = new ShadowGenerator(1024, sun);
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.blurKernel = 16;
    this.shadowGenerator.darkness = 0.3;

    console.log('[HexSceneManager] Lighting setup complete');
  }

  /**
   * Setup pointer/click input
   */
  private setupInput(): void {
    this.scene.onPointerDown = (evt, pickResult) => {
      if (pickResult?.hit && pickResult.pickedPoint) {
        const worldPos = pickResult.pickedPoint;

        // Convert to hex coordinate
        const hexCoord = worldToHex(worldPos, DEFAULT_HEX_LAYOUT);
        const tile = this.hexGrid?.tiles.get(hexKey(hexCoord));

        // Fire hex click callback
        if (this.onHexClick) {
          this.onHexClick(hexCoord, tile);
        }

        // Fire ground click callback (for movement)
        if (this.onGroundClick) {
          this.onGroundClick({
            x: worldPos.x,
            y: worldPos.y,
            z: worldPos.z,
          });
        }

        console.log(`[HexSceneManager] Click at hex (${hexCoord.q}, ${hexCoord.r})`);
      }
    };
  }

  /**
   * Load player character model
   */
  private async createPlayerMesh(): Promise<void> {
    console.log('[HexSceneManager] Loading player character...');

    try {
      // Load KayKit Engineer character (reliable model)
      const characterPath = WesternAssets.ENGINEER;
      const lastSlash = characterPath.lastIndexOf('/');
      const rootUrl = lastSlash >= 0 ? characterPath.substring(0, lastSlash + 1) : '';
      const fileName = lastSlash >= 0 ? characterPath.substring(lastSlash + 1) : characterPath;

      const result = await SceneLoader.ImportMeshAsync('', rootUrl, fileName, this.scene);

      console.log(`[HexSceneManager] Loaded character: ${result.meshes.length} meshes`);

      const player = result.meshes[0];

      // IMPORTANT: GLB models use rotationQuaternion which overrides Euler rotation
      // We must clear it first to use rotation.y
      player.rotationQuaternion = null;

      // Calculate bounding box to normalize the model (include all children)
      const boundingInfo = player.getHierarchyBoundingVectors();
      const modelHeight = boundingInfo.max.y - boundingInfo.min.y;
      const modelMinY = boundingInfo.min.y; // Bottom of model in model space
      const modelMaxY = boundingInfo.max.y; // Top of model in model space

      console.log(`[HexSceneManager] Model bounds: min=(${boundingInfo.min.x.toFixed(2)}, ${boundingInfo.min.y.toFixed(2)}, ${boundingInfo.min.z.toFixed(2)}), max=(${boundingInfo.max.x.toFixed(2)}, ${boundingInfo.max.y.toFixed(2)}, ${boundingInfo.max.z.toFixed(2)})`);
      console.log(`[HexSceneManager] Model height: ${modelHeight.toFixed(2)}`);

      // Normalize to desired height (around 1.5 units for a person on hex tiles)
      const desiredHeight = 1.5;
      let normalizedScale = 1.0;

      // If model height is reasonable (> 0.1), scale to desired height
      if (modelHeight > 0.1) {
        normalizedScale = desiredHeight / modelHeight;
      }

      // Clamp scale to reasonable range (0.01 to 10)
      normalizedScale = Math.max(0.01, Math.min(10, normalizedScale));
      player.scaling.setAll(normalizedScale);

      // Calculate Y offset: we need to move the model down so its feet are at Y=0
      // After scaling, the model's bottom will be at: modelMinY * normalizedScale
      // We need to subtract this to put feet at ground level
      this.playerModelYOffset = modelMinY * normalizedScale;

      console.log(`[HexSceneManager] Normalized scale: ${normalizedScale.toFixed(4)}, yOffset: ${this.playerModelYOffset.toFixed(4)}`);

      player.checkCollisions = true;

      // Set default facing direction (toward camera - Fallout 2 style)
      player.rotation.y = this.DEFAULT_PLAYER_FACING;
      this.playerFacingAngle = this.DEFAULT_PLAYER_FACING;

      this.playerMesh = player;
      this.playerSkeleton = result.skeletons[0] ?? null;
      this.playerAnimations = result.animationGroups;

      // Play idle animation if available
      const idleAnim = this.playerAnimations.find(a => a.name.toLowerCase().includes('idle'));
      if (idleAnim) {
        idleAnim.play(true);
      }

      // Add shadow casting
      if (this.shadowGenerator) {
        this.shadowGenerator.addShadowCaster(player);
        player.getChildMeshes().forEach(m => this.shadowGenerator?.addShadowCaster(m));
      }

      console.log('[HexSceneManager] Player character ready');
    } catch (err) {
      // NO FALLBACKS - fail loudly
      const errorMsg = `[HexSceneManager] FATAL: Failed to load player character from ${WesternAssets.ENGINEER}`;
      console.error(errorMsg, err);
      throw new Error(`${errorMsg}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Get the world center of the map
   */
  private getMapCenterWorld(): Vector3 {
    const centerQ = Math.floor(this.config.mapWidth / 2);
    const centerR = Math.floor(this.config.mapHeight / 2);
    return hexToWorld({ q: centerQ, r: centerR }, 0, DEFAULT_HEX_LAYOUT);
  }

  // ===========================================================================
  // PUBLIC API
  // ===========================================================================

  /**
   * Set player position by hex coordinate
   */
  setPlayerHex(coord: HexCoord, rotateToward: boolean = false): void {
    const previousHex = this.playerHex;
    this.playerHex = coord;

    // Get elevation from tile
    const tile = this.hexGrid?.tiles.get(hexKey(coord));
    const elevation = tile ? tile.elevation * 0.5 : 0;

    // Convert to world position
    const newWorldPos = hexToWorld(coord, elevation + 0.1, DEFAULT_HEX_LAYOUT);

    // Calculate rotation if moving to a new hex
    if (rotateToward && this.playerMesh && (previousHex.q !== coord.q || previousHex.r !== coord.r)) {
      // Calculate angle from current position to target
      const dx = newWorldPos.x - this.playerWorldPos.x;
      const dz = newWorldPos.z - this.playerWorldPos.z;

      if (Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001) {
        // atan2 gives angle, apply model offset for correct facing
        const moveDirection = Math.atan2(dx, dz);
        this.playerFacingAngle = moveDirection + this.MODEL_ROTATION_OFFSET;
        this.playerMesh.rotation.y = this.playerFacingAngle;
      }
    }

    this.playerWorldPos = newWorldPos;

    // Update player mesh position (compensate for model Y offset)
    if (this.playerMesh) {
      this.playerMesh.position = new Vector3(
        this.playerWorldPos.x,
        this.playerWorldPos.y - this.playerModelYOffset,
        this.playerWorldPos.z
      );
    }

    // Update camera target
    if (this.gridRenderer) {
      this.gridRenderer.updateCameraTarget(this.playerWorldPos);
    }

    console.log(`[HexSceneManager] Player at hex (${coord.q}, ${coord.r})`);
  }

  /**
   * Rotate player to face a target hex (without moving)
   */
  rotatePlayerToward(targetHex: HexCoord): void {
    if (!this.playerMesh) return;

    const targetWorld = hexToWorld(targetHex, 0, DEFAULT_HEX_LAYOUT);
    const dx = targetWorld.x - this.playerWorldPos.x;
    const dz = targetWorld.z - this.playerWorldPos.z;

    if (Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001) {
      const direction = Math.atan2(dx, dz);
      this.playerFacingAngle = direction + this.MODEL_ROTATION_OFFSET;
      this.playerMesh.rotation.y = this.playerFacingAngle;
    }
  }

  /**
   * Reset player rotation to face camera (default Fallout 2 pose)
   */
  resetPlayerRotation(): void {
    if (!this.playerMesh) return;

    this.playerFacingAngle = this.DEFAULT_PLAYER_FACING;
    this.playerMesh.rotation.y = this.playerFacingAngle;
  }

  /**
   * Set player position by world coordinates
   */
  setPlayerPosition(position: WorldPosition): void {
    const hexCoord = worldToHex(new Vector3(position.x, position.y, position.z), DEFAULT_HEX_LAYOUT);
    this.setPlayerHex(hexCoord, true); // Rotate toward movement direction
  }

  /**
   * Move player to target hex (with animation in future)
   */
  movePlayerTo(targetHex: HexCoord): void {
    // Rotate toward target and move (instant for now)
    this.setPlayerHex(targetHex, true);

    // After arriving, turn back to face the camera (Fallout 2 style)
    // Use a small delay so the turn toward movement direction is visible
    setTimeout(() => {
      this.resetPlayerRotation();
    }, 150);

    // TODO: Implement animated movement along path
  }

  /**
   * Get current player hex coordinate
   */
  getPlayerHex(): HexCoord {
    return this.playerHex;
  }

  /**
   * Get current player world position
   */
  getPlayerPosition(): WorldPosition {
    return {
      x: this.playerWorldPos.x,
      y: this.playerWorldPos.y,
      z: this.playerWorldPos.z,
    };
  }

  /**
   * Set hex click handler
   */
  setHexClickHandler(handler: (coord: HexCoord, tile: HexTileData | undefined) => void): void {
    this.onHexClick = handler;
  }

  /**
   * Set ground click handler (for compatibility with old API)
   */
  setGroundClickHandler(handler: (position: WorldPosition) => void): void {
    this.onGroundClick = handler;
  }

  /**
   * Get tile at hex coordinate
   */
  getTile(coord: HexCoord): HexTileData | undefined {
    return this.hexGrid?.tiles.get(hexKey(coord));
  }

  /**
   * Get height at world position (approximation from nearest hex)
   */
  getHeightAt(x: number, z: number): number {
    const hexCoord = worldToHex(new Vector3(x, 0, z), DEFAULT_HEX_LAYOUT);
    const tile = this.hexGrid?.tiles.get(hexKey(hexCoord));
    return tile ? tile.elevation * 0.5 : 0;
  }

  /**
   * Start the render loop
   */
  start(): void {
    this.engine.runRenderLoop(() => {
      // Update visibility culling
      if (this.gridRenderer) {
        this.gridRenderer.updateVisibility(this.playerWorldPos);
      }

      this.scene.render();
    });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });

    console.log('[HexSceneManager] Render loop started');
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    console.log('[HexSceneManager] Disposing...');

    // Dispose grid renderer
    if (this.gridRenderer) {
      this.gridRenderer.dispose();
    }

    // Dispose player
    if (this.playerMesh) {
      this.playerMesh.dispose();
    }

    // Dispose sky
    if (this.skyDome) {
      this.skyDome.dispose();
    }

    // Dispose scene and engine
    this.scene.dispose();
    this.engine.dispose();

    console.log('[HexSceneManager] Disposed');
  }

  /**
   * Get the Babylon scene
   */
  getScene(): Scene {
    return this.scene;
  }

  /**
   * Get the Babylon engine
   */
  getEngine(): Engine {
    return this.engine;
  }

  /**
   * Get the hex grid
   */
  getGrid(): HexGrid | null {
    return this.hexGrid;
  }
}

export default HexSceneManager;
